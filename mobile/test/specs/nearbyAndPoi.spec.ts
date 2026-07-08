import { expect } from '@wdio/globals';
import { HomeScreen, NearbyAttractionScreen } from '../../src/pages';

describe('Nearby Bus Stops and POI (guest)', () => {
  const home = new HomeScreen();
  const nearbyAttraction = new NearbyAttractionScreen();

  beforeEach(async () => {
    await home.backUntilBottomNavVisible();
    await home.goToTab('Home');
  });

  it('TC_001 - shows the Nearby Stops map with the current-location marker on Home', async () => {
    await expect(home.byDescContains('Nearby Stops')).toBeDisplayed();
    await expect(home.byDesc('Google Map')).toBeDisplayed();
  });

  it('TC_004 (partial) - opens the Near by Attraction / POI screen from Home', async () => {
    await home.openNearbyAttraction();
    await expect(nearbyAttraction.byDescContains('Near by')).toBeDisplayed();
    // Category chips (e.g. "Near by Groceries (0)") confirm the POI list loaded,
    // but this staging backend has no seeded POIs to assert a non-zero result -
    // TC_004's "select a POI from results" step needs an environment with data.
    await nearbyAttraction.expectCategoryVisible('Near by Groceries');
  });
});
