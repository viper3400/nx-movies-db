"use server";

import { gql } from "@apollo/client";

import { getClient } from "../../../lib/apollocient";

// GraphQL query
const getMovieById = gql`
  query GetMovies($id: String) {
    videos(id: $id, queryPlot: true) {
      videos {
        title
        diskid
        genres
        subtitle
        mediaType
        ownerid
        istv
        id
        plot
      }
    }
  }
`;

export async function getMoviesById(id: string, deleteMode: string) {

  const { data } = await getClient().query({
    query: getMovieById,
    variables: { id: id, deleteMode: deleteMode },
  });

  const result = await data;

  return result.videos;
}
