"use server";

import { gql, type TypedDocumentNode } from "@apollo/client";
import { getClient } from "../../../lib/apollocient";

type GetOwnersResult = {
  owners: Array<{ id: number; name: string }>;
};

const getOwnersQuery: TypedDocumentNode<GetOwnersResult> = gql`
  query GetOwners {
    owners {
      id
      name
    }
  }
`;

export async function getOwners(): Promise<GetOwnersResult> {
  const { data } = await getClient().query<GetOwnersResult>({
    query: getOwnersQuery,
  });
  return data ? data : { owners: [] };
}
