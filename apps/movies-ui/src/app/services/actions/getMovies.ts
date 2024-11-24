"use server";

import { gql } from "@apollo/client";

import { getClient } from "../../../lib/apollocient";

// GraphQL query
const getMovieByTitle = gql`
  query GetMovies($title: String!, $diskid: String!) {
    videos(title: $title, diskid: $diskid) {
      title
      diskid
      genres
      subtitle
      mediaType
      ownerid
      id
    }
  }
`;

export async function getMovies(searchString: string) {
  let searchTitle = "";
  let searchDiskId = "";
  const diskidRegex = /^R\d{2}F\d/;

  // Determine if the search string is a title or disk ID
  diskidRegex.test(searchString)
    ? (searchDiskId = searchString)
    : (searchTitle = searchString);

  const { data } = await getClient().query({
    query: getMovieByTitle,
    variables: { title: searchTitle, diskid: searchDiskId },
  });

  const result = await data;

  return result.videos;
}
