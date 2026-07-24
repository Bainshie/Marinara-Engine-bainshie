import type { ReactNode } from "react";
import { AlertTriangle, ChevronDown, Layers, Pencil, Sliders } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/utils";
import { ChatSettingsSection } from "../ChatSettingsSection";

interface PromptPresetOption {
  id: string;
  name: string;
}

const PROMPT_PRESET_CHEVRON_CLASS =
  "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]";

interface PromptPresetSectionProps {
  promptPresetId: string | null;
  presets: PromptPresetOption[];
  hasVariables: boolean;
  quickEditor: ReactNode;
  quickEditorOpen: boolean;
  showLorebookMarkerWarning: boolean;
  onEditVariables: () => void;
  onQuickEditorToggle: () => void;
  onPromptPresetChange: (presetId: string | null) => void;
}

export function PromptPresetSection({
  promptPresetId,
  presets,
  hasVariables,
  quickEditor,
  quickEditorOpen,
  showLorebookMarkerWarning,
  onEditVariables,
  onQuickEditorToggle,
  onPromptPresetChange,
}: PromptPresetSectionProps) {
  const { t } = useTranslation();
  const showVariableEditor = !!promptPresetId && hasVariables;

  return (
    <ChatSettingsSection
      label="Prompt Preset"
      icon={<Sliders size="0.875rem" />}
      help="Presets control how the system prompt is structured and what generation parameters are used. Different presets produce different AI behaviors."
    >
      <div className="flex items-center gap-1.5">
        <div className="relative min-w-0 flex-1">
          <select
            value={promptPresetId ?? ""}
            onChange={(event) => onPromptPresetChange(event.target.value || null)}
            className="mari-preset-native-select w-full appearance-none truncate rounded-lg bg-[var(--secondary)] px-3 py-2 pr-8 text-xs text-[var(--foreground)] outline-none ring-1 ring-transparent transition-shadow focus:ring-[var(--primary)]/40"
          >
            <option value="">None</option>
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          <ChevronDown
            data-prompt-preset-chevron="select"
            aria-hidden
            size="0.75rem"
            className={PROMPT_PRESET_CHEVRON_CLASS}
          />
        </div>
        {showVariableEditor && (
          <button
            type="button"
            aria-label="Edit preset variables"
            onClick={onEditVariables}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
            title="Edit preset variables"
          >
            <Pencil size="0.8125rem" />
          </button>
        )}
      </div>
      {showLorebookMarkerWarning && (
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-400/10 px-3 py-2 text-[0.6875rem] text-amber-200 ring-1 ring-amber-400/25">
          <AlertTriangle size="0.75rem" className="mt-[0.125rem] shrink-0" />
          <span>This preset has active lorebooks available, but no lorebook marker.</span>
        </div>
      )}
      {promptPresetId && (
        <div className="mt-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onQuickEditorToggle}
              aria-expanded={quickEditorOpen}
              className="relative flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[var(--secondary)] px-3 py-2 pr-8 text-left text-xs font-medium text-[var(--foreground)] ring-1 ring-[var(--border)] transition-colors hover:bg-[var(--accent)]"
            >
              <Layers size="0.75rem" className="shrink-0 text-[var(--primary)]" />
              <span className="min-w-0 flex-1 truncate">
                {t(
                  quickEditorOpen
                    ? "chat.settings.promptPreset.quickEdit.hide"
                    : "chat.settings.promptPreset.quickEdit.show",
                )}
              </span>
              <ChevronDown
                data-prompt-preset-chevron="quick-editor"
                aria-hidden
                size="0.75rem"
                className={cn(PROMPT_PRESET_CHEVRON_CLASS, "transition-transform", quickEditorOpen && "rotate-180")}
              />
            </button>
            {showVariableEditor && <span aria-hidden className="h-7 w-7 shrink-0" />}
          </div>
          {quickEditorOpen && (
            <div className="mt-2 rounded-lg border border-[var(--border)] bg-transparent p-2">
              <p className="mb-2 px-1 text-[0.625rem] leading-relaxed text-[var(--muted-foreground)]">
                {t("chat.settings.promptPreset.quickEdit.autoSave")}
              </p>
              {quickEditor}
            </div>
          )}
        </div>
      )}
    </ChatSettingsSection>
  );
}
