// ──────────────────────────────────────────────
// Relative timestamp formatting
// ──────────────────────────────────────────────

/**
 * "just now" / "5m ago" / "3d ago" for an ISO timestamp. Returns null for unparseable input.
 *
 * Note: output is hardcoded English, matching the behaviour this had while it lived inside
 * ConversationPresenceCard. Localizing it is a separate follow-up.
 */
export function formatRelativeContact(isoTimestamp: string, now = Date.now()): string | null {
  const timestamp = new Date(isoTimestamp).getTime();
  if (!Number.isFinite(timestamp)) return null;

  const diffMs = now - timestamp;
  if (diffMs < 60_000) return "just now";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(diffMs / 86_400_000);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}
