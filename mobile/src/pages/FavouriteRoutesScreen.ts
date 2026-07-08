import { BaseScreen } from './BaseScreen';

export class FavouriteRoutesScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('My Favourite Routes');
  }

  /** This account has never favourited a route on this backend - there is no
   * in-screen "add" control here, favourites are added from search results. */
  async expectEmptyState(): Promise<void> {
    await this.waitForDescContains('No favourite routes yet', 30000);
  }
}
