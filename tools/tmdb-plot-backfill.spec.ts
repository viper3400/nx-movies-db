import { buildCandidateSelectionSql, RateLimitedTmdbClient } from "./tmdb-plot-backfill";

describe("RateLimitedTmdbClient", () => {
  it("honors Retry-After before retrying a throttled TMDB request", async () => {
    const fetchFn = jest.fn()
      .mockResolvedValueOnce(new Response("{}", { status: 429, headers: { "retry-after": "1" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [] }), { status: 200 }));
    const sleepFn = jest.fn().mockResolvedValue(undefined);
    const client = new RateLimitedTmdbClient("token", "de-DE", 300, fetchFn, sleepFn);

    await expect(client.search({ id: 1, title: "A title", year: 2000, istv: 0, imdbID: null })).resolves.toEqual({ results: [] });

    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(sleepFn).toHaveBeenCalledWith(1000);
  });

  it("selects only non-TV videos before applying a batch limit", () => {
    expect(buildCandidateSelectionSql(false)).toContain("WHERE istv = 0 AND (plot IS NULL OR TRIM(plot) = '')");
    expect(buildCandidateSelectionSql(false)).toContain("ORDER BY id ASC LIMIT ?");
  });
});
