export interface AllowedUser {
  email: string;
  name: string;
  id: number;
}

export function parseUserString(input: string): AllowedUser[] {
  // Split the input string by semicolon to get individual user entries
  const userEntries = input.split(";");

  // Map each entry to a User object
  const users: AllowedUser[] = userEntries.map((entry) => {
    const [email, name, idStr] = entry.split(",");

    // Convert idStr to a number
    const id = parseInt(idStr, 10);

    return {
      email: email.trim(),
      name: name.trim(),
      id: isNaN(id) ? 0 : id, // Default to 0 if id is not a valid number
    };
  });

  return users;
}

export function getAllowedUser(email: string): AllowedUser | undefined {
  const allowedUsersEnv = process.env.ALLOWED_USERS
    ? process.env.ALLOWED_USERS
    : "";
  const allowedUsers = parseUserString(allowedUsersEnv);
  return allowedUsers.find((u) => u.email === email);
}
export function isUserAllowed(email: string): boolean {
  return getAllowedUser(email) !== undefined;
}
