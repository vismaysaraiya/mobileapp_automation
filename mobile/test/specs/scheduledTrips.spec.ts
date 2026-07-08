import { HomeScreen, LoginScreen, MoreMenuScreen, ScheduledTripsScreen } from '../../src/pages';
import { testUsers } from '../../src/data/testUsers';

describe('Scheduled Trips (signed in)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();
  const scheduledTrips = new ScheduledTripsScreen();

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

  it('TC_061 (partial) - opens Scheduled Trips and shows the correct empty state', async () => {
    await home.backUntilBottomNavVisible();
    await home.goToTab('More');
    await more.openScheduledTrips();
    await scheduledTrips.isOpen();
    // No in-screen "add" control was found during exploration - saving a
    // journey in advance isn't reachable from this screen on this backend.
    await scheduledTrips.expectEmptyState();
  });
});
