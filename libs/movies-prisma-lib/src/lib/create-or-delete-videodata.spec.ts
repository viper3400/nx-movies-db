import { PrismaClient } from "@prisma/client";
import { upsertVideoData } from "./create-or-update-videodata";
import { deleteVideoData } from "./delete-videodata";

const prisma = new PrismaClient();

describe("createOrDeleteVideoData integration tests", () => {
  let testVideoId: number;

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    if (testVideoId) {
      await prisma.videodb_videodata.deleteMany({
        where: { id: testVideoId },
      });
    }
  });

  it("should create a new video data entry if it does not exist", async () => {
    const videoData = {
      title: "Test Movie",
      year: 2024,
      mediatype: 14,
      owner_id: 2
      // add other required fields as needed for your schema
    };

    const result = await upsertVideoData(videoData);

    expect(result).toMatchObject({
      title: "Test Movie",
      year: 2024,
      mediatype: 14,
      owner_id: 2
    });

    testVideoId = result.id; // Save the generated id for cleanup

    // Verify in DB
    const dbEntry = await prisma.videodb_videodata.findUnique({
      where: { id: result.id },
    });
    expect(dbEntry).toMatchObject({
      title: "Test Movie",
      year: 2024,
      mediatype: 14,
      owner_id: 2
    });
  });

  it("should update an existing video data entry", async () => {
    // Create initial entry
    await prisma.videodb_videodata.create({
      data: {
        id: testVideoId,
        title: "Old Title",
        year: 2020,
        mediatype: 14,
        owner_id: 2
      },
    });

    const updatedData = {
      id: testVideoId,
      title: "Updated Title",
      year: 2025,
      mediatype: 14,
      owner_id: 2
    };

    const result = await upsertVideoData(updatedData);

    expect(result).toMatchObject({
      id: testVideoId,
      title: "Updated Title",
      year: 2025,
      mediatype: 14,
      owner_id: 2
    });

    // Verify in DB
    const dbEntry = await prisma.videodb_videodata.findUnique({
      where: { id: testVideoId },
    });
    expect(dbEntry).toMatchObject({
      id: testVideoId,
      title: "Updated Title",
      year: 2025,
      mediatype: 14,
      owner_id: 2
    });
  });

  it("should delete a video data entry", async () => {
    // Create initial entry
    await prisma.videodb_videodata.create({
      data: {
        id: testVideoId,
        title: "To Be Deleted",
        year: 2022,
        mediatype: 14,
        owner_id: 2
      },
    });

    const result = await deleteVideoData(testVideoId);

    expect(result).toMatchObject({
      id: testVideoId,
      title: "To Be Deleted",
      year: 2022,
      mediatype: 14,
      owner_id: 2
    });

    // Verify deletion
    const dbEntry = await prisma.videodb_videodata.findUnique({
      where: { id: testVideoId },
    });
    expect(dbEntry).toBeNull();
  });

  it("should throw when deleting a non-existent video data entry", async () => {
    await expect(deleteVideoData(999999)).rejects.toThrow();
  });
});
