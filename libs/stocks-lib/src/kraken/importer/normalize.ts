import type { TradesCsvImportModel } from "./types/trades-csv-import-model";

function toNumber(value: string | number | undefined | null): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const s = String(value).trim();
  if (!s) return null;
  const n = parseFloat(s.replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export type Side = "buy" | "sell";

export interface NormalizedTrade {
  txid: string;
  pair: string;
  side: Side;
  time: Date; // UTC
  timestampMs: number;
  price: number | null; // unit price; may be null if not provided
  cost: number; // in quote currency
  fee: number; // in quote currency, non-negative
  vol: number; // in base currency, non-negative
}

export interface NormalizeResult {
  trades: NormalizedTrade[];
  errors: string[];
}

/**
 * Parse -> validate -> normalize -> sort by time (UTC).
 * - Validates required columns: time, pair, type, cost, fee, vol
 * - Parses numerics; enforces non-negative fee and vol
 */
export function normalizeTrades(rows: TradesCsvImportModel[]): NormalizeResult {
  const errors: string[] = [];
  const trades: NormalizedTrade[] = [];

  const required = ["time", "pair", "type", "cost", "fee", "vol"] as const;

  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    if (!r) {
      errors.push(`Row ${idx}: empty row`);
      continue;
    }

    // Required fields present
    for (const key of required) {
      if (!(key in r) || String((r as any)[key]).trim() === "") {
        errors.push(`Row ${idx}: missing required field '${key}'`);
      }
    }

    const time = new Date(r.time);
    if (isNaN(time.getTime())) {
      errors.push(`Row ${idx}: invalid time '${r.time}'`);
      continue;
    }

    const pair = (r.pair || "").trim();
    if (!pair) {
      errors.push(`Row ${idx}: empty pair`);
      continue;
    }

    const sideStr = (r.type || "").toLowerCase().trim();
    if (sideStr !== "buy" && sideStr !== "sell") {
      errors.push(`Row ${idx}: invalid type '${r.type}'`);
      continue;
    }
    const side = sideStr as Side;

    const fee = toNumber(r.fee);
    const vol = toNumber(r.vol);
    const cost = toNumber(r.cost);
    const price = toNumber(r.price);

    if (fee === null || fee < 0) {
      errors.push(`Row ${idx}: invalid fee '${r.fee}'`);
      continue;
    }
    if (vol === null || vol < 0) {
      errors.push(`Row ${idx}: invalid vol '${r.vol}'`);
      continue;
    }
    if (cost === null || cost < 0) {
      errors.push(`Row ${idx}: invalid cost '${r.cost}'`);
      continue;
    }

    trades.push({
      txid: r.txid,
      pair,
      side,
      time: new Date(time.toISOString()), // ensure UTC-normalized
      timestampMs: time.getTime(),
      price: price === null ? null : price,
      cost,
      fee,
      vol,
    });
  }

  trades.sort((a, b) => a.timestampMs - b.timestampMs);
  return { trades, errors };
}

