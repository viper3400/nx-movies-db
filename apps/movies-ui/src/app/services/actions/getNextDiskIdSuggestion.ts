"use server";

import { gql, type TypedDocumentNode } from "@apollo/client";
import { getClient } from "../../../lib/apollocient";

type GetNextDiskIdSuggestionResult = {
  nextDiskIdSuggestion: string | null;
};

type GetNextDiskIdSuggestionVariables = {
  prefix: string;
  currentVideoId?: number | null;
};

const GET_NEXT_DISK_ID_SUGGESTION: TypedDocumentNode<
  GetNextDiskIdSuggestionResult,
  GetNextDiskIdSuggestionVariables
> = gql`
  query GetNextDiskIdSuggestion($prefix: String!, $currentVideoId: Int) {
    nextDiskIdSuggestion(prefix: $prefix, currentVideoId: $currentVideoId)
  }
`;

export async function getNextDiskIdSuggestion(
  prefix: string,
  currentVideoId?: number | null
): Promise<GetNextDiskIdSuggestionResult> {
  const { data } = await getClient().query<
    GetNextDiskIdSuggestionResult,
    GetNextDiskIdSuggestionVariables
  >({
    query: GET_NEXT_DISK_ID_SUGGESTION,
    variables: {
      prefix,
      currentVideoId,
    },
    fetchPolicy: "no-cache",
  });

  return data ?? { nextDiskIdSuggestion: null };
}
