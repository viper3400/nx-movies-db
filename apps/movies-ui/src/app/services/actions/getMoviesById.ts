"use server";

import { gql } from "@apollo/client";

import { getClient } from "../../../lib/apollocient";

// GraphQL query
const getMovieById = gql`
  query GetMovies($ids: [String!]) {
    videos(ids: $ids, queryPlot: true) {
      videos {
        title
        diskid
        genres
        subtitle
        mediaType
        ownerid
        rating
        runtime
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
    variables: { ids: [id], deleteMode: deleteMode },
  });

  const result = await data;

  return result.videos;
}
