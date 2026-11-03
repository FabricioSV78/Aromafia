import type { SceneContext } from './scene';

interface BookTurnTransitionOptions {
  gsap: SceneContext['gsap'];
  sheet: HTMLElement;
  forward: boolean;
}

/** A single opaque, two-sided sheet. Its parent must never fade or flatten preserve-3d. */
export function createBookTurnTransition({
  gsap,
  sheet,
  forward,
}: BookTurnTransitionOptions): gsap.core.Timeline {
  const timeline = gsap.timeline();
  timeline.fromTo(
    sheet,
    { rotationY: 0, z: 1, transformOrigin: forward ? '0% 50%' : '100% 50%' },
    {
      rotationY: forward ? -180 : 180,
      z: 1,
      duration: 1.04,
      ease: 'power2.inOut',
    },
    0,
  );
  return timeline;
}
