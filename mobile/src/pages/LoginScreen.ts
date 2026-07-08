import { BaseScreen } from './BaseScreen';

export class LoginScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.byDescContains('Sign in to continue')
      .waitForDisplayed({ timeout: 5000 })
      .catch(() => false);
  }

  async login(mobileNumber: string, password: string): Promise<void> {
    await this.typeIntoEditTextAt(0, mobileNumber);
    await this.typeIntoEditTextAt(1, password);
    await this.tap('Sign In');
  }

  async continueAsGuest(): Promise<void> {
    await this.tap('Continue as Guest');
  }

  async expectSuccessToast(): Promise<void> {
    await this.waitForDescContains('Login successful', 20000);
  }
}
