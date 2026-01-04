import { createUserSeenEntry, deleteUserSeenEntry, getSeenDates } from ".";
import { prisma } from "../prismaclient";

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
    await expect(createUserSeenEntry({
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

  it("should delete a user seen entry for a viewgroup and movie even if the date part differs", async () => {
    const movieId = 80;
    const viewDate = new Date(Date.UTC(2022, 10, 5, 20, 0, 0));
    const viewGroup = "diffent_time_part_group";
    const userName = "hans.dampf";

    await prisma.homewebbridge_userseen.create({
      data: {
        vdb_videoid: movieId,
        viewdate: viewDate,
        asp_viewgroup: viewGroup,
        asp_username: userName
      }
    });

    await deleteUserSeenEntry({ movieId, viewGroup, viewDate });
    const resultAfterDeletion = await getSeenDates({
      movieId: movieId,
      viewGroup: viewGroup
    }, undefined);

    expect(resultAfterDeletion.length).toBe(0);
  });
  it("should not allow to create seen date twice a day for a viewgroup, even if dates have different time parts", async () => {
    const userNameA = "user.seenA";
    const userNameB = "user.seenB";
    const viewGroup = "group_b_diff";
    const movieId = 52;
    const viewDateA = new Date(Date.UTC(2022, 10, 5, 0, 0, 0));
    const viewDateB = new Date(Date.UTC(2022, 10, 5, 12, 30, 0));
    // create entry 1
    const createResultOne = await createUserSeenEntry({
      movieId: movieId,
      userName: userNameA,
      viewGroup: viewGroup,
      viewDate: viewDateA
    });

    expect(createResultOne).toMatchObject({
      vdb_videoid: movieId,
      asp_viewgroup: viewGroup,
      asp_username: userNameA,
      viewdate: viewDateA
    });

    // create entry 2
    await expect(createUserSeenEntry({
      movieId: movieId,
      userName: userNameB,
      viewGroup: viewGroup,
      viewDate: viewDateB
    })).rejects.toThrow();


    // check that entry exists
    let seenDate = await getSeenDates({ movieId, viewGroup }, undefined);
    expect(seenDate.length).toBe(1);
    // delete entry
    await deleteUserSeenEntry({ movieId: movieId, viewGroup: viewGroup, viewDate: viewDateA });
    // check that entry does not exist
    seenDate = await getSeenDates({ movieId, viewGroup }, undefined);

    expect(seenDate.length).toBe(0);

  });

  it("should raise an error if viewgroup, date, movie deletion would delete more than one entry, even if dates have different time parts", async () => {
    // this should not be the case, as just one entry per day, per viewgroup is allowed, but just to be sure

    const movieId = 90;
    const viewGroup = "double_deletion_diff";
    const viewDateA = new Date(Date.UTC(2022, 10, 5, 0, 0, 0));
    const viewDateB = new Date(Date.UTC(2022, 10, 5, 23, 10, 0));
    const userName = "hans.dampf";
    await prisma.homewebbridge_userseen.createMany({
      data: [{
        vdb_videoid: movieId,
        viewdate: viewDateA,
        asp_viewgroup: viewGroup,
        asp_username: userName
      }, {
        vdb_videoid: movieId,
        viewdate: viewDateB,
        asp_viewgroup: viewGroup,
        asp_username: userName
      },
      ]
    });

    await expect(deleteUserSeenEntry({ movieId: movieId, viewGroup: viewGroup, viewDate: viewDateA })).rejects.toThrow();

    await prisma.homewebbridge_userseen.deleteMany({
      where: {
        vdb_videoid: movieId,
        viewdate: viewDateA,
        asp_viewgroup: viewGroup,
        asp_username: userName
      }
    });
    await prisma.homewebbridge_userseen.deleteMany({
      where: {
        vdb_videoid: movieId,
        viewdate: viewDateB,
        asp_viewgroup: viewGroup,
        asp_username: userName
      }
    });

  });
});
