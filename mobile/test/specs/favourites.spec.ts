import { expect } from '@wdio/globals';
import { FavouriteRoutesScreen, HomeScreen, LoginScreen, MoreMenuScreen } from '../../src/pages';
import { testUsers } from '../../src/data/testUsers';

describe('Favourite Routes (signed in)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();
  const favourites = new FavouriteRoutesScreen();

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

  it('TC_016 (partial) - opens My Favourite Routes and shows the correct empty state', async () => {
    await home.backUntilBottomNavVisible();
    await home.goToTab('More');
    await more.openMyFavouriteRoutes();
    await expect(favourites.byDesc('My Favourite Routes')).toBeDisplayed();
    // This account has never favourited a route on this backend, and the
    // screen has no in-screen "add" control (favourites are added from
    // search results, e.g. Journey Planner, which this environment's mock
    // GPS location has no seeded stops for - see journeyPlanner.spec.ts).
    await favourites.expectEmptyState();
  });
});
