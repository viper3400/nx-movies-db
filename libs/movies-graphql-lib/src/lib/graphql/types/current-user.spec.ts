jest.mock("@nx-movies-db/movies-prisma-lib", () => ({
  getUserByEmail: jest.fn(),
  prisma: {},
}));

import { graphql } from "graphql";
import { getUserByEmail } from "@nx-movies-db/movies-prisma-lib";
import { schema } from "../schema";

const getUserByEmailMock = jest.mocked(getUserByEmail);

describe("currentUser query", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns the database user mapped from the verified JWT email", async () => {
    getUserByEmailMock.mockResolvedValue({
      id: 3,
      name: "Jane",
      email: "jane@example.com",
    });

    const result = await graphql({
      schema,
      source: "{ currentUser { id name email } }",
      contextValue: { jwt: { payload: { email: "jane@example.com" } } },
    });

    expect(result).toEqual({
      data: {
        currentUser: {
          id: 3,
          name: "Jane",
          email: "jane@example.com",
        },
      },
    });
    expect(getUserByEmailMock).toHaveBeenCalledWith("jane@example.com");
  });

  it("returns no user when the JWT does not contain an email or no row matches", async () => {
    const missingEmail = await graphql({
      schema,
      source: "{ currentUser { id } }",
      contextValue: { jwt: { payload: {} } },
    });
    expect(missingEmail).toEqual({ data: { currentUser: null } });
    expect(getUserByEmailMock).not.toHaveBeenCalled();

    getUserByEmailMock.mockResolvedValue(null);
    const unknownUser = await graphql({
      schema,
      source: "{ currentUser { id } }",
      contextValue: { jwt: { payload: { email: "unknown@example.com" } } },
    });
    expect(unknownUser).toEqual({ data: { currentUser: null } });
  });
});
