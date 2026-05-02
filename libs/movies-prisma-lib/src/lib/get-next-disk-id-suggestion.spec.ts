import { calculateNextDiskIdSuggestion } from "./get-next-disk-id-suggestion";

describe("calculateNextDiskIdSuggestion", () => {
  it("appends the next number when a shelf is contiguous", () => {
    expect(
      calculateNextDiskIdSuggestion("R01F3", ["R01F3D01", "R01F3D02", "R01F3D03"])
    ).toBe("R01F3D04");
  });

  it("returns the first missing number in a shelf", () => {
    expect(
      calculateNextDiskIdSuggestion("R01F3", ["R01F3D01", "R01F3D04", "R01F3D05"])
    ).toBe("R01F3D02");
  });

  it("ignores malformed disk IDs and different shelves", () => {
    expect(
      calculateNextDiskIdSuggestion("R01F3", [
        "R01F3D01",
        "R01F3DXX",
        "R01F30D02",
        "R01F4D02",
      ])
    ).toBe("R01F3D02");
  });
});
