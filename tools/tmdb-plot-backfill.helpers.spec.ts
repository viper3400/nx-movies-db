import {
  findExactTmdbMatch,
  formatTmdbActors,
  mediaKindForCandidate,
  parseBackfillOptions,
} from "./tmdb-plot-backfill.helpers";

describe("TMDB plot backfill helpers", () => {
  const candidate = { id: 1, title: "Amélie!", year: 2001, istv: 0, imdbID: null };

  it("accepts one normalized title and year match", () => {
    expect(findExactTmdbMatch(candidate, [
      { id: 194, title: "Amelie", original_title: "Le Fabuleux Destin d'Amélie Poulain", release_date: "2001-04-25" },
    ])).toEqual({
      matched: true,
      result: expect.objectContaining({ id: 194 }),
    });
  });

  it("rejects unknown years and ambiguous matches", () => {
    expect(findExactTmdbMatch({ ...candidate, year: 0 }, [])).toEqual({ matched: false, reason: "unknown-year" });
    expect(findExactTmdbMatch(candidate, [
      { id: 1, title: "Amelie", release_date: "2001-01-01" },
      { id: 2, original_title: "Amélie", release_date: "2001-02-01" },
    ])).toEqual({ matched: false, reason: "ambiguous-match" });
  });

  it("formats and limits ordered TMDB cast", () => {
    const cast = Array.from({ length: 16 }, (_, index) => ({
      id: index + 1,
      name: `Actor ${index + 1}`,
      character: `Role ${index + 1}`,
      order: 16 - index,
    }));
    const actors = formatTmdbActors(cast).split("\n");
    expect(actors).toHaveLength(15);
    expect(actors[0]).toBe("Actor 16::Role 16::tmdb:16");
  });

  it("uses bounded batches unless --all is explicit", () => {
    expect(parseBackfillOptions([])).toMatchObject({ apply: false, all: false, limit: 25, delayMs: 300 });
    expect(parseBackfillOptions(["--apply", "--limit", "3"])).toMatchObject({ apply: true, limit: 3 });
    expect(() => parseBackfillOptions(["--all", "--limit", "3"])).toThrow("cannot be used together");
    expect(mediaKindForCandidate({ istv: 1 })).toBe("tv");
  });
});
