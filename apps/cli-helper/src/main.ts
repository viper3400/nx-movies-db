import { Command } from "commander";
import { TradesCsvFileReader } from "@nx-movies-db/stocks-backend";
import { TradesCsvImporter } from "@nx-movies-db/stocks-lib";
function run(argv: string[]): void {
  const program = new Command();

  program
    .name("cli-helper")
    .description("Utility helpers for the Nx Movies workspace")
    .argument("[message...]", "Message for the helper to print")
    .option("-u, --uppercase", "Print the message in uppercase")
    .option("-p, --process", "Process CSV file")
    .action(async (messageParts: string[], options: { uppercase?: boolean, process?: boolean }) => {
      const message = messageParts.length > 0
        ? messageParts.join(" ")
        : "Nx Movies CLI helper ready to assist! Pass a message to share something.";

      const output = options.uppercase ? message.toUpperCase() : message;
      console.log(output);

      if (options.process) {
        const fileContent = await TradesCsvFileReader.readCsv(message);
        const csvContent = TradesCsvImporter.parse(fileContent)
        console.log(csvContent.length);
      }

    });

  program.enablePositionalOptions();
  program.parse(argv);
}

run(process.argv);
