import { expect } from '@wdio/globals';
import { HomeScreen, MoreMenuScreen, NewsAndAlertsScreen } from '../../src/pages';

describe('News & Alerts (guest)', () => {
  const home = new HomeScreen();
  const more = new MoreMenuScreen();
  const newsAndAlerts = new NewsAndAlertsScreen();

  beforeEach(async () => {
    await home.backUntilBottomNavVisible();
    await home.goToTab('More');
    await more.openNewsAndAlerts();
    await expect(newsAndAlerts.byDesc('News & Alerts')).toBeDisplayed();
  });

  it('TC_023 - shows announcements in the News & Alerts tab', async () => {
    // Unlike most list screens on this backend, this one has real seeded
    // content - no empty-state handling needed.
    await newsAndAlerts.expectAnnouncementVisible('Launch of new NMMT Mobile App');
  });
});
