import { expect } from '@wdio/globals';
import { HomeScreen, TrackRouteScreen } from '../../src/pages';

describe('Track Route (guest)', () => {
  const home = new HomeScreen();
  const trackRoute = new TrackRouteScreen();

  beforeEach(async () => {
    await home.backUntilBottomNavVisible();
    await home.goToTab('Home');
    await home.openTrackRoute();
    await expect(trackRoute.byDesc('Track Route')).toBeDisplayed();
  });

  it('TC_010 (partial) - searches for a route and shows the correct no-match state', async () => {
    // Route numbers known to exist elsewhere on this backend (e.g. Quick
    // Ticket's "014 AC") and station names (e.g. "Vashi") were both tried
    // during exploration - this search index has no matching seeded data for
    // any of them. Verifies the search completes cleanly rather than crashing
    // or hanging; TC_010's actual ETA/live-position map needs a matched route.
    await trackRoute.search('014');
    await trackRoute.expectNoMatchResult();
  });
});
