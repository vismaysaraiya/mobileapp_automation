import { BaseScreen } from './BaseScreen';

export class GrievanceScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('My Grievance');
  }

  async openAddGrievance(): Promise<void> {
    await this.tap('Add Grievance');
  }

  async isAddGrievanceFormOpen(): Promise<boolean> {
    return this.isDisplayed('Category*');
  }

  async selectCategory(name: 'Conductor' | 'Driver' | 'Vehicle' | 'Ticket Issue Related' | 'Others'): Promise<void> {
    await this.tap(name);
  }

  /** The only EditText on the Add Grievance form is Problem Description. */
  async typeProblemDescription(text: string): Promise<void> {
    await this.typeIntoEditTextAt(0, text);
  }

  /** Opens the date picker, accepts today's date, then accepts the default time. */
  async selectIncidentDateTimeNow(): Promise<void> {
    await this.tap('Select Date & Time');
    await this.tapDescContains('Today');
    await this.tap('OK');
    await this.tap('OK');
  }

  /** Submit sits below the fold on this long form - needs a scroll, not a plain tap. */
  async tapSubmit(): Promise<void> {
    await this.scrollToAndTap('Submit');
  }

  async expectCategoryValidationError(): Promise<void> {
    await this.waitForDescContains('Please select a category', 20000);
  }

  async expectSubCategoryValidationError(): Promise<void> {
    await this.waitForDescContains('Please select a sub category', 20000);
  }
}
