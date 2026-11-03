// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountScene, type SceneContext, type SceneResources } from '../../src/motion/scene';
import type { MotionEngine } from '../../src/motion/load-engine';

class Query extends EventTarget {
  constructor(public matches: boolean) {
    super();
  }
  set(value: boolean) {
    this.matches = value;
    this.dispatchEvent(new Event('change'));
  }
}
let reduced: Query;
let wide: Query;
let root: HTMLElement;
let observer: FakeObserver;
let cleanups: (() => void)[];
class FakeObserver {
  disconnect = vi.fn();
  observe = vi.fn();
  constructor(private callback: IntersectionObserverCallback) {}
  show(visible: boolean) {
    this.callback(
      [{ target: root, isIntersecting: visible } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};
function engine() {
  const revert = vi.fn();
  const context = vi.fn(() => ({ add: (fn: () => void) => fn(), revert }));
  return { value: { gsap: { context } } as unknown as MotionEngine, context, revert };
}
beforeEach(() => {
  reduced = new Query(false);
  wide = new Query(true);
  cleanups = [];
  root = document.createElement('div');
  root.textContent = 'Contenido accesible';
  document.body.append(root);
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => (query.includes('reduced') ? reduced : wide)),
  );
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(function (callback: IntersectionObserverCallback) {
      observer = new FakeObserver(callback);
      return observer;
    }),
  );
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
});
afterEach(() => {
  cleanups.forEach((dispose) => dispose());
  root.remove();
  vi.unstubAllGlobals();
});

describe('ciclo de vida de escenas', () => {
  it('no descarga el motor con movimiento reducido ni fuera de pantalla', async () => {
    const load = vi.fn();
    reduced.set(true);
    cleanups.push(mountScene(root, () => {}, { load }));
    observer.show(true);
    await flush();
    expect(load).not.toHaveBeenCalled();
    observer.show(false);
    reduced.set(false);
    await flush();
    expect(load).not.toHaveBeenCalled();
  });
  it('cancela un montaje pendiente cuando se desmonta la vista', async () => {
    const mock = engine();
    let resolve: (value: MotionEngine) => void = () => {};
    const pending = new Promise<MotionEngine>((done) => {
      resolve = done;
    });
    const create = vi.fn();
    const dispose = mountScene(root, create, { load: () => pending });
    observer.show(true);
    dispose();
    resolve(mock.value);
    await flush();
    expect(create).not.toHaveBeenCalled();
    expect(mock.context).not.toHaveBeenCalled();
    expect(observer.disconnect).toHaveBeenCalledOnce();
  });
  it('limpia contexto, listeners externos y reconstruye al cambiar preferencias', async () => {
    const mock = engine();
    const customCleanup = vi.fn();
    const signals: AbortSignal[] = [];
    const profiles: string[] = [];
    const create = (ctx: SceneContext) => {
      signals.push(ctx.signal);
      profiles.push(ctx.profile);
      ctx.addCleanup(customCleanup);
    };
    cleanups.push(mountScene(root, create, { load: async () => mock.value }));
    observer.show(true);
    await flush();
    expect(profiles).toEqual(['full']);
    wide.set(false);
    await flush();
    expect(profiles).toEqual(['full', 'light']);
    expect(signals[0]?.aborted).toBe(true);
    expect(mock.revert).toHaveBeenCalledOnce();
    reduced.set(true);
    await flush();
    expect(signals[1]?.aborted).toBe(true);
    expect(mock.revert).toHaveBeenCalledTimes(2);
    expect(customCleanup).toHaveBeenCalledTimes(2);
    expect(root.textContent).toBe('Contenido accesible');
  });
  it('suspende solo sus animaciones y respeta pausas deliberadas', async () => {
    const mock = engine();
    let paused = false;
    const running = {
      paused: () => paused,
      pause: vi.fn(() => {
        paused = true;
      }),
      resume: vi.fn(() => {
        paused = false;
      }),
    };
    const intentional = { paused: () => true, pause: vi.fn(), resume: vi.fn() };
    const resources = { animations: [running, intentional] } as unknown as SceneResources;
    cleanups.push(mountScene(root, () => resources, { load: async () => mock.value }));
    observer.show(true);
    await flush();
    observer.show(false);
    await flush();
    expect(running.pause).toHaveBeenCalledOnce();
    expect(intentional.pause).not.toHaveBeenCalled();
    observer.show(true);
    await flush();
    expect(running.resume).toHaveBeenCalledOnce();
    expect(intentional.resume).not.toHaveBeenCalled();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await flush();
    expect(running.pause).toHaveBeenCalledTimes(2);
  });
  it('evita montajes duplicados y tolera dispose repetido', async () => {
    const mock = engine();
    const first = mountScene(root, () => {}, { load: async () => mock.value });
    observer.show(true);
    await flush();
    const second = mountScene(root, () => {}, { load: async () => mock.value });
    expect(mock.revert).toHaveBeenCalledOnce();
    first();
    first();
    observer.show(true);
    await flush();
    second();
    second();
    expect(mock.revert).toHaveBeenCalledTimes(2);
  });
  it('limpia al salir de una vista Astro', async () => {
    const mock = engine();
    cleanups.push(mountScene(root, () => {}, { load: async () => mock.value }));
    observer.show(true);
    await flush();
    document.dispatchEvent(new Event('astro:before-swap'));
    expect(mock.revert).toHaveBeenCalledOnce();
    expect(observer.disconnect).toHaveBeenCalledOnce();
  });
  it('mantiene contenido base y comunica un fallo de carga', async () => {
    const error = new Error('No se pudo cargar el módulo');
    const report = vi.fn();
    cleanups.push(
      mountScene(root, () => {}, { load: () => Promise.reject(error), onError: report }),
    );
    observer.show(true);
    await flush();
    expect(report).toHaveBeenCalledWith(error);
    expect(root.textContent).toBe('Contenido accesible');
  });
  it('registra callbacks de eventos en su contexto y los cancela después del desmontaje', async () => {
    const mock = engine();
    let run: SceneContext['run'] | undefined;
    const effect = vi.fn();
    const dispose = mountScene(
      root,
      (context) => {
        run = context.run;
      },
      { load: async () => mock.value },
    );
    cleanups.push(dispose);
    observer.show(true);
    await flush();
    run?.(effect);
    expect(effect).toHaveBeenCalledOnce();
    dispose();
    run?.(effect);
    expect(effect).toHaveBeenCalledOnce();
  });
});
