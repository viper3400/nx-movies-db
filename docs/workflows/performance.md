# Database Performance Benchmark Workflow

This workflow compares database servers through the real request path:

```text
k6 workstation -> movies-service -> Prisma -> database
```

It deliberately does not include `movies-ui`; the benchmark isolates database-server effects. Run the load generator from a developer workstation, never from either database host. Measurements are relative comparisons and include workstation and network conditions.

## What the benchmark does

Every run sends authenticated GraphQL requests directly to `movies-service`. It does not open a browser or use the Next.js proxy. Before a run starts, a bootstrap query loads one existing movie from the target database. Its ID and the first three characters of its title are used as stable inputs for the detail and title-search requests.

The comparison workload repeatedly chooses one of these read-only operations:

| Share | GraphQL operation | What it represents |
| ---: | --- | --- |
| 50% | `videos` list | Browse the first 20 movies, including genres and media type. |
| 25% | `videos` title search | Search by a title prefix and return matching movies. |
| 15% | `videoData` | Open one movie's detail data, including genre and media-type relations. |
| 10% | `genres` and `mediaTypes` | Load the small metadata lists used by filtering/editing UI. |

No create, update, delete, or other GraphQL mutation is sent. In particular, `upsertVideoData`, user-seen changes, and user-flag changes are outside this suite. They need a separate write benchmark against a resettable, isolated database and must never be added to the production-read profile.

`perf-compare` executes nine independent runs: three repetitions at each of 1, 5, and 10 virtual users. Each individual run has a one-minute warm-up, followed by a five-minute measured period. Only measured requests contribute to the benchmark latency and request-rate metrics; bootstrap and warm-up requests are excluded.

The production-read profile uses the same read-only operation mix, but is fixed to one virtual user, a maximum of two requests per second, and five minutes. It requires an explicit production opt-in and an HTTPS endpoint.

## Prerequisites

- Install [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/).
- Start `movies-service` with the database under test and the same application build and environment for every run.
- Use the same `seed/videodb.sql` data, schema, indexes, database engine version, and relevant database configuration for both servers.
- Obtain a short-lived JWT for a dedicated benchmark identity. The JWT must have issuer `movie-database` and be accepted by the service. Keep it in a secret store or shell environment; do not commit it or include it in labels.

The current service verifies JWTs but does not authorize GraphQL operations by role. The benchmark contains only fixed GraphQL queries; do not replace them with mutations when using the production profile.

## Compare development database servers

```bash
export PERF_GRAPHQL_URL=http://127.0.0.1:7100/graphql
export PERF_BEARER_TOKEN='short-lived-benchmark-jwt'
export PERF_OUTPUT_DIR=perf-results
export PERF_RUN_LABEL=old-db
npm exec nx run workspace:perf-compare
```

Run the same command against the candidate server after changing only the service database configuration and label. The target performs three repetitions at 1, 5, and 10 virtual users. Each has a 60-second warm-up and five-minute measurement. Raw k6 JSON, per-run summaries, and `<label>-report.md` are written to the ignored output directory.

Compare p50/p95/p99, failure rate, and per-operation metrics across repeated runs. Record database CPU, memory, disk I/O, active connections, slow queries, engine/version, and configuration separately. The benchmark intentionally has no pass/fail threshold.

After collecting both labels, generate a direct comparison report. The first label is the baseline and the second is the candidate; it shows p95 and throughput percentage changes at each VU level.

```bash
node tools/performance/summarize-results.mjs perf-results old-db new-db
```

## Production read-only probe

Only use this profile during a quiet period while normal service and database monitoring is available. It is fixed to one virtual user, two requests per second, and five minutes; it contains only GraphQL queries and cannot be made more aggressive through environment variables.

```bash
export PERF_GRAPHQL_URL=https://movies-service.example.com/graphql
export PERF_BEARER_TOKEN='short-lived-benchmark-jwt'
export PERF_OUTPUT_DIR=perf-results
export PERF_RUN_LABEL=production-read-2026-07-26
export PERF_ALLOW_PRODUCTION=true
npm exec nx run workspace:perf-production-read
```

The production target refuses to start without the explicit opt-in and an HTTPS endpoint. It stores timing data locally and does not include the bearer token in console, raw metric, or summary output.
