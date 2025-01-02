import { getUserFlagsForUser, UserFlagsForMovieArgs } from "./get-user-flags";

describe('Get User Flags', () => {
  const userNames = ["User 1", "User 2"];

  // Test cases for different user combinations
  const testCases = [
    {
      description: '1) Neither User 1 nor User 2 has marked this movie as a favorite and neither intends to watch it again.',
      movieId: 1,
      expected: [
        { isResultExpected: false, isFavorite: false, isWatchAgain: false }, // User 1
        { isResultExpected: false, isFavorite: false, isWatchAgain: false }, // User 2
      ],
    },
    {
      description: '2) User 1 has marked this movie as a favorite and intends to watch it again; User 2 has not marked it as a favorite but wants to watch it again.',
      movieId: 4,
      expected: [
        { isResultExpected: true, isFavorite: true, isWatchAgain: true }, // User 1
        { isResultExpected: true, isFavorite: false, isWatchAgain: true }, // User 2
      ],
    },
    {
      description: '3) Both User 1 and User 2 have marked this movie as a favorite; User 2 does not plan to watch it again.',
      movieId: 5,
      expected: [
        { isResultExpected: true, isFavorite: true, isWatchAgain: true }, // User 1
        { isResultExpected: true, isFavorite: true, isWatchAgain: false }, // User 2
      ],
    },
    {
      description: '4) User 1 does not consider this movie a favorite but is willing to watch it again; User 2 has marked it as a favorite and intends to watch it again.',
      movieId: 6,
      expected: [
        { isResultExpected: true, isFavorite: false, isWatchAgain: true }, // User 1
        { isResultExpected: true, isFavorite: true, isWatchAgain: true }, // User 2
      ],
    },
    {
      description: '5) Both User 1 and User 2 have marked this movie as a favorite; User 1 does not plan to watch it again, but User 2 intends to watch it again.',
      movieId: 7,
      expected: [
        { isResultExpected: true, isFavorite: true, isWatchAgain: false }, // User 1
        { isResultExpected: true, isFavorite: true, isWatchAgain: true }, // User 2
      ],
    },
  ];

  const assertUserFlags = async (userName, expected) => {
    const args: UserFlagsForMovieArgs = { movieId: expected.movieId, userName };
    const query = undefined;

    const result = await getUserFlagsForUser(args, query);
    if (expected.isResultExpected) {
      expect(result.length).toEqual(1);
      expect(result[0].watchagain).toEqual(expected.isWatchAgain);
      expect(result[0].is_favorite).toEqual(expected.isFavorite);
      expect(result[0].asp_username).toEqual(userName);
    } else {
      expect(result.length).toEqual(0);
    }
  };

  testCases.forEach(({ description, movieId, expected }) => {
    test(description, async () => {
      for (let i = 0; i < userNames.length; i++) {
        await assertUserFlags(userNames[i], { ...expected[i], movieId });
      }
    });
  });
});
