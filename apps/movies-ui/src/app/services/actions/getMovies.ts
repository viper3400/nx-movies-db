"use server";

import { gql } from "@apollo/client";

import { getClient } from "../../../lib/apollocient";

// GraphQL query
const getMovieByTitle = gql`
  query GetMovies(
    $title: String!,
    $diskid: String!,
    $deleteMode: DeleteMode,
    $tvSeriesMode: TvSeriesMode,
    $filterFavorites: Boolean!,
    $filterFlagged: Boolean!,
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

  const { data } = await getClient().query({
    query: getMovieByTitle,
    variables: {
      title: searchTitle,
      diskid: searchDiskId,
      deleteMode: deleteMode,
      tvSeriesMode: tvSeriesMode,
      filterFavorites: filterFavorites,
      filterFlagged: filterFlagged,
      randomOrder: filterRandom,
      userName: userName,
      take: take,
      skip: skip
    },
  });

  const result = await data;

  return result;
}
