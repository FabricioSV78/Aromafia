/** Viewport coordinates measured together while the book camera is at its neutral transform. */
export interface RectLike {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** CSS pixels for translation; apply with transform-origin: 0 0 and a uniform scale. */
export interface CameraTransform {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

export interface BookCameraOptions {
  readonly camera: RectLike;
  readonly target: RectLike;
  /** Pass the available reading area, already excluding any controls that must remain visible. */
  readonly viewport: RectLike;
  readonly inset?: number;
  readonly maxScale?: number;
  /** Fraction of the inset reading rectangle occupied by the fitted zone, from 0 to 1. */
  readonly fillRatio?: number;
}

function isUsableRect(rect: RectLike): boolean {
  return (
    [rect.left, rect.top, rect.width, rect.height].every(Number.isFinite) &&
    rect.width > 0 &&
    rect.height > 0
  );
}

/**
 * Center a real zone of the book inside the available reading area without changing
 * its aspect ratio. Translation is relative to the untransformed camera's top-left corner.
 * Null leaves the caller free to retain the native link when a zone cannot be measured.
 */
export function calculateBookCamera({
  camera,
  target,
  viewport,
  inset = 20,
  maxScale = 2.4,
  fillRatio = 0.94,
}: BookCameraOptions): CameraTransform | null {
  if (
    !isUsableRect(camera) ||
    !isUsableRect(target) ||
    !isUsableRect(viewport) ||
    !Number.isFinite(inset) ||
    inset < 0 ||
    !Number.isFinite(maxScale) ||
    maxScale <= 0 ||
    !Number.isFinite(fillRatio) ||
    fillRatio <= 0 ||
    fillRatio > 1
  )
    return null;

  const availableWidth = (viewport.width - inset * 2) * fillRatio;
  const availableHeight = (viewport.height - inset * 2) * fillRatio;
  if (availableWidth <= 0 || availableHeight <= 0) return null;

  const scale = Math.min(maxScale, availableWidth / target.width, availableHeight / target.height);
  const x =
    viewport.left +
    viewport.width / 2 -
    camera.left -
    (target.left + target.width / 2 - camera.left) * scale;
  const y =
    viewport.top +
    viewport.height / 2 -
    camera.top -
    (target.top + target.height / 2 - camera.top) * scale;

  if (![x, y, scale].every(Number.isFinite) || scale <= 0) return null;
  return { x, y, scale };
}
