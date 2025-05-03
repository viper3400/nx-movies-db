"use server";

import { gql } from "@apollo/client";
import { getClient } from "../../../lib/apollocient";



// GraphQL query
const getSeenVideosGql = gql`
  query GetSeenVideos(
    $viewGroup: String,
    $fromDate: String!,
    $toDate: String!,
    $take: Int!,
    $skip: Int!)
    {
      seenVideos(
        viewGroup: $viewGroup,
        fromDate: $fromDate,
        toDate: $toDate,
        take: $take,
        skip: $skip) {
      requestMeta {
      totalCount
      }
      SeenEntries {
        movieId
        userName
        viewDate
      }
      }
  }
`;

export async function getSeenVideos(
  viewGroup: string,
  fromDate: string,
  ToDate: string,
  take: number,
  skip: number) {

  const { data } = await getClient().query({
    query: getSeenVideosGql,
    variables: {
      viewGroup: viewGroup,
      fromDate: fromDate,
      toDate: ToDate,
      take: take,
      skip: skip
    },
  });

  const result = await data;

  return result;
}
