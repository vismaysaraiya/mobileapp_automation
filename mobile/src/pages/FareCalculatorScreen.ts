import { BaseScreen } from './BaseScreen';

/**
 * Pass Fare Calculator Application - Route Specific Pass flow: pick a pass
 * duration, a fare category, then Source/Destination stations from a real
 * searchable station list (unlike Journey Planner's GPS-based picker, this
 * one has seeded station data and works reliably).
 */
export class FareCalculatorScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('Pass Fare Calculator Application');
  }

  /** The category list on first open of this screen has been observed taking
   * longer than the default 20s to render on this dev backend. */
  async selectPassCategory(name: 'Route Specific Pass' | 'Senior Citizen Pass' | 'Handicapped Pass' | 'Magical Pass'): Promise<void> {
    await this.tap(name, 30000);
  }

  async selectDuration(name: 'Monthly Pass' | 'Weekly Pass' | 'Quartly Pass' | 'Half Yealy Pass' | 'Yearly Pass'): Promise<void> {
    await this.tap(name);
  }

  async selectFareCategory(name: 'General' | 'Student'): Promise<void> {
    await this.tap(name);
  }

  async openSourcePicker(): Promise<void> {
    await this.tap('Source\nSelect Source Station');
  }

  async openDestinationPicker(): Promise<void> {
    await this.tap('Destination\nSelect Destination Station');
  }

  /** Station rows in the picker are plain buttons labelled with the exact station name. */
  async selectStation(stationName: string): Promise<void> {
    await this.tap(stationName);
  }

  /**
   * This dev backend has no seeded fare/route data for arbitrary station
   * pairs - every combination tried during exploration returned this info
   * message rather than a computed fare. Asserting it verifies the reactive
   * Source+Destination -> journey lookup completes without crashing.
   */
  async expectJourneyLookupResult(): Promise<void> {
    await this.waitForDescContains('No routes available for this journey', 30000);
  }

  /** With only Source selected, the reactive lookup must not fire prematurely. */
  async isJourneyLookupResultDisplayed(): Promise<boolean> {
    return this.byDescContains('No routes available for this journey')
      .isDisplayed()
      .catch(() => false);
  }
}
