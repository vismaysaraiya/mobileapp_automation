import { BaseScreen } from './BaseScreen';

export class QuickTicketScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('By Route');
  }

  async openRoutePicker(): Promise<void> {
    await this.tap('Route\nSelect Route');
  }

  /** Route rows carry a multi-line content-desc ("<number>\n<description>\n[AC]")
   * that varies with live data - match on the route number prefix instead. */
  async selectRouteByNumber(routeNumber: string): Promise<void> {
    await this.tapDescStartsWith(routeNumber);
  }

  async expectWalletRequiredError(): Promise<void> {
    await this.waitForDescContains('Wallet not created', 10000);
  }
}
