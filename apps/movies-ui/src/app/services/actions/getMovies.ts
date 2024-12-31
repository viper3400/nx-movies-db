"use server";

import { gql } from "@apollo/client";

import { getClient } from "../../../lib/apollocient";

// GraphQL query
const getMovieByTitle = gql`
  query GetMovies($title: String!, $diskid: String!, $deleteMode: DeleteMode) {
    videos(title: $title, diskid: $diskid, deleteMode: $deleteMode, queryPlot: true) {
      title
      diskid
      genres
      subtitle
      mediaType
      ownerid
      id
      plot
    }
  }
`;

export async function getMovies(searchString: string, deleteMode: string) {
  let searchTitle = "";
  let searchDiskId = "";
  const diskidRegex = /^R\d{2}F\d/;

  // Determine if the search string is a title or disk ID
  diskidRegex.test(searchString)
    ? (searchDiskId = searchString)
    : (searchTitle = searchString);

  const { data } = await getClient().query({
    query: getMovieByTitle,
    variables: { title: searchTitle, diskid: searchDiskId, deleteMode: deleteMode },
  });

  const result = await data;

  return result.videos;
}
