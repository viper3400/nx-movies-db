"use server";

import { gql } from "@apollo/client";

import { getClient } from "../../../lib/apollocient";

// GraphQL query
const getSeenDateQuery = gql`
  query GetSeenDates($movieId: Int, $viewGroup: String) {
    seenData(movieId: $movieId, viewGroup: $viewGroup) {
      viewdate
    }
  }
`;

export async function getSeenDates(
  movieId: string,
  viewGroup: string
): Promise<string[]> {
  const { data } = await getClient().query({
    query: getSeenDateQuery,
    variables: { movieId: parseInt(movieId), viewGroup: viewGroup },
  });

  const result = await data;
  return result.seenData.map((v: any) => v.viewdate);
}
