import {
  bookHash,
  normalizeBookIndex,
  parseBookHash,
  visibleBookIndices,
  type BookNavigationState,
  type BookPageSize,
} from './book-state';
import { mountScene, type SceneContext } from './scene';
import { createBookCoverTransition } from './book-cover';
import { createBookTurnTransition } from './book-turn';
import { captureBookLayout, createBookLayoutTransition } from './book-layout';
import { createProductPhotoController, type ProductPhotoController } from './product-photo';
import { initializeOrderForm } from '../features/orders/order-form';
import { initializeOrderDialog } from '../features/orders/order-dialog';

const initialized = new WeakMap<HTMLElement, () => void>();

function decorativeClone(source: HTMLElement): HTMLElement | null {
  const node = source.cloneNode(true);
  if (!(node instanceof HTMLElement)) return null;
  node.hidden = false;
  node.inert = true;
  node.classList.remove('is-left', 'is-right');
  for (const element of [node, ...node.querySelectorAll<HTMLElement>('*')]) {
    for (const attribute of [
      'id',
      'tabindex',
      'aria-labelledby',
      'aria-describedby',
      'data-book-leaf',
      'data-book-leaf-title',
      'data-book-leaf-kind',
      'data-product-slug',
      'data-product-link',
    ])
      element.removeAttribute(attribute);
  }
  node.setAttribute('aria-hidden', 'true');
  return node;
}

/** Enhance physical pages while keeping the native catalog readable and usable. */
export function initializeBook(root: HTMLElement): () => void {
  initialized.get(root)?.();
  const volume = root.querySelector<HTMLElement>('[data-book-volume]');
  const pages = root.querySelector<HTMLElement>('[data-book-pages]');
  const cover = root.querySelector<HTMLElement>('[data-book-cover]');
  const controls = root.querySelector<HTMLElement>('[data-book-controls]');
  const previous = root.querySelector<HTMLButtonElement>('[data-book-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-book-next]');
  const close = root.querySelector<HTMLButtonElement>('[data-book-close]');
  const status = root.querySelector<HTMLElement>('[data-book-status]');
  const opener = root.querySelector<HTMLElement>('[data-book-open]');
  const progress = root.querySelector<HTMLElement>('[data-book-progress]');
  const viewport = root.querySelector<HTMLElement>('[data-book-viewport]');
  const camera = root.querySelector<HTMLElement>('[data-book-camera]');
  const focusControls = root.querySelector<HTMLElement>('[data-book-focus-controls]');
  const returnButton = root.querySelector<HTMLButtonElement>('[data-book-return]');
  const focusedName = root.querySelector<HTMLElement>('[data-book-focused-name]');
  const orderStage = root.querySelector<HTMLDialogElement>('[data-order-stage]');
  const orderRoot = root.querySelector<HTMLElement>('[data-order-root]');
  const leaves = Array.from(root.querySelectorAll<HTMLElement>('[data-book-leaf]'));
  if (
    !volume ||
    !pages ||
    !cover ||
    !controls ||
    !previous ||
    !next ||
    !close ||
    !status ||
    !opener ||
    !viewport ||
    !camera ||
    !focusControls ||
    !returnButton ||
    !focusedName ||
    !orderStage?.showModal ||
    !orderRoot ||
    !leaves.length ||
    typeof window.matchMedia !== 'function'
  )
    return () => {};
  window.clearTimeout(Number(root.dataset['bookBoot']));
  root.removeAttribute('data-book-boot');
  const nodes = { volume, pages, cover, controls, previous, next, close, status, opener };
  const spatial = { camera, focusControls, returnButton, focusedName };
  const order = {
    stage: orderStage,
    form: initializeOrderForm(orderRoot),
    dialog: initializeOrderDialog(root, orderStage, requestOrderClose),
  };
  const turnLayer = root.querySelector<HTMLElement>('[data-book-turn-layer]') ?? volume;
  const controller = new AbortController();
  const { signal } = controller;
  const desktop = window.matchMedia('(min-width: 56rem)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let state: BookNavigationState = { phase: 'closed', pageIndex: 0, selectedSlug: null };
  let disposed = false;
  let motion: SceneContext | null = null;
  let actionContext: gsap.Context | null = null;
  let timeline: gsap.core.Timeline | null = null;
  let turning: HTMLElement | null = null;
  let operation = 0;
  let gesture: { id: number; x: number; y: number; startedAt: number } | null = null;
  let suppressClickUntil = 0;
  let resizeFrame = 0;
  let focusFrame = 0;
  let lastAppliedLocation = '';
  let entryScrollY = 0;
  const photos = new Map<HTMLElement, ProductPhotoController>();
  const animations: gsap.core.Animation[] = [];
  const initialStyles = [volume, pages, cover, progress, camera]
    .filter((element): element is HTMLElement => element !== null)
    .map((element) => ({ element, style: element.getAttribute('style') }));
  const pageSize = (): BookPageSize => (desktop.matches ? 2 : 1);
  const isOpen = () => state.phase !== 'closed' && state.phase !== 'preparing';
  const isBusy = () => !['closed', 'browsing', 'focused', 'ordering'].includes(state.phase);
  const hasFocus = () =>
    ['focusing', 'revealing', 'focused', 'ordering', 'retracting', 'returning'].includes(
      state.phase,
    );
  let signalEngineReady: () => void = () => {};
  let engineSettled = reduced.matches;
  let engineReady = new Promise<void>((resolve) => {
    signalEngineReady = resolve;
  });

  function markEngineReady() {
    engineSettled = true;
    signalEngineReady();
  }

  async function waitForMotion() {
    if (motion || reduced.matches || engineSettled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        engineReady,
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, 450);
        }),
      ]);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  }

  function syncControls() {
    root.dataset['bookBusy'] = String(isBusy());
    root.dataset['bookPhase'] = state.phase;
    nodes.previous.disabled = state.phase !== 'browsing' || state.pageIndex === 0;
    nodes.next.disabled =
      state.phase !== 'browsing' || state.pageIndex + pageSize() >= leaves.length;
    nodes.close.disabled = isBusy();
    nodes.pages.inert = !isOpen() || isBusy() || state.phase === 'ordering';
    nodes.opener.setAttribute('aria-disabled', String(isBusy()));
  }

  function displayLeaves(indices: readonly number[]) {
    leaves.forEach((leaf, position) => {
      const visible = indices.includes(position);
      leaf.hidden = !visible;
      leaf.inert = !visible || isBusy();
      leaf.classList.toggle('is-left', visible && position === indices[0]);
      leaf.classList.toggle('is-right', visible && position === indices[1]);
    });
  }

  function render() {
    state = { ...state, pageIndex: normalizeBookIndex(state.pageIndex, leaves.length, pageSize()) };
    root.dataset['bookMode'] = isOpen() ? 'open' : 'closed';
    nodes.cover.hidden = state.phase === 'browsing' || state.phase === 'turning' || hasFocus();
    nodes.cover.inert = isOpen();
    nodes.pages.hidden = !isOpen();
    nodes.controls.hidden = !isOpen() || hasFocus();
    spatial.focusControls.hidden = !hasFocus();
    root.dataset['bookFocus'] = String(hasFocus() && state.phase !== 'returning');
    root.dataset['bookOrder'] = String(state.phase === 'ordering');
    const editorial =
      hasFocus() &&
      state.phase !== 'returning' &&
      Boolean(
        state.selectedSlug &&
        productZone(state.selectedSlug)?.hasAttribute('data-editorial-detail'),
      );
    root.dataset['bookEditorial'] = String(editorial);
    if (!editorial) root.style.removeProperty('--editorial-height');
    displayLeaves(isOpen() ? visibleBookIndices(state.pageIndex, leaves.length, pageSize()) : []);
    for (const leaf of leaves) {
      let readingPage = false;
      for (const zone of leaf.querySelectorAll<HTMLElement>('[data-product-slug]')) {
        const selected = hasFocus() && zone.dataset['productSlug'] === state.selectedSlug;
        zone.classList.toggle('is-selected', selected);
        zone.classList.toggle('is-returning', selected && state.phase === 'returning');
        zone.inert = hasFocus() && !selected;
        const reading = selected && state.phase !== 'returning';
        setReading(zone, reading);
        readingPage ||= selected;
        if (selected) {
          const title = zone.querySelector('h4');
          spatial.focusedName.textContent = title?.dataset['detailName'] ?? '';
        }
      }
      leaf.classList.toggle('is-reading-page', readingPage);
    }
    const last = Math.min(state.pageIndex + pageSize(), leaves.length);
    nodes.status.textContent =
      pageSize() === 2
        ? `Páginas ${state.pageIndex + 1}–${last} de ${leaves.length}`
        : `Página ${state.pageIndex + 1} de ${leaves.length}`;
    if (progress) progress.style.transform = `scaleX(${last / leaves.length})`;
    syncControls();
    order.dialog.setOpen(state.phase === 'ordering');
  }

  function clearAction() {
    operation++;
    timeline?.kill();
    if (timeline) {
      const position = animations.indexOf(timeline);
      if (position >= 0) animations.splice(position, 1);
    }
    timeline = null;
    actionContext?.revert();
    actionContext = null;
    turning?.remove();
    turning = null;
  }

  function focusLeaf() {
    const heading = leaves[state.pageIndex]?.querySelector<HTMLElement>('[data-book-leaf-title]');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }

  function repairHiddenFocus() {
    if (
      document.activeElement instanceof Element &&
      document.activeElement.closest('[data-book-leaf][hidden]')
    )
      focusLeaf();
  }

  function revealFocusedControl() {
    const active = document.activeElement;
    if (
      disposed ||
      state.phase !== 'focused' ||
      !(active instanceof HTMLElement) ||
      !nodes.pages.contains(active)
    )
      return;
    const bounds = active.getBoundingClientRect();
    const bottom = desktop.matches
      ? window.innerHeight
      : Math.min(window.innerHeight, spatial.focusControls.getBoundingClientRect().top);
    if (bounds.top < 0 || bounds.bottom > window.innerHeight || bounds.top >= bottom)
      active.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
  }

  function settleAction() {
    const wasReturning = ['returning', 'retracting'].includes(state.phase);
    clearAction();
    gesture = null;
    const phase =
      hasFocus() && !['returning', 'retracting'].includes(state.phase)
        ? state.phase === 'ordering'
          ? 'ordering'
          : 'focused'
        : state.phase === 'closed' || state.phase === 'closing' || state.phase === 'preparing'
          ? 'closed'
          : 'browsing';
    state = {
      ...state,
      phase,
      selectedSlug: phase === 'focused' || phase === 'ordering' ? state.selectedSlug : null,
    };
    render();
    if (state.phase === 'focused' || state.phase === 'ordering') reframeFocus();
    else resetCamera();
    repairHiddenFocus();
    revealFocusedControl();
    if (!disposed && wasReturning) writeHash(true);
  }

  function writeHash(replace = false) {
    const slug = hasFocus() && state.phase !== 'returning' ? state.selectedSlug : null;
    const ordering = state.phase === 'ordering';
    const keepOrigin = replace || ordering;
    const hash = isOpen()
      ? bookHash(state.pageIndex, slug, state.phase === 'ordering')
      : window.location.pathname + window.location.search;
    const historyState = {
      aromafiaBookFocus:
        Boolean(slug) && (!keepOrigin || history.state?.aromafiaBookFocus === true),
      returnHash: slug
        ? keepOrigin
          ? history.state?.returnHash
          : bookHash(state.pageIndex)
        : null,
      returnDetail: ordering
        ? replace
          ? history.state?.returnDetail
          : bookHash(state.pageIndex, slug)
        : null,
    };
    if (replace) history.replaceState(historyState, '', hash);
    else if (window.location.hash !== (isOpen() ? hash : ''))
      history.pushState(historyState, '', hash);
    lastAppliedLocation = window.location.href;
  }

  function animate(
    build: (engine: SceneContext['gsap']) => gsap.core.Timeline,
    complete: () => void,
  ) {
    const engine = motion;
    if (!engine || reduced.matches) {
      complete();
      return;
    }
    const currentOperation = operation;
    actionContext = engine.gsap.context(() => {
      timeline = build(engine.gsap);
      animations.push(timeline);
      timeline.eventCallback('onComplete', () => {
        if (disposed || currentOperation !== operation) return;
        clearAction();
        complete();
      });
    }, root);
  }

  async function openBook(updateHistory = true, focus = true) {
    if (isBusy()) return;
    if (isOpen()) {
      if (focus) focusLeaf();
      return;
    }
    const pendingOperation = ++operation;
    state = { ...state, phase: 'preparing' };
    render();
    await waitForMotion();
    if (disposed || pendingOperation !== operation) return;
    clearAction();
    state = { ...state, phase: 'opening' };
    render();
    if (updateHistory) writeHash();
    const finish = () => {
      state = { ...state, phase: 'browsing' };
      render();
      if (focus) focusLeaf();
    };
    animate(
      (engine) =>
        createBookCoverTransition({
          gsap: engine,
          volume: nodes.volume,
          pages: nodes.pages,
          cover: nodes.cover,
          opening: true,
          desktop: desktop.matches,
        }),
      finish,
    );
  }

  function closeBook(updateHistory = true) {
    if (state.phase === 'closed' || state.phase === 'closing') return;
    settleAction();
    resetCamera();
    state = { ...state, phase: 'closing', selectedSlug: null };
    render();
    const finish = () => {
      state = { ...state, phase: 'closed' };
      render();
      if (updateHistory) writeHash();
      nodes.opener.focus({ preventScroll: true });
    };
    animate(
      (engine) =>
        createBookCoverTransition({
          gsap: engine,
          volume: nodes.volume,
          pages: nodes.pages,
          cover: nodes.cover,
          opening: false,
          desktop: desktop.matches,
        }),
      finish,
    );
  }

  function pageTurn(target: number, updateHistory = true) {
    if (state.phase !== 'browsing') return;
    const nextIndex = normalizeBookIndex(target, leaves.length, pageSize());
    if (nextIndex === state.pageIndex) return;
    const previousIndex = state.pageIndex;
    const forward = nextIndex > previousIndex;
    const oldIndices = visibleBookIndices(previousIndex, leaves.length, pageSize());
    const newIndices = visibleBookIndices(nextIndex, leaves.length, pageSize());
    const front =
      leaves[forward ? (oldIndices[oldIndices.length - 1] ?? previousIndex) : previousIndex];
    const back = leaves[forward ? nextIndex : (newIndices[newIndices.length - 1] ?? nextIndex)];
    const focusWasOnLeaf =
      document.activeElement instanceof Element &&
      Boolean(document.activeElement.closest('[data-book-leaf]'));
    state = { phase: 'turning', pageIndex: nextIndex, selectedSlug: null };
    syncControls();
    const finish = () => {
      state = { ...state, phase: 'browsing' };
      render();
      if (focusWasOnLeaf) focusLeaf();
    };
    if (updateHistory) writeHash();
    if (!motion || reduced.matches || !front || !back) {
      finish();
      return;
    }
    const frontClone = decorativeClone(front);
    const backClone = decorativeClone(back);
    if (!frontClone || !backClone) {
      finish();
      return;
    }
    turning = document.createElement('div');
    turning.className = 'book-turn';
    turning.dataset['direction'] = forward ? 'next' : 'previous';
    turning.setAttribute('aria-hidden', 'true');
    turning.inert = true;
    const frontFace = document.createElement('div');
    frontFace.className = 'book-turn__front';
    frontFace.append(frontClone);
    const backFace = document.createElement('div');
    backFace.className = 'book-turn__back';
    backFace.append(backClone);
    turning.append(frontFace, backFace);
    turnLayer.append(turning);
    if (pageSize() === 2) {
      const underLeft = forward ? oldIndices[0] : newIndices[0];
      const underRight = forward ? newIndices[1] : oldIndices[1];
      displayLeaves(
        [underLeft, underRight].filter((value): value is number => value !== undefined),
      );
    } else displayLeaves(newIndices);
    const sheet = turning;
    animate((engine) => createBookTurnTransition({ gsap: engine, sheet, forward }), finish);
  }

  function productZone(slug: string): HTMLElement | null {
    for (const leaf of leaves) {
      for (const zone of leaf.querySelectorAll<HTMLElement>('[data-product-slug]'))
        if (zone.dataset['productSlug'] === slug) return zone;
    }
    return null;
  }

  function setReading(zone: HTMLElement, enabled: boolean) {
    zone.classList.toggle('is-reading', enabled);
    const heading = zone.querySelector<HTMLElement>('h4');
    const label = heading?.dataset[enabled || disposed ? 'detailName' : 'overviewName'];
    if (heading && label && heading.textContent?.trim() !== label) heading.textContent = label;
    const detailImage = zone.querySelector<HTMLSourceElement>('[data-detail-image]');
    if (detailImage && !disposed) {
      let photo = photos.get(zone);
      if (!photo) {
        photo = createProductPhotoController(zone, detailImage, reduced) ?? undefined;
        if (photo) photos.set(zone, photo);
      }
      photo?.setDetail(enabled);
    }
    const body = zone.querySelector<HTMLElement>('[data-book-reading]');
    const trigger = zone.querySelector<HTMLElement>('[data-product-link]');
    if (body) {
      body.hidden = !enabled;
      body.inert = !enabled;
    }
    const buy = zone.querySelector<HTMLButtonElement>('[data-order-open]');
    if (buy) buy.hidden = !enabled;
    if (trigger) trigger.inert = enabled;
    if (!enabled) {
      for (const property of ['left', 'top', 'width', 'height'])
        zone.style.removeProperty('--reading-' + property);
    }
  }

  function resetCamera() {
    spatial.camera.style.removeProperty('transform');
  }

  /** Measure once after layout changes. The selected zone remains on its original physical leaf. */
  function configureReading(zone: HTMLElement) {
    const leaf = zone.closest<HTMLElement>('[data-book-leaf]');
    if (!leaf) return;
    const frame = spatial.camera.getBoundingClientRect();
    const paper = leaf.getBoundingClientRect();
    const inset = window.innerWidth <= 360 ? 0 : 12;
    zone.style.setProperty('--reading-left', frame.left - paper.left + inset + 'px');
    zone.style.setProperty('--reading-top', frame.top - paper.top + inset + 'px');
    zone.style.setProperty('--reading-width', frame.width - inset * 2 + 'px');
    zone.style.setProperty('--reading-height', frame.height - inset * 2 + 'px');
    if (!desktop.matches && zone.hasAttribute('data-editorial-detail'))
      root.style.setProperty('--editorial-height', zone.offsetHeight + inset * 2 + 'px');
  }

  function reframeFocus() {
    const zone = state.selectedSlug ? productZone(state.selectedSlug) : null;
    resetCamera();
    if (zone) configureReading(zone);
    else {
      state = { ...state, phase: 'browsing', selectedSlug: null };
      render();
    }
  }

  function openOrder(updateHistory = true) {
    if (state.phase !== 'focused' || !state.selectedSlug) return;
    if (!order.form.selectProduct(state.selectedSlug)) return;
    state = { ...state, phase: 'ordering' };
    render();
    if (updateHistory) writeHash();
    else writeHash(true);
    const entry = desktop.matches
      ? order.stage.querySelector<HTMLElement>('input[name="name"]')
      : order.stage.querySelector<HTMLElement>('h2');
    entry?.focus({ preventScroll: true });
  }

  function closeOrder(updateHistory = true) {
    if (state.phase !== 'ordering') return;
    state = { ...state, phase: 'focused' };
    render();
    reframeFocus();
    if (updateHistory) {
      writeHash(true);
      history.replaceState(
        { ...history.state, aromafiaBookFocus: false },
        '',
        window.location.href,
      );
    }
    const zone = state.selectedSlug ? productZone(state.selectedSlug) : null;
    zone?.querySelector<HTMLButtonElement>('[data-order-open]')?.focus({ preventScroll: true });
    revealFocusedControl();
  }

  function requestOrderClose() {
    if (state.phase !== 'ordering') return;
    if (history.state?.returnDetail === bookHash(state.pageIndex, state.selectedSlug))
      history.back();
    else closeOrder();
  }

  function focusProduct(
    slug: string,
    updateHistory = true,
    animated = true,
    ordering = false,
  ): boolean {
    if (state.phase === 'focused' && state.selectedSlug === slug) {
      if (ordering) openOrder(updateHistory);
      return true;
    }
    const zone = productZone(slug);
    const leaf = zone?.closest<HTMLElement>('[data-book-leaf]');
    if (!zone || !leaf) return false;
    if (!hasFocus()) entryScrollY = window.scrollY;
    const before = captureBookLayout(spatial.camera, zone);
    clearAction();
    gesture = null;
    state = {
      phase: 'focusing',
      pageIndex: normalizeBookIndex(leaves.indexOf(leaf), leaves.length, pageSize()),
      selectedSlug: slug,
    };
    resetCamera();
    render();
    configureReading(zone);
    // Save the catalog's scroll position in its history entry before aligning the reading paper.
    if (updateHistory) writeHash();
    else if (!ordering && window.location.hash !== bookHash(state.pageIndex, slug)) writeHash(true);
    if (!desktop.matches) {
      const top = spatial.camera.getBoundingClientRect().top - 12;
      if (top < 0) window.scrollBy({ top, behavior: 'instant' });
    }
    const after = captureBookLayout(spatial.camera, zone);
    const finish = () => {
      state = { ...state, phase: 'focused' };
      resetCamera();
      render();
      if (ordering) openOrder(false);
      else spatial.returnButton.focus({ preventScroll: true });
    };
    if (!animated || !motion || reduced.matches) finish();
    else
      animate((engine) => {
        const sequence = createBookLayoutTransition(engine, spatial.camera, before, after);
        const reading = zone.querySelector<HTMLElement>('[data-book-reading]');
        if (reading) {
          sequence
            .call(
              () => {
                state = { ...state, phase: 'revealing' };
                render();
              },
              [],
              1.05,
            )
            .fromTo(
              zone.hasAttribute('data-editorial-detail') ? Array.from(reading.children) : reading,
              { opacity: 0, y: 8 },
              {
                opacity: 1,
                y: 0,
                duration: 0.28,
                stagger: zone.hasAttribute('data-editorial-detail') ? 0.045 : 0,
                ease: 'power2.out',
              },
              1.05,
            );
        }
        return sequence;
      }, finish);
    return true;
  }

  function returnToBook(updateHistory = true) {
    if (!hasFocus() || ['returning', 'retracting'].includes(state.phase)) return;
    if (state.phase === 'ordering') closeOrder(false);
    const slug = state.selectedSlug;
    const zone = slug ? productZone(slug) : null;
    if (!zone) return;
    const reading = zone.querySelector<HTMLElement>('[data-book-reading]');
    const returnLayout = () => {
      // Capture the actual intermediate position before cancelling an interrupted entrance.
      const before = captureBookLayout(spatial.camera, zone);
      clearAction();
      state = { ...state, phase: 'returning' };
      render();
      resetCamera();
      if (!desktop.matches && zone.hasAttribute('data-editorial-detail'))
        window.scrollTo({ top: entryScrollY, behavior: 'instant' });
      const after = captureBookLayout(spatial.camera, zone);
      if (updateHistory) writeHash(true);
      const finish = () => {
        resetCamera();
        state = { ...state, phase: 'browsing', selectedSlug: null };
        render();
        zone.querySelector<HTMLElement>('[data-product-link]')?.focus({ preventScroll: true });
      };
      animate(
        (engine) => createBookLayoutTransition(engine, spatial.camera, before, after),
        finish,
      );
    };
    if (state.phase === 'focused' && reading && motion && !reduced.matches) {
      clearAction();
      state = { ...state, phase: 'retracting' };
      render();
      animate(
        (engine) => engine.timeline().to(reading, { opacity: 0, y: 8, duration: 0.16 }),
        returnLayout,
      );
    } else returnLayout();
  }

  function requestReturn() {
    if (!hasFocus() || ['returning', 'retracting'].includes(state.phase)) return;
    if (history.state?.aromafiaBookFocus && history.state?.returnHash === bookHash(state.pageIndex))
      history.back();
    else returnToBook();
  }

  function applyLocation(animated = true) {
    if (lastAppliedLocation === window.location.href) return;
    lastAppliedLocation = window.location.href;
    const location = parseBookHash(window.location.hash, leaves.length, pageSize());
    if (!location) {
      if (!window.location.hash && (isOpen() || state.phase === 'preparing')) closeBook(false);
      else if (window.location.hash === '#coleccion') void openBook(false, false);
      return;
    }
    if (location.slug === state.selectedSlug && location.slug) {
      if (location.order && state.phase === 'focused') {
        openOrder(false);
        return;
      }
      if (!location.order && state.phase === 'ordering') {
        closeOrder(false);
        return;
      }
    }
    if (!location.slug && hasFocus() && location.index === state.pageIndex) {
      returnToBook(false);
      return;
    }
    clearAction();
    const zone = location.slug ? productZone(location.slug) : null;
    const selectedLeaf = zone?.closest<HTMLElement>('[data-book-leaf]');
    const leafIndex = selectedLeaf ? leaves.indexOf(selectedLeaf) : location.index;
    state = {
      phase: 'browsing',
      pageIndex: normalizeBookIndex(leafIndex, leaves.length, pageSize()),
      selectedSlug: null,
    };
    resetCamera();
    render();
    if (zone && location.slug)
      focusProduct(location.slug, false, animated, location.order === true);
    else {
      if (window.location.hash !== bookHash(state.pageIndex)) writeHash(true);
      repairHiddenFocus();
    }
  }

  function onClick(event: MouseEvent) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (performance.now() < suppressClickUntil && target.closest('[data-book-viewport]')) {
      event.preventDefault();
      return;
    }
    if (target.closest('[data-order-open]')) {
      event.preventDefault();
      openOrder();
      return;
    }

    const detailLink = target.closest<HTMLAnchorElement>('[data-product-link]');
    if (detailLink) {
      if (isBusy()) event.preventDefault();
      else {
        const slug = detailLink.closest<HTMLElement>('[data-product-slug]')?.dataset['productSlug'];
        if (slug && focusProduct(slug)) event.preventDefault();
      }
      return;
    }
    if (target.closest('[data-book-open], a[href="#coleccion"]')) {
      event.preventDefault();
      void openBook();
    }
  }

  function onKeydown(event: KeyboardEvent) {
    if (!isOpen() || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      if (state.phase === 'ordering') requestOrderClose();
      else if (hasFocus()) requestReturn();
      else closeBook();
      return;
    }
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest('input, textarea, select, [contenteditable="true"]')
    )
      return;
    if (state.phase !== 'browsing') return;
    const destinations: Record<string, number> = {
      ArrowRight: state.pageIndex + pageSize(),
      ArrowLeft: state.pageIndex - pageSize(),
      Home: 0,
      End: leaves.length - 1,
    };
    const destination = destinations[event.key];
    if (destination !== undefined) {
      event.preventDefault();
      pageTurn(destination);
    }
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType !== 'touch') return;
    if (!event.isPrimary) {
      gesture = null;
      return;
    }
    if (state.phase !== 'browsing' || event.button !== 0) return;
    const target = event.target;
    if (target instanceof Element && target.closest('button, input, textarea, select')) return;
    gesture = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startedAt: performance.now(),
    };
  }

  function onPointerUp(event: PointerEvent) {
    const start = gesture;
    gesture = null;
    if (!start || event.pointerId !== start.id || state.phase !== 'browsing') return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (
      Math.abs(dx) < 56 ||
      Math.abs(dx) < Math.abs(dy) * 1.4 ||
      performance.now() - start.startedAt > 1200
    )
      return;
    suppressClickUntil = performance.now() + 400;
    pageTurn(state.pageIndex + (dx < 0 ? pageSize() : -pageSize()));
  }

  root.classList.add('is-enhanced');
  root.addEventListener('click', onClick, { signal });
  root.addEventListener('keydown', onKeydown, { signal });
  root.addEventListener('aromafia:order-close', requestOrderClose, { signal });
  root.addEventListener(
    'aromafia:order-product',
    (event) => {
      if (state.phase !== 'ordering' || !(event instanceof CustomEvent)) return;
      const detail: unknown = event.detail;
      if (
        typeof detail !== 'object' ||
        detail === null ||
        !('slug' in detail) ||
        typeof detail.slug !== 'string'
      )
        return;
      const zone = productZone(detail.slug);
      const leaf = zone?.closest<HTMLElement>('[data-book-leaf]');
      if (!zone || !leaf) return;
      state = {
        ...state,
        selectedSlug: detail.slug,
        pageIndex: normalizeBookIndex(leaves.indexOf(leaf), leaves.length, pageSize()),
      };
      render();
      reframeFocus();
      writeHash(true);
    },
    { signal },
  );
  previous.addEventListener('click', () => pageTurn(state.pageIndex - pageSize()), { signal });
  next.addEventListener('click', () => pageTurn(state.pageIndex + pageSize()), { signal });
  close.addEventListener('click', () => closeBook(), { signal });
  viewport?.addEventListener('pointerdown', onPointerDown, { signal, passive: true });
  window.addEventListener('pointerup', onPointerUp, { signal, passive: true });
  window.addEventListener(
    'pointercancel',
    () => {
      gesture = null;
    },
    { signal, passive: true },
  );
  window.addEventListener(
    'blur',
    () => {
      gesture = null;
    },
    { signal },
  );
  window.addEventListener('popstate', () => applyLocation(), { signal });
  window.addEventListener('hashchange', () => applyLocation(), { signal });
  spatial.returnButton.addEventListener('click', requestReturn, { signal });
  pages.addEventListener(
    'focusin',
    () => {
      cancelAnimationFrame(focusFrame);
      focusFrame = requestAnimationFrame(revealFocusedControl);
    },
    { signal },
  );
  window.addEventListener(
    'resize',
    () => {
      if (!hasFocus()) return;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        if (disposed || !hasFocus()) return;
        settleAction();
        if (state.phase === 'focused' || state.phase === 'ordering') writeHash(true);
      });
    },
    { signal },
  );
  desktop.addEventListener(
    'change',
    () => {
      if (state.selectedSlug) {
        const leaf = productZone(state.selectedSlug)?.closest<HTMLElement>('[data-book-leaf]');
        if (leaf) state = { ...state, pageIndex: leaves.indexOf(leaf) };
      }
      settleAction();
      if (isOpen()) writeHash(true);
    },
    { signal },
  );
  reduced.addEventListener('change', settleAction, { signal });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) for (const photo of photos.values()) photo.finish();
    },
    { signal },
  );
  render();
  const disposeMotion = mountScene(
    root,
    (context) => {
      motion = context;
      markEngineReady();
      context.addCleanup(() => {
        if (motion === context) motion = null;
        if (!disposed && !reduced.matches) {
          engineSettled = false;
          engineReady = new Promise<void>((resolve) => {
            signalEngineReady = resolve;
          });
        }
        settleAction();
      });
      return { animations };
    },
    { onError: markEngineReady },
  );
  applyLocation(false);

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(resizeFrame);
    cancelAnimationFrame(focusFrame);
    clearAction();
    controller.abort();
    for (const photo of photos.values()) photo.dispose();
    photos.clear();
    order.dialog.dispose();
    order.form.dispose();
    order.stage.hidden = true;
    order.stage.inert = true;
    disposeMotion();
    root.classList.remove('is-enhanced');
    for (const name of [
      'data-book-mode',
      'data-book-busy',
      'data-book-phase',
      'data-book-focus',
      'data-book-order',
      'data-book-editorial',
    ])
      root.removeAttribute(name);
    root.style.removeProperty('--editorial-height');
    leaves.forEach((leaf) => {
      leaf.hidden = false;
      leaf.inert = false;
      leaf.classList.remove('is-left', 'is-right', 'is-reading-page');
      leaf.querySelector('[data-book-leaf-title]')?.removeAttribute('tabindex');
      for (const zone of leaf.querySelectorAll<HTMLElement>('[data-product-slug]')) {
        zone.inert = false;
        zone.classList.remove('is-selected', 'is-returning');
        setReading(zone, false);
        const body = zone.querySelector<HTMLElement>('[data-book-reading]');
        if (body) {
          body.hidden = false;
          body.inert = false;
        }
      }
    });
    nodes.pages.hidden = false;
    nodes.pages.inert = false;
    nodes.cover.hidden = false;
    nodes.cover.inert = false;
    nodes.opener.removeAttribute('aria-disabled');
    nodes.controls.hidden = true;
    spatial.focusControls.hidden = true;
    for (const initial of initialStyles) {
      if (initial.style === null) initial.element.removeAttribute('style');
      else initial.element.setAttribute('style', initial.style);
    }
    if (initialized.get(root) === dispose) initialized.delete(root);
  }
  document.addEventListener('astro:before-swap', dispose, { signal });
  initialized.set(root, dispose);
  return dispose;
}
