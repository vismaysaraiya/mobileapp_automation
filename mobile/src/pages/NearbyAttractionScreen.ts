import { BaseScreen } from './BaseScreen';

export class NearbyAttractionScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('Near by Attraction');
  }

  async expectCategoryVisible(categoryLabelContains: string): Promise<void> {
    await this.waitForDescContains(categoryLabelContains, 10000);
  }

  /** The only EditText on this screen is the POI search box; its hint text
   * (e.g. "Search Groceries") changes with the selected category chip. */
  async search(query: string): Promise<void> {
    await this.typeIntoEditTextAt(0, query);
  }
}
