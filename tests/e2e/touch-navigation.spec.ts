import { expect, test, type CDPSession, type Page } from './fixtures';

async function swipe(
  session: CDPSession,
  from: { x: number; y: number },
  by: { x: number; y: number },
) {
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ ...from, id: 1 }],
  });
  for (let step = 1; step <= 8; step++) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: from.x + (by.x * step) / 8, y: from.y + (by.y * step) / 8, id: 1 }],
    });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function photoPoint(page: Page, horizontal = 0.9) {
  const visual = page.locator('[data-book-leaf]:visible [data-product-visual]').first();
  const box = await visual.boundingBox();
  if (!box) throw new Error('The photograph must be visible for a native touch gesture.');
  return { x: box.x + box.width * horizontal, y: box.y + box.height * 0.5 };
}

test('el gesto táctil real gira la hoja y conserva desplazamiento vertical sin activar un perfume', async ({
  page,
  context,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'), 'Mobile Chromium touch emulation.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const session = await context.newCDPSession(page);
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/#libro/1');
    const root = page.locator('[data-book-root]');
    await expect(root).toHaveAttribute('data-book-phase', 'browsing');
    expect(
      await page
        .locator('[data-book-leaf]:visible')
        .first()
        .evaluate((sheet) => getComputedStyle(sheet).touchAction),
    ).toBe('pan-y pinch-zoom');
    const point = await photoPoint(page);
    await swipe(session, point, { x: -Math.min(120, point.x - 12), y: 0 });
    await expect(page).toHaveURL(/#libro\/2$/);
    await expect(root).toHaveAttribute('data-book-phase', 'browsing');
    await expect(page.locator('.book-turn')).toHaveCount(0);
    await swipe(session, await photoPoint(page), { x: 0, y: -90 });
    await expect(page).toHaveURL(/#libro\/2$/);
    await expect(root).toHaveAttribute('data-book-phase', 'browsing');
    await swipe(session, await photoPoint(page, 0.1), { x: 120, y: 0 });
    await expect(page).toHaveURL(/#libro\/1$/);
    await expect(root).toHaveAttribute('data-book-phase', 'browsing');
  }
  await session.detach();
});
