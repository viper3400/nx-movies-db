# Video share inventory

The inventory command scans a mounted video share and compares its video files with movie `filename` values read through the Movies GraphQL API. It is read-only: it never writes to the database.

## Configure and run

Make the share available inside the environment running the command (for example, mount SMB on the host/container), then configure:

```sh
INVENTORY_SHARE_ROOT=/mnt/filme
INVENTORY_LEGACY_PREFIX='V:\Filme\'
INVENTORY_GRAPHQL_URL=http://localhost:7100/graphql
```

The mapping above resolves legacy values such as `"V:\Filme\Das brandneue Testament\Das brandneue Testament.mkv"` under `/mnt/filme`. Matching strips only a matching pair of literal surrounding quotes; database values are not changed. Relative database paths are interpreted relative to the configured share root. Other absolute drive paths and UNC paths remain unresolved.

Run the dry-run scan:

```sh
npm run inventory:scan
```

Use `npm run inventory:scan -- --help` for the full environment-variable list. Set `INVENTORY_REPORT` to choose the JSON report path; otherwise the report is written under `tmp/`. The report classifies matched HDD movies, missing files for HDD records, movies whose media type does not require a share file, files absent from the database, ambiguous paths, and filesystem scan errors.

If the API requires bearer authentication, set `INVENTORY_API_TOKEN`. Keep tokens in environment configuration, not source control. The command supports common video extensions (`mkv`, `mp4`, `avi`, `mov`, `m4v`, `wmv`, `mpeg`, `mpg`, `ts`, `webm`).

For share files that remain unmatched after exact path matching, the report also suggests unresolved HDD movies whose titles match the file basename (without its video extension). Title comparison ignores case, diacritics, punctuation, and repeated whitespace. Suggestions are review-only; there is no automatic association or database update. If multiple unresolved HDD records share the same title, all are listed as candidates.
