import { BaseScreen } from './BaseScreen';

export class TrackABusScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('Track a Bus');
  }

  /** The only EditText on this screen is the route/bus number search box. */
  async search(query: string): Promise<void> {
    await this.typeIntoEditTextAt(0, query);
  }

  /** Result rows carry a "<reg no> (<depot/destination>)" content-desc that
   * varies with live data - match on the registration number prefix. */
  async selectBusResultStartingWith(prefix: string): Promise<void> {
    await this.tapDescStartsWith(prefix);
  }

  async expectRouteDetailsOpened(): Promise<void> {
    await this.waitForDisplayed('Route Details', 15000);
  }

  /**
   * This dev backend has no vehicle actually broadcasting a live GPS feed for
   * the seeded buses returned by search - every result tried during
   * exploration reported this rather than a live position/ETA. Asserting it
   * verifies the route lookup completes without crashing.
   */
  async expectNoLiveTripMessage(): Promise<void> {
    await this.waitForDescContains("isn't on a live trip", 20000);
  }
}
