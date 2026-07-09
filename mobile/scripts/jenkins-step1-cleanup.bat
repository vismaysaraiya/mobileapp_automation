@echo off
REM Jenkins build step 1/3: free up anything left over from a previous run
REM before touching the emulator or Appium. Safe to run even when nothing
REM needs cleaning up - taskkill failures here are expected and non-fatal.

echo ============================================
echo Step 1 - Free port 4723 if a stray Appium process is holding it
echo ============================================

set FOUND_STUCK_PORT=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4723 ^| findstr LISTENING') do (
    echo Killing process with PID %%a on port 4723
    taskkill /PID %%a /T /F
    if errorlevel 1 (
        echo WARNING: could not kill PID %%a - it may be running under a
        echo different permission context. Re-run with APPIUM_PORT=4724 set
        echo in Step 3 if Appium fails to bind to 4723.
        set FOUND_STUCK_PORT=1
    )
)

if "%FOUND_STUCK_PORT%"=="1" (
    echo.
    echo NOTE: at least one stuck process on port 4723 could not be removed.
    echo This build will still attempt port 4723 first - only override
    echo APPIUM_PORT manually if Step 3 actually fails to connect.
)

echo.
echo Step 1 complete.
exit /b 0
