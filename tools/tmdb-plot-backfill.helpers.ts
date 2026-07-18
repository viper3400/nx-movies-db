export type BackfillCandidate = {
  id: number;
  title: string | null;
  year: number;
  istv: number;
  imdbID: string | null;
};

export type TmdbMediaKind = "movie" | "tv";

export type TmdbSearchResult = {
  id: number;
  title?: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  release_date?: string;
  first_air_date?: string;
};

export type TmdbCastMember = {
  id?: number;
  name?: string;
  character?: string;
  order?: number;
};

export type BackfillOptions = {
  apply: boolean;
  all: boolean;
  limit: number;
  delayMs: number;
  reportPath?: string;
};

const DEFAULT_LIMIT = 25;
const DEFAULT_DELAY_MS = 300;

export function normalizeTitle(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim();
}

function resultTitles(result: TmdbSearchResult): string[] {
  return [result.title, result.original_title, result.name, result.original_name]
    .filter((title): title is string => Boolean(title?.trim()));
}

function resultYear(result: TmdbSearchResult): number | null {
  const date = result.release_date ?? result.first_air_date;
  if (!date) return null;
  const year = Number(date.slice(0, 4));
  return Number.isInteger(year) && year > 0 ? year : null;
}

export function mediaKindForCandidate(candidate: Pick<BackfillCandidate, "istv">): TmdbMediaKind {
  return candidate.istv === 0 ? "movie" : "tv";
}

export type MatchResult =
  | { matched: true; result: TmdbSearchResult }
  | { matched: false; reason: "missing-title" | "unknown-year" | "no-exact-match" | "ambiguous-match" };

export function findExactTmdbMatch(candidate: BackfillCandidate, results: TmdbSearchResult[]): MatchResult {
  if (!candidate.title?.trim()) return { matched: false, reason: "missing-title" };
  if (!Number.isInteger(candidate.year) || candidate.year <= 0) {
    return { matched: false, reason: "unknown-year" };
  }

  const title = normalizeTitle(candidate.title);
  const matches = new Map<number, TmdbSearchResult>();
  for (const result of results) {
    if (
      resultYear(result) === candidate.year &&
      resultTitles(result).some((resultTitle) => normalizeTitle(resultTitle) === title)
    ) {
      matches.set(result.id, result);
    }
  }

  if (matches.size === 0) return { matched: false, reason: "no-exact-match" };
  if (matches.size > 1) return { matched: false, reason: "ambiguous-match" };
  return { matched: true, result: [...matches.values()][0] };
}

export function formatTmdbActors(cast: TmdbCastMember[]): string {
  return [...cast]
    .filter((member): member is Required<Pick<TmdbCastMember, "id" | "name">> & TmdbCastMember =>
      Number.isInteger(member.id) && Boolean(member.name?.trim())
    )
    .sort((left, right) => (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER))
    .slice(0, 15)
    .map((member) => `${member.name}::${member.character ?? ""}::tmdb:${member.id}`)
    .join("\n");
}

function positiveInteger(value: string, flag: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${flag} must be a positive integer.`);
  }
  return parsed;
}

export function parseBackfillOptions(argv: string[]): BackfillOptions {
  let apply = false;
  let all = false;
  let limit = DEFAULT_LIMIT;
  let delayMs = DEFAULT_DELAY_MS;
  let reportPath: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
    case "--apply":
      apply = true;
      break;
    case "--dry-run":
      apply = false;
      break;
    case "--all":
      all = true;
      break;
    case "--limit":
      limit = positiveInteger(argv[++index] ?? "", "--limit");
      break;
    case "--delay-ms":
      delayMs = positiveInteger(argv[++index] ?? "", "--delay-ms");
      break;
    case "--report":
      reportPath = argv[++index];
      if (!reportPath) throw new Error("--report requires a file path.");
      break;
    case "--help":
      throw new Error("HELP_REQUESTED");
    default:
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (all && argv.includes("--limit")) {
    throw new Error("--all and --limit cannot be used together.");
  }

  return { apply, all, limit, delayMs, reportPath };
}
