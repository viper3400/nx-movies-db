import { getClient } from "../../../lib/apollocient";
import { getMovieSuggestions } from "./getMovieSuggestions";

jest.mock("../../../lib/apollocient", () => ({
  getClient: jest.fn(),
}));

const getClientMock = getClient as jest.MockedFunction<typeof getClient>;

describe("getMovieSuggestions", () => {
  it("forwards the collection filters and returns GraphQL suggestions", async () => {
    const query = jest.fn().mockResolvedValue({
      data: { videoSuggestions: [{ id: "42", title: "Matrix", subtitle: null, diskid: "R01F1" }] },
    });
    getClientMock.mockReturnValue({ query } as any);

    await expect(getMovieSuggestions({
      query: "ma",
      deleteMode: "EXCLUDE_DELETED",
      tvSeriesMode: "INCLUDE_TVSERIES",
      filterFavorites: true,
      filterFlagged: false,
      mediaType: ["DVD"],
      genreName: ["Action"],
      userName: "jan",
    })).resolves.toEqual([{ id: "42", title: "Matrix", subtitle: null, diskid: "R01F1" }]);

    expect(query).toHaveBeenCalledWith(expect.objectContaining({
      variables: expect.objectContaining({ query: "ma", mediaType: ["DVD"], genreName: ["Action"] }),
    }));
  });
});
