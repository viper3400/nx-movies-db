"use server";

import { gql } from "@apollo/client";

import { getClient } from "../../../lib/apollocient";
//import { UserFlagsDTO } from "apps/movies-ui/src/interfaces";

// GraphQL query
const getUserFlagsQuery = gql`
  query UserFlagsForMovie($movieId: Int, $userName: String) {
    userFlagsForUser(movieId: $movieId, userName: $userName) {
      movieId
      isWatchAgain
      isFavorite
    }
  }
`;

export async function getUserFlagsForMovie(movieId: string, userName: string) {
  const { data } = await getClient().query({
    query: getUserFlagsQuery,
    variables: { movieId: parseInt(movieId), userName: userName },
  });

  const result = await data;
  console.log(result.userFlagsForUser);
  const flags =
    result.userFlagsForUser.length > 0
      ? {
          movieId: movieId,
          isFavorite: result.userFlagsForUser[0].isFavorite,
          isWatchAgain: result.userFlagsForUser[0].isWatchAgain,
        }
      : { movieId: movieId, isFavorite: false, isWatchAgain: false };
  return flags;
}
