import { promises as fs } from "fs";
import { resolve } from "path";

/**
 * Helper to read a CSV file from disk.
 */
export class TradesCsvFileReader {
  /**
   * Reads a file as UTF-8 and returns its content as a string.
   */
  static async readCsv(filePath: string): Promise<string> {
    const abs = resolve(filePath);
    return fs.readFile(abs, "utf8");
  }
}

