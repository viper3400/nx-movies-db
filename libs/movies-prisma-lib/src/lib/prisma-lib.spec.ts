import { prismaLib } from "./prisma-lib";

describe("prismaLib", () => {
  it("should work", () => {
    expect(prismaLib()).toEqual("prisma-lib");
  });
});
