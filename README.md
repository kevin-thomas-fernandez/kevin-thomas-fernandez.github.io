# Website Offline Hosting Guide

This project is a static website that can be hosted and viewed entirely offline. Follow the steps below to set up and view the site on your local machine.

---

## Project Structure

- `index.html` — Main HTML file
- `style.css`, `mediaqueries.css` — CSS styles
- `script.js` — JavaScript
- `assets/` — Images, fonts, and other assets

---

## How to Host and View Offline

### 1. Prerequisites
- **Python 3** (recommended, comes pre-installed on most systems)
  - Or, **Node.js** (for alternative server options)

### 2. Start a Local Web Server

#### Using Python 3
1. Open a terminal or command prompt.
2. Navigate to the `Website` directory:
   ```sh
   cd "C:\This Matters 2025\Application\Website"
   ```
3. Start the server:
   ```sh
   python -m http.server 8000
   ```
4. Open your browser and go to:
   [http://localhost:8000](http://localhost:8000)

#### Using Node.js (Optional)
1. Open a terminal in the `Website` directory.
2. Run:
   ```sh
   npx serve .
   ```
   or
   ```sh
   npx http-server .
   ```
3. Open your browser and go to the address shown (usually [http://localhost:8000](http://localhost:8000) or similar).

---

## Notes
- All assets (images, fonts, scripts) are included locally for full offline functionality.
- External links (e.g., LinkedIn, GitHub) require an internet connection to open, but the site itself works offline.
- If you add new fonts or assets, place them in the `assets/` folder and update your HTML/CSS paths accordingly.

---

## Troubleshooting
- If fonts or images do not load, check that their paths in your HTML/CSS match the actual file locations.
- If you see a browser error about CORS or file access, make sure you are using a local server (not just opening `index.html` directly).

---

## Example: Launch and Connect

```sh
cd "C:\This Matters 2025\Application\Website"
python -m http.server 8000
```

Then open your browser and go to:
[http://localhost:8000](http://localhost:8000) 