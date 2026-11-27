// The signed-in demo user. The MVP has no real accounts; this identifies
// content the current user creates (reports, comments) for "My reports" etc.
export const CURRENT_USER = {
  // Matches the @jramos handle on this user's posts and comments.
  name: "Juan Ramos",
  handle: "jramos",
  role: "DLSU student · commuter",
} as const;
