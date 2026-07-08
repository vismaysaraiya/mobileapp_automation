import { BaseScreen } from './BaseScreen';

export class FeedbackScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('Add Feedback');
  }

  /** This account has never had a feedback category selectable (see
   * expectCategoryValidationError) so it has no submitted feedback either. */
  async expectNoFeedbackData(): Promise<void> {
    await this.waitForDisplayed('No data available', 30000);
  }

  async openAddFeedback(): Promise<void> {
    await this.tap('Add Feedback');
  }

  async isAddFeedbackFormOpen(): Promise<boolean> {
    return this.isDisplayed('Feedback Category *');
  }

  async tapSubmit(): Promise<void> {
    await this.tap('Submit');
  }

  async expectCategoryValidationError(): Promise<void> {
    await this.waitForDescContains('Please select a feedback category', 10000);
  }
}
