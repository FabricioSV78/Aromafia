import { loadMotionEngine, type MotionEngine } from './load-engine';

export type MotionProfile = 'light' | 'full';
export interface SceneResources {
  /** Return top-level timelines/tweens only; do not return their children too. */
  animations?: readonly gsap.core.Animation[];
  /** Return enabled, scene-owned triggers; this controller manages their suspension. */
  triggers?: readonly ScrollTrigger[];
}
export interface SceneContext extends MotionEngine {
  root: HTMLElement;
  profile: MotionProfile;
  signal: AbortSignal;
  addCleanup: (cleanup: () => void) => void;
  /** Record animations created by later event callbacks in this scene's context. */
  run: (callback: () => void) => void;
}
// A scene may only register cleanup, without returning animation handles.
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type SceneFactory = (context: SceneContext) => SceneResources | void;
export interface SceneOptions {
  scroll?: boolean;
  onError?: (error: unknown) => void;
  /** Injected in lifecycle tests; production uses the dynamic GSAP loader. */
  load?: (scroll: boolean) => Promise<MotionEngine>;
}
type Connection = EventTarget & { saveData?: boolean };
const mounted = new WeakMap<HTMLElement, () => void>();

/** Progressive enhancement: base HTML stays usable even if the engine fails. */
export function mountScene(
  root: HTMLElement,
  create: SceneFactory,
  options: SceneOptions = {},
): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  mounted.get(root)?.();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wide = window.matchMedia('(min-width: 48rem)');
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  let visible = !('IntersectionObserver' in window);
  let disposed = false;
  let generation = 0;
  let loading = false;
  let context: gsap.Context | undefined;
  let sceneAbort: AbortController | undefined;
  let cleanups: (() => void)[] = [];
  let resources: SceneResources = {};
  const paused = new Set<gsap.core.Animation>();
  const disabled = new Set<ScrollTrigger>();
  const report = (error: unknown) => options.onError?.(error);
  const profile = (): MotionProfile => (!wide.matches || connection?.saveData ? 'light' : 'full');
  const isHidden = () => document.visibilityState === 'hidden';

  function reset() {
    generation++;
    loading = false;
    sceneAbort?.abort();
    sceneAbort = undefined;
    for (const cleanup of cleanups.reverse()) {
      try {
        cleanup();
      } catch (error) {
        report(error);
      }
    }
    cleanups = [];
    context?.revert();
    context = undefined;
    resources = {};
    paused.clear();
    disabled.clear();
  }

  function syncActivity() {
    const active = visible && !isHidden();
    if (!active) {
      for (const animation of resources.animations ?? []) {
        if (!animation.paused()) {
          animation.pause();
          paused.add(animation);
        }
      }
      for (const trigger of resources.triggers ?? []) {
        if (!disabled.has(trigger)) {
          trigger.disable(false);
          disabled.add(trigger);
        }
      }
    } else {
      for (const trigger of disabled) trigger.enable(false);
      disabled.clear();
      for (const animation of paused) animation.resume();
      paused.clear();
    }
  }

  async function ensureScene() {
    if (disposed || reduced.matches || !visible || isHidden()) {
      syncActivity();
      return;
    }
    if (context || loading) {
      syncActivity();
      return;
    }
    loading = true;
    const request = generation;
    try {
      const engine = await (options.load ?? loadMotionEngine)(options.scroll ?? false);
      if (disposed || request !== generation) return;
      loading = false;
      if (reduced.matches || !visible || isHidden()) return;
      const controller = new AbortController();
      sceneAbort = controller;
      const scopedContext = engine.gsap.context(() => {}, root);
      context = scopedContext;
      scopedContext.add(() => {
        resources =
          create({
            ...engine,
            root,
            profile: profile(),
            signal: controller.signal,
            addCleanup: (cleanup) => {
              cleanups.push(cleanup);
            },
            run: (callback) => {
              if (!controller.signal.aborted) scopedContext.add(callback);
            },
          }) ?? {};
      });
      syncActivity();
    } catch (error) {
      if (!disposed && request === generation) {
        reset();
        report(error);
      }
    }
  }

  const rebuild = () => {
    reset();
    void ensureScene();
  };
  const activity = () => {
    void ensureScene();
  };
  const observer =
    'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
          const entry = entries.find((item) => item.target === root);
          if (entry) {
            visible = entry.isIntersecting;
            void ensureScene();
          }
        })
      : undefined;

  function dispose() {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    reduced.removeEventListener('change', rebuild);
    wide.removeEventListener('change', rebuild);
    connection?.removeEventListener('change', rebuild);
    document.removeEventListener('visibilitychange', activity);
    document.removeEventListener('astro:before-swap', dispose);
    reset();
    if (mounted.get(root) === dispose) mounted.delete(root);
  }
  mounted.set(root, dispose);
  observer?.observe(root);
  reduced.addEventListener('change', rebuild);
  wide.addEventListener('change', rebuild);
  connection?.addEventListener('change', rebuild);
  document.addEventListener('visibilitychange', activity);
  document.addEventListener('astro:before-swap', dispose);
  void ensureScene();
  return dispose;
}
