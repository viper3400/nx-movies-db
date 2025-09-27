import { Command } from "commander";
import { TradesCsvFileReader } from "@nx-movies-db/stocks-backend";
import { TradesCsvImporter } from "@nx-movies-db/stocks-lib";

function run(argv: string[]): void {
  const program = new Command();

  program
    .name("cli-helper")
    .description("Utility helpers for the Nx Movies workspace")
    .argument("<filepath>", "Path to Kraken trades CSV file")
    .option("-p, --pair <pair>", "Filter by trading pair (e.g. ETH/EUR)")
    .action(async (filepath: string, options: { pair?: string }) => {
      const fileContent = await TradesCsvFileReader.readCsv(filepath);
      const csvContent = TradesCsvImporter.parse(fileContent);

      if (options.pair) {
        const match = csvContent.filter((c: any) => c.pair === options.pair);
        console.log(match.length ?? `No entries found for pair ${options.pair}`);
      } else {
        console.log(csvContent);
      }
    });

  program.enablePositionalOptions();
  program.parse(argv);
}

run(process.argv);
