"use server";
import { gql, type TypedDocumentNode } from "@apollo/client";
import { getClient } from "../../../lib/apollocient";

// GraphQL mutation
type DeleteUserSeenEntryResult = {
  deleteUserSeenEntry: {
    username: string;
    viewdate: string;
  };
};

type DeleteUserSeenEntryVariables = {
  movieId: number;
  viewDate: string;
  viewGroup: string;
};

const deleteUserSeenDateMutation: TypedDocumentNode<
  DeleteUserSeenEntryResult,
  DeleteUserSeenEntryVariables
> = gql`
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

  const variables: DeleteUserSeenEntryVariables = {
    movieId,
    viewDate,
    viewGroup,
  };

  try {
    const response = await client.mutate<DeleteUserSeenEntryResult, DeleteUserSeenEntryVariables>({
      mutation: deleteUserSeenDateMutation,
      variables,
    });

    return response.data?.deleteUserSeenEntry ?? null;
  } catch (error) {
    console.error("Error deleting user seen date:", error);
    throw error;
  }
}
