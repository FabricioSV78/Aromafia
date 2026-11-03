export interface BookLocation {
  /** Zero-based index of the first visible physical page, including the endpaper. */
  readonly index: number;
  readonly slug: string | null;
  readonly order?: true;
}

export type BookPageSize = 1 | 2;

export type BookPhase =
  | 'closed'
  | 'preparing'
  | 'opening'
  | 'browsing'
  | 'turning'
  | 'closing'
  | 'focusing'
  | 'revealing'
  | 'focused'
  | 'ordering'
  | 'retracting'
  | 'returning';

/** The only navigation state; animation handles never own page or product selection. */
export interface BookNavigationState {
  readonly phase: BookPhase;
  readonly pageIndex: number;
  readonly selectedSlug: string | null;
}

export function normalizeBookIndex(index: number, total: number, pageSize: BookPageSize): number {
  if (!Number.isSafeInteger(total) || total <= 0) return 0;
  const integer = Number.isFinite(index) ? Math.trunc(index) : 0;
  const clamped = Math.max(0, Math.min(integer, total - 1));
  return Math.floor(clamped / pageSize) * pageSize;
}

export function visibleBookIndices(
  index: number,
  total: number,
  pageSize: BookPageSize,
): readonly number[] {
  const first = normalizeBookIndex(index, total, pageSize);
  return Array.from(
    { length: Math.min(pageSize, Math.max(0, total - first)) },
    (_, offset) => first + offset,
  );
}

export function bookHash(index: number, slug: string | null = null, order = false): string {
  const page = Math.max(0, Math.trunc(Number.isFinite(index) ? index : 0)) + 1;
  if (slug !== null && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new TypeError('Invalid perfume slug.');
  return `#libro/${page}${slug ? `/perfume/${slug}${order ? '/pedido' : ''}` : ''}`;
}

export function parseBookHash(
  hash: string,
  total: number,
  pageSize: BookPageSize,
): BookLocation | null {
  const match = /^#libro\/([1-9]\d*)(?:\/perfume\/([a-z0-9]+(?:-[a-z0-9]+)*)(\/pedido)?)?$/.exec(
    hash,
  );
  if (!match || total <= 0) return null;
  const page = Number(match[1]);
  if (!Number.isSafeInteger(page)) return null;
  return {
    index: normalizeBookIndex(page - 1, total, pageSize),
    slug: match[2] ?? null,
    ...(match[3] ? { order: true as const } : {}),
  };
}
