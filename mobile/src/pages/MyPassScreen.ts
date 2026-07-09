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

  /**
   * These labels have been observed to change between sessions (seen "Route
   * Specific Pass"/"Magical Pass" in one run, "Route Pass"/"Magic Pass" in
   * another) - likely admin-CMS-driven content (see TC_092) rather than a
   * stable app constant. If this selector starts failing, re-check the live
   * labels before assuming a locator regression.
   */
  async selectPassCategory(name: 'Route Pass' | 'Senior Citizen Pass' | 'Handicapped Pass' | 'Magic Pass'): Promise<void> {
    await this.tap(name);
  }

  /** TC_031: the four pass categories offered when applying for a new pass. */
  async expectPassCategoriesVisible(): Promise<void> {
    await this.waitForDisplayed('Route Pass', 20000);
    await this.waitForDisplayed('Senior Citizen Pass', 20000);
    await this.waitForDisplayed('Handicapped Pass', 20000);
    await this.waitForDisplayed('Magic Pass', 20000);
  }

  /** TC_054: transit product durations shown after picking Route Specific Pass. */
  async expectPassDurationOptionsVisible(): Promise<void> {
    await this.waitForDisplayed('Monthly Pass', 20000);
    await this.waitForDisplayed('Weekly Pass', 20000);
    await this.waitForDisplayed('Yearly Pass', 20000);
  }

  async selectPassDuration(name: 'Monthly Pass' | 'Weekly Pass' | 'Quartly Pass' | 'Half Yealy Pass' | 'Yearly Pass'): Promise<void> {
    await this.tap(name);
  }

  /** Selecting a duration reveals a General/Student fare category choice. */
  async selectFareCategory(name: 'General' | 'Student'): Promise<void> {
    await this.tap(name);
  }

  /**
   * TC_056: with Name (pre-filled from profile) as the only field touched,
   * mandatory Gender/Service Type/Date of Birth are still unset - the button
   * is disabled from the moment the form renders, before any interaction.
   */
  async isProceedForVerificationEnabled(): Promise<boolean> {
    const el = this.byDesc('Proceed for Verification');
    await el.waitForDisplayed({ timeout: 20000 });
    return el.isEnabled();
  }
}
