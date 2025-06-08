"use server";

import { gql } from "@apollo/client";

import { getClient } from "../../../lib/apollocient";

// GraphQL query
const getMediaTypesQuery = gql`
  query GetMediaType {
    mediaTypes {
      id
      name
    }
  }
`;

export async function getMediaTypes() {

  const { data } = await getClient().query({
    query: getMediaTypesQuery,
  });

  const result = await data;
  return result;
}
