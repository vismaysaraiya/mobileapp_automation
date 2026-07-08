import { BaseScreen } from './BaseScreen';

export class MyPassScreen extends BaseScreen {
  async expectNoPassesState(): Promise<void> {
    await this.waitForDescContains('No passes found', 20000);
  }

  async openApplyPass(): Promise<void> {
    await this.tap('Apply Pass');
  }

  async isPassApplicationOpen(): Promise<boolean> {
    return this.isDisplayed('Pass Application', 20000);
  }

  async selectPassCategory(name: 'Route Specific Pass' | 'Senior Citizen Pass' | 'Handicapped Pass' | 'Magical Pass'): Promise<void> {
    await this.tap(name);
  }

  /** TC_031: the four pass categories offered when applying for a new pass. */
  async expectPassCategoriesVisible(): Promise<void> {
    await this.waitForDisplayed('Route Specific Pass', 20000);
    await this.waitForDisplayed('Senior Citizen Pass', 20000);
    await this.waitForDisplayed('Handicapped Pass', 20000);
    await this.waitForDisplayed('Magical Pass', 20000);
  }

  /** TC_054: transit product durations shown after picking Route Specific Pass. */
  async expectPassDurationOptionsVisible(): Promise<void> {
    await this.waitForDisplayed('Monthly Pass', 20000);
    await this.waitForDisplayed('Weekly Pass', 20000);
    await this.waitForDisplayed('Yearly Pass', 20000);
  }
}
