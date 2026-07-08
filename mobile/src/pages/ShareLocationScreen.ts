import { BaseScreen } from './BaseScreen';

export class ShareLocationScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('Share via', 20000);
  }

  /** The emulator's mock GPS location renders as coordinates/address once the
   * "Getting your location..." loading state resolves. */
  async expectCurrentLocationResolved(): Promise<void> {
    await this.waitForDisplayed('Current Location', 20000);
  }

  /**
   * Intentionally stops at verifying the share-via options are present.
   * Tapping SMS/Email/WhatsApp/Contacts hands off to a real external
   * Android app via an OS share intent - out of scope for UI automation,
   * same boundary as the payment gateway handoff in wallet.spec.ts.
   */
  async expectShareOptionsVisible(): Promise<void> {
    await this.waitForDisplayed('SMS', 10000);
    await this.waitForDisplayed('Email', 10000);
    await this.waitForDisplayed('WhatsApp', 10000);
    await this.waitForDisplayed('Contacts', 10000);
  }
}
