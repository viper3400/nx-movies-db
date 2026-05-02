import {
  FULL_DISK_ID_PATTERN,
  getDiskIdShelfPrefix,
  normalizeDiskId,
} from "@nx-movies-db/shared-types";
import { prisma } from "../prismaclient";

export async function getNextDiskIdSuggestion(
  prefix: string,
  currentVideoId?: number | null
): Promise<string | null> {
  const shelfPrefix = getDiskIdShelfPrefix(prefix);
  if (!shelfPrefix) return null;

  const diskIds = await prisma.videodb_videodata.findMany({
    where: {
      diskid: {
        startsWith: `${shelfPrefix}D`,
      },
      ...(currentVideoId ? { id: { not: currentVideoId } } : {}),
    },
    select: {
      diskid: true,
    },
  });

  return calculateNextDiskIdSuggestion(shelfPrefix, diskIds.map(({ diskid }) => diskid));
}

export function calculateNextDiskIdSuggestion(
  shelfPrefix: string,
  diskIds: Array<string | null | undefined>
): string | null {
  const normalizedShelfPrefix = getDiskIdShelfPrefix(shelfPrefix);
  if (!normalizedShelfPrefix) return null;

  const usedDiskNumbers = new Set<number>();
  for (const diskid of diskIds) {
    const normalized = normalizeDiskId(diskid);
    if (!normalized || !FULL_DISK_ID_PATTERN.test(normalized)) continue;
    if (!normalized.startsWith(`${normalizedShelfPrefix}D`)) continue;
    usedDiskNumbers.add(Number(normalized.slice(-2)));
  }

  let next = 1;
  while (usedDiskNumbers.has(next)) {
    next += 1;
  }

  return `${normalizedShelfPrefix}D${String(next).padStart(2, "0")}`;
}
