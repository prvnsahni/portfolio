// Usernames that can't be claimed — route names, app areas, and common words
// that would collide with real or future paths.
export const RESERVED_USERNAMES = new Set<string>([
  "admin",
  "administrator",
  "login",
  "logout",
  "signin",
  "signup",
  "auth",
  "dashboard",
  "api",
  "u",
  "user",
  "users",
  "me",
  "settings",
  "account",
  "profile",
  "about",
  "contact",
  "work",
  "notes",
  "resume",
  "public",
  "static",
  "assets",
  "null",
  "undefined",
  "root",
  "support",
  "help",
  "privacy",
  "terms",
]);

export function isReservedUsername(name: string): boolean {
  return RESERVED_USERNAMES.has(name.trim().toLowerCase());
}
