import { prisma } from "../prismaclient";
import { upsertVideoData } from "./create-or-update-videodata";
import { deleteVideoData } from "./delete-videodata";

describe("createOrDeleteVideoData integration tests", () => {
  let createdVideoIds: number[] = [];

  const trackVideo = (id: number) => createdVideoIds.push(id);

  afterEach(async () => {
    if (createdVideoIds.length) {
      await prisma.videodb_videogenre.deleteMany({
        where: { video_id: { in: createdVideoIds } },
      });
      await prisma.videodb_videodata.deleteMany({
        where: { id: { in: createdVideoIds } },
      });
      createdVideoIds = [];
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should create a new video data entry if it does not exist", async () => {
    const videoData = {
      title: "Test Movie",
      year: 2024,
      mediatype: 14,
      owner_id: 2,
    };

    const result = await upsertVideoData(videoData);
    trackVideo(result.id);

    expect(result).toMatchObject({
      title: "Test Movie",
      year: 2024,
      mediatype: 14,
      owner_id: 2,
    });

    const dbEntry = await prisma.videodb_videodata.findUnique({
      where: { id: result.id },
    });
    expect(dbEntry).toMatchObject({
      title: "Test Movie",
      year: 2024,
      mediatype: 14,
      owner_id: 2,
    });
  });

  it("should update an existing video data entry", async () => {
    const created = await upsertVideoData({
      title: "Old Title",
      year: 2020,
      mediatype: 14,
      owner_id: 2,
    });
    trackVideo(created.id);

    const updatedData = {
      id: created.id,
      title: "Updated Title",
      year: 2025,
      mediatype: 15,
      owner_id: 3,
    };

    const result = await upsertVideoData(updatedData);

    expect(result).toMatchObject(updatedData);

    const dbEntry = await prisma.videodb_videodata.findUnique({
      where: { id: created.id },
    });
    expect(dbEntry).toMatchObject(updatedData);
  });

  it("should upsert and replace genre relations when genreIds are provided", async () => {
    const genres = await prisma.videodb_genres.findMany({ take: 3 });
    expect(genres.length).toBeGreaterThanOrEqual(3);

    const created = await upsertVideoData({
      title: "Genre Test",
      year: 2024,
      mediatype: 14,
      owner_id: 2,
      genreIds: [genres[0].id, genres[1].id],
    });
    trackVideo(created.id);

    let genreRows = await prisma.videodb_videogenre.findMany({
      where: { video_id: created.id },
    });
    expect(genreRows.map((row) => row.genre_id).sort()).toEqual(
      [genres[0].id, genres[1].id].sort()
    );

    await upsertVideoData({
      id: created.id,
      title: created.title ?? undefined,
      year: created.year,
      mediatype: created.mediatype,
      owner_id: created.owner_id,
      genreIds: [genres[1].id, genres[2].id],
    });

    genreRows = await prisma.videodb_videogenre.findMany({
      where: { video_id: created.id },
    });
    expect(genreRows.map((row) => row.genre_id).sort()).toEqual(
      [genres[1].id, genres[2].id].sort()
    );
  });

  it("should delete a video data entry", async () => {
    const video = await prisma.videodb_videodata.create({
      data: {
        title: "To Be Deleted",
        year: 2022,
        mediatype: 14,
        owner_id: 2,
      },
    });

    const result = await deleteVideoData(video.id);

    expect(result).toMatchObject({
      id: video.id,
      title: "To Be Deleted",
    });
  });

  it("should throw when deleting a non-existent video data entry", async () => {
    await expect(deleteVideoData(999999)).rejects.toThrow();
  });
});
