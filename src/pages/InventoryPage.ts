import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly pageTitle: Locator;
  readonly menuButton: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.pageTitle).toHaveText('Products');
  }

  itemAddButton(itemName: string): Locator {
    const slug = itemName.toLowerCase().replace(/\s+/g, '-');
    return this.page.locator(`[data-test="add-to-cart-${slug}"]`);
  }

  async addItemToCart(itemName: string): Promise<void> {
    await this.click(this.itemAddButton(itemName));
  }

  async openCart(): Promise<void> {
    await this.click(this.cartLink);
  }

  async expectCartCount(count: number): Promise<void> {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async sortBy(option: string): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }
}
