import { Command } from "commander";
import { TradesCsvFileReader } from "@nx-movies-db/stocks-backend";
import {
  TradesCsvImporter,
  normalizeTrades,
  buildBasicReport,
} from "@nx-movies-db/stocks-lib";

function run(argv: string[]): void {
  const program = new Command();

  program.name("cli-helper").description("Utility helpers for the Nx Movies workspace");

  program
    .command("eval")
    .description("Wire-up & sanity stats for Kraken trades CSV")
    .argument("<filepath>", "Path to Kraken trades CSV file")
    .option("--start <YYYY-MM-DD>", "Start date (UTC inclusive)")
    .option("--end <YYYY-MM-DD>", "End date (UTC inclusive)")
    .option("--report <name>", "Report type", "basic")
    .action(async (filepath: string, options: { start?: string; end?: string; report?: string }) => {
      const fileContent = await TradesCsvFileReader.readCsv(filepath);
      const parsed = TradesCsvImporter.parse(fileContent);
      const norm = normalizeTrades(parsed);

      const start = options.start ? new Date(options.start + "T00:00:00.000Z") : undefined;
      const end = options.end ? new Date(options.end + "T23:59:59.999Z") : undefined;

      if (options.report === "basic") {
        const report = buildBasicReport(norm.trades, { start, end, errors: norm.errors });
        console.log(report);
      } else {
        console.error(`Unknown report: ${options.report}`);
        process.exitCode = 2;
      }
    });

  program.enablePositionalOptions();
  program.parse(argv);
}

run(process.argv);
