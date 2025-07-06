@echo off
echo Setting up daily AQI data fetch at 3:00 AM...

REM Get the current directory
set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%.."

REM Create the scheduled task
schtasks /create /tn "OxiNest AQI Data Fetch" /tr "node \"%PROJECT_DIR%\scripts\scheduled_fetch_waqi.js\"" /sc daily /st 03:00 /f

echo.
echo Task scheduled successfully!
echo Task Name: OxiNest AQI Data Fetch
echo Schedule: Daily at 3:00 AM
echo Command: node scripts\scheduled_fetch_waqi.js
echo.
echo To check the task: schtasks /query /tn "OxiNest AQI Data Fetch"
echo To delete the task: schtasks /delete /tn "OxiNest AQI Data Fetch" /f
echo.
pause 