import type { TradesCsvImportModel } from './types/trades-csv-import-model';

/**
 * Lightweight CSV importer for Kraken trades export.
 * - Accepts a CSV string with a header row whose columns match TradesCsvImportModel keys.
 * - Handles commas, quoted fields, escaped quotes ("").
 * - Ignores empty lines and trims BOM.
 */
export class TradesCsvImporter {
  /** Parse a CSV string into a list of entries typed as TradesCsvImportModel */
  static parse(csv: string): TradesCsvImportModel[] {
    if (!csv) return [];

    const rows = parseCsv(csv);
    if (rows.length === 0) return [];

    // Find first non-empty header row
    const headerRow = rows.find((r) => r.length > 0 && r.some((c) => c.trim() !== ''));
    if (!headerRow) return [];

    const header = headerRow.map((h) => h.trim());

    // Determine the index of the header row, and slice subsequent data rows
    const headerIndex = rows.indexOf(headerRow);
    const dataRows = rows.slice(headerIndex + 1).filter((r) => r.length && r.some((c) => c !== ''));

    const list: TradesCsvImportModel[] = [];
    for (const row of dataRows) {
      const obj: any = {};
      for (let i = 0; i < header.length; i++) {
        const key = header[i];
        if (!key) continue;
        obj[key] = row[i] ?? '';
      }
      list.push(obj as TradesCsvImportModel);
    }
    return list;
  }
}

/**
 * Minimal RFC 4180 CSV parser for simple datasets.
 * Returns an array of rows, each row an array of string cells.
 */
function parseCsv(input: string): string[][] {
  // Normalize newlines and strip BOM
  let s = input.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows: string[][] = [];
  let i = 0;
  const len = s.length;
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    // Trim trailing empty cells if the entire row is empty
    rows.push(row);
    row = [];
  };

  while (i < len) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') {
        // Escaped quote ""
        if (i + 1 < len && s[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        pushField();
        i++;
      } else if (ch === '\n') {
        pushField();
        pushRow();
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }
  // Flush last field/row
  pushField();
  pushRow();

  return rows;
}

