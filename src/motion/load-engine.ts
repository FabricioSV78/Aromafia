export interface MotionEngine {
  gsap: (typeof import('gsap'))['gsap'];
  ScrollTrigger?: (typeof import('gsap/ScrollTrigger'))['ScrollTrigger'];
}

/** Imported only after the scene becomes visible and motion is allowed. */
export async function loadMotionEngine(scroll: boolean): Promise<MotionEngine> {
  const { gsap } = await import('gsap');
  if (!scroll) return { gsap };
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}
