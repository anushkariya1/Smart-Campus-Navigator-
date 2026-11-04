@echo off
set PATH=C:\Program Files\CMake\bin;D:\tools\w64devkit\bin;%PATH%
cd /d "%~dp0backend"

if not exist "build\smart_campus_server.exe" (
    echo Building C++ Crow Backend with CMake and G++...
    cmake -B build -S . -G "MinGW Makefiles" -DCMAKE_CXX_COMPILER="D:/tools/w64devkit/bin/g++.exe"
    cmake --build build -j 4
)

cd build
echo Starting Smart Campus C++ Navigation Server on port 18080...
smart_campus_server.exe 18080

