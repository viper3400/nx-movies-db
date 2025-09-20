import { getAllowedUser, isUserAllowed, parseUserString } from "../../../lib/allowed-user-parser";
import { MoviesDbSession } from "../../../interfaces";

export async function getAllowedSession() {
  // CI/Test mode: bypass NextAuth and return a stub session
  if (process.env.TEST_MODE === "true") {
    const allowedUsersEnv = process.env.ALLOWED_USERS ?? "";
    const users = allowedUsersEnv ? parseUserString(allowedUsersEnv) : [];
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
  if (session?.user?.email && isUserAllowed(session.user?.email)) {
    const allowedUser = getAllowedUser(session.user.email);
    if (allowedUser) {
      const moviesDbSession: MoviesDbSession = {
        userName: allowedUser.name,
        eMail: allowedUser.email,
        ownerId: allowedUser.id,
        avatarUrl: session.user.image ?? ""
      };
      return moviesDbSession;
    } else return undefined;
  }
}
