"use server";

import { gql } from "@apollo/client";

import { getClient } from "../../../lib/apollocient";

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
  return result.userFlagsForUser;
}
