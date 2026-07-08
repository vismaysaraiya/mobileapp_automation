import { expect } from '@wdio/globals';
import { HomeScreen, LoginScreen, MoreMenuScreen, TravelStatisticsScreen } from '../../src/pages';
import { testUsers } from '../../src/data/testUsers';

describe('Travel Statistics (signed in)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();
  const travelStatistics = new TravelStatisticsScreen();

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

  it('TC_062 - shows travel analytics widgets with the correct no-history state', async () => {
    await home.backUntilBottomNavVisible();
    await home.goToTab('More');
    await more.openTravelStatistics();
    await expect(travelStatistics.byDesc('Travel Statistics')).toBeDisplayed();
    // This account has never completed a real booking on this backend, so
    // Tickets Purchased / Fare Spent read 0 and Most Traveled Routes is empty.
    await travelStatistics.expectEmptyState();
  });
});
