#!/usr/bin/env python3
"""Local server for the site.

Serves the files, supports video seeking, and lets the photo editor save changes
for Highlights and the Zipline case study. Listens on 127.0.0.1 only.
Run it with start-site.bat, or:  python serve.py
"""
import json
import mimetypes
import os
import re
import shutil
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("PORT", "8000"))
LISTS = {"highlights": ("highlights-data.js", "HIGHLIGHTS"), "zipline": ("zipline-data.js", "ZIPLINE_PHOTOS")}
MEDIA_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm", ".mov", ".m4v"}
MAX_UPLOAD = 400 * 1024 * 1024

mimetypes.add_type("model/stl", ".stl")
mimetypes.add_type("video/mp4", ".mp4")
mimetypes.add_type("text/javascript", ".js")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        if args and str(args[1]).startswith(("4", "5")):
            sys.stderr.write("%s\n" % (fmt % args))

    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def _host_ok(self):
        host = (self.headers.get("Host") or "").rsplit(":", 1)[0].strip("[]").lower()
        return host in ("localhost", "127.0.0.1", "::1")

    def _json(self, code, obj):
        data = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if not self._host_ok():
            return self.send_error(403)
        path = urlparse(self.path).path
        if path == "/api/ping":
            return self._json(200, {"ok": True})
        rng = self.headers.get("Range")
        if rng:
            fp = self.translate_path(self.path)
            if os.path.isfile(fp):
                return self._serve_range(fp, rng)
        return super().do_GET()

    def _serve_range(self, fp, rng):
        size = os.path.getsize(fp)
        m = re.match(r"bytes=(\d*)-(\d*)$", rng.strip())
        if not m or (not m.group(1) and not m.group(2)):
            return super().do_GET()
        if m.group(1):
            start = int(m.group(1))
            end = min(int(m.group(2)), size - 1) if m.group(2) else size - 1
        else:
            start = max(0, size - int(m.group(2)))
            end = size - 1
        if start > end or start >= size:
            self.send_response(416)
            self.send_header("Content-Range", "bytes */%d" % size)
            self.end_headers()
            return
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(fp))
        self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, size))
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        remaining = end - start + 1
        with open(fp, "rb") as f:
            f.seek(start)
            while remaining > 0:
                chunk = f.read(min(65536, remaining))
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError):
                    break
                remaining -= len(chunk)

    def do_POST(self):
        if not self._host_ok():
            return self.send_error(403)
        url = urlparse(self.path)
        q = parse_qs(url.query)
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return self._json(400, {"error": "bad length"})
        if url.path == "/api/save":
            return self._save(q.get("name", [""])[0], length)
        if url.path == "/api/upload":
            return self._upload(q.get("folder", [""])[0], length)
        return self._json(404, {"error": "not found"})

    def _save(self, name, length):
        if name not in LISTS or length > 5 * 1024 * 1024:
            return self._json(400, {"error": "bad request"})
        try:
            items = json.loads(self.rfile.read(length).decode("utf-8"))
            assert isinstance(items, list)
            clean = []
            for it in items:
                src = str(it["src"])
                if ".." in src or not src.startswith("./assets/"):
                    raise ValueError("bad src")
                entry = {"src": src, "caption": str(it.get("caption", ""))[:300]}
                if it.get("type") == "video":
                    entry["type"] = "video"
                clean.append(entry)
        except Exception as e:  # noqa: BLE001
            return self._json(400, {"error": "invalid data: %s" % e})
        fname, var = LISTS[name]
        target = os.path.join(ROOT, fname)
        if os.path.exists(target):
            shutil.copyfile(target, target + ".bak")
        header = "// Edited by the local photo editor. You can also edit this file by hand.\n"
        with open(target, "w", encoding="utf-8") as f:
            f.write(header + "window.%s = %s;\n" % (var, json.dumps(clean, indent=2, ensure_ascii=False)))
        return self._json(200, {"ok": True, "count": len(clean)})

    def _upload(self, folder, length):
        if folder not in LISTS or length <= 0 or length > MAX_UPLOAD:
            return self._json(400, {"error": "bad request"})
        raw = unquote(self.headers.get("X-Filename") or "upload")
        base = re.sub(r"[^A-Za-z0-9._ -]", "_", os.path.basename(raw)).strip(". ") or "upload"
        stem, ext = os.path.splitext(base)
        if ext.lower() not in MEDIA_EXT:
            return self._json(400, {"error": "Use JPG, PNG, WEBP, GIF or MP4 files"})
        folder_path = os.path.join(ROOT, "assets", folder)
        os.makedirs(folder_path, exist_ok=True)
        name, n = stem + ext, 1
        while os.path.exists(os.path.join(folder_path, name)):
            name = "%s-%d%s" % (stem, n, ext)
            n += 1
        with open(os.path.join(folder_path, name), "wb") as f:
            remaining = length
            while remaining > 0:
                chunk = self.rfile.read(min(1 << 20, remaining))
                if not chunk:
                    break
                f.write(chunk)
                remaining -= len(chunk)
        return self._json(200, {"ok": True, "src": "./assets/%s/%s" % (folder, name)})


if __name__ == "__main__":
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print("Site running at http://localhost:%d  (Ctrl+C or close this window to stop)" % PORT)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
