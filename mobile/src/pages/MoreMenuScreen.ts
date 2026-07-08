import { BaseScreen } from './BaseScreen';

export class MoreMenuScreen extends BaseScreen {
  async isOpen(): Promise<boolean> {
    return this.byDescContains('Explore & More')
      .waitForDisplayed({ timeout: 5000 })
      .catch(() => false);
  }

  async isGuest(): Promise<boolean> {
    return this.isDisplayed('Guest User');
  }

  async tapLogin(): Promise<void> {
    await this.scrollToAndTap('Login');
  }

  async openTimeTable(): Promise<void> {
    await this.scrollToAndTap('Time Table');
  }

  async openCityGuide(): Promise<void> {
    await this.scrollToAndTap('City Guide');
  }

  async openPassFareCalculator(): Promise<void> {
    await this.scrollToAndTap('Pass Fare Calculator');
  }

  async openSelfPisQrScan(): Promise<void> {
    await this.scrollToAndTap('Self PIS QR Scan');
  }

  async openNewsAndAlerts(): Promise<void> {
    await this.scrollToAndTap('News & Alerts');
  }

  /** Guest-accessible entry point; the destination itself redirects to Login. */
  async openMyGrievance(): Promise<void> {
    await this.scrollToAndTap('My Grievance');
  }

  /** Only present once signed in. */
  async openFeedback(): Promise<void> {
    await this.scrollToAndTap('Feedback');
  }

  async openNmmtWallet(): Promise<void> {
    await this.scrollToAndTap('NMMT Wallet');
  }

  async openMyFavouriteRoutes(): Promise<void> {
    await this.scrollToAndTap('My Favourite Routes');
  }

  async openScheduledTrips(): Promise<void> {
    await this.scrollToAndTap('Scheduled Trips');
  }

  async openTravelStatistics(): Promise<void> {
    await this.scrollToAndTap('Travel Statistics');
  }

  async openShareLocation(): Promise<void> {
    await this.scrollToAndTap('Share Location');
  }

  async openChangePassword(): Promise<void> {
    await this.scrollToAndTap('Change Password');
  }

  async logout(): Promise<void> {
    await this.scrollToAndTap('Logout');
    await this.tap('Yes'); // confirms the "Are you sure you want to logout?" dialog
  }
}
