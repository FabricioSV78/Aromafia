import type { RectLike } from './book-camera';
import type { SceneContext } from './scene';

export interface FlipPose {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}
export function frameFlip(before: RectLike, after: RectLike): FlipPose {
  return {
    x: before.left - after.left,
    y: before.top - after.top,
    scaleX: before.width / after.width,
    scaleY: before.height / after.height,
  };
}

export function childFlip(
  before: RectLike,
  after: RectLike,
  camera: RectLike,
  parent: FlipPose,
): FlipPose {
  const left = camera.left + parent.x + (after.left - camera.left) * parent.scaleX;
  const top = camera.top + parent.y + (after.top - camera.top) * parent.scaleY;
  return {
    x: (before.left - left) / parent.scaleX,
    y: (before.top - top) / parent.scaleY,
    scaleX: before.width / (after.width * parent.scaleX),
    scaleY: before.height / (after.height * parent.scaleY),
  };
}

interface LayoutSnapshot {
  camera: RectLike;
  items: readonly { element: HTMLElement; rect: RectLike }[];
}
export function captureBookLayout(camera: HTMLElement, zone: HTMLElement): LayoutSnapshot {
  const zoneRect = zone.getBoundingClientRect();
  const items = Array.from(
    zone.querySelectorAll<HTMLElement>(
      '[data-reading-paper], [data-product-visual], h4, .product-price, .perfume-zone__brand',
    ),
  ).map((element) => ({
    element,
    rect: element.hasAttribute('data-reading-paper') ? zoneRect : element.getBoundingClientRect(),
  }));
  return { camera: camera.getBoundingClientRect(), items };
}

/** Compensate both the book frame and its real shared elements before interpolating. */
export function createBookLayoutTransition(
  gsap: SceneContext['gsap'],
  camera: HTMLElement,
  before: LayoutSnapshot,
  after: LayoutSnapshot,
): gsap.core.Timeline {
  // Reading can grow vertically on mobile. Move its camera without stretching it;
  // the real shared elements and paper own their individual size compensation.
  const parent = { ...frameFlip(before.camera, after.camera), scaleX: 1, scaleY: 1 };
  const end = { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 1.05, ease: 'power3.inOut' };
  // GSAP attaches startAt to tween vars; every tween must own its destination object.
  const timeline = gsap
    .timeline()
    .fromTo(camera, { ...parent, transformOrigin: '0 0' }, { ...end }, 0);
  for (const item of after.items) {
    const source = before.items.find((previous) => previous.element === item.element);
    if (
      !source ||
      !source.rect.width ||
      !source.rect.height ||
      !item.rect.width ||
      !item.rect.height
    )
      continue;
    timeline.fromTo(
      item.element,
      { ...childFlip(source.rect, item.rect, after.camera, parent), transformOrigin: '0 0' },
      { ...end },
      0,
    );
  }
  return timeline;
}
