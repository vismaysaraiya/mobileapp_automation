import { BaseScreen } from './BaseScreen';

export class NewsAndAlertsScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('News & Alerts');
  }

  /** This dev backend has real seeded announcement data - unlike most other
   * list screens explored, no empty-state handling needed here. */
  async expectAnnouncementVisible(titleContains: string): Promise<void> {
    await this.waitForDescContains(titleContains, 20000);
  }
}
