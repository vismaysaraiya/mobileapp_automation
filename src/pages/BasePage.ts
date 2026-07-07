import { Locator, Page } from '@playwright/test';

export class BasePage {
  constructor(public readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  protected async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  protected async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  protected async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }
}
