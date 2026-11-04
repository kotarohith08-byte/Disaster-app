@echo off
title DisasterAI - Intelligent Disaster Response & Management System
color 0c
echo ======================================================================
echo       DisasterAI - Intelligent Disaster Response & Management System
echo           AI/ML Social Good Capstone Full-Stack Application
echo ======================================================================
echo.

cd /d "%~dp0"

echo [*] Checking Python environment...
python --version
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    pause
    exit /b 1
)

echo [*] Ensuring database and demo dataset are initialized...
python backend\seed_data.py

echo [*] Launching DisasterAI integrated server on http://127.0.0.1:5000
echo [*] Opening default web browser...
start "" "http://127.0.0.1:5000"

python backend\app.py
pause
