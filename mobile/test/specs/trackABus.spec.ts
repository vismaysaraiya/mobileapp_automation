import { expect } from '@wdio/globals';
import { HomeScreen, LoginScreen, MoreMenuScreen, TrackABusScreen } from '../../src/pages';
import { testUsers } from '../../src/data/testUsers';

describe('Track a Bus (signed in)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();
  const trackABus = new TrackABusScreen();

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

  it('TC_007 (partial) - looks up a bus by route number and opens its route details', async () => {
    await home.backUntilBottomNavVisible();
    await home.goToTab('Home');
    await home.openTrackABus();
    await expect(trackABus.byDesc('Track a Bus')).toBeDisplayed();
    await trackABus.search('014');
    await trackABus.selectBusResultStartingWith('MH-43-BP-0014');
    await trackABus.expectRouteDetailsOpened();
    // This dev backend has no vehicle actually broadcasting live GPS for the
    // seeded buses returned by search - this verifies the lookup completes
    // with a clear status message rather than a live position/ETA.
    await trackABus.expectNoLiveTripMessage();
  });
});
