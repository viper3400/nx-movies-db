import { getClient } from "../../../lib/apollocient";
import { isRemoteHttpUrl, storeCoverImageFromUrl } from "./coverImageLocalization";
import { upsertVideoData } from "./upsertVideoData";

jest.mock("../../../lib/apollocient", () => ({
  getClient: jest.fn(),
}));

jest.mock("./coverImageLocalization", () => ({
  isRemoteHttpUrl: jest.fn(),
  storeCoverImageFromUrl: jest.fn(),
}));

const getClientMock = getClient as jest.MockedFunction<typeof getClient>;
const isRemoteHttpUrlMock = isRemoteHttpUrl as jest.MockedFunction<typeof isRemoteHttpUrl>;
const storeCoverImageFromUrlMock = storeCoverImageFromUrl as jest.MockedFunction<typeof storeCoverImageFromUrl>;

const baseValues = {
  id: null,
  title: "Remote Cover",
  year: 2024,
  istv: 0,
  mediatype: 1,
  owner_id: 1,
  imgurl: "https://example.com/cover.png",
  genreIds: [],
};

describe("upsertVideoData cover localization", () => {
  const originalCoverImagePath = process.env.COVER_IMAGE_PATH;
  let mutate: jest.Mock;
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    mutate = jest.fn();
    getClientMock.mockReturnValue({ mutate } as any);
    isRemoteHttpUrlMock.mockReturnValue(true);
    storeCoverImageFromUrlMock.mockResolvedValue("./530.jpg");
    process.env.COVER_IMAGE_PATH = "/covers";
    consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleError.mockRestore();
    if (originalCoverImagePath === undefined) {
      delete process.env.COVER_IMAGE_PATH;
    } else {
      process.env.COVER_IMAGE_PATH = originalCoverImagePath;
    }
  });

  it("saves non-remote imgurl without trying to localize the cover", async () => {
    isRemoteHttpUrlMock.mockReturnValue(false);
    mutate.mockResolvedValueOnce({
      data: { upsertVideoData: { id: 530, title: "Local Cover", imdbID: null } },
    });

    const result = await upsertVideoData({
      ...baseValues,
      imgurl: "./530.jpg",
    });

    expect(result).toEqual({ id: 530, title: "Local Cover", imdbID: null });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(storeCoverImageFromUrlMock).not.toHaveBeenCalled();
  });

  it("creates first, then downloads and writes localized cover metadata using the new id", async () => {
    mutate
      .mockResolvedValueOnce({
        data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
      })
      .mockResolvedValueOnce({
        data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
      });

    await upsertVideoData(baseValues);

    expect(storeCoverImageFromUrlMock).toHaveBeenCalledWith("https://example.com/cover.png", "/covers", 530);
    expect(mutate).toHaveBeenCalledTimes(2);
    expect(mutate.mock.calls[1][0].variables).toEqual(
      expect.objectContaining({
        id: 530,
        imgurl: "./530.jpg",
        custom3: "https://example.com/cover.png",
      })
    );
  });

  it("updates first, then localizes cover metadata when download succeeds", async () => {
    mutate
      .mockResolvedValueOnce({
        data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
      })
      .mockResolvedValueOnce({
        data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
      });

    await upsertVideoData({
      ...baseValues,
      id: 530,
    });

    expect(mutate.mock.calls[0][0].variables).toEqual(
      expect.objectContaining({
        id: 530,
        imgurl: "https://example.com/cover.png",
      })
    );
    expect(storeCoverImageFromUrlMock).toHaveBeenCalledWith("https://example.com/cover.png", "/covers", 530);
    expect(mutate.mock.calls[1][0].variables).toEqual(
      expect.objectContaining({
        id: 530,
        imgurl: "./530.jpg",
        custom3: "https://example.com/cover.png",
      })
    );
  });

  it("keeps the metadata save result when cover download fails", async () => {
    mutate.mockResolvedValueOnce({
      data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
    });
    storeCoverImageFromUrlMock.mockRejectedValueOnce(new Error("download failed"));

    const result = await upsertVideoData(baseValues);

    expect(result).toEqual({ id: 530, title: "Remote Cover", imdbID: null });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(
      "Cover image localization failed after metadata save",
      expect.objectContaining({
        movieId: 530,
        imgurl: "https://example.com/cover.png",
        error: "download failed",
      })
    );
  });

  it("keeps the metadata save result when COVER_IMAGE_PATH is missing", async () => {
    delete process.env.COVER_IMAGE_PATH;
    mutate.mockResolvedValueOnce({
      data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
    });

    const result = await upsertVideoData(baseValues);

    expect(result).toEqual({ id: 530, title: "Remote Cover", imdbID: null });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(storeCoverImageFromUrlMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "Skipping cover image localization: COVER_IMAGE_PATH is not configured",
      expect.objectContaining({
        movieId: 530,
        imgurl: "https://example.com/cover.png",
      })
    );
  });
});
