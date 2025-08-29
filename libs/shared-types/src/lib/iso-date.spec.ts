import { makeIsoDate, isIsoDate, IsoDate } from "./iso-date";

describe("IsoDate type", () => {
  it("accepts valid ISO dates", () => {
    expect(makeIsoDate("2023-01-01")).toBe("2023-01-01");
    expect(makeIsoDate("1999-12-31")).toBe("1999-12-31");
    expect(isIsoDate("2023-02-28")).toBe(true);
    expect(isIsoDate("2024-02-29")).toBe(true); // Leap year
  });

  it("rejects invalid ISO dates", () => {
    expect(() => makeIsoDate("2023-13-01")).toThrow(); // Invalid month
    expect(() => makeIsoDate("2023-00-10")).toThrow(); // Invalid month
    expect(() => makeIsoDate("2023-02-30")).toThrow(); // Invalid day
    expect(() => makeIsoDate("2023-04-31")).toThrow(); // April has 30 days
    expect(() => makeIsoDate("2023-2-2")).toThrow();   // Not zero-padded
    expect(() => makeIsoDate("2023-02-2")).toThrow();  // Not zero-padded
    expect(() => makeIsoDate("2023-2-02")).toThrow();  // Not zero-padded
    expect(() => makeIsoDate("2023-02-002")).toThrow(); // Too many digits
    expect(isIsoDate("2023-02-30")).toBe(false);
    expect(isIsoDate("not-a-date")).toBe(false);
  });

  it("accepts leap years correctly", () => {
    expect(makeIsoDate("2020-02-29")).toBe("2020-02-29");
    expect(() => makeIsoDate("2019-02-29")).toThrow(); // Not a leap year
  });

  it("returns branded type", () => {
    const date = makeIsoDate("2023-01-01");
    // Type assertion: should be IsoDate
    const check: IsoDate = date;
    expect(typeof check).toBe("string");
  });
});
