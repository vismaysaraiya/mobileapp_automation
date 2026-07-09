# mobileapp_automation

Two independent test frameworks live in this repo:

- **`/` (root)** — Playwright POM framework driving the **mobile web** experience (emulated devices — Pixel 7, iPhone 14, iPad Mini) against [saucedemo.com](https://www.saucedemo.com), a sample site unrelated to the native app below.
- **`mobile/`** — Appium + WebdriverIO framework driving the real **NMMT commuter Android app** (`nmmt.commuter.com`), automating test cases from `Testcases.xlsx`.

> Playwright does not automate native/hybrid mobile apps — it only emulates mobile viewports inside a desktop browser. Real Android app automation lives entirely under `mobile/` and uses Appium instead.

## Playwright web framework (root)

### Stack

- Playwright Test + TypeScript
- Allure reporting (`allure-playwright`, `allure-commandline`) alongside the built-in HTML reporter
- `dotenv` for environment config

### Structure

```
src/
  pages/       # Page Object classes (BasePage, LoginPage, InventoryPage, CartPage)
  fixtures/    # Custom Playwright fixtures that inject page objects into tests
  data/        # Static test data (users, etc.)
  utils/       # Shared helper functions
tests/         # Spec files, consume fixtures from src/fixtures
playwright.config.ts
```

### Prerequisites

- Node.js 18+ and npm
- No Android/iOS emulator needed — Playwright emulates mobile viewport, touch input, and user-agent inside a real desktop Chromium/WebKit browser.

### Setup

```bash
npm install             # installs Playwright, TypeScript, Allure, dotenv, etc.
npx playwright install  # downloads the Chromium/WebKit browser binaries
cp .env.example .env    # sets BASE_URL=https://www.saucedemo.com
```

### Running tests

```bash
npm test                     # all projects (Pixel 7, iPhone 14, iPad Mini), headless
npm run test:mobile-chrome   # Pixel 7 only
npm run test:mobile-safari   # iPhone 14 only
npm run test:headed          # headed mode, all projects — opens a visible browser window
npm run test:ui              # Playwright UI mode — best for step-by-step/time-travel debugging
```

Run a single project headed (visible browser sized as that device):

```bash
npx playwright test --headed --project="Mobile Chrome - Pixel 7"
npx playwright test --headed --project="Mobile Safari - iPhone 14"
npx playwright test --headed --project="Tablet - iPad Mini"
```

Run a single spec file or test by name:

```bash
npx playwright test tests/login.spec.ts
npx playwright test -g "logs in successfully"
```

### Reports

```bash
npm run report:html     # Playwright HTML report
npm run report:allure    # Allure report (requires Java runtime)
```

### Adding a new page object

1. Create a class in `src/pages/` extending `BasePage`.
2. Register it in `src/fixtures/pageFixtures.ts`.
3. Consume it in a spec via `import { test, expect } from '../src/fixtures/pageFixtures'`.

## Appium native Android framework (`mobile/`)

Automates the आपली NMMT commuter app (`nmmt.commuter.com`) against test cases TC_001–TC_110 in `Testcases.xlsx`. **23 of 110 cases** currently have real automation passing, plus **2 deferred** (implemented but not yet reliable) — see `mobile/reports/index.html` (generated, see below) for the full case-by-case breakdown, and inline comments in `mobile/test/specs/*.spec.ts` for exactly why each partial case stops where it does (no payment gateway sandbox, no seeded backend data, a deliberate refusal to fire a real SOS alert, etc.).

### Stack

- Appium 3.x + `appium-uiautomator2-driver`, WebdriverIO v9, Mocha (BDD), TypeScript
- Locators are almost entirely Android accessibility `content-desc` (the app exposes very few resource-ids) — see `mobile/src/pages/BaseScreen.ts` for the selector helpers this requires
- A custom WDIO reporter (`mobile/src/reporters/JsonResultsReporter.ts`) captures real pass/fail per TC ID, feeding an HTML dashboard generator

### Structure

```
mobile/
  wdio.conf.ts             # WDIO config — capabilities, timeouts, cold-start-to-known-state before() hook
  scripts/
    run-with-appium.js     # Starts Appium, polls /status until ready, then runs wdio (see comments for why
                            # @wdio/appium-service isn't used directly)
    generate-report.js     # Merges testCaseCatalog.json + automationStatus.json + real run results
                            # into mobile/reports/index.html
    jenkins-step1-cleanup.bat          # Free port 4723 if a stray Appium process is holding it
    jenkins-step2-ensure-emulator.bat  # Boot/authorize/DNS-check the emulator - see Jenkins section below
    jenkins-step3-run-tests.bat        # npm install, run tests, generate report
  src/
    pages/                  # Page objects: BaseScreen + one class per screen
    data/
      testUsers.ts          # Reads real credentials from env vars only — never hardcode credentials here
      testCaseCatalog.json  # All 110 TC IDs from Testcases.xlsx (id, module, description) - factual reference
      automationStatus.json # Curated per-TC notes: which spec file covers it, and why it's full/partial/deferred
    reporters/
      JsonResultsReporter.ts # Writes one JSON file per spec run under mobile/reports/results/
  test/specs/*.spec.ts      # One spec file per feature area, TC IDs referenced in test titles/comments
  reports/
    results/*.json          # Raw per-run results (one file per spec file per run) - safe to accumulate,
                             # the report generator keeps only the latest entry per TC ID
    index.html               # Generated dashboard - not committed, regenerate with npm run report:mobile
```

### Prerequisites

- An Android emulator or device with the NMMT app installed and reachable via `adb` (tested against emulator `Medium_Phone_API_36.1`, Android 16)
- `ANDROID_UDID` and real `NMMT_TEST_MOBILE` / `NMMT_TEST_PASSWORD` credentials set in `.env` (see `.env.example`) — the framework throws on startup if these are missing rather than falling back to a hardcoded value

### Running tests

```bash
npm run test:android              # full suite (all spec files)
npm run test:android:spec <path>  # a single spec file, e.g.:
npm run test:android:spec ./mobile/test/specs/login.spec.ts
npm run report:mobile             # regenerate mobile/reports/index.html from the latest results
```

If port 4723 is already taken by a stuck/unkillable Appium process (see below), override it for one run:

```bash
APPIUM_PORT=4724 npm run test:android
```

### Step-by-step: running the full suite from `cmd.exe`

From `C:\Users\vismay.saraiya\Desktop\automation\mobileapp_automation` in Command Prompt, the three scripts below are the same ones Jenkins uses (see the Jenkins section) — running them locally exercises the exact same emulator-recovery logic:

```
call mobile\scripts\jenkins-step1-cleanup.bat
call mobile\scripts\jenkins-step2-ensure-emulator.bat
call mobile\scripts\jenkins-step3-run-tests.bat
```

To run a single spec file instead of the full suite, set `SPEC_FILE` before step 3:
```
set SPEC_FILE=./mobile/test/specs/nearbyAndPoi.spec.ts
call mobile\scripts\jenkins-step3-run-tests.bat
```

Then open `mobile\reports\index.html` in your browser.

### Jenkins setup (3 build steps)

The emulator has turned out to need enough recovery logic (see Troubleshooting below) that it's kept as versioned, independently-testable scripts rather than pasted directly into the Jenkins UI. Add three **"Execute Windows batch command"** build steps to a Freestyle job, in order:

**Build step 1:**
```bat
call mobile\scripts\jenkins-step1-cleanup.bat
```

**Build step 2:**
```bat
call mobile\scripts\jenkins-step2-ensure-emulator.bat
```

**Build step 3:**
```bat
call mobile\scripts\jenkins-step3-run-tests.bat
```

Each step exits non-zero on real failure, so Jenkins stops the build at the right step instead of limping into a later one with a broken emulator. Since these are plain files in the repo, you can also edit/test them locally (as in the section above) without touching the Jenkins job config at all.

Credentials: add `NMMT_TEST_MOBILE`/`NMMT_TEST_PASSWORD` as Jenkins Secret Text credentials, bind them as environment variables of the same name in the job's Build Environment, and write them into `.env` at the start of build step 3 (or add that as its own small step) — never commit real credentials into `.env` itself.

### Troubleshooting: "my tests aren't running" / "emulator won't start"

In practice this has always turned out to be one of these, in order of likelihood — check them before suspecting a code/locator bug. `jenkins-step2-ensure-emulator.bat` now handles all of these automatically; this list is for when you're running things manually or that script itself reports a failure.

1. **A stray Appium process is still holding port 4723** from a previous run that didn't get torn down cleanly (a known Windows quirk where killing the parent doesn't kill the whole process tree). Symptoms: the run hangs at startup, or fails immediately with a port-in-use / connection error.
   ```bash
   netstat -ano | findstr :4723
   taskkill /PID <pid> /T /F
   ```
   If `taskkill` itself reports "Access is denied" (the process is stuck under a different permission context), don't fight it — just run on a different port instead: `APPIUM_PORT=4724 npm run test:android`.

2. **The device shows as `unauthorized` in `adb devices`.** This happens after an abrupt emulator crash resets its trusted-adb-keys state, and it cannot be fixed from a script — someone needs to tap "Always allow from this computer" on the emulator's own screen, then re-run. `jenkins-step2-ensure-emulator.bat` detects this and fails loudly with that instruction rather than hanging forever waiting for an adb command that will never succeed.

3. **The emulator's virtual network has silently lost DNS resolution.** This can happen mid-session (seen after a host VPN/network change or very long uptime) and looks exactly like a hung UI — every screen that needs a backend call times out waiting for an element, but the emulator otherwise looks "on". Confirm with:
   ```bash
   adb shell ping -c 2 google.com   # fails to resolve even though raw IP (adb shell ping -c 2 8.8.8.8) works fine
   ```
   Fix with a **true cold boot** (a plain `adb reboot` does NOT fix this — the network stack lives in the host-side emulator process, not the guest OS):
   ```bash
   emulator -avd Medium_Phone_API_36.1 -no-snapshot-load
   ```
   Also kill **both** `emulator.exe` and `qemu-system-x86_64.exe` (with `/T /F`) before that cold boot — killing only the launcher leaves the actual VM process holding the AVD's lock, so the new instance silently fails to start.

   Watch out for a false positive here: `sys.boot_completed` can flip to 1 a few seconds before the network stack has actually finished settling, so a DNS check run immediately after boot can wrongly report "broken" and trigger a needless cold-reboot cycle. Retry the check 2-3 times a few seconds apart before concluding it's actually broken (this is what `jenkins-step2-ensure-emulator.bat` does).

4. **The emulator process itself has died** (crashed under sustained load — seen once during a very long unattended full-suite run). `adb devices` returns nothing and no `qemu-system-x86_64.exe` process exists. Just relaunch it (a normal snapshot-resume boot is fine here, unlike case 3):
   ```bash
   emulator -avd Medium_Phone_API_36.1
   ```

5. **Under Jenkins specifically, the emulator takes far longer to boot than it does when you run it yourself.** This points to hardware acceleration (WHPX/Hyper-V) not being available to whatever Windows account Jenkins runs under, silently falling back to slow software CPU emulation. `jenkins-step2-ensure-emulator.bat` launches with `-accel on` (fails loudly instead of silently degrading) and redirects the emulator's own log to `%WORKSPACE%\emulator-boot.log`, printed into the Jenkins console on failure — check it for `WHPX`/`HAXM`/`Requested engine` messages. Fix: add that Windows account to the **Hyper-V Administrators** local group and restart Jenkins.

Given the emulator's fragility under long unattended runs, prefer running a handful of spec files at a time over the full 17-file suite in one go until this is hardened further.
