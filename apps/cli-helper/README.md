# CLI Helper (Nx Movies DB)

Small Node.js CLI for working with Kraken trades CSV files in this workspace.

- Reads a CSV file, normalizes and validates fields, then generates sanity reports.
- Built with Commander and bundled by Nx/esbuild.

## Disclaimer

This is a private project utility. The CLI lives inside the Nx monorepo purely for my convenience as a developer so I don’t have to maintain too many separate projects with the limited time I have. It currently has no connection to the main purpose of this repository (the movie database).

## Current Command: eval

Evaluate a Kraken trades CSV and print a sanity report. Supports an optional time window and an echo of what was included/excluded.

Usage:

```bash
cli-helper eval <filepath> [--start YYYY-MM-DD] [--end YYYY-MM-DD] [--report basic] [--echo-window]
```

Flags:

- `--start YYYY-MM-DD`  Start date (UTC, inclusive). Applied during normalization/reporting.
- `--end YYYY-MM-DD`    End date (UTC). In the basic report, the end is inclusive for day ranges; for echo, the end is treated as exclusive [start, end) when `--echo-window` is used.
- `--report basic`      The default report. Prints counts by pair/side, first/last timestamps, total volume, total fees, plus any validation errors.
- `--echo-window`       Additionally prints a window echo report that shows what trades fall inside vs outside the half-open interval [start, end) per pair. Includes a compact tab-separated summary.

Notes on time handling:

- The basic report filters inclusively by start and end.
- The echo report uses a half-open window [start, end). If `--end` is date-only, echo treats it as next day 00:00Z for the exclusive bound.

## Run via Nx (dev)

Nx’s node executor expects runtime args via `--args` (one per value). Examples:

```bash
# Build + run: basic report for 2024
npx nx run cli-helper:serve \
  --args="eval" \
  --args="path/to/trades.csv" \
  --args="--start" --args="2024-01-01" \
  --args="--end" --args="2024-12-31" \
  --args="--report" --args="basic"

# Same with echo of half-open window [start, end)
npx nx run cli-helper:serve \
  --args="eval" \
  --args="path/to/trades.csv" \
  --args="--start" --args="2024-01-01" \
  --args="--end" --args="2024-12-31" \
  --args="--report" --args="basic" \
  --args="--echo-window"
```

Notes:
- Use `--args` repeatedly to pass each argument.
- If your path contains spaces, quote the value inside `--args`.

## Build and run directly

First build the app:

```bash
npx nx build cli-helper
```

Then run the built file with Node:

```bash
node dist/apps/cli-helper/main.js eval path/to/trades.csv --start 2024-01-01 --end 2024-12-31 --report basic --echo-window
```

## Output

The CLI prints pretty-JSON for the requested report(s):

- Basic report JSON includes:
  - `range`: start/end ISO strings and inclusivity
  - `totals`: trades, volume, fees, firstTime, lastTime
  - `byPair`: per-pair stats `{ buy, sell, total, volume, fees, firstTime, lastTime }`
  - `errors`: validation errors, if any

- Echo report JSON (when `--echo-window` is used) includes:
  - `range`: start/end ISO strings with leftInclusive/rightExclusive
  - `byPair`: per-pair `included` and `excluded` (with `left`, `right`, `total`)
  - `totals`: overall included/excluded aggregates
  - A compact tab-separated summary is also printed for quick scanning in terminals/spreadsheets.

## Validation & Normalization

Internally, the CSV is parsed into a model and normalized with:

- Required fields: `time`, `pair`, `type`, `cost`, `fee`, `vol`
- Type must be `buy` or `sell`
- Numeric parse for `cost`, `fee`, `vol`, `price`; non-negative `fee` and `vol`
- Normalized timestamps (UTC) and sort by time

## Troubleshooting

- Ensure you rebuilt after code changes: `npx nx build cli-helper`.
- Check help output if flags change: `node dist/apps/cli-helper/main.js --help`.
