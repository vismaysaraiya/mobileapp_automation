import { BaseScreen } from './BaseScreen';

export class ScheduledTripsScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('Scheduled Trips');
  }

  /** This screen has no in-screen "add" control (no button/FAB found during
   * exploration) - only its empty state is reachable via UI automation. */
  async expectEmptyState(): Promise<void> {
    await this.waitForDescContains('No scheduled trips found', 20000);
  }
}
