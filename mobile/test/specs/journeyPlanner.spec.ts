import { expect } from '@wdio/globals';
import { HomeScreen, JourneyPlannerScreen } from '../../src/pages';

describe('Journey Planner (guest)', () => {
  const home = new HomeScreen();
  const journeyPlanner = new JourneyPlannerScreen();

  beforeEach(async () => {
    await home.backUntilBottomNavVisible();
    await home.goToTab('Home');
    await home.openPlanJourney();
    await expect(journeyPlanner.byDesc('Find Routes')).toBeDisplayed();
  });

  it('TC_015 - blocks search and shows a validation error when source station is missing', async () => {
    await journeyPlanner.tapFindRoutes();
    await journeyPlanner.expectValidationError('Please select From station');
  });

  it('TC_013 (partial) - opens the source station picker with a map', async () => {
    await journeyPlanner.openSourcePicker();
    await expect(journeyPlanner.byDescContains('Select Source')).toBeDisplayed();
    // This staging backend returns no stops for the emulator's mock GPS location
    // ("0 stops" / "No nearby stops found"), so selecting a real source station
    // and asserting a populated results list needs a location with seeded data.
  });
});
