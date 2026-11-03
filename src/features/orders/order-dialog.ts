export interface OrderDialogController {
  setOpen: (open: boolean) => void;
  dispose: () => void;
}

/** A native top-layer purchase dialog; the book behind it keeps its real layout. */
export function initializeOrderDialog(
  root: HTMLElement,
  dialog: HTMLDialogElement,
  requestClose: () => void,
): OrderDialogController {
  const originalParent = dialog.parentNode;
  const originalNext = dialog.nextSibling;
  const abort = new AbortController();
  let bodyOverflow: string | null = null;
  let disposed = false;
  root.append(dialog);

  function unlockPage() {
    if (bodyOverflow === null) return;
    document.body.style.overflow = bodyOverflow;
    bodyOverflow = null;
  }

  function setOpen(open: boolean) {
    if (disposed) return;
    if (open) {
      dialog.hidden = false;
      dialog.inert = false;
      if (!dialog.open) {
        bodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
      }
    } else {
      if (dialog.open) dialog.close();
      dialog.hidden = true;
      dialog.inert = true;
      unlockPage();
    }
  }

  dialog.addEventListener(
    'cancel',
    (event) => {
      event.preventDefault();
      requestClose();
    },
    { signal: abort.signal },
  );
  dialog.addEventListener(
    'click',
    (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        requestClose();
    },
    { signal: abort.signal },
  );

  return {
    setOpen,
    dispose: () => {
      if (disposed) return;
      setOpen(false);
      disposed = true;
      abort.abort();
      if (originalParent?.isConnected)
        originalParent.insertBefore(
          dialog,
          originalNext?.parentNode === originalParent ? originalNext : null,
        );
    },
  };
}
