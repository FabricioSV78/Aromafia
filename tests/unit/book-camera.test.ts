import { describe, expect, it } from 'vitest';
import {
  calculateBookCamera,
  type CameraTransform,
  type RectLike,
} from '../../src/motion/book-camera';

function projectedRect(camera: RectLike, target: RectLike, transform: CameraTransform): RectLike {
  return {
    left: camera.left + transform.x + (target.left - camera.left) * transform.scale,
    top: camera.top + transform.y + (target.top - camera.top) * transform.scale,
    width: target.width * transform.scale,
    height: target.height * transform.scale,
  };
}

function expectCenteredAndContained(rect: RectLike, viewport: RectLike, inset: number): void {
  expect(rect.left + rect.width / 2).toBeCloseTo(viewport.left + viewport.width / 2);
  expect(rect.top + rect.height / 2).toBeCloseTo(viewport.top + viewport.height / 2);
  expect(rect.left).toBeGreaterThanOrEqual(viewport.left + inset);
  expect(rect.top).toBeGreaterThanOrEqual(viewport.top + inset);
  expect(rect.left + rect.width).toBeLessThanOrEqual(viewport.left + viewport.width - inset);
  expect(rect.top + rect.height).toBeLessThanOrEqual(viewport.top + viewport.height - inset);
}

const camera: RectLike = { left: 120, top: 180, width: 1180, height: 680 };
const viewport: RectLike = { left: 40, top: 160, width: 1360, height: 700 };

describe('spatial book camera geometry', () => {
  it.each([
    { name: 'top-left', left: 150, top: 220 },
    { name: 'top-right', left: 760, top: 220 },
    { name: 'bottom-left', left: 150, top: 540 },
    { name: 'bottom-right', left: 760, top: 540 },
  ])('centers the $name product without clipping or stretching', ({ left, top }) => {
    const target: RectLike = { left, top, width: 500, height: 280 };
    const result = calculateBookCamera({ camera, target, viewport, inset: 24 });
    expect(result).not.toBeNull();
    if (!result) throw new Error('A visible product must produce a camera destination.');
    const projected = projectedRect(camera, target, result);
    expectCenteredAndContained(projected, viewport, 24);
    expect(projected.width / projected.height).toBeCloseTo(target.width / target.height);
    expect(result.scale).toBeGreaterThan(1);
  });

  it('keeps the same relative transform when the whole book is offset by scrolling', () => {
    const target: RectLike = { left: 760, top: 220, width: 500, height: 280 };
    const offset = (rect: RectLike): RectLike => ({
      ...rect,
      left: rect.left + 470,
      top: rect.top - 340,
    });
    const original = calculateBookCamera({ camera, target, viewport });
    const shifted = calculateBookCamera({
      camera: offset(camera),
      target: offset(target),
      viewport: offset(viewport),
    });
    expect(shifted).toEqual(original);
  });

  it('caps a small visual on mobile and recalculates a smaller destination after resize', () => {
    const mobileCamera: RectLike = { left: 15, top: 150, width: 360, height: 520 };
    const target: RectLike = { left: 30, top: 200, width: 125, height: 180 };
    const mobileViewport: RectLike = { left: 0, top: 130, width: 390, height: 560 };
    const first = calculateBookCamera({ camera: mobileCamera, target, viewport: mobileViewport });
    const resizedViewport: RectLike = { left: 0, top: 130, width: 320, height: 300 };
    const resized = calculateBookCamera({
      camera: mobileCamera,
      target,
      viewport: resizedViewport,
    });
    if (!first || !resized) throw new Error('Usable mobile rectangles must produce destinations.');
    expect(first.scale).toBe(2.4);
    expect(resized.scale).toBeLessThan(first.scale);
    expectCenteredAndContained(projectedRect(mobileCamera, target, first), mobileViewport, 20);
    expectCenteredAndContained(projectedRect(mobileCamera, target, resized), resizedViewport, 20);
  });

  it('fits an oversized zone and respects a custom scale ceiling', () => {
    const target: RectLike = { left: 150, top: 220, width: 800, height: 900 };
    const narrowViewport: RectLike = { left: 0, top: 80, width: 320, height: 500 };
    const result = calculateBookCamera({ camera, target, viewport: narrowViewport });
    if (!result) throw new Error('An oversized but valid zone must fit at a smaller scale.');
    expect(result.scale).toBeLessThan(1);
    expectCenteredAndContained(projectedRect(camera, target, result), narrowViewport, 20);
    const smallTarget: RectLike = { ...target, width: 80, height: 100 };
    const capped = calculateBookCamera({ camera, target: smallTarget, viewport, maxScale: 1.8 });
    expect(capped?.scale).toBe(1.8);
  });

  it('reserves controls by fitting only the reading rectangle supplied by the caller', () => {
    const target: RectLike = { left: 760, top: 220, width: 500, height: 280 };
    const readingArea: RectLike = {
      ...viewport,
      top: viewport.top + 60,
      height: viewport.height - 60,
    };
    const result = calculateBookCamera({ camera, target, viewport: readingArea, inset: 0 });
    if (!result) throw new Error('The remaining reading area is measurable.');
    expectCenteredAndContained(projectedRect(camera, target, result), readingArea, 0);
  });

  it('allows a nearly full-width mobile zone to enlarge without clipping its name or price', () => {
    const mobileCamera: RectLike = { left: 12, top: 150, width: 366, height: 520 };
    const target: RectLike = { left: 32, top: 180, width: 302, height: 220 };
    const mobileViewport: RectLike = { left: 12, top: 140, width: 366, height: 540 };
    const result = calculateBookCamera({
      camera: mobileCamera,
      target,
      viewport: mobileViewport,
      inset: 8,
      fillRatio: 0.98,
    });
    if (!result) throw new Error('The nearly full-width zone remains measurable.');
    expect(result.scale).toBeGreaterThan(1);
    const projected = projectedRect(mobileCamera, target, result);
    expect(projected.width).toBeCloseTo((mobileViewport.width - 16) * 0.98);
    expectCenteredAndContained(projected, mobileViewport, 8);
  });

  it('declines hidden, nonfinite or exhausted geometry instead of producing invalid CSS', () => {
    const target: RectLike = { left: 150, top: 220, width: 500, height: 280 };
    for (const invalid of [
      { ...target, width: 0 },
      { ...target, height: -1 },
      { ...target, left: Number.NaN },
      { ...target, top: Number.POSITIVE_INFINITY },
    ]) {
      expect(calculateBookCamera({ camera: invalid, target, viewport })).toBeNull();
      expect(calculateBookCamera({ camera, target: invalid, viewport })).toBeNull();
      expect(calculateBookCamera({ camera, target, viewport: invalid })).toBeNull();
    }
    expect(calculateBookCamera({ camera, target, viewport, inset: viewport.width })).toBeNull();
    expect(calculateBookCamera({ camera, target, viewport, inset: -1 })).toBeNull();
    expect(calculateBookCamera({ camera, target, viewport, maxScale: 0 })).toBeNull();
    expect(calculateBookCamera({ camera, target, viewport, maxScale: Number.NaN })).toBeNull();
    expect(calculateBookCamera({ camera, target, viewport, fillRatio: 0 })).toBeNull();
    expect(calculateBookCamera({ camera, target, viewport, fillRatio: 1.1 })).toBeNull();
    expect(
      calculateBookCamera({
        camera: { ...camera, left: -Number.MAX_VALUE },
        target: { ...target, left: Number.MAX_VALUE },
        viewport,
      }),
    ).toBeNull();
  });
});
