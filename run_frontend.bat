@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Installing npm dependencies...
    npm install
)

echo Starting Vite React Dev Server on port 5173...
npm run dev -- --host 0.0.0.0 --port 5173

