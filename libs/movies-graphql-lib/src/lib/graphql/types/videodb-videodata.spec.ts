import { schema } from "../schema";

describe("upsertVideoData mutation", () => {
  it("requires a title", () => {
    const mutation = schema.getMutationType()?.getFields().upsertVideoData;

    expect(mutation?.args.find((argument) => argument.name === "title")?.type.toString()).toBe("String!");
  });
});
