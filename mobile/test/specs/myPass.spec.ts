import { expect } from '@wdio/globals';
import { HomeScreen, LoginScreen, MoreMenuScreen, MyPassScreen } from '../../src/pages';
import { testUsers } from '../../src/data/testUsers';

describe('My Pass (signed in)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();
  const myPass = new MyPassScreen();

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

  beforeEach(async () => {
    await home.backUntilBottomNavVisible();
    await home.goToTab('My Pass');
    await myPass.expectNoPassesState();
    await myPass.openApplyPass();
    await expect(await myPass.isPassApplicationOpen()).toBe(true);
  });

  it('TC_031 - shows the available pass categories', async () => {
    await myPass.expectPassCategoriesVisible();
  });

  it('TC_054 - shows transit product durations for a Route Specific Pass', async () => {
    await myPass.selectPassCategory('Route Specific Pass');
    await myPass.expectPassDurationOptionsVisible();
  });
});
