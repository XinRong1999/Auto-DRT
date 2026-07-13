@echo off
setlocal

set "APP_DIR=%~dp0"
set "APP_HTML=%APP_DIR%Start_Auto_DRT_Analyzer.html"

if not exist "%APP_HTML%" (
  echo Auto DRT Analyzer files are missing.
  echo Expected file:
  echo "%APP_HTML%"
  pause
  exit /b 1
)

echo %APP_DIR% | find /I "\AppData\Local\Temp\" >nul
if not errorlevel 1 (
  echo.
  echo Auto DRT Analyzer appears to be running from a Windows temporary ZIP folder.
  echo Please extract the ZIP archive first, then run this launcher from the extracted folder.
  echo.
  pause
)

start "" "%APP_HTML%"
