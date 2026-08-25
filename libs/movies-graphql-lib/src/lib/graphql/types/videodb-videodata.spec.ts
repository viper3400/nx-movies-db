jest.mock("@nx-movies-db/movies-prisma-lib", () => ({
  prisma: {},
}));

import { schema } from "../schema";

describe("upsertVideoData mutation", () => {
  it("requires a title", () => {
    const mutation = schema.getMutationType()?.getFields().upsertVideoData;

    expect(mutation?.args.find((argument) => argument.name === "title")?.type.toString()).toBe("String!");
  });

  it("exposes a filtered video suggestion query", () => {
    const query = schema.getQueryType()?.getFields().videoSuggestions;

    expect(query?.args.find((argument) => argument.name === "query")?.type.toString()).toBe("String!");
    expect(query?.type.toString()).toBe("[VideoSuggestion!]");
  });
});
