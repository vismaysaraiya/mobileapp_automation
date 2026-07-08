import { expect } from '@wdio/globals';
import { HomeScreen, LoginScreen, MoreMenuScreen } from '../../src/pages';

/**
 * Covers TC_085 (Feedback/Grievance status requires login) and the equivalent
 * guest-gating behaviour shared by My Ticket, My Pass and Quick Ticket - all
 * verified live to redirect to Login rather than crash or silently no-op.
 */
describe('Guest access restrictions', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();

  beforeEach(async () => {
    // Land on Home as a guest, regardless of what the previous spec left behind.
    if (await login.isOpen()) {
      await login.continueAsGuest();
      return;
    }
    await home.backUntilBottomNavVisible();
    await home.goToTab('More');
    if (!(await more.isGuest())) {
      await more.logout();
      await login.continueAsGuest();
    }
  });

  it('TC_085 - blocks My Grievance for a guest and prompts login', async () => {
    await home.goToTab('More');
    await more.openMyGrievance();
    // Unlike My Ticket/My Pass (which show a persistent "please login" message
    // screen), My Grievance redirects straight to the Login screen itself.
    await expect(login.byDescContains('Sign in to continue')).toBeDisplayed();
  });

  it('blocks My Ticket for a guest and prompts login', async () => {
    await home.goToTab('My Ticket');
    await expect(home.byDescContains('login first to continue')).toBeDisplayed();
  });

  it('blocks My Pass for a guest and prompts login', async () => {
    await home.goToTab('My Pass');
    await expect(home.byDescContains('login first to continue')).toBeDisplayed();
  });

  it('blocks Quick Ticket for a guest with a toast, without crashing', async () => {
    await home.goToTab('Home');
    await home.openQuickTicket();
    await expect(home.byDescContains('Login Required')).toBeDisplayed();
  });
});
