/**
 * One-time TMDB backfill for non-TV videos with an empty plot.
 *
 * Examples:
 *   npm run backfill:tmdb -- --dry-run --limit 25
 *   npm run backfill:tmdb -- --apply --limit 25
 *   npm run backfill:tmdb -- --apply --all --delay-ms 500
 */
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as dotenv from "dotenv";
import * as mariadb from "mariadb";
import {
  type BackfillCandidate,
  type BackfillOptions,
  type TmdbCastMember,
  type TmdbMediaKind,
  type TmdbSearchResult,
  findExactTmdbMatch,
  formatTmdbActors,
  mediaKindForCandidate,
  parseBackfillOptions,
} from "./tmdb-plot-backfill.helpers";

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const MAX_RETRIES = 3;

const envLoadResult = dotenv.config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env.local" });
if (envLoadResult.error && process.env.DOTENV_CONFIG_PATH === undefined) {
  dotenv.config();
}

type TmdbDetails = { overview?: string };
type TmdbCredits = { cast?: TmdbCastMember[] };
type ReportStatus =
  | "would-update"
  | "updated"
  | "skipped"
  | "failed";

type ReportRow = {
  videoId: number;
  title: string | null;
  year: number;
  mediaKind: TmdbMediaKind;
  status: ReportStatus;
  tmdbId?: number;
  reason?: string;
};

type FetchLike = typeof fetch;
type Sleep = (milliseconds: number) => Promise<void>;

const sleep: Sleep = (milliseconds) => new Promise((resolveSleep) => setTimeout(resolveSleep, milliseconds));

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be configured.`);
  return value;
}

function parseRetryAfter(value: string | null): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : null;
}

export class RateLimitedTmdbClient {
  private lastRequestStartedAt = 0;

  constructor(
    private readonly token: string,
    private readonly language: string,
    private readonly delayMs: number,
    private readonly fetchFn: FetchLike = fetch,
    private readonly sleepFn: Sleep = sleep
  ) {}

  private async request<T>(path: string, params: Record<string, string | number>): Promise<T> {
    const wait = this.delayMs - (Date.now() - this.lastRequestStartedAt);
    if (wait > 0) await this.sleepFn(wait);

    const url = new URL(`${TMDB_API_BASE_URL}${path}`);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      this.lastRequestStartedAt = Date.now();
      try {
        const response = await this.fetchFn(url, {
          headers: { Authorization: `Bearer ${this.token}`, Accept: "application/json" },
        });
        if (response.ok) return await response.json() as T;

        const retryable = response.status === 429 || response.status >= 500;
        if (!retryable || attempt === MAX_RETRIES) {
          throw new Error(`TMDB request failed with status ${response.status}.`);
        }
        const retryAfter = response.status === 429 ? parseRetryAfter(response.headers.get("retry-after")) : null;
        await this.sleepFn(retryAfter ?? this.delayMs * 2 ** (attempt + 1));
      } catch (error) {
        if (attempt === MAX_RETRIES || (error instanceof Error && error.message.startsWith("TMDB request failed"))) {
          throw error;
        }
        await this.sleepFn(this.delayMs * 2 ** (attempt + 1));
      }
    }

    throw new Error("TMDB retry loop ended unexpectedly.");
  }

  search(candidate: BackfillCandidate): Promise<{ results?: TmdbSearchResult[] }> {
    const kind = mediaKindForCandidate(candidate);
    return this.request(`/search/${kind}`, {
      query: candidate.title ?? "",
      language: this.language,
      include_adult: "false",
      ...(kind === "movie" ? { year: candidate.year } : { first_air_date_year: candidate.year }),
    });
  }

  details(kind: TmdbMediaKind, tmdbId: number): Promise<TmdbDetails> {
    return this.request(`/${kind}/${tmdbId}`, { language: this.language });
  }

  credits(kind: TmdbMediaKind, tmdbId: number): Promise<TmdbCredits> {
    return this.request(`/${kind}/${tmdbId}/credits`, { language: this.language });
  }
}

function defaultReportPath(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return resolve(process.cwd(), "tmp", `tmdb-plot-backfill-${timestamp}.jsonl`);
}

function writeReport(reportPath: string, row: ReportRow): void {
  appendFileSync(reportPath, `${JSON.stringify(row)}\n`);
}

function printHelp(): void {
  console.log(`Usage: npm run backfill:tmdb -- [options]

Defaults to a dry run of the next 25 non-TV, empty-plot records, in ascending video ID order.

Options:
  --apply              Persist accepted TMDB matches (otherwise dry run)
  --dry-run            Do not update the database (default)
  --limit <X>          Process the next X candidates (default: 25)
  --all                Process every candidate; cannot be used with --limit
  --delay-ms <X>       Minimum delay between TMDB requests (default: 300)
  --report <path>      JSONL report path (default: tmp/tmdb-plot-backfill-<timestamp>.jsonl)
  --help               Show this help
`);
}

export function buildCandidateSelectionSql(all: boolean): string {
  return `SELECT id, title, year, istv, imdbID
    FROM videodb_videodata
    WHERE istv = 0 AND (plot IS NULL OR TRIM(plot) = '')
    ORDER BY id ASC${all ? "" : " LIMIT ?"}`;
}

async function loadCandidates(connection: mariadb.Connection, options: BackfillOptions): Promise<BackfillCandidate[]> {
  const sql = buildCandidateSelectionSql(options.all);
  return connection.query<BackfillCandidate[]>(sql, options.all ? [] : [options.limit]);
}

async function updateCandidate(
  connection: mariadb.Connection,
  candidate: BackfillCandidate,
  plot: string,
  actors: string,
  tmdbReference: string
): Promise<boolean> {
  const result = await connection.query<{ affectedRows: number }>(
    `UPDATE videodb_videodata
     SET plot = ?, actors = ?, imdbID = ?, lastupdate = NOW()
     WHERE id = ? AND (plot IS NULL OR TRIM(plot) = '')`,
    [plot, actors, tmdbReference, candidate.id]
  );
  return result.affectedRows === 1;
}

export async function runBackfill(options: BackfillOptions): Promise<void> {
  const reportPath = resolve(process.cwd(), options.reportPath ?? defaultReportPath());
  mkdirSync(dirname(reportPath), { recursive: true });
  const connection = await mariadb.createConnection({
    host: getRequiredEnv("DATABASE_HOST"),
    port: Number(process.env.DATABASE_PORT ?? "3306"),
    user: getRequiredEnv("DATABASE_USER"),
    password: getRequiredEnv("DATABASE_PASSWORD"),
    database: getRequiredEnv("DATABASE_NAME"),
  });
  const client = new RateLimitedTmdbClient(
    getRequiredEnv("TMDB_READ_ACCESS_TOKEN"),
    process.env.TMDB_LANGUAGE ?? "en-US",
    options.delayMs
  );

  let updated = 0;
  let skipped = 0;
  let failed = 0;
  try {
    const candidates = await loadCandidates(connection, options);
    console.log(`${options.apply ? "Applying" : "Dry run:"} processing ${candidates.length} candidate(s). Report: ${reportPath}`);

    for (const candidate of candidates) {
      const mediaKind = mediaKindForCandidate(candidate);
      const report = (row: Omit<ReportRow, "videoId" | "title" | "year" | "mediaKind">) =>
        writeReport(reportPath, { videoId: candidate.id, title: candidate.title, year: candidate.year, mediaKind, ...row });

      if (!candidate.title?.trim()) {
        skipped += 1;
        report({ status: "skipped", reason: "missing-title" });
        continue;
      }
      if (candidate.year <= 0) {
        skipped += 1;
        report({ status: "skipped", reason: "unknown-year" });
        continue;
      }

      try {
        const search = await client.search(candidate);
        const match = findExactTmdbMatch(candidate, search.results ?? []);
        if (!match.matched) {
          skipped += 1;
          report({ status: "skipped", reason: match.reason });
          continue;
        }

        // Keep every TMDB request serialized, including detail and credit lookups.
        const details = await client.details(mediaKind, match.result.id);
        const credits = await client.credits(mediaKind, match.result.id);
        const plot = details.overview?.trim();
        if (!plot) {
          skipped += 1;
          report({ status: "skipped", tmdbId: match.result.id, reason: "empty-tmdb-overview" });
          continue;
        }

        const tmdbReference = `tmdb:${mediaKind}:${match.result.id}`;
        if (options.apply) {
          const changed = await updateCandidate(connection, candidate, plot, formatTmdbActors(credits.cast ?? []), tmdbReference);
          if (!changed) {
            skipped += 1;
            report({ status: "skipped", tmdbId: match.result.id, reason: "plot-already-updated" });
            continue;
          }
          updated += 1;
          report({ status: "updated", tmdbId: match.result.id });
        } else {
          updated += 1;
          report({ status: "would-update", tmdbId: match.result.id });
        }
      } catch (error) {
        failed += 1;
        report({ status: "failed", reason: error instanceof Error ? error.message : String(error) });
      }
    }
  } finally {
    await connection.end();
  }

  console.log(`Finished. ${options.apply ? "Updated" : "Would update"}: ${updated}; skipped: ${skipped}; failed: ${failed}.`);
}

async function main(): Promise<void> {
  try {
    await runBackfill(parseBackfillOptions(process.argv.slice(2)));
  } catch (error) {
    if (error instanceof Error && error.message === "HELP_REQUESTED") {
      printHelp();
      return;
    }
    console.error(error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  void main();
}
