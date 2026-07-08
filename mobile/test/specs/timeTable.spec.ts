import { expect } from '@wdio/globals';
import { HomeScreen, LoginScreen, MoreMenuScreen, TimeTableScreen } from '../../src/pages';

describe('Time Table (guest)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();
  const timeTable = new TimeTableScreen();

  beforeEach(async () => {
    // Time Table shows real data for a signed-in session vs. an empty state
    // for guests - explicitly enforce guest, don't assume it from run order.
    if (await login.isOpen()) {
      await login.continueAsGuest();
    } else {
      await home.backUntilBottomNavVisible();
      await home.goToTab('More');
      if (!(await more.isGuest())) {
        await more.logout();
        await login.continueAsGuest();
      }
    }
    await home.backUntilBottomNavVisible();
    await home.goToTab('More');
    await more.openTimeTable();
    await expect(timeTable.byDesc('By Route')).toBeDisplayed();
  });

  it('TC_009 - shows "No routes available" when nothing has been searched yet', async () => {
    await timeTable.expectNoRoutesAvailable();
  });

  it('offers both By Route and By Station search modes', async () => {
    await expect(timeTable.byDesc('By Route')).toBeDisplayed();
    await expect(timeTable.byDesc('By Station')).toBeDisplayed();
    await timeTable.selectByStation();
    await expect(timeTable.byDesc('By Station')).toBeDisplayed();
  });
});
