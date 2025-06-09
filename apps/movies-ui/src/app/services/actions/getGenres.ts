"use server";

import { gql } from "@apollo/client";

import { getClient } from "../../../lib/apollocient";

// GraphQL query
const getGenresQuery = gql`
  query GetGenres {
    genres {
      id
      name
    }
  }
`;

export async function getGenres() {

  const { data } = await getClient().query({
    query: getGenresQuery,
  });

  const result = await data;
  return result;
}
