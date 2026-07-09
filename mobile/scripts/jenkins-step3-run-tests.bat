@echo off
REM Jenkins build step 3/3: install deps, run the suite, generate the report.
REM Assumes steps 1-2 already ran and the emulator is healthy.

if "%PROJECT_DIR%"=="" set PROJECT_DIR=C:\Users\vismay.saraiya\Desktop\automation\mobileapp_automation
cd /d "%PROJECT_DIR%"

echo ============================================
echo Step 3 - Install dependencies and run the mobile suite
echo ============================================

call npm install
if errorlevel 1 exit /b 1

REM Run the full suite by default. To run a single spec file instead, set
REM SPEC_FILE before calling this script, e.g.:
REM   set SPEC_FILE=./mobile/test/specs/nearbyAndPoi.spec.ts
if not "%SPEC_FILE%"=="" (
    call npm run test:android:spec %SPEC_FILE%
) else (
    call npm run test:android
)
set TEST_EXIT=%errorlevel%

echo.
echo ============================================
echo Generating report
echo ============================================
call npm run report:mobile

echo.
echo ============================================
if "%TEST_EXIT%"=="0" (
    echo Automation completed successfully.
) else (
    echo Automation completed with test failures - exit code %TEST_EXIT%.
)
echo Report location: mobile\reports\index.html
echo ============================================

exit /b %TEST_EXIT%
