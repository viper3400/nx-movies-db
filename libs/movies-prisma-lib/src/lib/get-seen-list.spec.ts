import { getSeenList } from "./get-seen-list";

describe("get seen list for view group", () => {
  it("should return a list of movie ids and dates", async () => {
    const result = await getSeenList({
      viewGroup: "VG_Default"
    }, null);
    expect(result.length).toBe(22);
  });

  it("should return a list of movie ids and dates with fromDate filter", async () => {
    const fromDate = new Date("2015-01-10");
    const result = await getSeenList({
      fromDate,
      viewGroup: "VG_Default"
    }, null);
    expect(result.length).toBe(11);
    result.forEach(item => {
      expect(item.viewdate.getTime()).toBeGreaterThanOrEqual(fromDate.getTime());
    });
  });

  it("should return a list of movie ids and dates with toDate filter", async () => {
    const toDate = new Date("2015-01-10");
    const result = await getSeenList({
      toDate,
      viewGroup: "VG_Default"
    }, null);
    expect(result.length).toBe(12);
    result.forEach(item => {
      expect(item.viewdate.getTime()).toBeLessThanOrEqual(toDate.getTime());
    });
  });

  it("should return a list of movie ids and dates with fromDate and toDate filters", async () => {
    const fromDate = new Date("2015-01-05");
    const toDate = new Date("2015-01-15");
    const result = await getSeenList({
      fromDate,
      toDate,
      viewGroup: "VG_Default"
    }, null);
    expect(result.length).toBe(11);
    result.forEach(item => {
      expect(item.viewdate.getTime()).toBeGreaterThanOrEqual(fromDate.getTime());
      expect(item.viewdate.getTime()).toBeLessThanOrEqual(toDate.getTime());
    });
  });

  it("should return a list of movie ids and dates for a different view group", async () => {
    const result = await getSeenList({
      viewGroup: "VG_NewGroup"
    }, null);
    expect(result.length).toBe(4);
  });
});
