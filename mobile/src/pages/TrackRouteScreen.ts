import { BaseScreen } from './BaseScreen';

export class TrackRouteScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('Track Route');
  }

  /** The only EditText on this screen is the route search-by-name-or-number box. */
  async search(query: string): Promise<void> {
    await this.typeIntoEditTextAt(0, query);
  }

  /**
   * This dev backend has no seeded data matching any route number or station
   * name tried during exploration ("014", "028", "Vashi" all came back empty) -
   * asserting this message verifies the search completes and reports no
   * results cleanly rather than crashing or hanging.
   */
  async expectNoMatchResult(): Promise<void> {
    await this.waitForDescContains('No routes match your search', 20000);
  }
}
