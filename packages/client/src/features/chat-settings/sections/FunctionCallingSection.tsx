import { useId } from "react";
import { Check, FilePlus2, Plus, RotateCcw, Trash2, Wrench } from "lucide-react";
import { DEFAULT_DICE_ROLL_FIXER_PATTERN, isValidDiceRollFixerPattern } from "@marinara-engine/shared";
import { cn } from "../../../lib/utils";
import { SettingsSwitch } from "../../../components/panels/settings/SettingControls";
import { ChatSettingsSection } from "../ChatSettingsSection";
import { PickerDropdown } from "../PickerDropdown";

export interface FunctionToolOption {
  id: string;
  name: string;
  description: string;
}

interface FunctionCallingSectionProps {
  enableTools: boolean | undefined;
  activeToolIds: string[];
  pendingToolIds: string[];
  availableTools: FunctionToolOption[];
  showToolPicker: boolean;
  toolSearch: string;
  forceDiceRollTool: boolean | undefined;
  diceRollFixerPattern: string | undefined;
  onEnableToolsChange: (enabled: boolean) => void;
  onToggleTool: (toolId: string) => void;
  onShowToolPickerChange: (show: boolean) => void;
  onToolSearchChange: (value: string) => void;
  onPendingToolIdsChange: (updater: (previous: string[]) => string[]) => void;
  onAddPendingTools: () => void;
  onCreateCustomTool: () => void;
  onForceDiceRollToolChange: (enabled: boolean) => void;
  onDiceRollFixerPatternChange: (pattern: string) => void;
}

export function FunctionCallingSection({
  enableTools,
  activeToolIds,
  pendingToolIds,
  availableTools,
  showToolPicker,
  toolSearch,
  forceDiceRollTool,
  diceRollFixerPattern,
  onEnableToolsChange,
  onToggleTool,
  onShowToolPickerChange,
  onToolSearchChange,
  onPendingToolIdsChange,
  onAddPendingTools,
  onCreateCustomTool,
  onForceDiceRollToolChange,
  onDiceRollFixerPatternChange,
}: FunctionCallingSectionProps) {
  const dicePatternInputId = useId();
  const dicePatternErrorId = useId();
  const effectiveDicePattern = diceRollFixerPattern ?? "";
  const dicePatternIsInvalid =
    effectiveDicePattern.trim().length > 0 && !isValidDiceRollFixerPattern(effectiveDicePattern);
  const inactiveTools = availableTools.filter((tool) => !activeToolIds.includes(tool.id));
  const visibleInactiveTools = inactiveTools.filter((tool) => tool.name.toLowerCase().includes(toolSearch.toLowerCase()));

  return (
    <ChatSettingsSection
      label="Function Calling"
      icon={<Wrench size="0.875rem" />}
      count={activeToolIds.length}
      help="When enabled, the AI can call built-in tools like dice rolls, game state updates, and lorebook searches during conversation."
    >
      <div className="space-y-2">
        <SettingsSwitch
          label="Enable Tool Use"
          description="Allow AI to call functions (dice rolls, game state, etc.)"
          checked={!!enableTools}
          onChange={onEnableToolsChange}
          labelPosition="start"
          className={cn(
            "justify-between rounded-lg px-3 py-2.5 text-left",
            enableTools
              ? "bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30"
              : "bg-[var(--secondary)] hover:bg-[var(--accent)]",
          )}
          labelClassName="text-xs font-medium"
        />
        <p className="text-[0.625rem] text-[var(--muted-foreground)] px-1">
          {enableTools
            ? "If enabled, this chat can use globally enabled tools (or any tools you add below)."
            : "If disabled, no functions will be available."}
        </p>

        {enableTools && (
          <>
            {activeToolIds.length === 0 ? (
              <p className="text-[0.6875rem] text-[var(--muted-foreground)] px-1">
                All globally enabled tools are available to this chat. Add tools below to restrict this chat to a
                specific set.
              </p>
            ) : (
              <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                {activeToolIds.map((toolId) => {
                  const tool = availableTools.find((item) => item.id === toolId);
                  if (!tool) return null;
                  return (
                    <div
                      key={tool.id}
                      className="flex items-center gap-2.5 rounded-lg bg-[var(--primary)]/10 px-3 py-2 ring-1 ring-[var(--primary)]/30"
                    >
                      <Wrench size="0.875rem" className="text-[var(--primary)]" />
                      <div className="flex-1 min-w-0">
                        <span className="block truncate text-xs">{tool.name}</span>
                      </div>
                      <button
                        onClick={() => onToggleTool(tool.id)}
                        className="flex h-5 w-5 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--destructive)]/15 hover:text-[var(--destructive)]"
                        title="Remove from chat"
                      >
                        <Trash2 size="0.6875rem" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {(activeToolIds.length === 0 || activeToolIds.includes("roll_dice")) && (
              <>
                <SettingsSwitch
                  label="Force Dice Rolls"
                  description="Require the AI to call a tool on its first response instead of skipping straight to text — reduces hallucinated dice results, but can cause an unrelated tool to be called when other tools are also active."
                  checked={!!forceDiceRollTool}
                  onChange={onForceDiceRollToolChange}
                  labelPosition="start"
                  className="justify-between rounded-lg bg-[var(--secondary)] px-3 py-2.5 text-left hover:bg-[var(--accent)]"
                  labelClassName="text-xs font-medium"
                />

                {forceDiceRollTool && (
                  <div className="space-y-1 rounded-lg bg-[var(--secondary)] px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor={dicePatternInputId} className="text-xs font-medium">
                        Roll Detection Pattern
                      </label>
                      {effectiveDicePattern.trim().length > 0 && (
                        <button
                          type="button"
                          onClick={() => onDiceRollFixerPatternChange("")}
                          className="flex items-center gap-1 text-[0.625rem] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                          title="Reset to default pattern"
                        >
                          <RotateCcw size="0.625rem" /> Reset
                        </button>
                      )}
                    </div>
                    <p className="text-[0.625rem] text-[var(--muted-foreground)]">
                      Regex (no delimiters/flags) used to find hallucinated dice-roll lines in the AI's text so they
                      can be swapped for a real roll. Applied with the "gi" flags.
                    </p>
                    <input
                      id={dicePatternInputId}
                      type="text"
                      spellCheck={false}
                      placeholder={DEFAULT_DICE_ROLL_FIXER_PATTERN}
                      value={effectiveDicePattern}
                      onChange={(e) => onDiceRollFixerPatternChange(e.target.value)}
                      aria-invalid={dicePatternIsInvalid}
                      aria-describedby={dicePatternIsInvalid ? dicePatternErrorId : undefined}
                      className="w-full rounded-lg bg-[var(--background)] px-3 py-2 font-mono text-[0.6875rem] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 ring-1 ring-transparent focus:ring-[var(--primary)]/40 focus:outline-none transition-all"
                    />
                    {dicePatternIsInvalid && (
                      <p id={dicePatternErrorId} className="text-[0.625rem] text-red-400">
                        Invalid regex — the built-in default pattern will be used instead until this is fixed.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {!showToolPicker ? (
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    onShowToolPickerChange(true);
                    onToolSearchChange("");
                    onPendingToolIdsChange(() => []);
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-xs text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
                >
                  <Plus size="0.75rem" /> Add Functions
                </button>
                <button
                  type="button"
                  onClick={onCreateCustomTool}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-xs text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
                >
                  <FilePlus2 size="0.75rem" /> New Custom Function
                </button>
              </div>
            ) : (
              <PickerDropdown
                search={toolSearch}
                onSearchChange={onToolSearchChange}
                onClose={() => onShowToolPickerChange(false)}
                placeholder="Search functions…"
                footer={
                  <div className="grid gap-2 border-t border-[var(--border)] px-3 py-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={onCreateCustomTool}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] ring-1 ring-[var(--border)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                    >
                      <FilePlus2 size="0.75rem" /> New Custom Function
                    </button>
                    <button
                      type="button"
                      disabled={pendingToolIds.length === 0}
                      onClick={onAddPendingTools}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Plus size="0.75rem" />
                      {pendingToolIds.length > 0
                        ? `Add ${pendingToolIds.length} Function${pendingToolIds.length === 1 ? "" : "s"}`
                        : "Add Selected"}
                    </button>
                  </div>
                }
              >
                {visibleInactiveTools.map((tool) => {
                  const selected = pendingToolIds.includes(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={() =>
                        onPendingToolIdsChange((previous) =>
                          previous.includes(tool.id)
                            ? previous.filter((id) => id !== tool.id)
                            : [...previous, tool.id],
                        )
                      }
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all hover:bg-[var(--accent)]",
                        selected && "bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                          selected ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)]",
                        )}
                      >
                        {selected && <Check size="0.625rem" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block truncate text-xs">{tool.name}</span>
                        <span className="block truncate text-[0.625rem] text-[var(--muted-foreground)]">
                          {tool.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {visibleInactiveTools.length === 0 && (
                  <p className="px-3 py-2 text-[0.6875rem] text-[var(--muted-foreground)]">
                    {inactiveTools.length === 0 ? "All functions already added." : "No matches."}
                  </p>
                )}
              </PickerDropdown>
            )}
          </>
        )}
      </div>
    </ChatSettingsSection>
  );
}
