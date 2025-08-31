"use server";
import { gql, type TypedDocumentNode } from "@apollo/client";
import type { GraphQLError } from "graphql";
import { getClient } from "../../../lib/apollocient";

// GraphQL mutation
type UpdateUserFlagsResult = {
  createOrUpdateUserFlag: {
    movieId: number;
  };
};

type UpdateUserFlagsVariables = {
  movieId: number;
  isFavorite: boolean;
  isWatchAgain: boolean;
  userName: string;
};

const setUserFlagsMutation: TypedDocumentNode<
  UpdateUserFlagsResult,
  UpdateUserFlagsVariables
> = gql`
  mutation CreateOrUpdateUserFlag($movieId: Int!, $isFavorite: Boolean!, $isWatchAgain: Boolean!, $userName: String!) {
    createOrUpdateUserFlag(movieId: $movieId, isFavorite: $isFavorite, isWatchAgain: $isWatchAgain, userName: $userName) {
      movieId
    }
  }
`;

export async function updateUserFlags(movieId: number, isFavorite: boolean, isWatchAgain: boolean, username: string) {
  const client = getClient();

  const variables: UpdateUserFlagsVariables = {
    movieId,
    isFavorite,
    isWatchAgain,
    userName: username,
  };

  const response = await client.mutate<UpdateUserFlagsResult, UpdateUserFlagsVariables>({
    mutation: setUserFlagsMutation,
    variables,
  });

  return response.data?.createOrUpdateUserFlag ?? null;
}
