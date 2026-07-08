import { $, driver } from '@wdio/globals';

/**
 * The NMMT app exposes almost no resource-ids - nearly every element is identified
 * only by its Android accessibility content-desc (often multi-line, joined with \n).
 * These helpers standardize the selector strategies that actually work against it.
 */
export class BaseScreen {
  byDesc(desc: string) {
    return $(`~${desc}`);
  }

  byDescStartsWith(prefix: string) {
    return $(`android=new UiSelector().descriptionStartsWith("${prefix}")`);
  }

  byDescContains(text: string) {
    return $(`android=new UiSelector().descriptionContains("${text}")`);
  }

  byTextContains(text: string) {
    return $(`android=new UiSelector().textContains("${text}")`);
  }

  /** Unlabeled EditText fields (mobile number, password, search boxes) have no
   * content-desc, so they must be targeted by position among same-class siblings. */
  editTextAt(index: number) {
    return $(`android=new UiSelector().className("android.widget.EditText").instance(${index})`);
  }

  async tap(desc: string, timeout = 20000): Promise<void> {
    const el = this.byDesc(desc);
    await el.waitForDisplayed({ timeout });
    await el.click();
  }

  async tapDescStartsWith(prefix: string, timeout = 20000): Promise<void> {
    const el = this.byDescStartsWith(prefix);
    await el.waitForDisplayed({ timeout });
    await el.click();
  }

  /** For items inside a scrollable list (e.g. the More menu) that may be below
   * the fold - UiScrollable scrolls the nearest scrollable container until the
   * target description is visible, then returns it already on-screen. */
  async scrollToAndTap(desc: string, timeout = 20000): Promise<void> {
    const el = $(
      `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().description("${desc}"))`,
    );
    await el.waitForDisplayed({ timeout });
    await el.click();
  }

  /**
   * On this Android 16 emulator image, focusing an EditText sometimes triggers
   * the OS's one-time "Try out your stylus" handwriting tip, which overlays the
   * next field below it. It only appears once per session but must be dismissed
   * (via its own Cancel button) or every later field interaction stays blocked.
   */
  async dismissStylusHandwritingPromptIfPresent(): Promise<void> {
    const prompt = $('android=new UiSelector().textContains("Try out your stylus")');
    if (await prompt.isDisplayed().catch(() => false)) {
      // This is a system IME overlay (a different window than the app), so its
      // own "Cancel" button isn't reliably clickable via the app's element tree -
      // the hardware back button is the robust way to dismiss any OS overlay.
      await driver.back();
      await prompt.waitForDisplayed({ timeout: 5000, reverse: true });
    }
  }

  /**
   * EditText.setValue only sticks once the field has focus - click before typing.
   * Re-fetches and re-focuses the field after dismissing the stylus prompt (that
   * dismissal can shift focus/layout) and uses addValue over setValue to skip
   * setValue's internal clear() step, which has been seen to fire against a
   * stale element reference and fail with "element wasn't found" right after
   * that popup closes.
   *
   * Fields can carry over a previous value - noReset:true keeps the app process
   * (and its in-memory form state) alive across specs/retries, so a field this
   * same flow already typed into (e.g. a mocha-retried login) is not guaranteed
   * empty. addValue() alone would then append onto stale text and submit a
   * corrupted mobile number/password. clearValue() first, retried once against
   * a freshly-fetched element if it hits that same stale-element error.
   */
  async typeIntoEditTextAt(index: number, text: string): Promise<void> {
    await this.editTextAt(index).waitForDisplayed({ timeout: 20000 });
    await this.editTextAt(index).click();
    await this.dismissStylusHandwritingPromptIfPresent();
    await this.editTextAt(index).waitForDisplayed({ timeout: 20000 });
    await this.editTextAt(index).click();
    await this.editTextAt(index)
      .clearValue()
      .catch(async () => {
        await this.editTextAt(index).waitForDisplayed({ timeout: 5000 });
        await this.editTextAt(index).clearValue();
      });
    await this.editTextAt(index).addValue(text);
  }

  /** Waits briefly rather than checking instantaneously - screen transitions
   * (splash, navigation animations) can leave a target element not-yet-rendered
   * for a few hundred ms even though it's about to appear. */
  async isDisplayed(desc: string, timeout = 5000): Promise<boolean> {
    return this.byDesc(desc)
      .waitForDisplayed({ timeout })
      .catch(() => false);
  }

  async waitForDisplayed(desc: string, timeout = 20000): Promise<void> {
    await this.byDesc(desc).waitForDisplayed({ timeout });
  }

  async waitForDescContains(text: string, timeout = 20000): Promise<void> {
    await this.byDescContains(text).waitForDisplayed({ timeout });
  }

  async goBack(): Promise<void> {
    await driver.back();
  }
}
