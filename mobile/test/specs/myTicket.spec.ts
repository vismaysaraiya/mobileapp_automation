import { HomeScreen, LoginScreen, MoreMenuScreen, MyTicketScreen } from '../../src/pages';
import { testUsers } from '../../src/data/testUsers';

describe('My Ticket (signed in)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();
  const myTicket = new MyTicketScreen();

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

  it('TC_029 (partial) - shows the correct empty state when no ticket has been booked', async () => {
    await home.backUntilBottomNavVisible();
    await home.goToTab('My Ticket');
    // Completing a real booking needs wallet funds/payment gateway (see
    // quickTicket.spec.ts) - this account has no active/scheduled ticket.
    await myTicket.expectNoTicketsState();
  });
});
