"use server";

import { gql, type TypedDocumentNode } from "@apollo/client";
import type { Movie } from "../../../interfaces/movie";
import { getClient } from "../../../lib/apollocient";

// Result and variables typing
type GetMoviesByIdResult = {
  videos: {
    videos: Movie[];
  };
};

type GetMoviesByIdVariables = {
  ids: string[];
  deleteMode?: string; // matches server enum name DeleteMode in schema
};

// GraphQL query
const getMovieById: TypedDocumentNode<
  GetMoviesByIdResult,
  GetMoviesByIdVariables
> = gql`
  query GetMovies($ids: [String!], $deleteMode: DeleteMode) {
    videos(ids: $ids, queryPlot: true, deleteMode: $deleteMode) {
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
  const { data } = await getClient().query<GetMoviesByIdResult, GetMoviesByIdVariables>({
    query: getMovieById,
    variables: { ids: [id], deleteMode },
  });

  return data?.videos;
}
