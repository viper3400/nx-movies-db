jest.mock("../../../lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("../../../lib/graphql-auth", () => ({
  signApiToken: jest.fn(),
}));

import { auth } from "../../../lib/auth";
import { signApiToken } from "../../../lib/graphql-auth";
import { getAllowedSession } from "./getAllowedSession";

const authMock = jest.mocked(auth);
const signApiTokenMock = jest.mocked(signApiToken);
const fetchMock = jest.fn();

describe("getAllowedSession", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      TEST_MODE: "false",
      GRAPHQL_URL: "http://movies-service/graphql",
    };
    global.fetch = fetchMock;
    signApiTokenMock.mockResolvedValue("bootstrap-token");
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = originalEnv;
  });

  it("builds the session from the matching database user", async () => {
    authMock.mockResolvedValue({
      user: { email: "jane@example.com", image: "https://example.com/jane.png" },
      expires: "never",
    });
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          currentUser: { id: 3, name: "Jane", email: "jane@example.com" },
        },
      }),
    });

    await expect(getAllowedSession()).resolves.toEqual({
      ownerId: 3,
      userName: "Jane",
      eMail: "jane@example.com",
      avatarUrl: "https://example.com/jane.png",
    });
    expect(signApiTokenMock).toHaveBeenCalledWith({
      sub: undefined,
      email: "jane@example.com",
      name: undefined,
      expiresIn: "1m",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://movies-service/graphql",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("denies an OAuth user without a matching database row", async () => {
    authMock.mockResolvedValue({
      user: { email: "unknown@example.com" },
      expires: "never",
    });
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { currentUser: null } }),
    });

    await expect(getAllowedSession()).resolves.toBeUndefined();
  });

  it("keeps test mode deterministic without OAuth or GraphQL", async () => {
    process.env.TEST_MODE = "true";
    process.env.NEXT_PUBLIC_TEST_USERS = "tester@example.com,Tester,2";

    await expect(getAllowedSession()).resolves.toEqual({
      ownerId: 2,
      userName: "Tester",
      eMail: "tester@example.com",
      avatarUrl: "",
    });
    expect(authMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
