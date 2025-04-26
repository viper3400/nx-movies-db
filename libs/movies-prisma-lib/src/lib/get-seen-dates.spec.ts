import { getSeenDates } from "./get-seen-dates";

describe("get seen dates", () => {
  it("should find seen dates for a movie id and a view group", async () => {
    const args = { movieId: 1874, viewGroup: "VG_Default" };
    const query = undefined;
    const result = await getSeenDates(args, query);
    expect(result.length).toBe(2);
    expect(result[0].asp_username).toEqual("Xoom");
    expect(result[0].viewdate.toISOString()).toEqual("2014-07-26T21:06:43.000Z");
  });

  it("should return empty result for a movie id that was not seen", async () => {
    const args = { movieId: 566, viewGroup: "VG_Default" };
    const query = undefined;
    const result = await getSeenDates(args, query);
    expect(result.length).toBe(0);
  });

  it("should ensure seen dates are ordered in descending order", async () => {
    const args = { movieId: 1874, viewGroup: "VG_Default", sortOrder: "desc" };
    const result = await getSeenDates(args, undefined);

    expect(result.length).toBeGreaterThan(1);
    for (let i = 0; i < result.length - 1; i++) {
      expect(new Date(result[i].viewdate).getTime()).toBeGreaterThanOrEqual(
        new Date(result[i + 1].viewdate).getTime()
      );
    }
  });

  it("should ensure seen dates are ordered in ascending order", async () => {
    const args = { movieId: 1874, viewGroup: "VG_Default", sortOrder: "asc" };
    const result = await getSeenDates(args, undefined);

    expect(result.length).toBeGreaterThan(1);
    for (let i = 0; i < result.length - 1; i++) {
      expect(new Date(result[i].viewdate).getTime()).toBeLessThanOrEqual(
        new Date(result[i + 1].viewdate).getTime()
      );
    }
  });
});
