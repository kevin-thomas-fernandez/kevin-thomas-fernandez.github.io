@echo off
cd /d "%~dp0"
echo Starting the site at http://localhost:8000
echo Close this window to stop it.
start "" http://localhost:8000
python serve.py || py serve.py
pause
