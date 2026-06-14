import { getClient } from "../../../lib/apollocient";
import { getMovies } from "./getMovies";

jest.mock("../../../lib/apollocient", () => ({
  getClient: jest.fn(),
}));

describe("getMovies", () => {
  const getClientMock = getClient as jest.MockedFunction<typeof getClient>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should forward excluded ids and bypass cache for random searches", async () => {
    const query = jest.fn().mockResolvedValue({
      data: {
        videos: {
          videos: [],
          requestMeta: { totalCount: 0 },
        },
      },
    });

    getClientMock.mockReturnValue({ query } as any);

    await getMovies(
      "",
      "EXCLUDE_DELETED",
      "INCLUDE_TVSERIES",
      false,
      false,
      true,
      [],
      [],
      ["11", "12"],
      "jan",
      10,
      0,
    );

    expect(query).toHaveBeenCalledWith(expect.objectContaining({
      variables: expect.objectContaining({
        excludedIds: ["11", "12"],
      }),
      fetchPolicy: "no-cache",
    }));
  });
});
