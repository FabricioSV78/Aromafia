import type { SceneContext } from './scene';

interface BookCoverTransitionOptions {
  gsap: SceneContext['gsap'];
  volume: HTMLElement;
  pages: HTMLElement;
  cover: HTMLElement;
  opening: boolean;
  desktop: boolean;
}

/**
 * A cover owns rotation, its front face owns opacity, and the volume owns centering.
 * Never fade the preserve-3d parent: that flattens the two cover faces in Chromium.
 * The controller owns state and reverts this timeline's context at either endpoint.
 */
export function createBookCoverTransition({
  gsap,
  volume,
  pages,
  cover,
  opening,
  desktop,
}: BookCoverTransitionOptions): gsap.core.Timeline {
  const front = cover.querySelector<HTMLElement>('.book-cover__front');
  const pageContent = pages.querySelectorAll<HTMLElement>('[data-book-leaf] > :not(.sr-only)');
  const closedOffset = desktop ? -25 : 0;
  const closedStack = desktop ? 0.5 : 1;
  const duration = 1.08;
  const timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

  timeline
    .fromTo(
      volume,
      {
        x: 0,
        y: 0,
        z: 0,
        xPercent: opening ? closedOffset : 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        '--book-stack-scale': opening ? closedStack : 1,
      },
      {
        x: 0,
        y: 0,
        z: 0,
        xPercent: opening ? 0 : closedOffset,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        '--book-stack-scale': opening ? 1 : closedStack,
        duration,
      },
      0,
    )
    .fromTo(
      cover,
      { rotationY: opening ? 0 : -180, transformOrigin: '0% 50%' },
      { rotationY: opening ? -180 : 0, duration },
      0,
    )
    .fromTo(
      pages,
      { scaleX: opening ? (desktop ? 0.5 : 1) : 1, opacity: 1, transformOrigin: '100% 50%' },
      { scaleX: opening ? 1 : desktop ? 0.5 : 1, duration },
      0,
    )
    .fromTo(
      pageContent,
      { opacity: opening ? 0 : 1 },
      { opacity: opening ? 1 : 0, duration: 0.28, ease: 'sine.inOut' },
      opening ? 0.73 : 0,
    );

  if (front) {
    timeline.fromTo(
      front,
      { opacity: opening ? 1 : 0 },
      { opacity: opening ? 0 : 1, duration: 0.28, ease: 'sine.inOut' },
      opening ? 0.2 : 0.6,
    );
  }
  return timeline;
}
