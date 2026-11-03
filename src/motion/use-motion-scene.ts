import { useEffect, type RefObject } from 'react';
import { mountScene, type SceneFactory, type SceneOptions } from './scene';

/** Keep factory/options stable; React cleanup also handles StrictMode remounting. */
export function useMotionScene(
  root: RefObject<HTMLElement | null>,
  create: SceneFactory,
  options?: SceneOptions,
): void {
  useEffect(() => {
    if (root.current) return mountScene(root.current, create, options);
    return undefined;
  }, [root, create, options]);
}
