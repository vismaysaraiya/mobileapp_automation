import { test, expect } from '../src/fixtures/pageFixtures';
import { users } from '../src/data/users';

test.describe('Cart', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.open();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
  });

  test('adds an item to the cart and checks out', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.expectCartCount(1);

    await inventoryPage.openCart();
    await cartPage.expectItemCount(1);
    await cartPage.checkout();

    await expect(cartPage.page).toHaveURL(/checkout-step-one/);
  });
});
