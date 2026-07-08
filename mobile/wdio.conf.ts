import type { Options } from '@wdio/types';
import * as dotenv from 'dotenv';
import { execFileSync } from 'child_process';

dotenv.config();

export const config: Options.Testrunner = {
  runner: 'local',
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: './mobile/tsconfig.json',
      transpileOnly: true,
    },
  },
  specs: ['./test/specs/**/*.spec.ts'],
  maxInstances: 1,
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:udid': process.env.ANDROID_UDID,
      'appium:appPackage': 'nmmt.commuter.com',
      'appium:appActivity': 'nmmt.commuter.com.MainActivity',
      'appium:noReset': true,
      'appium:newCommandTimeout': 240,
      'appium:autoGrantPermissions': true,
    },
  ],
  logLevel: 'info',
  bail: 0,
  // This staging backend's response time is noticeably variable under sustained
  // load (observed 2-15s+ for screens that fetch data, e.g. wallet balance,
  // home dashboard tiles) - 15s default plus a mocha-level retry absorbs that
  // instead of chasing an ever-larger fixed timeout per screen.
  waitforTimeout: 20000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 2,
  // Appium is started and health-checked by mobile/scripts/run-with-appium.js
  // (invoked via `npm run test:android`), not by @wdio/appium-service - see
  // that script for why.
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    retries: 1,
  },
  /**
   * noReset:true preserves login state between runs (desirable - avoids
   * re-authenticating every spec), but also preserves whatever in-app screen
   * was left over from a previous run or manual exploration. Force the app
   * back to its cold-start screen once per worker so specs never inherit
   * arbitrary leftover navigation state.
   */
  before: async function () {
    // This Android 16 emulator image pops a multi-page "Try out your stylus"
    // handwriting tutorial the first time any EditText gets focus in a fresh
    // session. It isn't reliably dismissible via the UI (its own buttons live
    // in a system overlay window, and the hardware back button just pages
    // through its tabs instead of closing it) - disable the feature outright.
    const udid = process.env.ANDROID_UDID;
    if (udid) {
      try {
        execFileSync('adb', ['-s', udid, 'shell', 'settings', 'put', 'secure', 'stylus_handwriting_enabled', '0']);
      } catch {
        // Non-fatal - worst case the stylus prompt dismissal logic in BaseScreen kicks in.
      }
    }

    await driver.terminateApp('nmmt.commuter.com');
    await driver.activateApp('nmmt.commuter.com');
    // The splash screen's duration is inconsistent under instrumentation (seen
    // anywhere from ~2s to 20s+) - poll for either possible cold-start
    // destination instead of guessing a fixed pause.
    await driver.waitUntil(
      async () => {
        const onLogin = await $('android=new UiSelector().descriptionContains("Sign in to continue")')
          .isDisplayed()
          .catch(() => false);
        const onHome = await $('~Quick Ticket')
          .isDisplayed()
          .catch(() => false);
        return onLogin || onHome;
      },
      { timeout: 30000, interval: 1000, timeoutMsg: 'App never left the splash screen after 30s' },
    );
  },
};
