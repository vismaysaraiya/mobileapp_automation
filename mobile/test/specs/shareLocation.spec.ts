import { HomeScreen, LoginScreen, MoreMenuScreen, ShareLocationScreen } from '../../src/pages';
import { testUsers } from '../../src/data/testUsers';

describe('Share Location (signed in)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();
  const shareLocation = new ShareLocationScreen();

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

  it('TC_072 (partial) - resolves current location and offers share-via options', async () => {
    await home.backUntilBottomNavVisible();
    await home.goToTab('More');
    await more.openShareLocation();
    await shareLocation.isOpen();
    await shareLocation.expectCurrentLocationResolved();
    // Deliberately stops here: tapping SMS/Email/WhatsApp/Contacts hands off
    // to a real external Android app via an OS share intent, out of scope
    // for UI automation - same boundary as the payment gateway handoff.
    await shareLocation.expectShareOptionsVisible();
  });
});
