import { expect } from '@wdio/globals';
import { HomeScreen, LoginScreen, MoreMenuScreen, SosScreen } from '../../src/pages';
import { testUsers } from '../../src/data/testUsers';

describe('SOS (signed in)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();
  const sos = new SosScreen();

  before(async () => {
    if (await login.isOpen()) {
      await login.login(testUsers.standard.mobileNumber, testUsers.standard.password);
      return;
    }
    await home.backUntilBottomNavVisible();
    await home.goToTab('More');
    if (await more.isGuest()) {
      await more.tapLogin();
      await login.login(testUsers.standard.mobileNumber, testUsers.standard.password);
    }
  });

  it('TC_068 (partial) - opens the Emergency screen with a vehicle selector and Send SOS control', async () => {
    await home.backUntilBottomNavVisible();
    await home.goToTab('Home');
    await home.openSos();
    await expect(sos.byDescContains('Send Emergency Alerts')).toBeDisplayed();
    await expect(await sos.isVehiclePickerDisplayed()).toBe(true);
    await expect(sos.byDescContains('Tap to Send SOS')).toBeDisplayed();
    // Deliberately does not tap "Tap to Send SOS": that fires a real alert to TMC
    // and must never be triggered by automation against a shared backend.
  });
});
