import { expect } from '@wdio/globals';
import { GrievanceScreen, HomeScreen, LoginScreen, MoreMenuScreen } from '../../src/pages';
import { testUsers } from '../../src/data/testUsers';

describe('Grievance (signed in)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();
  const grievance = new GrievanceScreen();

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
    // Add Grievance is pushed two levels deep (My Grievance list, then the
    // form itself), one level deeper than the default 2 back-out attempts
    // this helper assumes for other sub-screens.
    await home.backUntilBottomNavVisible(4);
    await home.goToTab('More');
    await more.openMyGrievance();
    await expect(grievance.byDesc('My Grievance')).toBeDisplayed();
    await grievance.openAddGrievance();
    await expect(await grievance.isAddGrievanceFormOpen()).toBe(true);
  });

  it('TC_077 - blocks submission and shows a validation error when category is missing', async () => {
    await grievance.tapSubmit();
    await grievance.expectCategoryValidationError();
  });

  it('TC_075 (partial) - fills category, description and incident date/time', async () => {
    await grievance.selectCategory('Driver');
    await grievance.typeProblemDescription('Test grievance description for automation');
    await grievance.selectIncidentDateTimeNow();
    await grievance.tapSubmit();
    // Sub Category is a dependent dropdown that stayed disabled through every
    // path tried during exploration (Route/Vehicle selection did not unlock
    // it either) - this is as far as this form can be driven on this backend.
    // The validation advancing past "select a category" to this next required
    // field confirms the category/description/date-time inputs above landed.
    await grievance.expectSubCategoryValidationError();
  });
});
