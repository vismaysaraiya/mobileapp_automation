import { BaseScreen } from './BaseScreen';

export class NearbyAttractionScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('Near by Attraction');
  }

  async expectCategoryVisible(categoryLabelContains: string): Promise<void> {
    await this.waitForDescContains(categoryLabelContains, 10000);
  }
}
