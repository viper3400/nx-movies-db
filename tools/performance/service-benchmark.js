import http from "k6/http";
import { check, fail, group } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const profile = __ENV.PERF_PROFILE;
const baseUrl = __ENV.PERF_GRAPHQL_URL;
const bearerToken = __ENV.PERF_BEARER_TOKEN;
const outputDirectory = __ENV.PERF_OUTPUT_DIR || "perf-results";
const runLabel = __ENV.PERF_RUN_LABEL || profile || "benchmark";
const runId = `${runLabel}-${new Date().toISOString().replace(/[:.]/g, "-")}`;

const requestDuration = new Trend("operation_duration", true);
const requestFailures = new Rate("operation_failures");
const requestsByOperation = new Counter("operation_requests");
const measuredOperations = {
  BenchmarkVideoList: {
    duration: new Trend("benchmark_video_list_duration", true),
    failures: new Rate("benchmark_video_list_failures"),
    requests: new Counter("benchmark_video_list_requests"),
  },
  BenchmarkTitleSearch: {
    duration: new Trend("benchmark_title_search_duration", true),
    failures: new Rate("benchmark_title_search_failures"),
    requests: new Counter("benchmark_title_search_requests"),
  },
  BenchmarkVideoDetail: {
    duration: new Trend("benchmark_video_detail_duration", true),
    failures: new Rate("benchmark_video_detail_failures"),
    requests: new Counter("benchmark_video_detail_requests"),
  },
  BenchmarkLookups: {
    duration: new Trend("benchmark_lookups_duration", true),
    failures: new Rate("benchmark_lookups_failures"),
    requests: new Counter("benchmark_lookups_requests"),
  },
};

const documents = {
  bootstrap: `query BenchmarkBootstrap {
    videos(diskid: "", filterFavorites: false, filterFlagged: false, mediaType: [], genreName: [], randomOrder: false, queryPlot: false, queryUserSettings: false, take: 10, skip: 0) {
      videos { id title }
    }
  }`,
  videoList: `query BenchmarkVideoList {
    videos(diskid: "", filterFavorites: false, filterFlagged: false, mediaType: [], genreName: [], randomOrder: false, queryPlot: false, queryUserSettings: false, take: 20, skip: 0) {
      requestMeta { totalCount }
      videos { id title subtitle diskid ownerid istv runtime rating genres mediaType }
    }
  }`,
  titleSearch: `query BenchmarkTitleSearch($title: String!) {
    videos(title: $title, diskid: "", filterFavorites: false, filterFlagged: false, mediaType: [], genreName: [], randomOrder: false, queryPlot: false, queryUserSettings: false, take: 20, skip: 0) {
      requestMeta { totalCount }
      videos { id title genres mediaType }
    }
  }`,
  videoDetail: `query BenchmarkVideoDetail($id: Int!) {
    videoData(id: $id) {
      id title subtitle diskid year runtime rating plot
      videodb_videogenre { genre { name } }
      videodb_mediatypes { name }
    }
  }`,
  lookups: `query BenchmarkLookups {
    genres { id name }
    mediaTypes { id name }
  }`,
};

function requireConfiguration() {
  if (profile !== "compare" && profile !== "production-read") {
    fail("PERF_PROFILE must be compare or production-read.");
  }
  if (!baseUrl || !bearerToken) {
    fail("PERF_GRAPHQL_URL and PERF_BEARER_TOKEN are required.");
  }

  if (!/^https?:\/\/[^\s/]+(?:\/|$)/i.test(baseUrl)) {
    fail("PERF_GRAPHQL_URL must be an absolute URL.");
  }

  if (profile === "production-read") {
    if (__ENV.PERF_ALLOW_PRODUCTION !== "true") {
      fail("Production benchmarks require PERF_ALLOW_PRODUCTION=true.");
    }
    if (!baseUrl.toLowerCase().startsWith("https://")) {
      fail("Production benchmarks require an HTTPS PERF_GRAPHQL_URL.");
    }
  }
}

function assertReadOnlyDocuments() {
  for (const [name, document] of Object.entries(documents)) {
    const normalized = document.trim();
    if (!normalized.startsWith("query ") || /\b(mutation|subscription)\b/i.test(normalized)) {
      fail(`Benchmark document ${name} is not read-only.`);
    }
  }
}

requireConfiguration();
assertReadOnlyDocuments();

const compareVus = Number(__ENV.PERF_VUS || "1");
if (!Number.isInteger(compareVus) || compareVus < 1) {
  fail("PERF_VUS must be a positive integer.");
}

export const options = {};
options.summaryTrendStats = ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"];

if (profile === "production-read") {
  options.scenarios = {
    production_read_only: {
      executor: "constant-arrival-rate",
      rate: 2,
      timeUnit: "1s",
      duration: "5m",
      preAllocatedVUs: 1,
      maxVUs: 1,
      exec: "productionReadOnly",
    },
  };
} else {
  options.scenarios = {
    warmup: { executor: "constant-vus", vus: compareVus, duration: "1m", exec: "warmup" },
    measurement: { executor: "constant-vus", vus: compareVus, startTime: "1m", duration: "5m", exec: "measurement" },
  };
}

function post(operation, query, variables = {}, collectMetrics = false) {
  const response = http.post(baseUrl, JSON.stringify({ query, variables, operationName: operation }), {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${bearerToken}` },
    tags: { operation },
  });

  let body;
  try {
    body = response.json();
  } catch {
    body = null;
  }

  const successful = check(response, {
    "HTTP status is 200": (result) => result.status === 200,
    "GraphQL response has data": () => Boolean(body?.data),
    "GraphQL response has no errors": () => !body?.errors?.length,
  });

  const operationMetrics = measuredOperations[operation];
  const isMeasuredRequest = collectMetrics && operationMetrics;
  if (isMeasuredRequest) {
    requestDuration.add(response.timings.duration, { operation });
    requestFailures.add(!successful, { operation });
    requestsByOperation.add(1, { operation });
    operationMetrics.duration.add(response.timings.duration);
    operationMetrics.failures.add(!successful);
    operationMetrics.requests.add(1);
  }
  return { successful, body, status: response.status };
}

export function setup() {
  const { successful, body, status } = post("BenchmarkBootstrap", documents.bootstrap);
  const video = body?.data?.videos?.videos?.find((candidate) => candidate?.id && candidate?.title);
  if (!successful || !video) {
    const errors = body?.errors
      ?.map((error) => error.message)
      .filter(Boolean)
      .join("; ");
    const detail = errors ? ` GraphQL errors: ${errors}` : "";
    fail(`Bootstrap query did not return a video with an id and title (HTTP ${status}).${detail}`);
  }
  return { videoId: Number(video.id), searchText: video.title.slice(0, Math.min(3, video.title.length)) };
}

function runRepresentativeRead(data, collectMetrics) {
  const selection = Math.random();
  if (selection < 0.5) return post("BenchmarkVideoList", documents.videoList, {}, collectMetrics);
  if (selection < 0.75) return post("BenchmarkTitleSearch", documents.titleSearch, { title: data.searchText }, collectMetrics);
  if (selection < 0.9) return post("BenchmarkVideoDetail", documents.videoDetail, { id: data.videoId }, collectMetrics);
  return post("BenchmarkLookups", documents.lookups, {}, collectMetrics);
}

export function warmup(data) { group("warmup", () => runRepresentativeRead(data, false)); }
export function measurement(data) { group("measurement", () => runRepresentativeRead(data, true)); }
export function productionReadOnly(data) { group("production-read-only", () => runRepresentativeRead(data, true)); }

function metricValue(metric, valueName) {
  return metric?.values?.[valueName] ?? "n/a";
}

export function handleSummary(data) {
  const duration = data.metrics.operation_duration?.values ?? {};
  const failures = metricValue(data.metrics.operation_failures, "rate");
  const report = [
    `Performance benchmark: ${runLabel}`,
    `profile=${profile}; p50=${metricValue(data.metrics.operation_duration, "med")}ms; p95=${metricValue(data.metrics.operation_duration, "p(95)")}ms; p99=${metricValue(data.metrics.operation_duration, "p(99)")}ms; failure_rate=${failures}`,
    `iterations=${metricValue(data.metrics.iterations, "count")}; http_requests=${metricValue(data.metrics.http_reqs, "count")}`,
  ].join("\n");
  return {
    stdout: `${report}\n`,
    [`${outputDirectory}/${runId}-summary.json`]: JSON.stringify({
      profile,
      runLabel,
      runId,
      generatedAt: new Date().toISOString(),
      run: {
        vus: profile === "compare" ? compareVus : 1,
        repeat: Number(__ENV.PERF_REPEAT || "1"),
        measurementSeconds: 300,
      },
      metrics: data.metrics,
      rootGroup: data.root_group,
      summary: { p50Ms: duration.med, p95Ms: duration["p(95)"], p99Ms: duration["p(99)"], failureRate: failures },
    }, null, 2),
  };
}
