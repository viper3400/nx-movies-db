"use server";
import { gql } from "@apollo/client";
import { getClient } from "../../../lib/apollocient";

// GraphQL mutation
const setUserFlagsMutation = gql`
  mutation CreateOrUpdateUserFlag(
    $movieId: Int!
    $isFavorite: Boolean!
    $isWatchAgain: Boolean!
    $userName: String!
  ) {
    createOrUpdateUserFlag(
      movieId: $movieId
      isFavorite: $isFavorite
      isWatchAgain: $isWatchAgain
      userName: $userName
    ) {
      movieId
    }
  }
`;

export async function updateUserFlags(
  movieId: number,
  isFavorite: boolean,
  isWatchAgain: boolean,
  username: string
) {
  const client = getClient();

  const variables = {
    movieId,
    isFavorite,
    isWatchAgain,
    userName: username,
  };

  try {
    const response = await client.mutate({
      mutation: setUserFlagsMutation,
      variables,
    });

    return response.data.createOrUpdateUserFlag;
  } catch (error) {
    console.error("Error setting user flags:", error);
    throw error;
  }
}
