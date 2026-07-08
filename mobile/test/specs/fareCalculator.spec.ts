import { expect } from '@wdio/globals';
import { FareCalculatorScreen, HomeScreen, LoginScreen, MoreMenuScreen } from '../../src/pages';
import { testUsers } from '../../src/data/testUsers';

describe('Pass Fare Calculator (signed in)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();
  const fareCalculator = new FareCalculatorScreen();

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
    await more.openPassFareCalculator();
    await expect(fareCalculator.byDesc('Pass Fare Calculator Application')).toBeDisplayed();
    await fareCalculator.selectPassCategory('Route Specific Pass');
    await fareCalculator.selectDuration('Monthly Pass');
    await fareCalculator.selectFareCategory('General');
  });

  // Runs before TC_019 deliberately: TC_019 selects both Source and
  // Destination, and re-navigating to this screen does not reliably reset
  // those selections - running the "only Source selected" check afterwards
  // would risk seeing TC_019's leftover Destination instead of a clean state.
  it('TC_021 - does not produce a result while destination is still unselected', async () => {
    await fareCalculator.openSourcePicker();
    await fareCalculator.selectStation('CBD Bus Stn.');
    expect(await fareCalculator.isJourneyLookupResultDisplayed()).toBe(false);
  });

  it('TC_019 (partial) - calculates a fare lookup for a selected source/destination station pair', async () => {
    await fareCalculator.openSourcePicker();
    await fareCalculator.selectStation('Badlapur fire Brigade (To Vashi)');
    await fareCalculator.openDestinationPicker();
    await fareCalculator.selectStation('Chuna Bhatti Fatak (To Vashi)');
    // This dev backend (nmmtitmsmobileapidev) has no seeded fare/route data for
    // station pairs picked blind - every combination tried during exploration
    // returned this info message rather than a computed ₹ fare. This still
    // verifies the reactive Source+Destination -> journey lookup completes.
    await fareCalculator.expectJourneyLookupResult();
  });
});
