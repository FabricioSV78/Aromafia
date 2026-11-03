/** The approved CSS scene runs once per tab; the catalogue stays usable on every failure path. */
export function initializeBrandIntro(dialog: HTMLDialogElement): () => void {
  const html = document.documentElement;
  const template = dialog.querySelector<HTMLTemplateElement>('[data-intro-template]');
  const sceneFrame = template?.content.querySelector('iframe')?.cloneNode(true);
  const frame = sceneFrame instanceof HTMLIFrameElement ? sceneFrame : undefined;
  const skip = dialog.querySelector<HTMLButtonElement>('[data-intro-skip]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const originalTheme = theme?.content;
  const events = new AbortController();
  const { signal } = events;
  let timeout = 0;
  let leaving = false;
  let disposed = false;
  let restoreFocus = false;

  function releaseBoot() {
    window.clearTimeout(Number(html.dataset.brandIntroBoot));
    delete html.dataset.brandIntroBoot;
  }

  function finalize() {
    if (disposed) return;
    disposed = true;
    events.abort();
    window.clearTimeout(timeout);
    releaseBoot();
    html.removeAttribute('data-brand-intro-pending');
    if (theme && originalTheme) theme.content = originalTheme;
    if (dialog.open) dialog.close();
    frame?.remove();
    dialog.remove();
    if (restoreFocus && document.visibilityState !== 'hidden') {
      const opener = document.querySelector<HTMLElement>('[data-book-open]');
      const target = opener?.getClientRects().length
        ? opener
        : document.querySelector<HTMLElement>('#contenido');
      target?.focus({ preventScroll: true });
    }
  }

  function finish(animated = true, focus = true) {
    if (disposed) return;
    if (leaving) {
      if (!animated) finalize();
      return;
    }
    leaving = true;
    restoreFocus = focus;
    dialog.dataset.introPhase = 'leaving';
    window.clearTimeout(timeout);
    releaseBoot();
    html.removeAttribute('data-brand-intro-pending');
    if (theme && originalTheme) theme.content = originalTheme;
    frame?.contentDocument?.documentElement.setAttribute('data-intro-paused', '');
    try {
      sessionStorage.setItem('aromafia:intro:v3:seen', '1');
    } catch {
      // Storage is optional; it must never prevent entering the catalogue.
    }
    if (!animated || reduced.matches || !dialog.open) {
      finalize();
      return;
    }
    timeout = window.setTimeout(finalize, 350);
  }

  const dispose = () => finish(false, false);
  if (
    !html.hasAttribute('data-brand-intro-pending') ||
    reduced.matches ||
    !template ||
    !frame ||
    !skip ||
    typeof dialog.showModal !== 'function'
  ) {
    finalize();
    return dispose;
  }

  async function start() {
    if (!frame || disposed || leaving) return;
    try {
      const scene = frame.contentDocument;
      if (!scene || scene.URL === 'about:blank') return;
      const stage = scene.querySelector<HTMLElement>('.stage');
      if (!stage) {
        finish(false);
        return;
      }
      await Promise.all(Array.from(scene.images, (image) => image.decode()));
      if (disposed || leaving) return;
      window.clearTimeout(timeout);
      stage.addEventListener(
        'animationend',
        (event) => {
          if (event.target === stage && event.animationName === 'stage') finish();
        },
        { signal },
      );
      dialog.dataset.introPhase = 'playing';
      dialog.setAttribute('data-intro-ready', '');
      scene.documentElement.removeAttribute('data-intro-paused');
      // A missing animation event must also release the catalogue.
      timeout = window.setTimeout(() => finish(), 17_000);
    } catch {
      finish(false);
    }
  }

  skip.addEventListener('click', () => finish(), { signal });
  dialog.addEventListener(
    'cancel',
    (event) => {
      event.preventDefault();
      finish();
    },
    { signal },
  );
  frame.addEventListener('load', () => void start(), { signal });
  frame.addEventListener('error', () => finish(false), { signal });
  reduced.addEventListener('change', () => reduced.matches && finish(false), { signal });
  document.addEventListener(
    'visibilitychange',
    () => document.visibilityState === 'hidden' && dispose(),
    { signal },
  );
  window.addEventListener('pagehide', dispose, { signal });
  document.addEventListener('astro:before-swap', dispose, { signal });

  try {
    dialog.dataset.introPhase = 'loading';
    dialog.showModal();
    if (theme) theme.content = '#f0e8d5';
    skip.focus({ preventScroll: true });
    timeout = window.setTimeout(() => finish(false), 8000);
    frame.src = frame.dataset.src ?? '/intro/v3/scene.html';
    template.replaceWith(frame);
    releaseBoot();
  } catch {
    finish(false);
  }
  return dispose;
}
