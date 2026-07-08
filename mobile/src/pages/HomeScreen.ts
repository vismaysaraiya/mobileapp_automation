import { driver } from '@wdio/globals';
import { BaseScreen } from './BaseScreen';

export class HomeScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('Quick Ticket');
  }

  async goToTab(tab: 'Home' | 'My Ticket' | 'My Pass' | 'More'): Promise<void> {
    await this.tap(tab);
  }

  /**
   * Sub-screens (Journey Planner, Time Table, Quick Ticket, ...) have no bottom
   * nav, so a test that leaves one mid-flow strands the next test's `goToTab`
   * call. Back out (up to a few levels) until any bottom-nav tab is visible
   * again before navigating.
   *
   * Two safety margins, learned the hard way: a too-short check timeout reads
   * a still-rendering Home screen as "no bottom nav" and then backs out of the
   * app entirely (Home is the root of the back stack); and once that happens,
   * relaunch rather than keep pressing back against the launcher.
   */
  async backUntilBottomNavVisible(maxAttempts = 2): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts && !(await this.isDisplayed('More', 3000)); attempt++) {
      await this.goBack();
    }
    if (!(await this.isDisplayed('More', 3000))) {
      await driver.activateApp('nmmt.commuter.com');
    }
  }

  async openQuickTicket(): Promise<void> {
    await this.tap('Quick Ticket');
  }

  async openPlanJourney(): Promise<void> {
    await this.tap('Plan Journey');
  }

  async openNearbyAttraction(): Promise<void> {
    await this.tap('Near by Attraction');
  }

  async openTrackRoute(): Promise<void> {
    await this.tapDescStartsWith('Track Route');
  }

  async openTrackABus(): Promise<void> {
    await this.tapDescStartsWith('Track a Bus');
  }

  /** Guest sessions show "Good Evening,\nuser"; authenticated sessions show the real name. */
  async isGuest(): Promise<boolean> {
    return this.isDisplayed('user');
  }

  /**
   * The SOS badge next to the profile avatar (only present when signed in) has no
   * content-desc/text in the accessibility tree, so it can't be targeted with an
   * accessibility-id or UiSelector locator - fall back to a relative-position tap.
   * Captured position: top-right header, ~79% width / ~6.5% height on a 1080x2400 screen.
   */
  async openSos(): Promise<void> {
    const { width, height } = await driver.getWindowSize();
    await driver.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: Math.round(width * 0.79), y: Math.round(height * 0.065) })
      .down()
      .pause(100)
      .up()
      .perform();
  }
}
