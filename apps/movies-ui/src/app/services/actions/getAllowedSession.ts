import { auth } from "../../../lib/auth";
import { isUserAllowed } from "../../../lib/allowed-user-parser";

export async function getAllowedSession() {
  const session = await auth();
  if (session?.user?.email && isUserAllowed(session.user?.email)) {
    return session;
  } else return undefined;
}
