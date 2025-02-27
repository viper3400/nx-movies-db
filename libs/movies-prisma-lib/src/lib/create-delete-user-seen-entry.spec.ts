import { createUserSeenEntry, deleteUserSeenEntry, getSeenDates } from ".";
import prisma from "./prisma-client";

describe("create seen date", () => {
  it("should create & delete seen date for a user in a viewgroup at a given date", async () => {
    const userName = "user.seen";
    const viewGroup = "group_a";
    const movieId = 50;
    const viewDate = new Date(Date.UTC(2022, 10, 5, 0, 0, 0));

    // create entry
    const createResult = await createUserSeenEntry({ movieId, userName, viewGroup, viewDate });
    expect(createResult).toMatchObject({
      vdb_videoid: movieId,
      asp_viewgroup: viewGroup,
      asp_username: userName,
      viewdate: viewDate
    });

    // check that entry exists
    let seenDate = await getSeenDates({ movieId, viewGroup }, undefined);
    expect(seenDate.length).toBe(1);
    // delete entry
    await deleteUserSeenEntry({ movieId, viewGroup, viewDate });
    // check that entry does not exist
    seenDate = await getSeenDates({ movieId, viewGroup }, undefined);
    expect(seenDate.length).toBe(0);

  });

  it("should not allow to create seen date twice a day for a viewgroup", async () => {
    const userNameA = "user.seenA";
    const userNameB = "user.seenB";
    const viewGroup = "group_b";
    const movieId = 52;
    const viewDate = new Date(Date.UTC(2022, 10, 5, 0, 0, 0));

    // create entry 1
    const createResultOne = await createUserSeenEntry({
      movieId: movieId,
      userName: userNameA,
      viewGroup: viewGroup,
      viewDate: viewDate
    });

    expect(createResultOne).toMatchObject({
      vdb_videoid: movieId,
      asp_viewgroup: viewGroup,
      asp_username: userNameA,
      viewdate: viewDate
    });

    // create entry 2
    expect(createUserSeenEntry({
      movieId: movieId,
      userName: userNameB,
      viewGroup: viewGroup,
      viewDate: viewDate
    })).rejects.toThrow();


    // check that entry exists
    let seenDate = await getSeenDates({ movieId, viewGroup }, undefined);
    expect(seenDate.length).toBe(1);
    // delete entry
    await deleteUserSeenEntry({ movieId, viewGroup, viewDate });
    // check that entry does not exist
    seenDate = await getSeenDates({ movieId, viewGroup }, undefined);

    expect(seenDate.length).toBe(0);

  });

  it("should raise an error if viewgroup, date, movie deletion would delete more than one entry", async () => {
    // this should not be the case, as just one entry per day, per viewgroup is allowed, but just to be sure

    const movieId = 90;
    const viewGroup = "double_deletion";
    const viewDate = new Date(Date.UTC(2022, 10, 5, 0, 0, 0));
    const userName = "hans.dampf";
    await prisma.homewebbridge_userseen.createMany({
      data: [{
        vdb_videoid: movieId,
        viewdate: viewDate,
        asp_viewgroup: viewGroup,
        asp_username: userName
      }, {
        vdb_videoid: movieId,
        viewdate: viewDate,
        asp_viewgroup: viewGroup,
        asp_username: userName
      },
      ]
    });

    await expect(deleteUserSeenEntry({ movieId, viewGroup, viewDate })).rejects.toThrow();

    await prisma.homewebbridge_userseen.deleteMany({
      where: {
        vdb_videoid: movieId,
        viewdate: viewDate,
        asp_viewgroup: viewGroup,
        asp_username: userName
      }
    });

  });
});
