@echo off
echo ==================================================
echo Starting SauceDemo Enterprise Dashboard
echo ==================================================
echo Cleaning up old processes...
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :5000') DO taskkill /F /PID %%a 2>nul
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :3000') DO taskkill /F /PID %%a 2>nul

echo Starting Backend Server on port 5000...
start cmd.exe /k "cd dashboard\backend && node server.js"

echo Starting Frontend on port 3000...
start cmd.exe /k "cd dashboard\frontend && npm.cmd run dev"

echo ==========================================================
echo    WARNING: DO NOT CLOSE THESE COMMAND WINDOWS!
echo ==========================================================
echo The dashboard frontend and backend are currently running.
echo If you close these black windows, the dashboard will stop 
echo working and you will get a "Failed to fetch" error!
echo.
echo The frontend will open automatically in your browser.
pause
