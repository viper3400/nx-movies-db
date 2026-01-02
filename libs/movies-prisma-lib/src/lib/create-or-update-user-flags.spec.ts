import { prisma } from "../prismaclient";
import { createOrUpdateUserFlag } from "./create-or-update-user-flags";

describe("createOrUpdateUserFlag integration tests", () => {
  beforeAll(async () => {
    // Optionally, set up any necessary test data or database state
  });

  afterAll(async () => {
    // Clean up any test data or database state
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up the test data after each test
    await prisma.homewebbridge_usermoviesettings.deleteMany({
      where: {
        asp_username: "hans.dampf",
      },
    });
  });

  it("should create a new flag when no existing entry is found", async () => {
    const result = await createOrUpdateUserFlag({
      movieId: 101,
      isWatchAgain: false,
      isFavorite: true,
      userName: "hans.dampf",
    });

    expect(result).toMatchObject({
      vdb_movieid: 101,
      watchagain: false,
      is_favorite: true,
      asp_username: "hans.dampf",
    });

    // Verify the entry in the database
    const dbEntry = await prisma.homewebbridge_usermoviesettings.findUnique({
      where: { id: result.id },
    });

    expect(dbEntry).toMatchObject({
      vdb_movieid: 101,
      watchagain: false,
      is_favorite: true,
      asp_username: "hans.dampf",
    });
  });

  it("should update an existing flag when an entry is found", async () => {
    // Create an initial entry
    const initialEntry = await prisma.homewebbridge_usermoviesettings.create({
      data: {
        vdb_movieid: 102,
        watchagain: true,
        is_favorite: false,
        asp_username: "hans.dampf",
      },
    });

    const result = await createOrUpdateUserFlag({
      movieId: 102,
      isWatchAgain: false,
      isFavorite: true,
      userName: "hans.dampf",
    });

    expect(result).toMatchObject({
      id: initialEntry.id,
      vdb_movieid: 102,
      watchagain: false,
      is_favorite: true,
      asp_username: "hans.dampf",
    });

    // Verify the updated entry in the database
    const dbEntry = await prisma.homewebbridge_usermoviesettings.findUnique({
      where: { id: result.id },
    });

    expect(dbEntry).toMatchObject({
      vdb_movieid: 102,
      watchagain: false,
      is_favorite: true,
      asp_username: "hans.dampf",
    });
  });

  it("should delete an existing flag when both isWatchAgain and isFavorite are false", async () => {
    // Create an initial entry
    const initialEntry = await prisma.homewebbridge_usermoviesettings.create({
      data: {
        vdb_movieid: 103,
        watchagain: true,
        is_favorite: true,
        asp_username: "hans.dampf",
      },
    });

    const result = await createOrUpdateUserFlag({
      movieId: 103,
      isWatchAgain: false,
      isFavorite: false,
      userName: "hans.dampf",
    });

    expect(result).toBeNull();

    // Verify the entry is deleted from the database
    const dbEntry = await prisma.homewebbridge_usermoviesettings.findUnique({
      where: { id: initialEntry.id },
    });

    expect(dbEntry).toBeNull();
  });

  it("should handle errors gracefully", async () => {
    // Simulate an error by providing invalid data
    await expect(
      createOrUpdateUserFlag({
        movieId: null as any, // Invalid movieId
        isWatchAgain: false,
        isFavorite: true,
        userName: "hans.dampf",
      })
    ).rejects.toThrow();

    // Ensure no entry was created in the database
    const dbEntries = await prisma.homewebbridge_usermoviesettings.findMany({
      where: {
        asp_username: "hans.dampf",
      },
    });

    expect(dbEntries).toHaveLength(0);
  });
});
