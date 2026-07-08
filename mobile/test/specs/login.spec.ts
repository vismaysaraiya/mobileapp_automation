import { expect } from '@wdio/globals';
import { HomeScreen, LoginScreen, MoreMenuScreen } from '../../src/pages';
import { testUsers } from '../../src/data/testUsers';

/**
 * Login itself isn't a numbered test case in Testcases.xlsx (it's assumed as
 * "step 1" of most flows) but every gated module depends on it, so it is
 * verified here as a standalone foundation.
 */
describe('Login', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();

  beforeEach(async () => {
    // A fresh/unauthenticated launch opens directly on the Login screen (no
    // bottom nav there yet); only navigate via More when starting from Home.
    if (await login.isOpen()) return;
    await home.backUntilBottomNavVisible();
    await home.goToTab('More');
    if (await more.isGuest()) {
      await more.tapLogin();
    } else {
      // Logout drops straight onto the Login screen - no separate Login tap needed.
      await more.logout();
    }
  });

  it('signs in with a valid mobile number and password', async () => {
    await expect(login.byDescContains('Sign in to continue')).toBeDisplayed();
    await login.login(testUsers.standard.mobileNumber, testUsers.standard.password);
    // The "Login successful" toast fades in ~2-3s and is easy to miss depending
    // on exact timing - landing on Home with the real display name is the
    // durable signal that the sign-in actually worked.
    await expect(home.byDesc('Quick Ticket')).toBeDisplayed();
    // Guest sessions greet "Good Evening,\nuser" - confirm the real name shows instead.
    await expect(home.isGuest()).resolves.toBe(false);
  });
});
