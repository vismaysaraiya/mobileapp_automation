import { BaseScreen } from './BaseScreen';

export class TimeTableScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('By Route');
  }

  async selectByRoute(): Promise<void> {
    await this.tap('By Route');
  }

  async selectByStation(): Promise<void> {
    await this.tap('By Station');
  }

  /** The only EditText on this screen is the route/station search box. */
  async search(query: string): Promise<void> {
    await this.typeIntoEditTextAt(0, query);
  }

  async expectNoRoutesAvailable(): Promise<void> {
    await this.waitForDisplayed('No routes available', 10000);
  }
}
