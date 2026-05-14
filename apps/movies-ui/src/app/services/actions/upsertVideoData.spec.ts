import { getClient } from "../../../lib/apollocient";
import {
  deleteStoredCoverImage,
  deleteStoredPosterImage,
  isRemoteHttpUrl,
  storeCoverImageFromUrl,
  storePosterImageFromUrl,
} from "./coverImageLocalization";
import { getVideoData } from "./getVideoData";
import { upsertVideoData } from "./upsertVideoData";

jest.mock("../../../lib/apollocient", () => ({
  getClient: jest.fn(),
}));

jest.mock("./coverImageLocalization", () => ({
  deleteStoredCoverImage: jest.fn(),
  deleteStoredPosterImage: jest.fn(),
  isRemoteHttpUrl: jest.fn(),
  storeCoverImageFromUrl: jest.fn(),
  storePosterImageFromUrl: jest.fn(),
}));

jest.mock("./getVideoData", () => ({
  getVideoData: jest.fn(),
}));

const getClientMock = getClient as jest.MockedFunction<typeof getClient>;
const deleteStoredCoverImageMock = deleteStoredCoverImage as jest.MockedFunction<typeof deleteStoredCoverImage>;
const deleteStoredPosterImageMock = deleteStoredPosterImage as jest.MockedFunction<typeof deleteStoredPosterImage>;
const isRemoteHttpUrlMock = isRemoteHttpUrl as jest.MockedFunction<typeof isRemoteHttpUrl>;
const storeCoverImageFromUrlMock = storeCoverImageFromUrl as jest.MockedFunction<typeof storeCoverImageFromUrl>;
const storePosterImageFromUrlMock = storePosterImageFromUrl as jest.MockedFunction<typeof storePosterImageFromUrl>;
const getVideoDataMock = getVideoData as jest.MockedFunction<typeof getVideoData>;

const baseValues = {
  id: null,
  title: "Remote Cover",
  year: 2024,
  istv: 0,
  mediatype: 1,
  owner_id: 1,
  imgurl: "https://example.com/cover.png",
  custom4: "https://image.tmdb.org/t/p/w500/poster.jpg",
  genreIds: [],
};

describe("upsertVideoData cover localization", () => {
  const originalCoverImagePath = process.env.COVER_IMAGE_PATH;
  const originalPosterImagePath = process.env.POSTER_IMAGE_PATH;
  let mutate: jest.Mock;
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    mutate = jest.fn();
    getClientMock.mockReturnValue({ mutate } as any);
    deleteStoredCoverImageMock.mockResolvedValue(undefined);
    deleteStoredPosterImageMock.mockResolvedValue(undefined);
    isRemoteHttpUrlMock.mockReturnValue(true);
    storeCoverImageFromUrlMock.mockResolvedValue("./530.jpg");
    storePosterImageFromUrlMock.mockResolvedValue("./530.jpg");
    getVideoDataMock.mockResolvedValue(undefined);
    process.env.COVER_IMAGE_PATH = "/covers";
    process.env.POSTER_IMAGE_PATH = "/posters";
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
    if (originalPosterImagePath === undefined) {
      delete process.env.POSTER_IMAGE_PATH;
    } else {
      process.env.POSTER_IMAGE_PATH = originalPosterImagePath;
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
    expect(storePosterImageFromUrlMock).not.toHaveBeenCalled();
  });

  it("keeps an empty subtitle in mutation variables so clearing it persists", async () => {
    isRemoteHttpUrlMock.mockReturnValue(false);
    mutate.mockResolvedValueOnce({
      data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
    });

    await upsertVideoData({
      ...baseValues,
      id: 530,
      subtitle: "",
    });

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0].variables).toEqual(
      expect.objectContaining({
        id: 530,
        subtitle: "",
      })
    );
  });

  it("creates first, then downloads and writes localized cover metadata using the new id", async () => {
    mutate
      .mockResolvedValueOnce({
        data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
      })
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
    expect(storePosterImageFromUrlMock).toHaveBeenCalledWith("https://image.tmdb.org/t/p/w500/poster.jpg", "/posters", 530);
  });

  it("updates first, then localizes cover metadata when download succeeds", async () => {
    mutate
      .mockResolvedValueOnce({
        data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
      })
      .mockResolvedValueOnce({
        data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
      })
      .mockResolvedValueOnce({
        data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
      });

    getVideoDataMock.mockResolvedValueOnce({
      id: 530,
      custom4: "",
      year: 2024,
      istv: 0,
      lastupdate: null,
      mediatype: 1,
      owner_id: 1,
    } as any);

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
    expect(storePosterImageFromUrlMock).toHaveBeenCalledWith("https://image.tmdb.org/t/p/w500/poster.jpg", "/posters", 530);
  });

  it("keeps the metadata save result when cover download fails", async () => {
    mutate.mockResolvedValueOnce({
      data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
    });
    storeCoverImageFromUrlMock.mockRejectedValueOnce(new Error("download failed"));

    const result = await upsertVideoData(baseValues);

    expect(result).toEqual({ id: 530, title: "Remote Cover", imdbID: null });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(deleteStoredCoverImageMock).toHaveBeenCalledWith("/covers", 530);
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

  it("skips poster localization when custom4 has not changed on update", async () => {
    mutate
      .mockResolvedValueOnce({
        data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
      })
      .mockResolvedValueOnce({
        data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
      });
    getVideoDataMock.mockResolvedValueOnce({
      id: 530,
      custom4: "https://image.tmdb.org/t/p/w500/poster.jpg",
      year: 2024,
      istv: 0,
      lastupdate: null,
      mediatype: 1,
      owner_id: 1,
    } as any);

    await upsertVideoData({
      ...baseValues,
      id: 530,
    });

    expect(storePosterImageFromUrlMock).not.toHaveBeenCalled();
  });

  it("keeps the metadata save result when poster download fails", async () => {
    mutate
      .mockResolvedValueOnce({
        data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
      })
      .mockResolvedValueOnce({
        data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
      });
    storePosterImageFromUrlMock.mockRejectedValueOnce(new Error("poster download failed"));

    const result = await upsertVideoData(baseValues);

    expect(result).toEqual({ id: 530, title: "Remote Cover", imdbID: null });
    expect(deleteStoredPosterImageMock).toHaveBeenCalledWith("/posters", 530);
    expect(consoleError).toHaveBeenCalledWith(
      "Poster image localization failed after metadata save",
      expect.objectContaining({
        movieId: 530,
        custom4: "https://image.tmdb.org/t/p/w500/poster.jpg",
        error: "poster download failed",
      })
    );
  });

  it("keeps the metadata save result when POSTER_IMAGE_PATH is missing", async () => {
    delete process.env.POSTER_IMAGE_PATH;
    mutate
      .mockResolvedValueOnce({
        data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
      })
      .mockResolvedValueOnce({
        data: { upsertVideoData: { id: 530, title: "Remote Cover", imdbID: null } },
      });

    const result = await upsertVideoData(baseValues);

    expect(result).toEqual({ id: 530, title: "Remote Cover", imdbID: null });
    expect(storePosterImageFromUrlMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "Skipping poster image localization: POSTER_IMAGE_PATH is not configured",
      expect.objectContaining({
        movieId: 530,
        custom4: "https://image.tmdb.org/t/p/w500/poster.jpg",
      })
    );
  });
});
