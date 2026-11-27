import path from "node:path";

export type MovieRecord = { id: number; title: string | null; filename: string | null };
export type ShareFile = { path: string; relativePath: string };
export type InventoryRow = {
  status: "matched" | "database-entry-not-found" | "file-not-in-database" | "ambiguous";
  movieId?: number;
  title?: string | null;
  databasePath?: string | null;
  sharePath?: string;
  candidates?: string[];
};

function key(value: string): string {
  return value.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/\/$/, "").toLocaleLowerCase("en-US");
}

export function normalizeDatabasePath(filename: string, legacyPrefix: string, shareRoot: string): string | null {
  let value = filename.trim();
  if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) value = value.slice(1, -1).trim();
  if (!value) return null;

  const normalizedValue = key(value);
  const normalizedPrefix = key(legacyPrefix);
  if (normalizedValue === normalizedPrefix || normalizedValue.startsWith(`${normalizedPrefix}/`)) {
    const relative = value.replace(/\\/g, "/").slice(legacyPrefix.replace(/\\/g, "/").length).replace(/^\/+/, "");
    return path.resolve(shareRoot, ...relative.split("/"));
  }
  if (/^[a-z]:[\\/]/i.test(value) || value.startsWith("\\\\")) return null;
  return path.resolve(shareRoot, ...value.replace(/\\/g, "/").split("/"));
}

export function createInventoryReport(
  movies: MovieRecord[],
  files: ShareFile[],
  legacyPrefix: string,
  shareRoot: string,
  scanErrors: string[] = []
): { summary: Record<string, number>; items: InventoryRow[]; scanErrors: string[] } {
  const filesByPath = new Map<string, ShareFile[]>();
  for (const file of files) {
    const fileKey = key(file.path);
    filesByPath.set(fileKey, [...(filesByPath.get(fileKey) ?? []), file]);
  }

  const items: InventoryRow[] = [];
  const matchedPaths = new Set<string>();
  for (const movie of movies) {
    const resolved = movie.filename ? normalizeDatabasePath(movie.filename, legacyPrefix, shareRoot) : null;
    const candidates = resolved ? filesByPath.get(key(resolved)) ?? [] : [];
    if (candidates.length === 1) {
      matchedPaths.add(key(candidates[0].path));
      items.push({ status: "matched", movieId: movie.id, title: movie.title, databasePath: movie.filename, sharePath: candidates[0].path });
    } else if (candidates.length > 1) {
      items.push({ status: "ambiguous", movieId: movie.id, title: movie.title, databasePath: movie.filename, candidates: candidates.map((file) => file.path) });
    } else {
      items.push({ status: "database-entry-not-found", movieId: movie.id, title: movie.title, databasePath: movie.filename });
    }
  }
  for (const file of files) {
    if (!matchedPaths.has(key(file.path))) items.push({ status: "file-not-in-database", sharePath: file.path });
  }
  const summary: Record<string, number> = { matched: 0, "database-entry-not-found": 0, "file-not-in-database": 0, ambiguous: 0 };
  for (const item of items) summary[item.status] += 1;
  return { summary, items, scanErrors };
}
