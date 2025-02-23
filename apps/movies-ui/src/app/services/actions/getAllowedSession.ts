import { auth } from "../../../lib/auth";
import { getAllowedUser, isUserAllowed } from "../../../lib/allowed-user-parser";
import { MoviesDbSession } from "../../../interfaces";

export async function getAllowedSession() {
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
