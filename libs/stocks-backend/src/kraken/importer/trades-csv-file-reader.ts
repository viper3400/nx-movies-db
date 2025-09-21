import { promises as fs } from 'fs';
import { resolve } from 'path';
import { TradesCsvImporter, type TradesCsvImportModel } from '@nx-movies-db/stocks-lib';

/**
 * Helper to read a CSV file from disk and (optionally) parse it.
 */
export class TradesCsvFileReader {
  /**
   * Reads a file as UTF-8 and returns its content as a string.
   */
  static async readCsv(filePath: string): Promise<string> {
    const abs = resolve(filePath);
    return fs.readFile(abs, 'utf8');
  }

  /**
   * Reads and parses a Kraken trades CSV into typed entries.
   */
  static async readAndParse(filePath: string): Promise<TradesCsvImportModel[]> {
    const csv = await this.readCsv(filePath);
    return TradesCsvImporter.parse(csv);
  }
}

