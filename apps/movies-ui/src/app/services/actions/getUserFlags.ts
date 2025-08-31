"use server";

import { gql, type TypedDocumentNode } from "@apollo/client";
import type { GraphQLError } from "graphql";

import { getClient } from "../../../lib/apollocient";

type UserFlagsForMovieResult = {
  userFlagsForUser: Array<{
    movieId: number;
    isWatchAgain: boolean;
    isFavorite: boolean;
  }>;
};

type UserFlagsForMovieVariables = {
  movieId: number;
  userName: string;
};

// GraphQL query
const getUserFlagsQuery: TypedDocumentNode<
  UserFlagsForMovieResult,
  UserFlagsForMovieVariables
> = gql`
  query UserFlagsForMovie($movieId: Int, $userName: String) {
    userFlagsForUser(movieId: $movieId, userName: $userName) {
      movieId
      isWatchAgain
      isFavorite
    }
  }
`;

export async function getUserFlagsForMovie(movieId: string, userName: string): Promise<{ movieId: string; isFavorite: boolean; isWatchAgain: boolean; }> {
  try {
    const { data } = await getClient().query<UserFlagsForMovieResult, UserFlagsForMovieVariables>({
      query: getUserFlagsQuery,
      variables: { movieId: parseInt(movieId, 10), userName },
    });

    const first = data?.userFlagsForUser[0];
    return first
      ? { movieId, isFavorite: first.isFavorite, isWatchAgain: first.isWatchAgain }
      : { movieId, isFavorite: false, isWatchAgain: false };
  } catch (err: unknown) {
    const gqlErr = err as GraphQLError;
    const gqlMsgs = (gqlErr as any).graphQLErrors?.map((e: GraphQLError) => e.message).join(", ") || "";
    const netMsg = (gqlErr as any).networkError ? String((gqlErr as any).networkError) : "";
    const message = [gqlMsgs, netMsg].filter(Boolean).join(" | ") || "Unknown Apollo error";
    throw new Error(`GetUserFlagsForMovie failed: ${message}`);
  }
}
