import { expect } from '@wdio/globals';
import {
  AddMoneyScreen,
  HomeScreen,
  LoginScreen,
  MoreMenuScreen,
  WalletScreen,
} from '../../src/pages';
import { testUsers } from '../../src/data/testUsers';

describe('NMMT Wallet (signed in)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();
  const wallet = new WalletScreen();
  const addMoney = new AddMoneyScreen();

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
    await home.goToTab('More');
    await more.openNmmtWallet();
    // The wallet balance fetch hits a "dev" backend (nmmtitmsmobileapidev) that has
    // been observed taking 10-30s+ under load, occasionally exceeding even a 30s
    // wait on back-to-back navigations within the same spec file - wait further
    // past that instead of the shorthand `expect` assertion.
    await wallet.byDesc('Add Money').waitForDisplayed({ timeout: 45000 });
  });

  it('TC_049 (partial) - shows wallet-not-created state before first top-up', async () => {
    await wallet.expectWalletNotCreated();
  });

  it('TC_050 (partial) - reaches payment mode selection for a wallet top-up', async () => {
    await wallet.openAddMoney();
    await expect(addMoney.byDesc('Add Amount')).toBeDisplayed();
    await addMoney.selectQuickAmount('₹100');
    await addMoney.selectPaymentMode('Razorpay');
    // Completing the top-up needs a live PhonePe/Razorpay sandbox - out of scope
    // for UI automation. This verifies the flow up to the gateway handoff only.
    await expect(await addMoney.isAddAmountButtonDisplayed()).toBe(true);
  });
});
