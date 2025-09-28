import type { NormalizedTrade } from "./normalize";

export interface BasicReportRange {
  start?: string; // ISO
  end?: string;   // ISO
  inclusive: boolean; // true
}

export interface BasicPairStats {
  buy: number;
  sell: number;
  total: number;
  volume: number; // sum of vol
  fees: number;   // sum of fee
  firstTime?: string; // ISO
  lastTime?: string;  // ISO
}

export interface BasicReport {
  range: BasicReportRange;
  totals: {
    trades: number;
    volume: number;
    fees: number;
    firstTime?: string;
    lastTime?: string;
  };
  byPair: Record<string, BasicPairStats>;
  errors?: string[];
}

export function buildBasicReport(
  trades: NormalizedTrade[],
  opts: { start?: Date; end?: Date; errors?: string[] }
): BasicReport {
  let filtered = trades;
  const { start, end } = opts;

  if (start) {
    const s = start.getTime();
    filtered = filtered.filter((t) => t.timestampMs >= s);
  }
  if (end) {
    const e = end.getTime();
    filtered = filtered.filter((t) => t.timestampMs <= e);
  }

  const byPair: Record<string, BasicPairStats> = {};
  let totalVolume = 0;
  let totalFees = 0;
  let firstTs: number | undefined;
  let lastTs: number | undefined;

  for (const t of filtered) {
    totalVolume += t.vol;
    totalFees += t.fee;
    firstTs = firstTs === undefined ? t.timestampMs : Math.min(firstTs, t.timestampMs);
    lastTs = lastTs === undefined ? t.timestampMs : Math.max(lastTs, t.timestampMs);

    const p = (byPair[t.pair] ||= { buy: 0, sell: 0, total: 0, volume: 0, fees: 0 });
    p[t.side] += 1;
    p.total += 1;
    p.volume += t.vol;
    p.fees += t.fee;
    const pf = p.firstTime ? Date.parse(p.firstTime) : undefined;
    const pl = p.lastTime ? Date.parse(p.lastTime) : undefined;
    if (pf === undefined || t.timestampMs < pf) p.firstTime = new Date(t.timestampMs).toISOString();
    if (pl === undefined || t.timestampMs > pl) p.lastTime = new Date(t.timestampMs).toISOString();
  }

  const report: BasicReport = {
    range: { start: start?.toISOString(), end: end?.toISOString(), inclusive: true },
    totals: {
      trades: filtered.length,
      volume: totalVolume,
      fees: totalFees,
      firstTime: firstTs !== undefined ? new Date(firstTs).toISOString() : undefined,
      lastTime: lastTs !== undefined ? new Date(lastTs).toISOString() : undefined,
    },
    byPair,
  };

  if (opts.errors && opts.errors.length) {
    report.errors = opts.errors;
  }

  return report;
}

