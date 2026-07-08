import { expect } from '@wdio/globals';
import { HomeScreen, LoginScreen, MoreMenuScreen, QuickTicketScreen } from '../../src/pages';
import { testUsers } from '../../src/data/testUsers';

describe('Quick Ticket / Mobile Ticketing (signed in)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();
  const quickTicket = new QuickTicketScreen();

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
    await home.goToTab('Home');
    await home.openQuickTicket();
    await expect(quickTicket.byDesc('By Route')).toBeDisplayed();
  });

  it('TC_025 (partial) - lists real routes and proceeds to stop selection', async () => {
    await quickTicket.openRoutePicker();
    await expect(quickTicket.byDescStartsWith('014 AC')).toBeDisplayed();
    await quickTicket.selectRouteByNumber('014 AC');
    await expect(quickTicket.byDescContains('Select source')).toBeDisplayed();
    await expect(quickTicket.byDescContains('Select destination')).toBeDisplayed();
    // Completing the booking needs wallet funds or a live payment gateway - out of
    // scope for UI automation (see WalletScreen / AddMoneyScreen).
  });
});
