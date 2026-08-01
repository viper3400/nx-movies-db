import { createReadStream } from "node:fs";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { resolve } from "node:path";

const [outputDirectory = "perf-results", ...runLabels] = process.argv.slice(2);
if (runLabels.length === 0 || runLabels.length > 2) {
  throw new Error("Usage: node summarize-results.mjs <output-directory> <run-label> [candidate-run-label]");
}

const directory = resolve(outputDirectory);
const includeRawOperations = process.env.PERF_INCLUDE_RAW_OPERATIONS === "true";
const operationMetrics = [
  ["Video list", "benchmark_video_list", "BenchmarkVideoList"],
  ["Title search", "benchmark_title_search", "BenchmarkTitleSearch"],
  ["Video detail", "benchmark_video_detail", "BenchmarkVideoDetail"],
  ["Lookups", "benchmark_lookups", "BenchmarkLookups"],
];

const number = (value, digits = 2) => typeof value === "number" ? value.toFixed(digits) : "n/a";
const percent = (value) => typeof value === "number" ? `${(value * 100).toFixed(2)}%` : "n/a";
const median = (values) => {
  const sorted = values.filter((value) => typeof value === "number").sort((left, right) => left - right);
  if (sorted.length === 0) return undefined;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const range = (values) => {
  const valid = values.filter((value) => typeof value === "number");
  return valid.length ? `${number(Math.min(...valid))}–${number(Math.max(...valid))}` : "n/a";
};
const metric = (run, name, value) => run.metrics?.[name]?.values?.[value];
const delta = (baseline, candidate) => typeof baseline === "number" && baseline !== 0 && typeof candidate === "number"
  ? `${(((candidate - baseline) / baseline) * 100).toFixed(1)}%`
  : "n/a";

function percentile(values, fraction) {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((left, right) => left - right);
  const index = (sorted.length - 1) * fraction;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return lower === upper ? sorted[lower] : sorted[lower] + ((sorted[upper] - sorted[lower]) * (index - lower));
}

async function readRawOperationMetrics(rawFile) {
  const metrics = Object.fromEntries(operationMetrics.map(([, , rawOperation]) => [rawOperation, []]));
  const input = createReadStream(resolve(directory, rawFile));
  const lines = createInterface({ input, crlfDelay: Infinity });
  for await (const line of lines) {
    const point = JSON.parse(line);
    const tags = point.data?.tags;
    const isMeasuredScenario = tags?.scenario === "measurement" || tags?.scenario === "production_read_only";
    if (point.type === "Point" && point.metric === "http_req_duration" && isMeasuredScenario && metrics[tags.operation]) {
      metrics[tags.operation].push(point.data.value);
    }
  }
  return Object.fromEntries(Object.entries(metrics).map(([operation, values]) => [operation, {
    count: values.length,
    p50Ms: percentile(values, 0.5),
    p95Ms: percentile(values, 0.95),
    p99Ms: percentile(values, 0.99),
  }]));
}

async function loadRuns(label) {
  const allFiles = await readdir(directory);
  const files = allFiles
    .filter((file) => file.endsWith("-summary.json") && file.startsWith(`${label}-`))
    .sort();
  if (files.length === 0) throw new Error(`No k6 summary files found for run label "${label}" in ${directory}.`);

  const rawRuns = await Promise.all(allFiles
    .map((file) => {
      const match = file.match(/-vus(\d+)-run(\d+)-raw\.json$/);
      return match ? { file, vus: Number(match[1]), repeat: Number(match[2]) } : undefined;
    })
    .filter(Boolean)
    .map(async (rawRun) => ({ ...rawRun, modifiedAt: (await stat(resolve(directory, rawRun.file))).mtimeMs })));

  return Promise.all(files.map(async (file) => {
    const summary = JSON.parse(await readFile(resolve(directory, file), "utf8"));
    const modifiedAt = (await stat(resolve(directory, file))).mtimeMs;
    const legacyRawRun = rawRuns
      .map((rawRun) => ({ ...rawRun, difference: Math.abs(rawRun.modifiedAt - modifiedAt) }))
      .sort((left, right) => left.difference - right.difference)[0];
    const recoveredRun = legacyRawRun?.difference < 1_000 ? legacyRawRun : undefined;
    const measurementSeconds = summary.run?.measurementSeconds ?? (recoveredRun ? 300 : undefined);
    const requestCount = metric(summary, "operation_requests", "count");
    return {
      file,
      profile: summary.profile,
      vus: summary.run?.vus ?? recoveredRun?.vus,
      repeat: summary.run?.repeat ?? recoveredRun?.repeat,
      measurementSeconds,
      metrics: summary.metrics,
      p50Ms: summary.summary?.p50Ms,
      p95Ms: summary.summary?.p95Ms,
      p99Ms: summary.summary?.p99Ms,
      failureRate: summary.summary?.failureRate,
      requests: requestCount,
      requestsPerSecond: typeof requestCount === "number" && typeof measurementSeconds === "number" ? requestCount / measurementSeconds : undefined,
      rawOperationMetrics: includeRawOperations && recoveredRun ? await readRawOperationMetrics(recoveredRun.file) : undefined,
    };
  }));
}

function aggregateRuns(runs) {
  const groups = new Map();
  for (const run of runs) {
    const key = run.vus ?? "unknown";
    groups.set(key, [...(groups.get(key) ?? []), run]);
  }
  return [...groups.entries()].sort(([left], [right]) => Number(left) - Number(right)).map(([vus, group]) => {
    const successfulRuns = group.filter((run) => run.failureRate === 0);
    const measuredRuns = successfulRuns;
    return {
      vus,
      runs: group,
      measuredRuns,
      successfulRuns,
      p50Ms: median(measuredRuns.map((run) => run.p50Ms)),
      p95Ms: median(measuredRuns.map((run) => run.p95Ms)),
      p99Ms: median(measuredRuns.map((run) => run.p99Ms)),
      p95Range: range(measuredRuns.map((run) => run.p95Ms)),
      failureRate: median(measuredRuns.map((run) => run.failureRate)),
      requestsPerSecond: median(measuredRuns.map((run) => run.requestsPerSecond)),
    };
  }).filter((group) => group.successfulRuns.length > 0);
}

function operationRows(groups) {
  return groups.flatMap((group) => operationMetrics.map(([operation, prefix, rawOperation]) => ({
    vus: group.vus,
    operation,
    p50Ms: median(group.measuredRuns.map((run) => metric(run, `${prefix}_duration`, "med") ?? run.rawOperationMetrics?.[rawOperation]?.p50Ms)),
    p95Ms: median(group.measuredRuns.map((run) => metric(run, `${prefix}_duration`, "p(95)") ?? run.rawOperationMetrics?.[rawOperation]?.p95Ms)),
    p99Ms: median(group.measuredRuns.map((run) => metric(run, `${prefix}_duration`, "p(99)") ?? run.rawOperationMetrics?.[rawOperation]?.p99Ms)),
    failureRate: median(group.measuredRuns.map((run) => metric(run, `${prefix}_failures`, "rate"))),
  })));
}

const reports = await Promise.all(runLabels.map(async (label) => ({ label, runs: await loadRuns(label) })));
const [baseline, candidate] = reports.map((report) => ({ ...report, groups: aggregateRuns(report.runs) }));
const lines = [`# Performance results: ${runLabels.join(" vs ")}`, ""];

for (const report of reports.map((item) => ({ ...item, groups: aggregateRuns(item.runs) }))) {
  const groups = report.groups;
  lines.push(`## ${report.label}`, "", "| VUs | Runs | Median RPS | Median p50 | Median p95 | p95 range | Median p99 | Failure rate |", "| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  lines.push(...groups.map((group) => `| ${group.vus} | ${group.measuredRuns.length}/${group.runs.length} | ${number(group.requestsPerSecond)} | ${number(group.p50Ms)} ms | ${number(group.p95Ms)} ms | ${group.p95Range} ms | ${number(group.p99Ms)} ms | ${percent(group.failureRate)} |`), "");
  const rows = operationRows(groups);
  if (rows.some((row) => row.p95Ms !== undefined)) {
    lines.push("### Per-operation latency", "", "| VUs | Operation | Median p50 | Median p95 | Median p99 | Failure rate |", "| ---: | --- | ---: | ---: | ---: | ---: |");
    lines.push(...rows.map((row) => `| ${row.vus} | ${row.operation} | ${number(row.p50Ms)} ms | ${number(row.p95Ms)} ms | ${number(row.p99Ms)} ms | ${percent(row.failureRate)} |`), "");
  } else {
    lines.push("Per-operation latency is available for runs created after the benchmark metric update. To recover it from existing raw k6 files, rerun this report with `PERF_INCLUDE_RAW_OPERATIONS=true`.", "");
  }
}

if (candidate) {
  lines.push("## Candidate change versus baseline", "", "| VUs | Baseline p95 | Candidate p95 | Change | Baseline RPS | Candidate RPS | Change |", "| ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const baselineGroup of baseline.groups) {
    const candidateGroup = candidate.groups.find((group) => group.vus === baselineGroup.vus);
    if (candidateGroup) {
      lines.push(`| ${baselineGroup.vus} | ${number(baselineGroup.p95Ms)} ms | ${number(candidateGroup.p95Ms)} ms | ${delta(baselineGroup.p95Ms, candidateGroup.p95Ms)} | ${number(baselineGroup.requestsPerSecond)} | ${number(candidateGroup.requestsPerSecond)} | ${delta(baselineGroup.requestsPerSecond, candidateGroup.requestsPerSecond)} |`);
    }
  }
  lines.push("");
}

const failedRuns = reports.flatMap((report) => report.runs.filter((run) => run.failureRate && run.failureRate > 0).map((run) => `${report.label}: ${run.file}`));
if (failedRuns.length) lines.push("## Excluded or failed runs", "", ...failedRuns.map((run) => `- ${run}`), "");
lines.push("Compare repeated measurements by VU level and per-operation percentile. The report is observational and does not apply a pass/fail threshold.");

const report = `${lines.join("\n")}\n`;
const reportName = runLabels.length === 1 ? `${runLabels[0]}-report.md` : `${runLabels.join("-vs-")}-report.md`;
await writeFile(resolve(directory, reportName), report);
process.stdout.write(report);
