"use server";
import { gql } from "@apollo/client";
import { getClient } from "../../../lib/apollocient";

// GraphQL mutation
const setUserSeenDateMutation = gql`
  mutation CreateUserSeenEntry($movieId: Int!, $userName: String!, $viewDate: String!, $viewGroup: String!) {
    createUserSeenEntry(movieId: $movieId, userName: $userName, viewDate: $viewDate, viewGroup: $viewGroup) {
      username
      viewdate
    }
  }
`;

export async function setUserSeenDate(
  movieId: number,
  userName: string,
  viewDate: string,
  viewGroup: string) {
  const client = getClient();

  const variables = {
    movieId,
    userName,
    viewDate,
    viewGroup,
  };

  try {
    const response = await client.mutate({
      mutation: setUserSeenDateMutation,
      variables,
    });

    return response.data.createUserSeenEntry;
  } catch (error) {
    console.error("Error setting user seen date:", error);
    throw error;
  }
}

