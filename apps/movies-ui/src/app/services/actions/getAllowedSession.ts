import { signApiToken } from "../../../lib/graphql-auth";
import { parseUserString } from "../../../lib/allowed-user-parser";
import { MoviesDbSession } from "../../../interfaces";

const CURRENT_USER_QUERY = `
  query CurrentUser {
    currentUser {
      id
      name
      email
    }
  }
`;

interface CurrentUserResponse {
  data?: {
    currentUser?: {
      id: number;
      name: string;
      email: string | null;
    } | null;
  };
}

async function getCurrentUser(email: string) {
  const token = await signApiToken({
    sub: undefined,
    email,
    name: undefined,
    expiresIn: "1m",
  });

  const response = await fetch(process.env.GRAPHQL_URL!, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: CURRENT_USER_QUERY }),
    cache: "no-store",
  });

  if (!response.ok) return undefined;

  const result = (await response.json()) as CurrentUserResponse;
  return result.data?.currentUser ?? undefined;
}

export async function getAllowedSession() {
  // CI/Test mode: bypass NextAuth and return a stub session
  if (process.env.TEST_MODE === "true") {
    const testUsersEnv = process.env.NEXT_PUBLIC_TEST_USERS ?? "";
    const users = testUsersEnv ? parseUserString(testUsersEnv) : [];
    const u = users[0] ?? { email: "tester@example.com", name: "Tester", id: 1 };
    const moviesDbSession: MoviesDbSession = {
      userName: u.name,
      eMail: u.email,
      ownerId: u.id,
      avatarUrl: "",
    };
    return moviesDbSession;
  }

  // Lazy import to avoid loading NextAuth config (and its env assertions) in test mode
  const { auth } = await import("../../../lib/auth");
  const session = await auth();
  if (!session?.user?.email) return undefined;

  const currentUser = await getCurrentUser(session.user.email);
  if (!currentUser?.email) return undefined;

  const moviesDbSession: MoviesDbSession = {
    userName: currentUser.name,
    eMail: currentUser.email,
    ownerId: currentUser.id,
    avatarUrl: session.user.image ?? "",
  };
  return moviesDbSession;
}
