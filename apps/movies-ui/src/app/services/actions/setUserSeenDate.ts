"use server";
import { gql, type TypedDocumentNode } from "@apollo/client";
import { getClient } from "../../../lib/apollocient";

// GraphQL mutation
type CreateUserSeenEntryResult = {
  createUserSeenEntry: {
    username: string;
    viewdate: string;
  };
};

type CreateUserSeenEntryVariables = {
  movieId: number;
  userName: string;
  viewDate: string;
  viewGroup: string;
};

const setUserSeenDateMutation: TypedDocumentNode<
  CreateUserSeenEntryResult,
  CreateUserSeenEntryVariables
> = gql`
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

  const variables: CreateUserSeenEntryVariables = {
    movieId,
    userName,
    viewDate,
    viewGroup,
  };

  const response = await client.mutate<CreateUserSeenEntryResult, CreateUserSeenEntryVariables>({
    mutation: setUserSeenDateMutation,
    variables,
  });

  return response.data?.createUserSeenEntry ?? null;
}
