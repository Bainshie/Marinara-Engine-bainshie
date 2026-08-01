import { useId } from "react";
import { Check, FilePlus2, Plus, RotateCcw, Trash2, Wrench } from "lucide-react";
import { DEFAULT_DICE_ROLL_FIXER_PATTERN, isValidDiceRollFixerPattern } from "@marinara-engine/shared";
import { cn } from "../../../lib/utils";
import { SettingsSwitch } from "../../../components/panels/settings/SettingControls";
import { ChatSettingsSection } from "../ChatSettingsSection";
import { PickerDropdown } from "../PickerDropdown";
import { useTranslation as useUiTranslation } from "react-i18next";

export interface FunctionToolOption {
  id: string;
  name: string;
  description: string;
}

interface FunctionCallingSectionProps {
  enableTools: boolean | undefined;
  forceToolCall: boolean | undefined;
  activeToolIds: string[];
  pendingToolIds: string[];
  availableTools: FunctionToolOption[];
  showToolPicker: boolean;
  toolSearch: string;
  forceDiceRollTool: boolean | undefined;
  diceRollFixerPattern: string | undefined;
  onEnableToolsChange: (enabled: boolean) => void;
  onForceToolCallChange: (enabled: boolean) => void;
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
  forceToolCall,
  activeToolIds,
  pendingToolIds,
  availableTools,
  showToolPicker,
  toolSearch,
  forceDiceRollTool,
  diceRollFixerPattern,
  onEnableToolsChange,
  onForceToolCallChange,
  onToggleTool,
  onShowToolPickerChange,
  onToolSearchChange,
  onPendingToolIdsChange,
  onAddPendingTools,
  onCreateCustomTool,
  onForceDiceRollToolChange,
  onDiceRollFixerPatternChange,
}: FunctionCallingSectionProps) {
  const { t: localizeUi } = useUiTranslation();
  const dicePatternInputId = useId();
  const dicePatternErrorId = useId();
  const effectiveDicePattern = diceRollFixerPattern ?? "";
  const dicePatternIsInvalid =
    effectiveDicePattern.trim().length > 0 && !isValidDiceRollFixerPattern(effectiveDicePattern);
  const inactiveTools = availableTools.filter((tool) => !activeToolIds.includes(tool.id));
  const visibleInactiveTools = inactiveTools.filter((tool) =>
    tool.name.toLowerCase().includes(toolSearch.toLowerCase()),
  );

  return (
    <ChatSettingsSection
      id="function-calling"
      label={localizeUi("ui.chatSettings.functioncallingsection.functionCalling")}
      icon={<Wrench size="0.875rem" />}
      count={activeToolIds.length}
      help={localizeUi("ui.chatSettings.functioncallingsection.whenEnabledTheAiCanCallBuiltInTools")}
    >
      <div className="space-y-2">
        <SettingsSwitch
          label={localizeUi("ui.chatSettings.functioncallingsection.enableToolUse")}
          description={localizeUi("ui.chatSettings.functioncallingsection.allowAiToCallFunctionsDiceRollsGameState")}
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
            ? localizeUi("ui.chatSettings.functioncallingsection.ifEnabledThisChatCanUseGloballyEnabledTools")
            : localizeUi("ui.chatSettings.functioncallingsection.ifDisabledNoFunctionsWillBeAvailable")}
        </p>

        {enableTools && (
          <>
            <SettingsSwitch
              label={localizeUi("ui.chatSettings.functioncallingsection.forceToCallTool")}
              description={localizeUi("ui.chatSettings.functioncallingsection.forceToCallToolDescription")}
              checked={!!forceToolCall}
              onChange={onForceToolCallChange}
              labelPosition="start"
              className={cn(
                "justify-between rounded-lg px-3 py-2.5 text-left",
                forceToolCall
                  ? "bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30"
                  : "bg-[var(--secondary)] hover:bg-[var(--accent)]",
              )}
              labelClassName="text-xs font-medium"
            />
            {activeToolIds.length === 0 ? (
              <p className="text-[0.6875rem] text-[var(--muted-foreground)] px-1">
                {localizeUi("ui.chatSettings.functioncallingsection.allGloballyEnabledToolsAreAvailableToThisChat")}
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
                        title={localizeUi("ui.chatSettings.functioncallingsection.removeFromChat")}
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
                  label={localizeUi("ui.chatSettings.functioncallingsection.forceDiceRolls")}
                  description={localizeUi("ui.chatSettings.functioncallingsection.requireTheAiToCallAToolOnIts")}
                  checked={!!forceDiceRollTool}
                  onChange={onForceDiceRollToolChange}
                  labelPosition="start"
                  className="justify-between rounded-lg bg-[var(--secondary)] px-3 py-2.5 text-left hover:bg-[var(--accent)]"
                  labelClassName="text-xs font-medium"
                />

                {forceDiceRollTool && (
                  <div className="space-y-1 rounded-lg bg-[var(--secondary)] px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor={dicePatternInputId} className="text-xs font-medium">{localizeUi("ui.chatSettings.functioncallingsection.rollDetectionPattern")}</label>
                      {effectiveDicePattern.trim().length > 0 && (
                        <button
                          type="button"
                          onClick={() => onDiceRollFixerPatternChange("")}
                          className="flex items-center gap-1 text-[0.625rem] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                          title={localizeUi("ui.chatSettings.functioncallingsection.resetToDefaultPattern")}
                        >
                          <RotateCcw size="0.625rem" /> {localizeUi("ui.cardversionhistory.reset")}</button>
                      )}
                    </div>
                    <p className="text-[0.625rem] text-[var(--muted-foreground)]">{localizeUi("ui.chatSettings.functioncallingsection.regexNoDelimitersFlagsUsedToFindHallucinatedDice")}</p>
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
                      <p id={dicePatternErrorId} className="text-[0.625rem] text-red-400">{localizeUi("ui.chatSettings.functioncallingsection.invalidRegexTheBuiltInDefaultPatternWillBe")}</p>
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
                  <Plus size="0.75rem" /> {localizeUi("ui.chatSettings.functioncallingsection.addFunctions")}
                </button>
                <button
                  type="button"
                  onClick={onCreateCustomTool}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-xs text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
                >
                  <FilePlus2 size="0.75rem" /> {localizeUi("ui.chatSettings.functioncallingsection.newCustomFunction")}
                </button>
              </div>
            ) : (
              <PickerDropdown
                search={toolSearch}
                onSearchChange={onToolSearchChange}
                onClose={() => onShowToolPickerChange(false)}
                placeholder={localizeUi("ui.chatSettings.functioncallingsection.searchFunctions")}
                footer={
                  <div className="grid gap-2 border-t border-[var(--border)] px-3 py-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={onCreateCustomTool}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] ring-1 ring-[var(--border)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                    >
                      <FilePlus2 size="0.75rem" />{" "}
                      {localizeUi("ui.chatSettings.functioncallingsection.newCustomFunction")}
                    </button>
                    <button
                      type="button"
                      disabled={pendingToolIds.length === 0}
                      onClick={onAddPendingTools}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Plus size="0.75rem" />
                      {pendingToolIds.length > 0
                        ? localizeUi("ui.chatSettings.functioncallingsection.addValue1FunctionValue2", {
                            value1: pendingToolIds.length,
                            value2: pendingToolIds.length === 1 ? "" : localizeUi("ui.noodle.stageprofileview.s"),
                          })
                        : localizeUi("ui.chatSettings.functioncallingsection.addSelected")}
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
                          previous.includes(tool.id) ? previous.filter((id) => id !== tool.id) : [...previous, tool.id],
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
                          selected
                            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                            : "border-[var(--border)]",
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
                    {inactiveTools.length === 0
                      ? localizeUi("ui.chatSettings.functioncallingsection.allFunctionsAlreadyAdded")
                      : localizeUi("ui.lorebooks.linkedresourcepicker.noMatches")}
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
