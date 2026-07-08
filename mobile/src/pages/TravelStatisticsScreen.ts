import { BaseScreen } from './BaseScreen';

export class TravelStatisticsScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('Travel Statistics');
  }

  /** This account has never completed a real booking on this backend, so the
   * analytics widgets correctly show a zeroed/empty state rather than data. */
  async expectEmptyState(): Promise<void> {
    await this.waitForDisplayed('Tickets Purchased', 30000);
    await this.waitForDescContains('No travel data available', 30000);
  }
}
