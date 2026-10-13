@echo off
title REC Campus Connect
echo ========================================================
echo Starting REC Campus Connect Web Server...
echo ========================================================
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
