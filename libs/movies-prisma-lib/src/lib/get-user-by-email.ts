import { prisma } from "../prismaclient";

/**
 * Returns the first curated legacy user whose email matches an authenticated
 * OAuth identity. Email uniqueness is intentionally an operational concern
 * for now, not a database constraint.
 */
export async function getUserByEmail(email: string) {
  return prisma.videodb_users.findFirst({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}
