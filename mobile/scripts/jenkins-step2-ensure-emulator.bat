@echo off
setlocal EnableDelayedExpansion
REM Jenkins build step 2/3: get the emulator into a state where Appium can
REM actually drive it. This has turned out to need more than "start it if
REM not running" - across real runs we've hit four distinct failure modes,
REM each with a different fix, all folded in below:
REM   1. A previous abrupt crash can leave the device "unauthorized" on next
REM      boot (its trusted-adb-keys state gets lost) - this needs a human tap
REM      on the emulator's own screen, so we detect it and fail loudly rather
REM      than hang waiting for something that will never resolve on its own.
REM   2. The emulator's virtual network can silently lose DNS mid-session
REM      (seen after a host VPN/network change) - looks like a hung UI but is
REM      every backend call failing at the socket level. Needs a TRUE cold
REM      boot (-no-snapshot-load), not just a relaunch.
REM   3. A cold-boot restart that only kills emulator.exe (not the actual VM
REM      process, qemu-system-x86_64.exe) leaves the old instance holding the
REM      AVD's lock, so the new instance silently fails to start.
REM   4. `timeout /t N` fails immediately under Jenkins (no console/stdin on
REM      the spawned process) - every wait here uses `ping` instead.

if "%WORKSPACE%"=="" set WORKSPACE=%CD%
if "%AVD_NAME%"=="" set AVD_NAME=Medium_Phone_API_36.1
set EMULATOR_EXE=%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe
set EMULATOR_LOG=%WORKSPACE%\emulator-boot.log

echo ============================================
echo Step 2 - Ensure emulator is booted, authorized, and has working DNS
echo ============================================

call :check_state
if "%STATE%"=="device" goto :check_dns

if "%STATE%"=="unauthorized" (
    echo.
    echo ERROR: emulator-5554 is unauthorized. This happens after an abrupt
    echo emulator crash resets its trusted-adb-keys state and cannot be fixed
    echo from a script - someone needs to tap "Always allow from this
    echo computer" on the emulator's own screen, then re-run this build.
    exit /b 1
)

echo Emulator not running or not responding as expected. Starting it...
start "" /B cmd /c ""%EMULATOR_EXE%" -avd %AVD_NAME% -accel on -no-boot-anim > "%EMULATOR_LOG%" 2>&1"
call :wait_for_boot
if errorlevel 1 exit /b 1

:check_dns
echo.
echo Checking internet connectivity from the emulator...
call :check_dns_with_retry
if "%DNS_OK%"=="1" goto :verify_app

echo Emulator DNS is broken - this needs a true cold boot, not a simple restart.
echo Killing both the launcher and the underlying VM process...
taskkill /IM emulator.exe /T /F >nul 2>&1
taskkill /IM qemu-system-x86_64.exe /T /F >nul 2>&1
ping -n 6 127.0.0.1 >nul

echo Cold-booting (this is slower than a normal boot - expect a few minutes)...
start "" /B cmd /c ""%EMULATOR_EXE%" -avd %AVD_NAME% -accel on -no-boot-anim -no-snapshot-load > "%EMULATOR_LOG%" 2>&1"
call :wait_for_boot
if errorlevel 1 exit /b 1

call :check_dns_with_retry
if not "%DNS_OK%"=="1" (
    echo.
    echo ERROR: DNS is still broken after a full cold boot. This is no longer
    echo a known/scripted issue - check %EMULATOR_LOG% and the host machine's
    echo own network/VPN state manually.
    echo --- emulator boot log ---
    type "%EMULATOR_LOG%" 2>nul
    exit /b 1
)

:verify_app
echo.
echo Confirming the NMMT app is installed...
adb shell pm list packages | findstr nmmt.commuter.com >nul
if errorlevel 1 (
    echo ERROR: nmmt.commuter.com is not installed on this emulator image.
    exit /b 1
)

echo.
echo Step 2 complete - emulator is booted, authorized, has working DNS, and the app is installed.
exit /b 0

REM ---- subroutines ----

:check_state
REM Sets STATE to one of: device, unauthorized, offline, missing
set STATE=missing
for /f "skip=1 tokens=1,2" %%a in ('adb devices') do (
    if not "%%a"=="" set STATE=%%b
)
exit /b 0

:wait_for_boot
echo Waiting for adb to see the device...
set ADB_OK=0
for /l %%i in (1,1,20) do (
    if "!ADB_OK!"=="0" (
        adb wait-for-device
        call :check_state
        if "!STATE!"=="device" set ADB_OK=1
        if "!STATE!"=="unauthorized" (
            echo.
            echo ERROR: emulator-5554 is unauthorized. Tap "Always allow from
            echo this computer" on the emulator's own screen, then re-run.
            exit /b 1
        )
        if "!ADB_OK!"=="0" ping -n 4 127.0.0.1 >nul
    )
)
if "%ADB_OK%"=="0" (
    echo ERROR: emulator never became visible to adb.
    echo --- emulator boot log ---
    type "%EMULATOR_LOG%" 2>nul
    exit /b 1
)

echo Waiting for Android to finish booting...
set BOOTOK=
for /l %%i in (1,1,40) do (
    if not "!BOOTOK!"=="1" (
        for /f %%b in ('adb shell getprop sys.boot_completed 2^>nul') do set BOOTOK=%%b
        if not "!BOOTOK!"=="1" ping -n 4 127.0.0.1 >nul
    )
)
if not "%BOOTOK%"=="1" (
    echo ERROR: Android never finished booting within the expected time.
    echo --- emulator boot log ---
    type "%EMULATOR_LOG%" 2>nul
    exit /b 1
)

REM sys.boot_completed can flip to 1 a few seconds before the network stack
REM has actually finished settling - a DNS check run immediately here has
REM been seen to report a false failure that then triggers a needless cold
REM reboot. Give it a moment before anything downstream checks connectivity.
ping -n 8 127.0.0.1 >nul
exit /b 0

:check_dns_with_retry
REM Sets DNS_OK to 1 or 0. A single ping right after boot has been seen to
REM report a false failure - retry a few times before concluding it's
REM actually broken, not just still settling.
set DNS_OK=0
for /l %%i in (1,1,3) do (
    if "!DNS_OK!"=="0" (
        adb shell ping -c 2 google.com >nul 2>nul
        if not errorlevel 1 (
            set DNS_OK=1
        ) else (
            ping -n 6 127.0.0.1 >nul
        )
    )
)
exit /b 0
