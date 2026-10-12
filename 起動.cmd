@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 or later is required.
  pause
  exit /b 1
)
node scripts/build.mjs
if errorlevel 1 (pause & exit /b 1)
echo Open http://127.0.0.1:4173/store-it-quiz/ in your browser.
node scripts/serve.mjs
pause
