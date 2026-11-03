import { describe, expect, it } from 'vitest';
import { frameFlip, childFlip } from '../../src/motion/book-layout';

describe('nested book FLIP', () => {
  it.each([0, 1, 2, 3])('keeps shared element %i at its original world coordinates', (corner) => {
    const beforeCamera = { left: 100, top: 180, width: 1100, height: 540 };
    const afterCamera = { left: 100, top: 90, width: 1100, height: 720 };
    const before = {
      left: 140 + (corner % 2) * 550,
      top: 210 + Math.floor(corner / 2) * 250,
      width: 190,
      height: 210,
    };
    const after = { left: 130, top: 120, width: 340, height: 650 };
    const parent = frameFlip(beforeCamera, afterCamera);
    const child = childFlip(before, after, afterCamera, parent);
    expect(
      afterCamera.left + parent.x + (after.left - afterCamera.left + child.x) * parent.scaleX,
    ).toBeCloseTo(before.left);
    expect(
      afterCamera.top + parent.y + (after.top - afterCamera.top + child.y) * parent.scaleY,
    ).toBeCloseTo(before.top);
    expect(after.width * parent.scaleX * child.scaleX).toBeCloseTo(before.width);
    expect(after.height * parent.scaleY * child.scaleY).toBeCloseTo(before.height);
  });
});
