import { BaseScreen } from './BaseScreen';

export class JourneyPlannerScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('Find Routes');
  }

  async tapFindRoutes(): Promise<void> {
    await this.tap('Find Routes');
  }

  async openSourcePicker(): Promise<void> {
    await this.tap('Source:\nSelect Source Station');
  }

  async openDestinationPicker(): Promise<void> {
    await this.tap('Destination:\nSelect Destination');
  }

  async expectValidationError(messageContains: string): Promise<void> {
    await this.waitForDescContains(messageContains, 10000);
  }
}
