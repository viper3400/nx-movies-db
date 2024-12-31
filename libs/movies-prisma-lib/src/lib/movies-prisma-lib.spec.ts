import { moviesPrismaLib } from "./movies-prisma-lib";

describe("moviesPrismaLib", () => {
  it("should work", () => {
    expect(moviesPrismaLib()).toEqual("movies-prisma-lib");
  });
});
