"use server";

import { gql, type TypedDocumentNode } from "@apollo/client";

import { getClient } from "../../../lib/apollocient";

export type MovieSuggestion = {
  id: string;
  title: string | null;
  subtitle: string | null;
  diskid: string | null;
};

type GetMovieSuggestionsResult = {
  videoSuggestions: MovieSuggestion[];
};

export type GetMovieSuggestionsVariables = {
  query: string;
  deleteMode: string;
  tvSeriesMode: string;
  filterFavorites: boolean;
  filterFlagged: boolean;
  mediaType: string[];
  genreName: string[];
  userName: string;
};

const GET_MOVIE_SUGGESTIONS: TypedDocumentNode<
  GetMovieSuggestionsResult,
  GetMovieSuggestionsVariables
> = gql`
  query GetMovieSuggestions(
    $query: String!
    $deleteMode: DeleteMode
    $tvSeriesMode: TvSeriesMode
    $filterFavorites: Boolean!
    $filterFlagged: Boolean!
    $mediaType: [String!]!
    $genreName: [String!]!
    $userName: String!
  ) {
    videoSuggestions(
      query: $query
      deleteMode: $deleteMode
      tvSeriesMode: $tvSeriesMode
      filterFavorites: $filterFavorites
      filterFlagged: $filterFlagged
      mediaType: $mediaType
      genreName: $genreName
      userName: $userName
    ) {
      id
      title
      subtitle
      diskid
    }
  }
`;

export async function getMovieSuggestions(variables: GetMovieSuggestionsVariables): Promise<MovieSuggestion[]> {
  const { data, error } = await getClient().query<
    GetMovieSuggestionsResult,
    GetMovieSuggestionsVariables
  >({
    query: GET_MOVIE_SUGGESTIONS,
    variables,
  });

  if (error) throw new Error(error.message);
  return data?.videoSuggestions ?? [];
}
