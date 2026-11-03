// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  initializeOrderDialog,
  type OrderDialogController,
} from '../../src/features/orders/order-dialog';

let root: HTMLElement;
let paper: HTMLElement;
let next: HTMLElement;
let dialog: HTMLDialogElement;
let controller: OrderDialogController | undefined;

beforeEach(() => {
  root = document.createElement('section');
  paper = document.createElement('div');
  paper.inert = true;
  dialog = document.createElement('dialog');
  dialog.hidden = true;
  dialog.inert = true;
  dialog.innerHTML = '<button type="button">Cerrar</button>';
  next = document.createElement('span');
  paper.append(dialog, next);
  root.append(paper);
  document.body.append(root);
  // jsdom cannot provide a native top layer; stub only its browser entry/exit methods.
  Object.defineProperty(dialog, 'showModal', {
    configurable: true,
    value: vi.fn(() => dialog.setAttribute('open', '')),
  });
  Object.defineProperty(dialog, 'close', {
    configurable: true,
    value: vi.fn(() => dialog.removeAttribute('open')),
  });
});

afterEach(() => {
  controller?.dispose();
  controller = undefined;
  root.remove();
  document.body.style.overflow = '';
});

describe('ciclo de vida del modal de compra', () => {
  it('sale del papel inert y repone su lugar y el scroll previo al cerrar o desmontar', () => {
    document.body.style.overflow = 'scroll';
    controller = initializeOrderDialog(root, dialog, vi.fn());
    expect(dialog.parentNode).toBe(root);
    expect(paper.inert).toBe(true);
    controller.setOpen(true);
    controller.setOpen(true);
    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(dialog.open).toBe(true);
    expect(dialog.hidden).toBe(false);
    expect(dialog.inert).toBe(false);
    expect(document.body.style.overflow).toBe('hidden');
    controller.setOpen(false);
    expect(dialog.open).toBe(false);
    expect(dialog.hidden).toBe(true);
    expect(dialog.inert).toBe(true);
    expect(document.body.style.overflow).toBe('scroll');
    controller.setOpen(true);
    controller.dispose();
    controller.dispose();
    expect(dialog.parentNode).toBe(paper);
    expect(dialog.nextSibling).toBe(next);
    expect(dialog.open).toBe(false);
    expect(document.body.style.overflow).toBe('scroll');
    controller.setOpen(true);
    expect(dialog.open).toBe(false);
  });

  it('solicita el regreso por Escape o backdrop, ignora el contenido y limpia los listeners', () => {
    const close = vi.fn();
    controller = initializeOrderDialog(root, dialog, close);
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 100, 400, 400));
    controller.setOpen(true);
    const escape = new Event('cancel', { cancelable: true });
    expect(dialog.dispatchEvent(escape)).toBe(false);
    expect(escape.defaultPrevented).toBe(true);
    expect(close).toHaveBeenCalledTimes(1);
    expect(dialog.open).toBe(true);
    dialog.dispatchEvent(new MouseEvent('click', { clientX: 200, clientY: 200 }));
    dialog.querySelector('button')?.click();
    expect(close).toHaveBeenCalledTimes(1);
    dialog.dispatchEvent(new MouseEvent('click', { clientX: 50, clientY: 50 }));
    expect(close).toHaveBeenCalledTimes(2);
    controller.dispose();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    dialog.dispatchEvent(new MouseEvent('click', { clientX: 50, clientY: 50 }));
    expect(close).toHaveBeenCalledTimes(2);
  });
});
