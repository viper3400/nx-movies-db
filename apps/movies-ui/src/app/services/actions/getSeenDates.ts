"use server";

import { gql, type TypedDocumentNode } from "@apollo/client";

import { getClient } from "../../../lib/apollocient";

type GetSeenDatesResult = {
  seenData: { viewdate: string }[];
};

type GetSeenDatesVariables = {
  movieId: number;
  viewGroup: string;
};

// GraphQL query
const getSeenDateQuery: TypedDocumentNode<
  GetSeenDatesResult,
  GetSeenDatesVariables
> = gql`
  query GetSeenDates($movieId: Int, $viewGroup: String) {
    seenData(movieId: $movieId, viewGroup: $viewGroup, sortOrder: "desc") {
      viewdate
    }
  }
`;

export async function getSeenDates(movieId: string, viewGroup: string): Promise<string[]> {
  try {
    const { data } = await getClient().query<GetSeenDatesResult, GetSeenDatesVariables>({
      query: getSeenDateQuery,
      variables: { movieId: parseInt(movieId, 10), viewGroup },
    });
    return data?.seenData ? data.seenData.map((v) => v.viewdate) : [];
  } catch (err) {
    const error = err as { graphQLErrors?: { message: any }[]; networkError?: any };
    const gqlMsgs = error.graphQLErrors?.map((e: { message: any; }) => e.message).join(", ") || "";
    const netMsg = error.networkError ? String(error.networkError) : "";
    const message = [gqlMsgs, netMsg].filter(Boolean).join(" | ") || "Unknown Apollo error";
    throw new Error(`GetSeenDates failed: ${message}`);
  }
}
