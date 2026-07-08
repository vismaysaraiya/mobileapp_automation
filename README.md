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

Automates the आपली NMMT commuter app (`nmmt.commuter.com`) against test cases TC_001–TC_110 in `Testcases.xlsx`. **10 of 110 cases** currently have real automation (4 fully passing, 6 partial — see `mobile/test/specs/*.spec.ts` inline comments for exactly why each partial case stops where it does, e.g. no payment gateway sandbox, no seeded backend data, or a deliberate refusal to fire a real SOS alert).

### Stack

- Appium 3.x + `appium-uiautomator2-driver`, WebdriverIO v9, Mocha (BDD), TypeScript
- Locators are almost entirely Android accessibility `content-desc` (the app exposes very few resource-ids) — see `mobile/src/pages/BaseScreen.ts` for the selector helpers this requires

### Structure

```
mobile/
  wdio.conf.ts           # WDIO config — capabilities, timeouts, cold-start-to-known-state before() hook
  scripts/
    run-with-appium.js   # Starts Appium, polls /status until ready, then runs wdio (see comments for why
                          # @wdio/appium-service isn't used directly)
  src/
    pages/                # Page objects: BaseScreen + one class per screen
    data/testUsers.ts     # Reads real credentials from env vars only — never hardcode credentials here
  test/specs/*.spec.ts    # One spec file per feature area, TC IDs referenced in test titles/comments
```

### Prerequisites

- An Android emulator or device with the NMMT app installed and reachable via `adb` (tested against emulator `Medium_Phone_API_36.1`, Android 16)
- `ANDROID_UDID` and real `NMMT_TEST_MOBILE` / `NMMT_TEST_PASSWORD` credentials set in `.env` (see `.env.example`) — the framework throws on startup if these are missing rather than falling back to a hardcoded value

### Running tests

```bash
npm run test:android              # full suite (all spec files)
npm run test:android:spec <path>  # a single spec file, e.g.:
npm run test:android:spec ./mobile/test/specs/login.spec.ts
```

### Known environment quirk

If every login-dependent spec fails with "element still not displayed" after tapping Sign In, check the emulator's DNS before assuming it's a code bug — its virtual network can silently lose DNS resolution during a long-running session (seen after a host VPN/network change), which looks exactly like a hung UI but is actually every backend call failing at the socket level. A full cold boot (`emulator -avd <name> -no-snapshot-load`, not just `adb reboot`) fixes it; confirm with `adb shell ping -c 2 google.com` before re-running.
