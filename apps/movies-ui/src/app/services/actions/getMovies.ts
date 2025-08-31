"use server";

import { gql, type TypedDocumentNode } from "@apollo/client";

import { getClient } from "../../../lib/apollocient";

// GraphQL query
type GetMoviesResult = {
  videos: {
    videos: Array<{
      title: string;
      diskid?: string;
      genres: string[];
      subtitle: string;
      mediaType: string;
      ownerid: number;
      istv: boolean;
      runtime: number | null;
      rating: string | null;
      id: string;
      plot: string;
    }>;
    requestMeta: {
      totalCount: number;
    };
  };
};

type GetMoviesVariables = {
  title: string;
  diskid: string;
  deleteMode: string; // GraphQL enum DeleteMode
  tvSeriesMode: string; // GraphQL enum TvSeriesMode
  filterFavorites: boolean;
  filterFlagged: boolean;
  mediaType: string[];
  genreName: string[];
  randomOrder: boolean;
  userName: string;
  take: number;
  skip: number;
};

const getMovieByTitle: TypedDocumentNode<GetMoviesResult, GetMoviesVariables> = gql`
  query GetMovies(
    $title: String!,
    $diskid: String!,
    $deleteMode: DeleteMode,
    $tvSeriesMode: TvSeriesMode,
    $filterFavorites: Boolean!,
    $filterFlagged: Boolean!,
    $mediaType: [String!]!,
    $genreName: [String!]!,
    $randomOrder: Boolean!,
    $userName: String!,
    $take: Int!,
    $skip: Int!)
    {
    videos(
      title: $title,
      diskid: $diskid,
      deleteMode: $deleteMode,
      tvSeriesMode: $tvSeriesMode
      filterFavorites: $filterFavorites,
      filterFlagged: $filterFlagged,
      mediaType: $mediaType,
      genreName: $genreName,
      randomOrder: $randomOrder,
      userName: $userName,
      queryPlot: true,
      take: $take,
      skip: $skip)
      {
      videos {
        title
        diskid
        genres
        subtitle
        mediaType
        ownerid
        istv
        runtime
        rating
        id
        plot
      }
      requestMeta {
        totalCount
      }
    }
  }
`;

export async function getMovies(
  searchString: string,
  deleteMode: string,
  tvSeriesMode: string,
  filterFavorites: boolean,
  filterFlagged: boolean,
  filterRandom: boolean,
  mediaType: string[],
  genreName: string[],
  userName: string,
  take: number,
  skip: number) {

  let searchTitle = "";
  let searchDiskId = "";
  const diskidRegex = /^R\d{2}F\d/;

  // Determine if the search string is a title or disk ID
  diskidRegex.test(searchString)
    ? (searchDiskId = searchString)
    : (searchTitle = searchString);

  const variables: GetMoviesVariables = {
    title: searchTitle,
    diskid: searchDiskId,
    deleteMode: deleteMode,
    tvSeriesMode: tvSeriesMode,
    filterFavorites: filterFavorites,
    filterFlagged: filterFlagged,
    mediaType: mediaType,
    genreName: genreName,
    randomOrder: filterRandom,
    userName: userName,
    take: take,
    skip: skip
  };

  // Log the query and variables
  console.log("GraphQL Query:\n", getMovieByTitle.loc?.source.body);
  console.log("Variables:\n", variables);

  const { data, error } = await getClient().query<GetMoviesResult, GetMoviesVariables>({
    query: getMovieByTitle,
    variables,
  });
  if (error) throw new Error(error.message);
  return data;

}
