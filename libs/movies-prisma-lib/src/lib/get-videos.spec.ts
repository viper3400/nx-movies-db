import { prisma } from "../prismaclient";
import { getVideos } from "./get-videos";

function getAndClausesFromCall(spy: jest.SpyInstance, callIndex: number) {
  const where = spy.mock.calls[callIndex]?.[0]?.where as { AND?: unknown } | undefined;
  expect(Array.isArray(where?.AND)).toBe(true);
  return where!.AND as Array<unknown>;
}

describe("getVideos", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return all videos when no args are set", async () => {
    const result = await getVideos({}, undefined);
    expect(Array.isArray(result.videos)).toBe(true);
    expect(typeof result.totalCount).toBe("number");
  });

  it("should filter by title", async () => {
    const args = { title: "Grasgeflüster" };
    const result = await getVideos(args, undefined);
    expect(result.videos.some(v => v.title?.includes("Grasgeflüster"))).toBe(true);
  });

  it.each([
    "Die Zeit, die man Leben nennt",
    "Paris, Paris",
  ])("should find a title containing commas: %s", async (title) => {
    const result = await getVideos({ title }, undefined);

    expect(result.videos.some(video => video.title === title)).toBe(true);
  });

  it("keeps comma-containing searches as a contiguous phrase", async () => {
    const result = await getVideos({ title: "Die Zeit, die" }, undefined);

    expect(result.videos.some(video => video.title === "Die Zeit, die man Leben nennt")).toBe(true);
    expect(result.videos.some(video => video.title === "Wettlauf gegen die Zeit")).toBe(false);
  });

  it("should filter by id", async () => {
    const args = { ids: ["253"] };
    const result = await getVideos(args, undefined);
    expect(result.videos.every(v => v.id === 253)).toBe(true);
  });

  it("should filter by diskid", async () => {
    const args = { diskid: "R18F5" };
    const result = await getVideos(args, undefined);
    expect(result.videos.every(v => v.diskid?.startsWith("R18F5"))).toBe(true);
  });

  it("should filter by genreName", async () => {
    const args = { genreName: ["Comedy"] };
    const result = await getVideos(args, undefined);
    expect(result.videos.some(v =>
      v.videodb_videogenre?.some(g => g.genre.name.includes("Comedy"))
    )).toBe(true);
  });

  it("should filter by mediaType", async () => {
    const args = { mediaType: ["DVD"] };
    const result = await getVideos(args, undefined);
    expect(result.videos.every(v => v.videodb_mediatypes?.name === "DVD")).toBe(true);
  });

  it("should filter by ownerid", async () => {
    const args = { ownerid: "1" };
    const result = await getVideos(args, undefined);
    expect(result.videos.every(v => v.owner_id === 1)).toBe(true);
  });

  it("should filter by deleteMode ONLY_DELETED", async () => {
    const args = { deleteMode: "ONLY_DELETED" };
    const result = await getVideos(args, undefined);
    expect(result.videos.every(v => v.owner_id === 999)).toBe(true);
  });

  it("should filter by deleteMode EXCLUDE_DELETED", async () => {
    const args = { deleteMode: "EXCLUDE_DELETED" };
    const result = await getVideos(args, undefined);
    expect(result.videos.every(v => v.owner_id !== 999)).toBe(true);
  });

  it("should filter by tvSeriesMode ONLY_TVSERIES", async () => {
    const args = { tvSeriesMode: "ONLY_TVSERIES" };
    const result = await getVideos(args, undefined);
    expect(result.videos.every(v => v.istv === 1)).toBe(true);
  });

  it("should filter by tvSeriesMode EXCLUDE_TVSERIES", async () => {
    const args = { tvSeriesMode: "EXCLUDE_TVSERIES" };
    const result = await getVideos(args, undefined);
    expect(result.videos.every(v => v.istv === 0)).toBe(true);
  });

  it("should filter by filterFavorites", async () => {
    const args = { filterFavorites: true, userName: "testuser" };
    const result = await getVideos(args, undefined);
    expect(result.videos.every(v =>
      v.userMovieSettings?.some(s => s.asp_username === "testuser" && s.is_favorite)
    )).toBe(true);
  });

  it("should filter by filterFlagged", async () => {
    const args = { filterFlagged: true, userName: "testuser" };
    const result = await getVideos(args, undefined);
    expect(result.videos.every(v =>
      v.userMovieSettings?.some(s => s.asp_username === "testuser" && s.watchagain)
    )).toBe(true);
  });

  it("should throw if filterFavorites or filterFlagged is set without userName", async () => {
    await expect(getVideos({ filterFavorites: true }, undefined)).rejects.toThrow();
    await expect(getVideos({ filterFlagged: true }, undefined)).rejects.toThrow();
  });

  it("should respect take and skip", async () => {
    const args = { take: 2, skip: 1 };
    const result = await getVideos(args, undefined);
    expect(result.videos.length).toBeLessThanOrEqual(2);
  });

  it("should include plot and userMovieSettings if requested", async () => {
    const args = { queryPlot: true, queryUserSettings: true };
    const result = await getVideos(args, undefined);
    expect(result.videos.length).toBeGreaterThan(0);
    expect(result.videos[0]).toHaveProperty("plot");
    expect(result.videos[0]).toHaveProperty("userMovieSettings");
  });

  it("should exclude recent random ids when enough candidates remain", async () => {
    const findManySpy = jest.spyOn(prisma.videodb_videodata, "findMany");

    findManySpy
      .mockResolvedValueOnce([{ id: 3 }, { id: 4 }] as any)
      .mockResolvedValueOnce([
        { id: 3, title: "Movie 3" },
        { id: 4, title: "Movie 4" },
      ] as any);

    jest.spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);

    const result = await getVideos({
      randomOrder: true,
      excludedIds: ["1", "2"],
      take: 2,
    }, undefined);

    expect(result.totalCount).toBe(2);
    expect(result.videos.map(video => video.id)).toEqual([4, 3]);
    expect(getAndClausesFromCall(findManySpy, 0)[2]).toEqual({
      id: { notIn: [1, 2] },
    });
  });

  it("should trim the oldest excluded ids until enough random candidates remain", async () => {
    const findManySpy = jest.spyOn(prisma.videodb_videodata, "findMany");

    findManySpy
      .mockResolvedValueOnce([{ id: 4 }] as any)
      .mockResolvedValueOnce([{ id: 1 }, { id: 4 }] as any)
      .mockResolvedValueOnce([
        { id: 1, title: "Movie 1" },
        { id: 4, title: "Movie 4" },
      ] as any);

    jest.spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);

    const result = await getVideos({
      randomOrder: true,
      excludedIds: ["1", "2", "3"],
      take: 2,
    }, undefined);

    expect(getAndClausesFromCall(findManySpy, 0)[2]).toEqual({
      id: { notIn: [1, 2, 3] },
    });
    expect(getAndClausesFromCall(findManySpy, 1)[2]).toEqual({
      id: { notIn: [2, 3] },
    });
    expect(result.videos.map(video => video.id).sort()).toEqual([1, 4]);
  });

  it("should preserve sampled random order instead of sorting alphabetically", async () => {
    jest.spyOn(prisma.videodb_videodata, "findMany")
      .mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }] as any)
      .mockResolvedValueOnce([
        { id: 1, title: "Alpha" },
        { id: 2, title: "Bravo" },
        { id: 3, title: "Charlie" },
      ] as any);

    jest.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0);

    const result = await getVideos({
      randomOrder: true,
      take: 3,
    }, undefined);

    expect(result.videos.map(video => video.id)).toEqual([3, 1, 2]);
  });
});
