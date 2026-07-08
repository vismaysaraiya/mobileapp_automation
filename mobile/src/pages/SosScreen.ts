import { BaseScreen } from './BaseScreen';

export class SosScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.isDisplayed('Tap to Send SOS');
  }

  async isVehiclePickerDisplayed(): Promise<boolean> {
    return this.isDisplayed('Select Vehicle');
  }

  /**
   * Intentionally does NOT provide a method to tap the "Tap to Send SOS" control.
   * That control fires a real emergency alert to TMC - it must never be exercised
   * by automation against a shared/staging backend, only verified as present.
   */
}
