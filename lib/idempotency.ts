/**
 * Client-generated identifier attached to every mutation that creates a row.
 * The server uses it to dedupe: if a doc with this clientId already exists for
 * the user, return that doc instead of creating a duplicate.
 *
 * Lets us handle the "added the same thing offline on two devices" case
 * without surfacing conflicts to the user.
 */
export function newClientId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for very old runtimes — good enough for our dedupe purposes.
  return `cid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
