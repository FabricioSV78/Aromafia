import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, expect } from '@playwright/test';

// Run against an already built, locally served site. No screenshots, video or trace
// are recorded while sampling, so their overhead cannot inflate frame intervals.
const phase = process.argv[2] ?? 'before';
if (!['before', 'after'].includes(phase)) throw new Error('Use before or after.');
const baseUrl = process.env['AUDIT_BASE_URL'] ?? 'http://127.0.0.1:4321/';
const output = join('reports', 'visual-mobile-audit');
const slugs = ['9pm', 'hawas-ice', 'mandarine', 'khamrah-qahwa', 'hawas-malibu', 'royale-opal'];
const busyPhases = [
  'preparing',
  'opening',
  'turning',
  'focusing',
  'revealing',
  'retracting',
  'returning',
  'closing',
];

function distribution(intervals) {
  const sorted = [...intervals].sort((a, b) => a - b);
  const count = sorted.length;
  const percentile = (fraction) => sorted[Math.max(0, Math.ceil(count * fraction) - 1)] ?? null;
  return {
    count,
    meanMs: count ? intervals.reduce((total, value) => total + value, 0) / count : null,
    medianMs: percentile(0.5),
    p95Ms: percentile(0.95),
    maxMs: sorted.at(-1) ?? null,
    over20Ms: intervals.filter((value) => value > 20).length,
    over33Ms: intervals.filter((value) => value > 33.34).length,
    over50Ms: intervals.filter((value) => value > 50).length,
  };
}

function comparableSummary(profile) {
  const actions = profile.actions.filter((action) =>
    /^(?:open$|close$|focus-|return-|turn-to-)/.test(action.label),
  );
  return {
    cpuRate: profile.cpuRate,
    journeyInput: profile.journeyInput,
    actionCount: actions.length,
    activeFrames: distribution(actions.flatMap((action) => action.activeFrameIntervalsMs)),
    longTaskCount: actions.reduce((sum, action) => sum + action.longTaskCount, 0),
    longTaskTotalMs: actions.reduce((sum, action) => sum + action.longTaskTotalMs, 0),
    gestureChecks: profile.gestureChecks,
    postGestureTap: profile.postGestureTap,
    postGcHeapDeltaBytes: profile.postGcHeapDeltaBytes,
    residualTurnClones: profile.residualTurnClones,
    pageErrors: profile.pageErrors,
    failure: profile.failure,
  };
}

async function installObservers(page) {
  await page.evaluate(() => {
    const store = { longTasks: [], shifts: [], observers: [], sample: null };
    window.__aromafiaMotionAudit = store;
    for (const type of ['longtask', 'layout-shift']) {
      if (!PerformanceObserver.supportedEntryTypes.includes(type)) continue;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (type === 'longtask') {
            store.longTasks.push({ start: entry.startTime, duration: entry.duration });
          } else {
            store.shifts.push({
              start: entry.startTime,
              value: entry.value,
              hadRecentInput: entry.hadRecentInput,
            });
          }
        }
      });
      observer.observe({ type, buffered: true });
      store.observers.push(observer);
    }
  });
}

async function sampleAction(page, label, action, settle) {
  await page.evaluate((phases) => {
    const store = window.__aromafiaMotionAudit;
    const root = document.querySelector('[data-book-root]');
    const sample = {
      started: performance.now(),
      previous: null,
      intervals: [],
      phases: [],
      raf: 0,
    };
    store.sample = sample;
    const frame = (time) => {
      const current = root.dataset.bookPhase;
      if (sample.previous !== null) {
        sample.intervals.push({
          duration: time - sample.previous,
          active: phases.includes(current) || phases.includes(sample.phases.at(-1)),
        });
      }
      if (sample.phases.at(-1) !== current) sample.phases.push(current);
      sample.previous = time;
      sample.raf = requestAnimationFrame(frame);
    };
    sample.raf = requestAnimationFrame(frame);
  }, busyPhases);
  await action();
  await settle();
  const sample = await page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const store = window.__aromafiaMotionAudit;
    const sample = store.sample;
    cancelAnimationFrame(sample.raf);
    const ended = performance.now();
    store.sample = null;
    return {
      started: sample.started,
      durationMs: ended - sample.started,
      phases: sample.phases,
      intervals: sample.intervals,
      longTasks: store.longTasks.filter(
        (entry) => entry.start >= sample.started && entry.start < ended,
      ),
      shifts: store.shifts.filter((entry) => entry.start >= sample.started && entry.start < ended),
      residualTurnClones: document.querySelectorAll('.book-turn').length,
      endPhase: document.querySelector('[data-book-root]').dataset.bookPhase,
    };
  });
  assert.equal(sample.residualTurnClones, 0, `${label}: residual turning sheet`);
  assert(!busyPhases.includes(sample.endPhase), `${label}: animation did not settle`);
  const { intervals, ...record } = sample;
  return {
    label,
    ...record,
    allFrames: distribution(intervals.map((entry) => entry.duration)),
    activeFrames: distribution(
      intervals.filter((entry) => entry.active).map((entry) => entry.duration),
    ),
    activeFrameIntervalsMs: intervals
      .filter((entry) => entry.active)
      .map((entry) => entry.duration),
    longTaskCount: sample.longTasks.length,
    longTaskTotalMs: sample.longTasks.reduce((sum, entry) => sum + entry.duration, 0),
    unexpectedLayoutShift: sample.shifts
      .filter((entry) => !entry.hadRecentInput)
      .reduce((sum, entry) => sum + entry.value, 0),
  };
}

async function touchSwipe(cdp, from, to) {
  const point = (x, y) => ({ x, y, id: 0, radiusX: 2, radiusY: 2, force: 1 });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(...from)] });
  for (let step = 1; step <= 6; step++) {
    await delay(20);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        point(from[0] + ((to[0] - from[0]) * step) / 6, from[1] + ((to[1] - from[1]) * step) / 6),
      ],
    });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function memory(cdp) {
  try {
    await cdp.send('HeapProfiler.collectGarbage');
    return {
      gcCollected: true,
      ...(await cdp.send('Runtime.getHeapUsage')),
      dom: await cdp.send('Memory.getDOMCounters'),
    };
  } catch (error) {
    return { gcCollected: false, limitation: error.message };
  }
}

async function warmPhotographs(page) {
  return page.evaluate(async () => {
    const loads = [];
    for (const image of document.querySelectorAll('[data-book-pages] img')) {
      image.loading = 'eager';
      loads.push(image.decode().then(() => image.currentSrc));
    }
    for (const source of document.querySelectorAll('[data-detail-image]')) {
      const image = new Image();
      image.sizes = source.sizes;
      image.srcset = source.srcset;
      image.src = source.srcset.split(',')[0].trim().split(/\s+/)[0];
      loads.push(image.decode().then(() => image.currentSrc));
    }
    return Promise.all(loads);
  });
}

async function resourceSummary(page) {
  return page.evaluate(() => {
    const resources = performance.getEntriesByType('resource').map((entry) => ({
      name: new URL(entry.name).pathname,
      type: entry.initiatorType,
      durationMs: entry.duration,
      transferBytes: entry.transferSize,
      encodedBytes: entry.encodedBodySize,
      decodedBytes: entry.decodedBodySize,
    }));
    return {
      count: resources.length,
      transferBytes: resources.reduce((sum, entry) => sum + entry.transferBytes, 0),
      encodedBytes: resources.reduce((sum, entry) => sum + entry.encodedBytes, 0),
      resources,
    };
  });
}

const browser = await chromium.launch({ channel: 'chromium', headless: true });
const report = {
  phase,
  generatedAt: new Date().toISOString(),
  baseUrl,
  browserVersion: browser.version(),
  methodology: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    input:
      'Playwright tap plus CDP Input.dispatchTouchEvent (browser touch pipeline); labelled mouse-button fallback only when baseline native swipe fails',
    profiles: 'Chromium CPU throttling 1x and 4x, no network throttle',
    imageCache:
      'All product/inspiration images and responsive detail candidates decoded before motion',
    capture: 'No video, screenshots, tracing or DevTools profiler while measuring RAF',
    frames:
      'requestAnimationFrame intervals, active during busy book phases; not GPU presentation FPS',
    memory: 'Same document, forced CDP GC before/after six product focus/return journeys',
    measurementOrder:
      phase === 'before'
        ? 'Gesture checks precede paired journeys; failed swipes use a labelled mouse fallback.'
        : 'Paired native-tap journeys precede gesture checks; post-gesture tap is separately diagnosed after 12 stable scroll frames.',
    limitations: [
      'Desktop Chromium emulation is not a physical mid-range phone, Safari or Firefox.',
      'No field INP, thermal/battery behavior or GPU frame-presentation measurement.',
      'Warm-cache motion is separated from the independently tested cold-photo transition.',
      'A short post-GC heap comparison cannot prove absence of memory leaks.',
      'Local resource timings do not measure a mobile network or production cache.',
    ],
  },
  profiles: [],
  failures: [],
};

try {
  for (const cpuRate of [1, 4]) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });
    const profile = { cpuRate, pageErrors: [], actions: [], gestureChecks: [] };
    report.profiles.push(profile);
    page.on('pageerror', (error) => profile.pageErrors.push(error.message));
    try {
      const root = page.locator('[data-book-root]');
      const settled = (state) =>
        expect(root).toHaveAttribute('data-book-phase', state, { timeout: 20000 });
      await page.goto(baseUrl);
      await settled('closed');
      await installObservers(page);
      profile.warmedPhotographs = await warmPhotographs(page);
      // Initialize the lazy animation engine before the measured opening.
      await page.locator('[data-book-open]').tap();
      await settled('browsing');
      await page.locator('[data-book-close]').tap();
      await settled('closed');
      profile.memoryBefore = await memory(cdp);
      const run = async (label, action, state = 'browsing') => {
        const record = await sampleAction(page, label, action, () => settled(state));
        profile.actions.push(record);
        console.log(
          `CPU ${cpuRate}x ${label}: ${record.activeFrames.count} active intervals, p95 ${record.activeFrames.p95Ms?.toFixed(2)} ms`,
        );
      };
      await run('open', () => page.locator('[data-book-open]').tap());
      const checkGesture = async (name, expectedHash, fallback) => {
        const actualHash = new URL(page.url()).hash;
        const passed = actualHash === expectedHash;
        profile.gestureChecks.push({ name, expectedHash, actualHash, passed });
        if (!passed) {
          report.failures.push({ cpuRate, gesture: name, expectedHash, actualHash });
          // Keep measuring the remaining independent journeys after documenting
          // a real-input failure. A button fallback is labelled in the report.
          if (fallback) {
            await page.waitForTimeout(700);
            await run(`${name}-button-fallback`, fallback);
            assert.equal(new URL(page.url()).hash, expectedHash, `${name}: button fallback failed`);
          }
        }
      };
      const gestures = async () => {
        const originalHash = new URL(page.url()).hash;
        await run('vertical-touch-keeps-face-and-selection', async () => {
          await touchSwipe(cdp, [190, 430], [195, 245]);
          await page.waitForTimeout(150);
        });
        await checkGesture('vertical-touch-keeps-face-and-selection', originalHash);
        await page.waitForTimeout(700);
        await page.evaluate(() => scrollTo(0, 0));
        await run('horizontal-touch-next', () => touchSwipe(cdp, [310, 370], [80, 373]));
        await checkGesture('horizontal-touch-next', '#libro/2', () =>
          page.locator('[data-book-next]').click(),
        );
        // The suppress-click window also guards accidental product activations.
        await expect(root).toHaveAttribute('data-book-phase', 'browsing');
        await page.waitForTimeout(420);
        await run('horizontal-touch-previous', () => touchSwipe(cdp, [80, 370], [310, 372]));
        await checkGesture('horizontal-touch-previous', '#libro/1', () =>
          page.locator('[data-book-prev]').click(),
        );
        await page.waitForTimeout(700);
      };
      if (phase === 'before') await gestures();
      const activate = (locator) =>
        profile.gestureChecks.some((check) => !check.passed) ? locator.click() : locator.tap();
      profile.journeyInput = profile.gestureChecks.some((check) => !check.passed)
        ? 'Mouse control fallback after failed browser touch scrolling'
        : 'Native browser touch taps';
      for (const [index, slug] of slugs.entries()) {
        if (index > 0 && index % 2 === 0) {
          await run(`turn-to-face-${Math.floor(index / 2) + 1}`, () =>
            activate(page.locator('[data-book-next]')),
          );
        }
        const zone = page.locator(`[data-book-pages] [data-product-slug="${slug}"]`);
        await run(`focus-${slug}`, () => activate(zone.locator('[data-product-link]')), 'focused');
        await expect(zone.locator('[data-product-visual] img')).toBeVisible();
        await expect(root).toHaveAttribute('data-book-busy', 'false');
        assert.equal(
          new URL(page.url()).hash,
          `#libro/${Math.floor(index / 2) + 1}/perfume/${slug}`,
        );
        await run(`return-${slug}`, () => activate(page.locator('[data-book-return]')));
        await expect(zone.locator('[data-product-link]')).toBeFocused();
      }
      await run('turn-to-endpaper', () => activate(page.locator('[data-book-next]')));
      assert.equal(new URL(page.url()).hash, '#libro/4');
      await run('close', () => activate(page.locator('[data-book-close]')), 'closed');
      await expect(page.locator('[data-book-open]')).toBeFocused();
      profile.memoryAfter = await memory(cdp);
      if (phase === 'after') {
        await page.locator('[data-book-open]').tap();
        await settled('browsing');
        await page.evaluate(() => {
          location.hash = '#libro/1';
        });
        await expect(page.locator('[data-book-pages] [data-product-slug="9pm"]')).toBeVisible();
        await page.evaluate(() => {
          window.__aromafiaTouchDiagnostics = [];
          for (const type of [
            'pointerdown',
            'pointerup',
            'pointercancel',
            'click',
            'scroll',
            'scrollend',
          ]) {
            window.addEventListener(
              type,
              (event) => {
                const leaf = document.querySelector('[data-book-leaf]:not([hidden])');
                window.__aromafiaTouchDiagnostics.push({
                  type,
                  time: performance.now(),
                  x: event.clientX,
                  y: event.clientY,
                  target:
                    event.target instanceof Element
                      ? event.target.className
                      : event.target.constructor.name,
                  scrollY,
                  leafScrollTop: leaf?.scrollTop,
                  phase: document.querySelector('[data-book-root]').dataset.bookPhase,
                });
              },
              { passive: true, capture: true },
            );
          }
        });
        await gestures();
        profile.scrollSettled = await page.evaluate(async () => {
          const started = performance.now();
          const history = [];
          let stable = 0;
          let previous = '';
          while (stable < 12 && performance.now() - started < 3000) {
            await new Promise((resolve) => requestAnimationFrame(resolve));
            const leaf = document.querySelector('[data-book-leaf]:not([hidden])');
            const position = `${scrollX}/${scrollY}/${leaf?.scrollLeft}/${leaf?.scrollTop}`;
            stable = position === previous ? stable + 1 : 0;
            previous = position;
            history.push({ time: performance.now(), position });
          }
          return { durationMs: performance.now() - started, stableFrames: stable, history };
        });
        assert.equal(profile.scrollSettled.stableFrames, 12, 'Native scrolling did not settle');
        const beforeTap = await page.evaluate(() => performance.now());
        await page.locator('[data-book-pages] [data-product-slug="9pm"] [data-product-link]').tap();
        try {
          await settled('focused');
          profile.postGestureTap = { passed: true, started: beforeTap };
        } catch (error) {
          profile.postGestureTap = { passed: false, started: beforeTap, failure: error.message };
          report.failures.push({ cpuRate, postGestureTap: true, message: error.message });
        }
        profile.gestureDiagnostics = await page.evaluate(() => window.__aromafiaTouchDiagnostics);
        if ((await root.getAttribute('data-book-phase')) === 'focused') {
          await page.locator('[data-book-return]').click();
          await settled('browsing');
        }
        await page.locator('[data-book-close]').click();
        await settled('closed');
      }
      profile.resources = await resourceSummary(page);
      profile.residualTurnClones = await page.locator('.book-turn').count();
      assert.equal(profile.residualTurnClones, 0);
      assert.deepEqual(profile.pageErrors, []);
      const active = profile.actions.flatMap((record) => record.activeFrameIntervalsMs);
      profile.aggregateActiveFrames = distribution(active);
      profile.longTaskCount = profile.actions.reduce(
        (sum, record) => sum + record.longTaskCount,
        0,
      );
      profile.longTaskTotalMs = profile.actions.reduce(
        (sum, record) => sum + record.longTaskTotalMs,
        0,
      );
      if (profile.memoryBefore.gcCollected && profile.memoryAfter.gcCollected) {
        profile.postGcHeapDeltaBytes = profile.memoryAfter.usedSize - profile.memoryBefore.usedSize;
      }
      profile.passed =
        profile.gestureChecks.every((check) => check.passed) &&
        profile.postGestureTap?.passed !== false;
    } catch (error) {
      profile.passed = false;
      profile.failure = error.stack;
      report.failures.push({ cpuRate, message: error.message });
    } finally {
      if (profile.memoryBefore?.gcCollected && profile.memoryAfter?.gcCollected) {
        profile.postGcHeapDeltaBytes = profile.memoryAfter.usedSize - profile.memoryBefore.usedSize;
      }
      await context.close();
    }
  }

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  try {
    const page = await context.newPage();
    const engineRequests = [];
    page.on('request', (request) => {
      if (/\/(?:gsap|ScrollTrigger)[^/]*\.js(?:\?|$)/i.test(request.url()))
        engineRequests.push(request.url());
    });
    const root = page.locator('[data-book-root]');
    await page.goto(baseUrl);
    await expect(root).toHaveAttribute('data-book-phase', 'closed');
    await page.locator('[data-book-open]').tap();
    await expect(root).toHaveAttribute('data-book-phase', 'browsing');
    for (const [index, slug] of slugs.entries()) {
      if (index > 0 && index % 2 === 0) {
        await page.locator('[data-book-next]').tap();
        await expect(root).toHaveAttribute('data-book-phase', 'browsing');
      }
      await page
        .locator(`[data-book-pages] [data-product-slug="${slug}"] [data-product-link]`)
        .tap();
      await expect(root).toHaveAttribute('data-book-phase', 'focused');
      await page.locator('[data-book-return]').tap();
      await expect(root).toHaveAttribute('data-book-phase', 'browsing');
    }
    await page.locator('[data-book-close]').tap();
    await expect(root).toHaveAttribute('data-book-phase', 'closed');
    assert.deepEqual(engineRequests, [], 'Reduced-motion loaded the animation engine');
    assert.equal(await page.locator('.book-turn').count(), 0);
    report.reducedMotion = { passed: true, perfumes: 6, engineRequests };
  } catch (error) {
    report.reducedMotion = { passed: false, failure: error.stack };
    report.failures.push({ reducedMotion: true, message: error.message });
  } finally {
    await context.close();
  }
} finally {
  await browser.close();
  await mkdir(output, { recursive: true });
  report.comparableJourneys = report.profiles.map(comparableSummary);
  await writeFile(join(output, `motion-${phase}.json`), `${JSON.stringify(report, null, 2)}\n`);
  if (phase === 'after') {
    try {
      const before = JSON.parse(await readFile(join(output, 'motion-before.json'), 'utf8'));
      await writeFile(
        join(output, 'motion-comparison.json'),
        `${JSON.stringify(
          {
            comparedActions:
              'Opening, closing, named turns and six focus/return journeys; excludes failing baseline swipes and their control fallbacks',
            limits: report.methodology.limitations,
            before: before.profiles.map(comparableSummary),
            after: report.comparableJourneys,
            reducedMotion: { before: before.reducedMotion, after: report.reducedMotion },
          },
          null,
          2,
        )}\n`,
      );
    } catch (error) {
      console.error(`Comparison unavailable: ${error.message}`);
    }
  }
}
if (report.failures.length) {
  console.error(JSON.stringify(report.failures, null, 2));
  process.exitCode = 1;
} else {
  console.log(
    `Saved ${join(output, `motion-${phase}.json`)}; touch, six perfumes and reduced motion passed.`,
  );
}
