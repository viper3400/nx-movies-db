"use server";

import { gql, type TypedDocumentNode } from "@apollo/client";

import { getClient } from "../../../lib/apollocient";

type GetMediaTypesResult = {
  mediaTypes: Array<{ id: number; name: string }>;
};

// GraphQL query
const getMediaTypesQuery: TypedDocumentNode<GetMediaTypesResult> = gql`
  query GetMediaType {
    mediaTypes {
      id
      name
    }
  }
`;

export async function getMediaTypes(): Promise<GetMediaTypesResult> {
  const { data } = await getClient().query<GetMediaTypesResult>({
    query: getMediaTypesQuery,
  });
  return data ? data : { mediaTypes: [] };
}
