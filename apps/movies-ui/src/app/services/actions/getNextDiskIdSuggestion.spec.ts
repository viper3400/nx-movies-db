import { getClient } from "../../../lib/apollocient";
import { getNextDiskIdSuggestion } from "./getNextDiskIdSuggestion";

jest.mock("../../../lib/apollocient", () => ({
  getClient: jest.fn(),
}));

const getClientMock = getClient as jest.MockedFunction<typeof getClient>;

describe("getNextDiskIdSuggestion", () => {
  it("queries GraphQL for a disk ID suggestion", async () => {
    const query = jest.fn().mockResolvedValue({
      data: { nextDiskIdSuggestion: "R01F3D04" },
    });
    getClientMock.mockReturnValue({ query } as any);

    await expect(getNextDiskIdSuggestion("R01F3", 42)).resolves.toEqual({
      nextDiskIdSuggestion: "R01F3D04",
    });

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          prefix: "R01F3",
          currentVideoId: 42,
        },
        fetchPolicy: "no-cache",
      })
    );
  });
});
