export const FULL_DISK_ID_PATTERN = /^R\d{2}F\d{1,2}D\d{2}$/;
export const DISK_ID_SHELF_PREFIX_PATTERN = /^R\d{2}F\d{1,2}$/;

export const PHYSICAL_MEDIA_TYPE_NAMES = new Set([
  "DVD",
  "4K",
  "4K + 3D",
  "CD-RW",
  "DVD-R",
  "DVD-RW",
  "DVD_R",
  "DVD+RW",
  "DVD-DL",
  "DVD+DL",
  "LaserDisc",
  "Blu-ray 3D",
  "Blu-ray",
  "CD",
]);

export function normalizeDiskId(value: string | null | undefined): string | null {
  const normalized = value?.trim().toUpperCase();
  return normalized ? normalized : null;
}

export function isValidDiskId(value: string | null | undefined): boolean {
  const normalized = normalizeDiskId(value);
  return normalized ? FULL_DISK_ID_PATTERN.test(normalized) : false;
}

export function isValidDiskIdShelfPrefix(value: string | null | undefined): boolean {
  const normalized = normalizeDiskId(value);
  return normalized ? DISK_ID_SHELF_PREFIX_PATTERN.test(normalized) : false;
}

export function getDiskIdShelfPrefix(value: string | null | undefined): string | null {
  const normalized = normalizeDiskId(value);
  if (!normalized) return null;
  if (DISK_ID_SHELF_PREFIX_PATTERN.test(normalized)) return normalized;
  if (FULL_DISK_ID_PATTERN.test(normalized)) return normalized.replace(/D\d{2}$/, "");
  return null;
}

export function isPhysicalMediaTypeName(value: string | null | undefined): boolean {
  return value ? PHYSICAL_MEDIA_TYPE_NAMES.has(value) : false;
}
