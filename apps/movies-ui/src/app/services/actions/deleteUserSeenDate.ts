"use server";
import { gql } from "@apollo/client";
import { getClient } from "../../../lib/apollocient";

// GraphQL mutation
const deleteUserSeenDateMutation = gql`
  mutation DeleteUserSeenEntry($movieId: Int!, $viewDate: String!, $viewGroup: String!) {
    deleteUserSeenEntry(movieId: $movieId, viewDate: $viewDate, viewGroup: $viewGroup) {
      username
      viewdate
    }
  }
`;

export async function deleteUserSeenDate(
  movieId: number,
  viewDate: string,
  viewGroup: string) {
  const client = getClient();

  const variables = {
    movieId,
    viewDate,
    viewGroup,
  };

  try {
    const response = await client.mutate({
      mutation: deleteUserSeenDateMutation,
      variables,
    });

    return response.data.createUserSeenEntry;
  } catch (error) {
    console.error("Error deleting user seen date:", error);
    throw error;
  }
}

