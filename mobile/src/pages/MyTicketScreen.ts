import { BaseScreen } from './BaseScreen';

export class MyTicketScreen extends BaseScreen {
  /**
   * This account has no booked/active ticket on this backend, so the empty
   * state is what's reachable via UI automation (see quickTicket.spec.ts for
   * why a real booking can't be completed). Note the app shows the raw
   * untranslated i18n key "no_tickets_found" here rather than a formatted
   * message - a real (minor) localization bug, not a locator issue.
   */
  async expectNoTicketsState(): Promise<void> {
    await this.waitForDescContains('no_tickets_found', 20000);
  }
}
