// ──────────────────────────────────────────────
// NoodleR: global schedule manager. Global scheduler settings, roster-wide
// bulk actions, and inline per-creator schedule editing (cadence, images,
// reschedule, run-now) — no navigation away from the modal.
// ──────────────────────────────────────────────
import { useState, type CSSProperties } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";
import { Modal } from "../ui/Modal";
import { Avatar, NOODLE_PINK } from "./NoodleShell";
import { NOODLE_AUTO_POST_INTENSITIES, summarizeRefreshOutcomes } from "./noodle-auto-post";
import {
  useNoodle,
  useNoodlerAccounts,
  useRefreshAllNoodlerCreatorsNow,
  useRescheduleNoodlerAutoPost,
  useRunNoodlerAutoPostNow,
  useUpdateNoodleSettings,
  useUpdateNoodlerAutoPosting,
} from "../../hooks/use-noodle";
import type { NoodleAutoPostingIntensity } from "@marinara-engine/shared";
import { toast } from "sonner";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function NoodlerScheduleManagerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useNoodle();
  const settings = data?.settings;
  const accountsQuery = useNoodlerAccounts(data?.settings.enableNoodler === true);
  const creators = accountsQuery.data ?? [];
  const updateSettings = useUpdateNoodleSettings();
  const updateAutoPosting = useUpdateNoodlerAutoPosting();
  const rescheduleAutoPost = useRescheduleNoodlerAutoPost();
  const runAutoPostNow = useRunNoodlerAutoPostNow();
  const refreshAllNow = useRefreshAllNoodlerCreatorsNow();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rescheduleDraft, setRescheduleDraft] = useState("");

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applyBulkAutoPosting = async (patch: { enabled?: boolean; intensity?: NoodleAutoPostingIntensity }) => {
    const ids = selectedIds.size > 0 ? [...selectedIds] : creators.map((profile) => profile.id);
    if (ids.length === 0) return;
    // Independent PATCHes can partially commit, so summarize settled results instead of
    // reporting a blanket failure when only some siblings reject.
    const results = await Promise.allSettled(
      ids.map((accountId) => updateAutoPosting.mutateAsync({ accountId, ...patch })),
    );
    const failed = results.filter((result) => result.status === "rejected").length;
    if (failed === 0) return;
    if (failed === ids.length) {
      toast.error("Could not update automatic posting.");
    } else {
      toast.error(`Updated ${ids.length - failed} of ${ids.length}; ${failed} failed.`);
    }
  };

  const automatingCount = creators.filter((profile) => profile.autoPosting.enabled).length;
  const scheduleEnabled = settings?.autoPostingScheduleEnabled ?? true;
  const defaultIntensity = settings?.autoPostingDefaultIntensity ?? 1;
  const defaultIntensityLabel =
    NOODLE_AUTO_POST_INTENSITIES.find((option) => option.value === defaultIntensity)?.label ?? "Low";
  const selectedCount = selectedIds.size;
  // Membership, not count: polling can swap a selected creator for another of the same
  // roster length, which would falsely read as "all selected".
  const allSelected = creators.length > 0 && creators.every((profile) => selectedIds.has(profile.id));
  const bulkBusy = updateAutoPosting.isPending;

  const saveSettings = (patch: { autoPostingScheduleEnabled?: boolean; autoPostingDefaultIntensity?: NoodleAutoPostingIntensity }) => {
    updateSettings.mutate(patch, { onError: (error) => toast.error(errorMessage(error, "Could not update settings.")) });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="NoodleR schedules"
      width="max-w-2xl"
      panelStyle={{ "--noodle-blue": NOODLE_PINK } as CSSProperties}
    >
      <div className="space-y-3">
        <details className="group rounded-lg bg-[var(--secondary)] ring-1 ring-[var(--border)]" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3">
            <span className="text-sm font-semibold">Global settings</span>
            <span className="flex items-center gap-2 text-[0.625rem] font-medium">
              <span className="rounded-full px-2 py-1 ring-1 ring-[var(--border)] text-[var(--muted-foreground)]">
                {scheduleEnabled ? "On" : "Off"} · {defaultIntensityLabel} · {automatingCount} automating
              </span>
              <ChevronDown size={14} className="text-[var(--muted-foreground)] transition-transform group-open:rotate-180" />
            </span>
          </summary>
          <div className="space-y-3 border-t border-[var(--border)] p-3">
            <label className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Automatic posting schedule</span>
                <span className="block text-xs text-[var(--muted-foreground)]">
                  {scheduleEnabled ? "Creators post on their schedule." : "Paused globally — no automatic posts."}
                </span>
              </span>
              <input
                type="checkbox"
                checked={scheduleEnabled}
                disabled={updateSettings.isPending}
                onChange={(event) => saveSettings({ autoPostingScheduleEnabled: event.target.checked })}
                className="h-5 w-5 shrink-0 accent-[var(--noodle-blue)]"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold">Default cadence</span>
              {NOODLE_AUTO_POST_INTENSITIES.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  disabled={updateSettings.isPending}
                  onClick={() => saveSettings({ autoPostingDefaultIntensity: value })}
                  className={cn(
                    "h-8 rounded-full px-3 text-xs font-semibold ring-1 transition-colors disabled:opacity-40",
                    defaultIntensity === value
                      ? "bg-[var(--noodle-blue)] text-zinc-950 ring-transparent"
                      : "bg-[var(--background)] text-[var(--foreground)] ring-[var(--border)] hover:bg-[var(--accent)]",
                  )}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                disabled={refreshAllNow.isPending}
                onClick={() =>
                  refreshAllNow.mutate(undefined, {
                    onSuccess: ({ outcomes }) => {
                      const { ok, message } = summarizeRefreshOutcomes(outcomes);
                      (ok ? toast.success : toast.error)(message);
                    },
                    onError: (error) => toast.error(errorMessage(error, "Could not refresh creators.")),
                  })
                }
                className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--background)] px-3 text-xs font-semibold ring-1 ring-[var(--border)] transition-colors hover:bg-[var(--accent)] disabled:opacity-40"
              >
                <RefreshCw size={13} className={refreshAllNow.isPending ? "animate-spin" : undefined} />
                Refresh all now
              </button>
            </div>
          </div>
        </details>

        {creators.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[var(--secondary)] p-3 ring-1 ring-[var(--border)]">
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(event) =>
                  setSelectedIds(event.target.checked ? new Set(creators.map((profile) => profile.id)) : new Set())
                }
                className="h-4 w-4 accent-[var(--noodle-blue)]"
              />
              {selectedCount > 0 ? `${selectedCount} selected` : "Select all"}
            </label>
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={bulkBusy}
                onClick={() => void applyBulkAutoPosting({ enabled: true })}
                className="h-8 rounded-full bg-[var(--background)] px-3 text-xs font-semibold ring-1 ring-[var(--border)] hover:bg-[var(--accent)] disabled:opacity-40"
              >
                {selectedCount > 0 ? "Enable selected" : "Enable all"}
              </button>
              <button
                type="button"
                disabled={bulkBusy}
                onClick={() => void applyBulkAutoPosting({ enabled: false })}
                className="h-8 rounded-full bg-[var(--background)] px-3 text-xs font-semibold ring-1 ring-[var(--border)] hover:bg-[var(--accent)] disabled:opacity-40"
              >
                {selectedCount > 0 ? "Pause selected" : "Pause all"}
              </button>
              {selectedCount > 0 &&
                NOODLE_AUTO_POST_INTENSITIES.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={bulkBusy}
                    onClick={() => void applyBulkAutoPosting({ intensity: value })}
                    className="h-8 rounded-full bg-[var(--background)] px-3 text-xs font-semibold ring-1 ring-[var(--border)] hover:bg-[var(--accent)] disabled:opacity-40"
                    title={`Set cadence to ${label}`}
                  >
                    {label}
                  </button>
                ))}
            </div>
          </div>
        )}

        {creators.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No creators yet — add some from the NoodleR hub.
          </p>
        ) : (
          <div className="space-y-2">
            {creators.map((profile) => {
              const auto = profile.autoPosting;
              const selected = selectedIds.has(profile.id);
              const expanded = expandedId === profile.id;
              return (
                <div key={profile.id} className="rounded-lg bg-[var(--secondary)] ring-1 ring-[var(--border)]">
                  <div className="flex items-center gap-3 p-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelection(profile.id)}
                      aria-label={`Select ${profile.displayName}`}
                      className="h-4 w-4 shrink-0 accent-[var(--noodle-blue)]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedId(expanded ? null : profile.id);
                        setRescheduleDraft("");
                      }}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <Avatar account={profile} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{profile.displayName}</span>
                        <span className="block truncate text-xs text-[var(--muted-foreground)]">@{profile.handle}</span>
                      </span>
                    </button>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-1 text-[0.625rem] font-medium ring-1 ring-[var(--border)]",
                        auto.enabled
                          ? "bg-[var(--noodle-blue)]/12 text-[var(--noodle-blue)]"
                          : "bg-[var(--background)] text-[var(--muted-foreground)]",
                      )}
                    >
                      {auto.enabled
                        ? auto.nextRunAt
                          ? `Next ${new Date(auto.nextRunAt).toLocaleString()}`
                          : "Scheduling…"
                        : "Paused"}
                    </span>
                    <label className="flex shrink-0 items-center gap-2">
                      <span className="text-xs font-semibold">{auto.enabled ? "On" : "Off"}</span>
                      <input
                        type="checkbox"
                        checked={auto.enabled}
                        disabled={updateAutoPosting.isPending}
                        onChange={(event) =>
                          updateAutoPosting.mutate(
                            { accountId: profile.id, enabled: event.target.checked },
                            { onError: (error) => toast.error(errorMessage(error, "Could not update automatic posting.")) },
                          )
                        }
                        className="h-5 w-5 accent-[var(--noodle-blue)]"
                      />
                    </label>
                    <button
                      type="button"
                      aria-label={expanded ? "Collapse schedule" : "Expand schedule"}
                      aria-expanded={expanded}
                      onClick={() => {
                        setExpandedId(expanded ? null : profile.id);
                        setRescheduleDraft("");
                      }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                    >
                      <ChevronDown size={15} className={cn("transition-transform", expanded && "rotate-180")} />
                    </button>
                  </div>
                  {expanded && (
                    <fieldset
                      disabled={!auto.enabled || updateAutoPosting.isPending}
                      className="space-y-3 border-t border-[var(--border)] p-3 disabled:opacity-50"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {NOODLE_AUTO_POST_INTENSITIES.map(({ label, value }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              updateAutoPosting.mutate(
                                { accountId: profile.id, intensity: value },
                                { onError: (error) => toast.error(errorMessage(error, "Could not update cadence.")) },
                              )
                            }
                            className={cn(
                              "h-8 flex-1 rounded-full px-3 text-xs font-semibold ring-1 transition-colors",
                              auto.intensity === value
                                ? "bg-[var(--noodle-blue)] text-zinc-950 ring-transparent"
                                : "bg-[var(--background)] text-[var(--foreground)] ring-[var(--border)] hover:bg-[var(--accent)]",
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <label className="flex min-h-9 items-center justify-between gap-3 rounded-md px-2 ring-1 ring-[var(--border)]">
                        <span className="text-xs font-semibold">Generate an image with posts</span>
                        <input
                          type="checkbox"
                          checked={auto.imagesEnabled}
                          onChange={(event) =>
                            updateAutoPosting.mutate(
                              { accountId: profile.id, imagesEnabled: event.target.checked },
                              { onError: (error) => toast.error(errorMessage(error, "Could not update image generation.")) },
                            )
                          }
                          className="h-4 w-4 accent-[var(--noodle-blue)]"
                        />
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="datetime-local"
                          value={rescheduleDraft}
                          onChange={(event) => setRescheduleDraft(event.target.value)}
                          className="h-9 min-w-0 flex-1 rounded-md bg-[var(--background)] px-2 text-xs ring-1 ring-[var(--border)]"
                        />
                        <button
                          type="button"
                          disabled={!rescheduleDraft || rescheduleAutoPost.isPending}
                          onClick={() => {
                            const next = new Date(rescheduleDraft);
                            if (Number.isNaN(next.getTime()) || next.getTime() <= Date.now()) {
                              toast.error("Pick a future date and time to reschedule.");
                              return;
                            }
                            rescheduleAutoPost.mutate(
                              { accountId: profile.id, nextRunAt: next.toISOString() },
                              {
                                onSuccess: () => setRescheduleDraft(""),
                                onError: (error) => toast.error(errorMessage(error, "Could not reschedule the next post.")),
                              },
                            );
                          }}
                          className="h-9 shrink-0 rounded-full px-3 text-xs font-semibold ring-1 ring-[var(--border)] hover:bg-[var(--accent)] disabled:opacity-50"
                        >
                          Reschedule
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={runAutoPostNow.isPending}
                        onClick={() =>
                          runAutoPostNow.mutate(profile.id, {
                            onError: (error) => toast.error(errorMessage(error, "Could not run a post now.")),
                          })
                        }
                        className="h-9 w-full rounded-full px-3 text-xs font-semibold ring-1 ring-[var(--border)] hover:bg-[var(--accent)] disabled:opacity-50"
                      >
                        {runAutoPostNow.isPending ? "Running…" : "Run now"}
                      </button>
                    </fieldset>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
