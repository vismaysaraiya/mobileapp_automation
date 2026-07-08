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

From `C:\Users\vismay.saraiya\Desktop\automation\mobileapp_automation` in Command Prompt:

**Step 1 — check nothing is stuck on port 4723**
```
netstat -ano | findstr :4723
```
If a line comes back with `LISTENING` and a PID at the end, kill it:
```
taskkill /PID <that_pid> /T /F
```
If that says "Access is denied", don't fight it — just use a different port for this run (see Step 3).

**Step 2 — confirm the emulator is alive and has working internet**
```
adb devices
```
Should list `emulator-5554	device`. If it shows nothing, start the emulator and wait ~30s, then check again:
```
"%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd Medium_Phone_API_36.1
```
Then check DNS actually works (the emulator can look "on" but have silently lost internet):
```
adb shell ping -c 2 google.com
```
If that fails to resolve (but `adb shell ping -c 2 8.8.8.8` works), do a **true cold boot** instead — a normal restart won't fix it:
```
"%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd Medium_Phone_API_36.1 -no-snapshot-load
```

**Step 3 — run the tests**
```
npm run test:android
```
Run just one spec file first to confirm things work before committing to the full ~17-file suite:
```
npm run test:android:spec ./mobile/test/specs/nearbyAndPoi.spec.ts
```
If Step 1 found a stuck process you couldn't kill, run on an alternate port instead:
```
set APPIUM_PORT=4724
npm run test:android
```

**Step 4 — generate the HTML report**
```
npm run report:mobile
```
Then open `mobile\reports\index.html` in your browser.

### Troubleshooting: "my tests aren't running"

In practice this has always turned out to be one of these three, in order of likelihood — check them before suspecting a code/locator bug:

1. **A stray Appium process is still holding port 4723** from a previous run that didn't get torn down cleanly (a known Windows quirk where killing the parent doesn't kill the whole process tree). Symptoms: the run hangs at startup, or fails immediately with a port-in-use / connection error.
   ```bash
   netstat -ano | findstr :4723
   taskkill /PID <pid> /T /F
   ```
   If `taskkill` itself reports "Access is denied" (the process is stuck under a different permission context), don't fight it — just run on a different port instead: `APPIUM_PORT=4724 npm run test:android`.

2. **The emulator's virtual network has silently lost DNS resolution.** This can happen mid-session (seen after a host VPN/network change or very long uptime) and looks exactly like a hung UI — every screen that needs a backend call times out waiting for an element, but the emulator otherwise looks "on". Confirm with:
   ```bash
   adb shell ping -c 2 google.com   # fails to resolve even though raw IP (adb shell ping -c 2 8.8.8.8) works fine
   ```
   Fix with a **true cold boot** (a plain `adb reboot` does NOT fix this — the network stack lives in the host-side emulator process, not the guest OS):
   ```bash
   emulator -avd Medium_Phone_API_36.1 -no-snapshot-load
   ```

3. **The emulator process itself has died** (crashed under sustained load — seen once during a very long unattended full-suite run). `adb devices` returns nothing and no `qemu-system-x86_64.exe` process exists. Just relaunch it (a normal snapshot-resume boot is fine here, unlike case 2):
   ```bash
   emulator -avd Medium_Phone_API_36.1
   ```

Given the emulator's fragility under long unattended runs, prefer running a handful of spec files at a time over the full 17-file suite in one go until this is hardened further.
