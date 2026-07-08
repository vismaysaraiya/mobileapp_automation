import { FeedbackScreen, HomeScreen, LoginScreen, MoreMenuScreen } from '../../src/pages';
import { testUsers } from '../../src/data/testUsers';

describe('Feedback (signed in)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const login = new LoginScreen();
  const feedback = new FeedbackScreen();

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
    await more.openFeedback();
    await feedback.isOpen();
  });

  it('TC_083 (partial) - shows the correct no-data state when no feedback has been submitted', async () => {
    // This account has no submitted feedback on this backend (its Feedback
    // Category selector never became interactive during exploration - see
    // TC_082 - so no feedback has ever successfully gone through here).
    await feedback.expectNoFeedbackData();
  });

  it('TC_082 - blocks submission and shows a validation error when category is missing', async () => {
    await feedback.openAddFeedback();
    await feedback.isAddFeedbackFormOpen();
    await feedback.tapSubmit();
    await feedback.expectCategoryValidationError();
  });
});
