import { buildWhereClause } from "./build-where-clause";

describe("buildWhereClause", () => {
  it.each([
    "Die Zeit, die man Leben nennt",
    "Paris, Paris",
  ])("keeps commas as part of the search phrase: %s", (title) => {
    const where = buildWhereClause({ title });
    const titleFilter = where.AND[0];

    expect(titleFilter).toEqual({
      OR: [
        { title: { contains: title } },
        { subtitle: { contains: title } },
      ],
    });
  });
});
