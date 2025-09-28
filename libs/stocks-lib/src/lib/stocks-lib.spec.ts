import { stocksLib } from "./stocks-lib";

describe("stocksLib", () => {
  it("should work", () => {
    expect(stocksLib()).toBe("stocks-lib");
  });
});

