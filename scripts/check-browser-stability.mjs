import { mkdir, writeFile } from 'node:fs/promises';
import { freemem, totalmem } from 'node:os';
import { join } from 'node:path';
import { chromium, expect } from '@playwright/test';

// One browser, one context at a time. Shell is an explicit diagnostic, never a fallback.
const shell = process.argv.includes('--shell');
const mode = shell ? 'shell-baseline' : 'chromium-modern';
const output = join('reports', 'browser-stability', mode);
await mkdir(output, { recursive: true });
const report = {
  mode,
  startedAt: new Date().toISOString(),
  totalMemoryBytes: totalmem(),
  freeMemoryBeforeBytes: freemem(),
  journeys: [],
  pageCrashes: [],
  pageErrors: [],
  unexpectedDisconnects: 0,
  forcedTermination: false,
  browserStderr: '',
};
let server;
let expectedClose = false;
try {
  server = await chromium.launchServer({
    ...(shell ? {} : { channel: 'chromium' }),
    headless: true,
    timeout: 20000,
  });
  const child = server.process();
  report.pid = child.pid;
  report.executable = child.spawnfile;
  child.stderr?.on('data', (chunk) => {
    report.browserStderr = (report.browserStderr + String(chunk)).slice(-16000);
  });
  server.on('close', (exitCode, signal) => {
    report.exit = { exitCode, signal };
  });
  const browser = await chromium.connect(server.wsEndpoint());
  report.version = browser.version();
  browser.on('disconnected', () => {
    if (!expectedClose) report.unexpectedDisconnects++;
  });
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      isMobile: width < 896,
      hasTouch: width < 896,
      reducedMotion: 'no-preference',
    });
    try {
      const page = await context.newPage();
      page.on('crash', () => report.pageCrashes.push({ width, url: page.url() }));
      page.on('pageerror', (error) => report.pageErrors.push({ width, message: error.message }));
      await page.goto('http://127.0.0.1:4321/#libro/2');
      const root = page.locator('[data-book-root]');
      await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      const zone = page.locator('[data-book-pages] [data-product-slug="mandarine"]');
      await zone.locator('[data-product-link]').click();
      await expect(root).toHaveAttribute('data-book-phase', 'focused');
      await expect(zone).toHaveAttribute('data-photo-ready', '');
      await zone.locator('[data-product-visual] img').evaluate((image) => image.decode());
      await page.screenshot({ path: join(output, `${width}-detail.png`) });
      await zone.locator('[data-order-open]').click();
      await expect(root).toHaveAttribute('data-book-phase', 'ordering');
      await page.keyboard.press('Escape');
      await expect(root).toHaveAttribute('data-book-phase', 'focused');
      await page.locator('[data-book-return]').click();
      await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      await page.locator('[data-book-next]').click();
      await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      await page.locator('[data-book-prev]').click();
      await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      await page.locator('[data-book-close]').click();
      await expect(root).toHaveAttribute('data-book-phase', 'closed');
      expect(await page.locator('.book-turn').count()).toBe(0);
      report.journeys.push({ width, height, passed: true, freeMemoryBytes: freemem() });
      console.log(`${mode}: ${width}x${height} interaction/capture passed.`);
    } finally {
      await context.close();
    }
  }
} catch (error) {
  report.failure = error.stack;
  process.exitCode = 1;
} finally {
  expectedClose = true;
  if (server) {
    const guard = setTimeout(() => {
      report.forcedTermination = true;
      // Only the browser process tree created by this script is terminated.
      void server.kill().catch((error) => {
        report.closeFailure = String(error);
      });
    }, 10000);
    try {
      await server.close();
    } catch (error) {
      report.closeFailure = String(error);
    } finally {
      clearTimeout(guard);
    }
  }
  report.freeMemoryAfterBytes = freemem();
  report.finishedAt = new Date().toISOString();
  report.passed =
    !report.failure &&
    !report.closeFailure &&
    !report.forcedTermination &&
    report.exit?.exitCode === 0 &&
    report.unexpectedDisconnects === 0 &&
    report.pageCrashes.length === 0 &&
    report.pageErrors.length === 0 &&
    report.journeys.length === 2;
  await writeFile(join(output, 'result.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    JSON.stringify({ mode, passed: report.passed, exit: report.exit, failure: report.failure }),
  );
  if (!report.passed) process.exitCode = 1;
}
