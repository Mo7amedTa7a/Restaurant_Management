@echo off
taskkill /F /IM chrome.exe /T 2>nul
timeout /t 1 /nobreak >nul
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" http://localhost:5173

