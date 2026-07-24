// ──────────────────────────────────────────────
// NoodleR: bulk-create stage profiles from eligible public accounts.
// Mounted in the NoodleR hub right sidebar and (in a Modal) from settings.
// ──────────────────────────────────────────────
import { useState } from "react";
import { Check, Loader2, Search, Users } from "lucide-react";
import type { NoodleIdentityDisclosure } from "@marinara-engine/shared";
import { cn } from "../../lib/utils";
import { useBulkCreateNoodlerStageProfiles, useNoodlerEligibleAccounts } from "../../hooks/use-noodle";

const DISCLOSURE_CHOICES: { value: NoodleIdentityDisclosure; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "hinted", label: "Hinted" },
  { value: "secret", label: "Secret" },
];

const eyebrowClass = "text-[0.625rem] font-bold uppercase tracking-[0.18em] text-[var(--muted-foreground)]";

export function NoodlerBulkCreatePanel() {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<"all" | "character" | "persona">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [disclosureMode, setDisclosureMode] = useState<NoodleIdentityDisclosure>("hinted");

  const eligibleQuery = useNoodlerEligibleAccounts(search, kind);
  const bulkCreate = useBulkCreateNoodlerStageProfiles();

  const accounts = eligibleQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.size === accounts.length ? new Set() : new Set(accounts.map((a) => a.id))));
  };

  const create = () => {
    bulkCreate.mutate(
      { publicAccountIds: Array.from(selected), disclosureMode },
      { onSuccess: () => setSelected(new Set()) },
    );
  };

  return (
    <div className="rounded-lg ring-1 ring-[var(--border)] bg-[var(--secondary)] p-3">
      <div className="flex items-center gap-2">
        <Users size={15} className="shrink-0 text-[var(--noodle-blue)]" />
        <p className={eyebrowClass}>Bulk-create creators</p>
      </div>
      <label className="relative mt-2.5 block">
        <Search size={14} className="absolute left-2.5 top-2.5 text-[var(--muted-foreground)]" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search accounts"
          className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-8 pr-2 text-xs text-[var(--foreground)] outline-none transition-colors focus:border-[var(--noodle-blue)]"
        />
      </label>
      <div className="mt-2 grid grid-cols-3 rounded-md ring-1 ring-[var(--border)] p-0.5" aria-label="Filter by kind">
        {(["all", "character", "persona"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={kind === option}
            onClick={() => setKind(option)}
            className={cn(
              "h-7 rounded px-1.5 text-[0.68rem] font-semibold capitalize",
              kind === option
                ? "bg-[var(--noodle-blue)] text-zinc-950"
                : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]",
            )}
          >
            {option === "all" ? "All" : option}
          </button>
        ))}
      </div>

      {eligibleQuery.isLoading ? (
        <div className="mt-3 flex items-center justify-center gap-2 py-6 text-xs text-[var(--muted-foreground)]">
          <Loader2 size={14} className="animate-spin" /> Loading...
        </div>
      ) : accounts.length === 0 ? (
        <p className="mt-3 py-4 text-center text-xs text-[var(--muted-foreground)]">
          No eligible accounts remain — every account already has a stage profile.
        </p>
      ) : (
        <>
          <div className="mt-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={toggleAll}
              className="text-[0.68rem] font-semibold text-[var(--noodle-blue)] hover:underline"
            >
              {selected.size === accounts.length ? "Deselect all" : "Select all"}
            </button>
            <span className="text-[0.68rem] text-[var(--muted-foreground)]">{selected.size} selected</span>
          </div>
          <div className="mt-1.5 max-h-56 divide-y divide-[var(--border)] overflow-y-auto rounded-md ring-1 ring-[var(--border)]">
            {accounts.map((account) => {
              const checked = selected.has(account.id);
              return (
                <button
                  key={account.id}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => toggle(account.id)}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-[var(--accent)]"
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      checked ? "border-[var(--noodle-blue)] bg-[var(--noodle-blue)]" : "border-[var(--border)]",
                    )}
                  >
                    {checked && <Check size={11} className="text-zinc-950" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">{account.displayName}</span>
                    <span className="block truncate text-[0.68rem] text-[var(--muted-foreground)]">
                      @{account.handle}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {eligibleQuery.hasNextPage && (
            <button
              type="button"
              onClick={() => void eligibleQuery.fetchNextPage()}
              disabled={eligibleQuery.isFetchingNextPage}
              className="mt-1.5 flex h-7 w-full items-center justify-center gap-1.5 rounded-md ring-1 ring-[var(--border)] text-[0.68rem] font-semibold hover:bg-[var(--accent)] disabled:opacity-50"
            >
              {eligibleQuery.isFetchingNextPage && <Loader2 size={12} className="animate-spin" />}
              Load more
            </button>
          )}

          <fieldset className="mt-3">
            <legend className={eyebrowClass}>Disclosure</legend>
            <div className="mt-1.5 grid grid-cols-3 rounded-md ring-1 ring-[var(--border)] p-0.5">
              {DISCLOSURE_CHOICES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={disclosureMode === option.value}
                  onClick={() => setDisclosureMode(option.value)}
                  className={cn(
                    "h-7 rounded px-1.5 text-[0.68rem] font-semibold",
                    disclosureMode === option.value
                      ? "bg-[var(--noodle-blue)] text-zinc-950"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={create}
            disabled={selected.size === 0 || bulkCreate.isPending}
            className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[var(--noodle-blue)] text-xs font-bold text-zinc-950 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bulkCreate.isPending && <Loader2 size={13} className="animate-spin" />}
            {selected.size === 0
              ? "Create creators (paused)"
              : `Create ${selected.size} creator${selected.size === 1 ? "" : "s"} (paused)`}
          </button>
        </>
      )}
    </div>
  );
}
