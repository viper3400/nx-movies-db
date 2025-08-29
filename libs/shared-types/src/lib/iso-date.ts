// libs/shared-types/src/lib/iso-date.ts
declare const ISO_DATE_BRAND: unique symbol;
export type IsoDate = string & { readonly [ISO_DATE_BRAND]: "IsoDate" };

const ISO_DATE_REGEX =
  /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function makeIsoDate(s: string): IsoDate {
  const m = ISO_DATE_REGEX.exec(s);
  if (!m) throw new Error(`Invalid ISO date: ${s}`);
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const lastDay = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  if (d > lastDay) throw new Error(`Invalid calendar date: ${s}`);
  return s as IsoDate;
}

export function isIsoDate(s: string): s is IsoDate {
  try { makeIsoDate(s); return true; } catch { return false; }
}
