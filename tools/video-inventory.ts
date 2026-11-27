import { appendFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import * as dotenv from "dotenv";
import { createInventoryReport, type MovieRecord, type ShareFile } from "./video-inventory.helpers";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env.local" });
if (process.env.DOTENV_CONFIG_PATH === undefined) dotenv.config();

const extensions = new Set([".mkv", ".mp4", ".avi", ".mov", ".m4v", ".wmv", ".mpeg", ".mpg", ".ts", ".webm"]);
const query = `query InventoryMovies($skip: Int, $take: Int) {
  videos(skip: $skip, take: $take, deleteMode: INCLUDE_DELETED, tvSeriesMode: INCLUDE_TVSERIES) {
    videos { id title filename mediaType }
    requestMeta { totalCount }
  }
}`;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be configured.`);
  return value;
}

function scan(root: string): { files: ShareFile[]; errors: string[] } {
  const files: ShareFile[] = [];
  const errors: string[] = [];
  function walk(directory: string): void {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      errors.push(`${directory}: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }
    for (const entry of entries) {
      const fullPath = join(directory, entry.name);
      try {
        if (entry.isDirectory()) walk(fullPath);
        else if (entry.isFile() && extensions.has(extname(entry.name).toLowerCase())) {
          files.push({ path: resolve(fullPath), relativePath: fullPath.slice(root.length).replace(/^[/\\]/, "") });
        }
      } catch (error) {
        errors.push(`${fullPath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  walk(root);
  return { files, errors };
}

async function loadMovies(endpoint: string): Promise<MovieRecord[]> {
  const movies: MovieRecord[] = [];
  let skip = 0;
  const pageSize = 500;
  while (true) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", ...(process.env.INVENTORY_API_TOKEN ? { authorization: `Bearer ${process.env.INVENTORY_API_TOKEN}` } : {}) },
      body: JSON.stringify({ query, variables: { skip, take: pageSize } }),
    });
    if (!response.ok) throw new Error(`GraphQL request failed: HTTP ${response.status}`);
    const body = await response.json() as { data?: { videos?: { videos: MovieRecord[]; requestMeta: { totalCount: number } } }; errors?: { message: string }[] };
    if (body.errors?.length) throw new Error(body.errors.map((error) => error.message).join("; "));
    const result = body.data?.videos;
    if (!result) throw new Error("GraphQL response did not contain videos.");
    movies.push(...result.videos);
    skip += result.videos.length;
    if (skip >= result.requestMeta.totalCount || result.videos.length === 0) break;
  }
  return movies;
}

async function main(): Promise<void> {
  if (process.argv.includes("--help")) {
    console.log(`Read-only share inventory scan (always dry-run).

Required environment:
  INVENTORY_SHARE_ROOT       Mounted share path, e.g. /mnt/filme
  INVENTORY_LEGACY_PREFIX    Legacy path prefix, e.g. V:\\Filme\\
  INVENTORY_GRAPHQL_URL      GraphQL endpoint, e.g. http://movies-service:7100/graphql

Optional:
  INVENTORY_API_TOKEN        Bearer token if required by the API
  INVENTORY_REPORT           JSON report path (default: tmp/video-inventory-<timestamp>.json)
`);
    return;
  }
  const root = resolve(required("INVENTORY_SHARE_ROOT"));
  const legacyPrefix = required("INVENTORY_LEGACY_PREFIX");
  const reportPath = resolve(process.env.INVENTORY_REPORT ?? `tmp/video-inventory-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  if (!statSync(root).isDirectory()) throw new Error(`Share root is not a directory: ${root}`);
  const [movies, scanned] = await Promise.all([loadMovies(required("INVENTORY_GRAPHQL_URL")), Promise.resolve(scan(root))]);
  const report = createInventoryReport(movies, scanned.files, legacyPrefix, root, scanned.errors);
  mkdirSync(dirname(reportPath), { recursive: true });
  appendFileSync(reportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), shareRoot: root, legacyPrefix, ...report }, null, 2)}\n`);
  console.log("Read-only inventory scan complete (no database writes).");
  console.log(report.summary);
  console.log(`Files scanned: ${scanned.files.length}; scan errors: ${scanned.errors.length}`);
  console.log(`Report: ${reportPath}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
