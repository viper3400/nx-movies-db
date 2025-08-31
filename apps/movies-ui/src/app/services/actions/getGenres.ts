"use server";

import { gql, type TypedDocumentNode } from "@apollo/client";
import type { GraphQLError } from "graphql";

import { getClient } from "../../../lib/apollocient";

type GetGenresResult = {
  genres: Array<{ id: number; name: string }>;
};

// GraphQL query
const getGenresQuery: TypedDocumentNode<GetGenresResult> = gql`
  query GetGenres {
    genres {
      id
      name
    }
  }
`;

export async function getGenres(): Promise<GetGenresResult> {
  const { data } = await getClient().query<GetGenresResult>({
    query: getGenresQuery,
  });
  return data ? data : { genres: [] };
}
