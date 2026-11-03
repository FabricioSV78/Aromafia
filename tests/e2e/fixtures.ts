import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';
export type { CDPSession, Locator, Page, TestInfo } from '@playwright/test';

/** Catalog cases represent an existing tab that has already watched or skipped the intro. */
export const test = base.extend<{ catalogSession: boolean }>({
  catalogSession: [
    async ({ page }, use) => {
      await page.addInitScript(() => {
        if (window.top !== window) return;
        try {
          sessionStorage.setItem('aromafia:intro:v3:seen', '1');
        } catch {
          // An opaque document can precede navigation to the local site.
        }
      });
      await use(true);
    },
    { auto: true },
  ],
});
