import { BaseScreen } from './BaseScreen';

export class WalletScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('Add Money');
  }

  async expectWalletNotCreated(): Promise<void> {
    await this.waitForDescContains('Wallet not created', 10000);
  }

  async openAddMoney(): Promise<void> {
    await this.tap('Add Money');
  }

  async openViewHistory(): Promise<void> {
    await this.tap('View History');
  }
}

export class AddMoneyScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('Add Amount');
  }

  async selectQuickAmount(amountLabel: '₹100' | '₹200' | '₹500' | '₹1000'): Promise<void> {
    await this.tap(amountLabel);
  }

  async selectPaymentMode(mode: 'PhonePe' | 'Razorpay'): Promise<void> {
    await this.tap(mode);
  }

  /** Stops short of tapping "Add Amount" - completing payment needs a real gateway
   * sandbox and is out of scope for UI automation. */
  async isAddAmountButtonDisplayed(): Promise<boolean> {
    return this.isDisplayed('Add Amount');
  }
}
