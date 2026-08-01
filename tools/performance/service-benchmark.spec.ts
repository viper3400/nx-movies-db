import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const benchmarkPath = resolve(__dirname, "service-benchmark.js");

describe("service performance benchmark contract", () => {
  const source = readFileSync(benchmarkPath, "utf8");

  it("contains only query operations", () => {
    expect(source).toMatch(/query BenchmarkBootstrap/);
    expect(source).toMatch(/query BenchmarkVideoList/);
    expect(source).toMatch(/query BenchmarkTitleSearch/);
    expect(source).toMatch(/query BenchmarkVideoDetail/);
    expect(source).toMatch(/query BenchmarkLookups/);
    expect(source).not.toMatch(/`\s*mutation\b/i);
    expect(source).not.toMatch(/`\s*subscription\b/i);
  });

  it("caps the production profile at two requests per second and one VU", () => {
    expect(source).toMatch(/rate:\s*2/);
    expect(source).toMatch(/duration:\s*"5m"/);
    expect(source).toMatch(/preAllocatedVUs:\s*1/);
    expect(source).toMatch(/maxVUs:\s*1/);
    expect(source).toMatch(/PERF_ALLOW_PRODUCTION !== "true"/);
  });

  it("retains p99 latency in k6 summaries", () => {
    expect(source).toMatch(/summaryTrendStats.*p\(99\)/);
  });

  it("requires the endpoint and token without putting the token into the summary", () => {
    expect(source).toMatch(/PERF_GRAPHQL_URL and PERF_BEARER_TOKEN are required/);
    expect(source).not.toMatch(/bearerToken,/);
    expect(source).not.toMatch(/PERF_BEARER_TOKEN,/);
  });
});
