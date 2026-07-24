import type { NoodleAutoPostingIntensity, NoodlerRefreshNowOutcome } from "@marinara-engine/shared";

export const NOODLE_AUTO_POST_INTENSITIES: { label: string; value: NoodleAutoPostingIntensity }[] = [
  { label: "Low", value: 1 },
  { label: "Medium", value: 3 },
  { label: "High", value: 6 },
];

/**
 * Summarize the per-creator outcomes of "Refresh NoodleR now" into a single toast.
 * Anything not generated/skipped is a failure, so an all-failure run never toasts success.
 */
export function summarizeRefreshOutcomes(outcomes: NoodlerRefreshNowOutcome[]): { ok: boolean; message: string } {
  const generated = outcomes.filter((o) => o.status === "generated").length;
  const skipped = outcomes.filter((o) => o.status === "skipped").length;
  const failed = outcomes.length - generated - skipped;
  if (outcomes.length === 0) return { ok: true, message: "No creators have automatic posting enabled." };
  if (failed === 0) return { ok: true, message: `Generated ${generated} post${generated === 1 ? "" : "s"}.` };
  if (generated === 0) {
    return {
      ok: false,
      message: `All ${failed} creator${failed === 1 ? "" : "s"} failed to post (connection or provider error).`,
    };
  }
  return { ok: false, message: `Generated ${generated}, ${failed} failed${skipped ? `, ${skipped} skipped` : ""}.` };
}
