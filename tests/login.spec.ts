import { test, expect } from '../src/fixtures/pageFixtures';
import { users } from '../src/data/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('logs in successfully with valid credentials', async ({ loginPage, inventoryPage }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
  });

  test('shows an error for a locked-out user', async ({ loginPage }) => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);
    await loginPage.expectErrorMessage('locked out');
  });

  test('shows an error for an invalid password', async ({ loginPage }) => {
    await loginPage.login(users.invalidPassword.username, users.invalidPassword.password);
    await loginPage.expectErrorMessage('do not match');
  });
});
