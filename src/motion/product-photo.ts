export interface ProductPhotoController {
  setDetail: (detail: boolean) => void;
  finish: () => void;
  dispose: () => void;
}

/** Fade two complete photographs inside the real frame, keeping a single accessible img. */
export function createProductPhotoController(
  zone: HTMLElement,
  source: HTMLSourceElement,
  reduced: MediaQueryList,
): ProductPhotoController | null {
  const image = zone.querySelector<HTMLImageElement>('[data-product-visual] img');
  const frame = zone.querySelector<HTMLElement>('.product-hero__photo-frame');
  if (!image || !frame) return null;
  let desired = false;
  let generation = 0;
  let disposed = false;
  let preload: HTMLImageElement | undefined;
  let blend: Animation | undefined;

  function finish() {
    blend?.cancel();
    blend = undefined;
    image?.style.removeProperty('opacity');
    frame?.style.removeProperty('background-image');
    zone.removeAttribute('data-photo-blending');
    zone.removeAttribute('data-photo-changing');
  }

  function cancel() {
    generation++;
    preload?.removeAttribute('srcset');
    preload?.removeAttribute('src');
    preload = undefined;
    finish();
  }

  function setDetail(detail: boolean) {
    if (disposed || !image || !frame) return;
    if (reduced.matches) finish();
    if (desired === detail) return;
    desired = detail;
    cancel();
    zone.removeAttribute('data-photo-ready');
    const media = detail ? 'all' : 'not all';
    if (source.media === media) {
      zone.toggleAttribute('data-photo-ready', detail);
      return;
    }
    const previousMedia = source.media;
    const request = generation;
    const next = new Image();
    preload = next;
    next.sizes = detail ? source.sizes : image.sizes;
    next.srcset = detail ? source.srcset : image.srcset;
    if (!detail) next.src = image.src;
    void next
      .decode()
      .then(async () => {
        if (request !== generation) return;
        const animate = !reduced.matches && !document.hidden && Boolean(image.currentSrc);
        if (animate) {
          // The earlier photograph supplies its own baked background until the new one is visible.
          frame.style.backgroundImage = `url(${JSON.stringify(image.currentSrc)})`;
          image.style.opacity = '0';
        }
        zone.setAttribute('data-photo-changing', '');
        source.media = media;
        await image.decode();
        if (request !== generation) return;
        preload = undefined;
        zone.toggleAttribute('data-photo-ready', detail);
        zone.removeAttribute('data-photo-changing');
        if (animate && !reduced.matches && !document.hidden) {
          zone.setAttribute('data-photo-blending', '');
          blend = image.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 420,
            easing: 'cubic-bezier(.22,.61,.36,1)',
          });
          blend.onfinish = finish;
        } else finish();
      })
      .catch(() => {
        if (request !== generation) return;
        source.media = previousMedia;
        finish();
      });
  }

  return {
    setDetail,
    finish,
    dispose() {
      disposed = true;
      cancel();
      source.media = 'not all';
      zone.removeAttribute('data-photo-ready');
    },
  };
}
