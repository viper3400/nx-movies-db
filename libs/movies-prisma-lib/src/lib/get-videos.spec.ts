import { getVideos } from "./get-videos";

describe("getVideos", () => {
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
});
