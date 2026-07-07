# mobileapp_automation

Page Object Model (POM) test framework built on [Playwright](https://playwright.dev), driving the **mobile web** experience (emulated devices — Pixel 7, iPhone 14, iPad Mini) rather than native apps.

> Playwright does not automate native/hybrid mobile apps. For real Android/iOS apps, use Appium instead.

Sample under test: [saucedemo.com](https://www.saucedemo.com) — swap the page objects and `BASE_URL` for your own site.

## Stack

- Playwright Test + TypeScript
- Allure reporting (`allure-playwright`, `allure-commandline`) alongside the built-in HTML reporter
- `dotenv` for environment config

## Structure

```
src/
  pages/       # Page Object classes (BasePage, LoginPage, InventoryPage, CartPage)
  fixtures/    # Custom Playwright fixtures that inject page objects into tests
  data/        # Static test data (users, etc.)
  utils/       # Shared helper functions
tests/         # Spec files, consume fixtures from src/fixtures
playwright.config.ts
```

## Prerequisites

- Node.js 18+ and npm
- No Android/iOS emulator needed — Playwright emulates mobile viewport, touch input, and user-agent inside a real desktop Chromium/WebKit browser. It does not run on or require a device emulator.

## Setup

```bash
npm install           # installs Playwright, TypeScript, Allure, dotenv, etc.
npx playwright install  # downloads the Chromium/WebKit browser binaries
cp .env.example .env    # sets BASE_URL=https://www.saucedemo.com
```

## Running tests

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

## Reports

```bash
npm run report:html     # Playwright HTML report
npm run report:allure    # Allure report (requires Java runtime)
```

## Adding a new page object

1. Create a class in `src/pages/` extending `BasePage`.
2. Register it in `src/fixtures/pageFixtures.ts`.
3. Consume it in a spec via `import { test, expect } from '../src/fixtures/pageFixtures'`.
