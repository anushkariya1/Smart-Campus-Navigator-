@echo off
echo =====================================================================
echo  Chandigarh University Smart Campus Navigation & Room Finder
echo  Advanced Data Structures and Algorithms (ADSA) Project
echo =====================================================================
echo.
echo Starting C++ Crow Backend on http://localhost:18080 ...
start "CU Navigation - C++ Backend" cmd /k "call run_backend.bat"

timeout /t 3 /nobreak >nul

echo Starting React Vite Frontend on http://localhost:5173 ...
start "CU Navigation - React Frontend" cmd /k "call run_frontend.bat"

echo.
echo =====================================================================
echo  Application is launching!
echo  Open browser at: http://localhost:5173
echo =====================================================================

