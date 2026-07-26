import { useMemo } from "react";
import { PanelsTopLeft, Settings2 } from "lucide-react";
import { useTranslation as useUiTranslation } from "react-i18next";
import {
  GAME_STORYBOARD_ANIMATION_DURATION_SECONDS_MAX,
  GAME_STORYBOARD_ANIMATION_DURATION_SECONDS_MIN,
  GAME_STORYBOARD_KEYFRAME_COUNT_MAX,
  GAME_STORYBOARD_KEYFRAME_COUNT_MIN,
  STORYBOARD_AGENT_ID,
  type AgentPromptTemplateOption,
  type StoryboardAgentSettings,
  type StoryboardAutoGenerateMode,
  type StoryboardViewerMode,
} from "@marinara-engine/shared";
import { mergeBuiltInAgentSettings, normalizeStoryboardAgentSettings } from "@marinara-engine/shared";
import { useAgentConfigs, type AgentConfigRow } from "../../hooks/use-agents";
import { useCapabilityAgentRegistry } from "../../hooks/use-capability-packages";
import { useUpdateChatMetadata } from "../../hooks/use-chats";
import { useConnections } from "../../hooks/use-connections";
import { filterLanguageGenerationConnections } from "../../lib/connection-filters";
import { useUIStore } from "../../stores/ui.store";
import {
  AgentDefaultStatus,
  AgentSettingsCard,
  AgentSettingsSegmentedControl,
  AgentSettingsSubsection,
  AgentSettingsToggle,
  GamePromptTemplateSelect,
} from "./AgentSettingsControls";

export type StoryboardChatConnection = {
  id: string;
  name: string;
  model?: string | null;
};

type StoryboardChatSettingsPanelProps = {
  cardId: string;
  active: boolean;
  settings: StoryboardAgentSettings;
  metadata: Record<string, unknown>;
  promptConnections: StoryboardChatConnection[];
  imageConnections: StoryboardChatConnection[];
  videoConnections: StoryboardChatConnection[];
  onActiveChange: (active: boolean) => void;
  onUpdate: (patch: Record<string, unknown>) => void;
  onOpenAgentSettings: () => void;
};

type StoryboardChatSettingsBridgeProps = {
  chatId: string;
  metadata: Record<string, unknown>;
  onClose: () => void;
};

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readBoundedInteger(value: unknown, fallback: number, min: number, max: number): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(numeric)));
}

function resolveSelectedId(
  value: unknown,
  fallback: string | null,
  options: readonly AgentPromptTemplateOption[],
): string {
  const selected = readString(value);
  if (selected && options.some((option) => option.id === selected)) return selected;
  if (fallback && options.some((option) => option.id === fallback)) return fallback;
  return options[0]?.id ?? "";
}

function StoryboardConnectionSelect({
  label,
  description,
  value,
  connections,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  connections: StoryboardChatConnection[];
  onChange: (connectionId: string) => void;
}) {
  const { t: localizeUi } = useUiTranslation();
  const missing = value.length > 0 && !connections.some((connection) => connection.id === value);

  return (
    <div className="space-y-1">
      <label className="flex flex-col gap-1 rounded-lg bg-[var(--background)]/75 px-2.5 py-2 ring-1 ring-[var(--border)]">
        <span className="text-[0.625rem] font-semibold text-[var(--foreground)]">{label}</span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-md bg-[var(--secondary)] px-2 py-1.5 text-[0.6875rem] text-[var(--foreground)] ring-1 ring-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="">{localizeUi("ui.chat.chatsettingsdrawer.agentDefault")}</option>
          {missing ? (
            <option value={value}>{localizeUi("ui.chat.chatsettingsdrawer.missingConnection")}</option>
          ) : null}
          {connections.map((connection) => (
            <option key={connection.id} value={connection.id}>
              {connection.name}
              {connection.model
                ? localizeUi("ui.chat.datablock.value1", { value1: connection.model })
                : ""}
            </option>
          ))}
        </select>
        <span className="text-[0.5625rem] leading-snug text-[var(--muted-foreground)]">{description}</span>
      </label>
      <AgentDefaultStatus overridden={value.length > 0} onReset={() => onChange("")} />
    </div>
  );
}

function StoryboardSlider({
  label,
  description,
  value,
  min,
  max,
  overridden,
  onChange,
  onReset,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  overridden: boolean;
  onChange: (value: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block space-y-2 rounded-lg bg-[var(--background)]/75 px-3 py-2 ring-1 ring-[var(--border)]">
        <span className="flex items-center justify-between gap-3">
          <span className="min-w-0">
            <span className="block text-[0.625rem] font-medium text-[var(--foreground)]">{label}</span>
            <span className="mt-0.5 block text-[0.5625rem] leading-snug text-[var(--muted-foreground)]">
              {description}
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[0.625rem] tabular-nums text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {value}
          </span>
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-7 w-full cursor-pointer accent-[var(--primary)]"
          aria-label={label}
        />
      </label>
      <AgentDefaultStatus overridden={overridden} onReset={onReset} />
    </div>
  );
}

export function StoryboardChatSettingsPanel({
  cardId,
  active,
  settings,
  metadata,
  promptConnections,
  imageConnections,
  videoConnections,
  onActiveChange,
  onUpdate,
  onOpenAgentSettings,
}: StoryboardChatSettingsPanelProps) {
  const { t: localizeUi } = useUiTranslation();
  const autoModeOverridden =
    typeof metadata.gameStoryboardAutoIllustrationsEnabled === "boolean" ||
    typeof metadata.gameStoryboardAutoGenerationEnabled === "boolean";
  const autoGenerateMode: StoryboardAutoGenerateMode =
    metadata.gameStoryboardAutoGenerationEnabled === true
      ? "animation"
      : metadata.gameStoryboardAutoIllustrationsEnabled === true
        ? "illustration"
        : autoModeOverridden
          ? "manual"
          : settings.autoGenerateMode;
  const keyframeCountOverridden = typeof metadata.gameStoryboardKeyframeCount === "number";
  const keyframeCount = readBoundedInteger(
    metadata.gameStoryboardKeyframeCount,
    settings.keyframeCount,
    GAME_STORYBOARD_KEYFRAME_COUNT_MIN,
    GAME_STORYBOARD_KEYFRAME_COUNT_MAX,
  );
  const durationOverridden = typeof metadata.gameStoryboardAnimationDurationSeconds === "number";
  const animationDurationSeconds = readBoundedInteger(
    metadata.gameStoryboardAnimationDurationSeconds,
    settings.animationDurationSeconds,
    GAME_STORYBOARD_ANIMATION_DURATION_SECONDS_MIN,
    GAME_STORYBOARD_ANIMATION_DURATION_SECONDS_MAX,
  );
  const viewerOverridden =
    metadata.gameStoryboardViewerDisplayMode === "floating" ||
    metadata.gameStoryboardViewerDisplayMode === "background";
  const viewerDisplayMode: StoryboardViewerMode =
    metadata.gameStoryboardViewerDisplayMode === "background"
      ? "background"
      : metadata.gameStoryboardViewerDisplayMode === "floating"
        ? "floating"
        : settings.viewerDisplayMode;
  const promptConnectionId = readString(metadata.gameStoryboardPromptConnectionId);
  const imageConnectionId = readString(metadata.gameStoryboardImageConnectionId);
  const videoConnectionId = readString(metadata.gameStoryboardVideoConnectionId);
  const appearanceOverridden = typeof metadata.gameStoryboardIncludeCharacterAppearance === "boolean";
  const includeCharacterAppearance = appearanceOverridden
    ? metadata.gameStoryboardIncludeCharacterAppearance === true
    : settings.includeCharacterAppearance;
  const avatarReferencesOverridden = typeof metadata.gameStoryboardUseAvatarReferences === "boolean";
  const useAvatarReferences = avatarReferencesOverridden
    ? metadata.gameStoryboardUseAvatarReferences === true
    : settings.useAvatarReferences;
  const novelAiOverridden = typeof metadata.gameStoryboardUseNovelAiCharacterPrompts === "boolean";
  const useNovelAiCharacterPrompts = novelAiOverridden
    ? metadata.gameStoryboardUseNovelAiCharacterPrompts === true
    : settings.useNovelAiCharacterPrompts;
  const useTemplateOverridden = typeof metadata.gameStoryboardUsePromptTemplate === "boolean";
  const usePromptTemplate = useTemplateOverridden
    ? metadata.gameStoryboardUsePromptTemplate === true
    : settings.usePromptTemplate;
  const stillPlannerOptions = settings.plannerTemplates.filter((template) =>
    settings.illustrationPlannerTemplateIds.includes(template.id),
  );
  const animationPlannerOptions = settings.plannerTemplates.filter((template) =>
    settings.animationPlannerTemplateIds.includes(template.id),
  );
  const stillPlannerId = resolveSelectedId(
    metadata.gameStoryboardIllustrationPromptTemplateId,
    settings.illustrationPlannerTemplateId,
    stillPlannerOptions,
  );
  const animationPlannerId = resolveSelectedId(
    metadata.gameStoryboardAnimationPromptTemplateId,
    settings.animationPlannerTemplateId,
    animationPlannerOptions,
  );
  const illustrationTemplateId = resolveSelectedId(
    metadata.gameStoryboardImagePromptTemplateId,
    settings.illustrationTemplateId,
    settings.illustrationTemplates,
  );
  const videoTemplateId = resolveSelectedId(
    metadata.gameStoryboardVideoPromptTemplateId,
    settings.videoTemplateId,
    settings.videoTemplates,
  );

  const updateAutoGenerateMode = (mode: StoryboardAutoGenerateMode) => {
    onUpdate({
      gameStoryboardAutoIllustrationsEnabled: mode !== "manual",
      gameStoryboardAutoGenerationEnabled: mode === "animation",
    });
  };

  return (
    <AgentSettingsCard
      id={cardId}
      icon={<PanelsTopLeft size="0.75rem" className="mt-0.5 text-[var(--primary)]" />}
      title={localizeUi("ui.agents.storyboard.settings")}
      description={localizeUi("ui.agents.storyboard.settingsDescription")}
    >
      <AgentSettingsToggle
        label={localizeUi("ui.chat.chatsettingsdrawer.enableStoryboards")}
        description={localizeUi("ui.chat.chatsettingsdrawer.showStoryboardControlsAndAllowAutomaticKeyframeMedia")}
        enabled={active}
        onToggle={() => onActiveChange(!active)}
      />

      {active ? (
        <div className="space-y-3 border-t border-[var(--border)] pt-3">
          <div className="space-y-1">
            <p className="text-[0.625rem] font-medium text-[var(--foreground)]">
              {localizeUi("ui.agents.storyboard.autoGenerate")}
            </p>
            <AgentSettingsSegmentedControl<StoryboardAutoGenerateMode>
              value={autoGenerateMode}
              columns={3}
              options={[
                { id: "manual", label: localizeUi("ui.agents.storyboard.manual") },
                { id: "illustration", label: localizeUi("ui.agents.storyboard.stillImages") },
                { id: "animation", label: localizeUi("ui.agents.storyboard.animations") },
              ]}
              onChange={updateAutoGenerateMode}
            />
            <AgentDefaultStatus
              overridden={autoModeOverridden}
              onReset={() =>
                onUpdate({
                  gameStoryboardAutoIllustrationsEnabled: null,
                  gameStoryboardAutoGenerationEnabled: null,
                })
              }
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <StoryboardSlider
              label={localizeUi("ui.agents.storyboard.keyframes")}
              description={localizeUi(
                "ui.chat.chatsettingsdrawer.controlsHowManyStoryboardIllustrationsArePlannedForEach",
              )}
              value={keyframeCount}
              min={GAME_STORYBOARD_KEYFRAME_COUNT_MIN}
              max={GAME_STORYBOARD_KEYFRAME_COUNT_MAX}
              overridden={keyframeCountOverridden}
              onChange={(value) => onUpdate({ gameStoryboardKeyframeCount: value })}
              onReset={() => onUpdate({ gameStoryboardKeyframeCount: null })}
            />
            <StoryboardSlider
              label={localizeUi("ui.agents.storyboard.duration")}
              description={localizeUi("ui.chat.chatsettingsdrawer.controlsTheDurationOfEachStoryboardMp4ClipIn")}
              value={animationDurationSeconds}
              min={GAME_STORYBOARD_ANIMATION_DURATION_SECONDS_MIN}
              max={GAME_STORYBOARD_ANIMATION_DURATION_SECONDS_MAX}
              overridden={durationOverridden}
              onChange={(value) => onUpdate({ gameStoryboardAnimationDurationSeconds: value })}
              onReset={() => onUpdate({ gameStoryboardAnimationDurationSeconds: null })}
            />
          </div>

          <div className="space-y-1">
            <p className="text-[0.625rem] font-medium text-[var(--foreground)]">
              {localizeUi("ui.agents.storyboard.viewer")}
            </p>
            <AgentSettingsSegmentedControl<StoryboardViewerMode>
              value={viewerDisplayMode}
              options={[
                {
                  id: "floating",
                  label: localizeUi("ui.agents.storyboard.floating"),
                  description: localizeUi("ui.agents.storyboard.floatingDescription"),
                },
                {
                  id: "background",
                  label: localizeUi("ui.agents.storyboard.background"),
                  description: localizeUi("ui.agents.storyboard.backgroundDescription"),
                },
              ]}
              onChange={(mode) => onUpdate({ gameStoryboardViewerDisplayMode: mode })}
            />
            <AgentDefaultStatus
              overridden={viewerOverridden}
              onReset={() => onUpdate({ gameStoryboardViewerDisplayMode: null })}
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <StoryboardConnectionSelect
              label={localizeUi("ui.chat.chatsettingsdrawer.promptModel")}
              description={localizeUi("ui.agents.storyboard.promptConnectionDescription")}
              value={promptConnectionId}
              connections={promptConnections}
              onChange={(connectionId) => onUpdate({ gameStoryboardPromptConnectionId: connectionId || null })}
            />
            <StoryboardConnectionSelect
              label={localizeUi("ui.agents.storyboard.imageConnection")}
              description={localizeUi(
                "ui.chat.chatsettingsdrawer.usedForAutomaticIllustrationsManualStoryboardsAndAnimationSource",
              )}
              value={imageConnectionId}
              connections={imageConnections}
              onChange={(connectionId) => onUpdate({ gameStoryboardImageConnectionId: connectionId || null })}
            />
            <StoryboardConnectionSelect
              label={localizeUi("ui.agents.storyboard.videoConnection")}
              description={localizeUi("ui.chat.chatsettingsdrawer.usedForEachGeneratedStoryboardAnimationClip")}
              value={videoConnectionId}
              connections={videoConnections}
              onChange={(connectionId) => onUpdate({ gameStoryboardVideoConnectionId: connectionId || null })}
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <AgentSettingsToggle
              label={localizeUi("ui.chat.agentaddsetupfields.attachCardAppearance")}
              description={localizeUi("ui.chat.chatsettingsdrawer.appendMatchedCharacterAppearanceDetailsToTheFinalScene")}
              enabled={includeCharacterAppearance}
              onToggle={() =>
                onUpdate({ gameStoryboardIncludeCharacterAppearance: !includeCharacterAppearance })
              }
              overridden={appearanceOverridden}
              onReset={() => onUpdate({ gameStoryboardIncludeCharacterAppearance: null })}
            />
            <AgentSettingsToggle
              label={localizeUi("ui.chat.agentaddsetupfields.sendAvatarReferences")}
              description={localizeUi("ui.chat.chatsettingsdrawer.sendMatchingCharacterAndPersonaAvatarsOrSpritesAs")}
              enabled={useAvatarReferences}
              onToggle={() => onUpdate({ gameStoryboardUseAvatarReferences: !useAvatarReferences })}
              overridden={avatarReferencesOverridden}
              onReset={() => onUpdate({ gameStoryboardUseAvatarReferences: null })}
            />
            <AgentSettingsToggle
              label={localizeUi("ui.agents.storyboard.useNovelAiCharacters")}
              description={localizeUi("ui.agents.storyboard.useNovelAiCharactersDescription")}
              enabled={useNovelAiCharacterPrompts}
              onToggle={() =>
                onUpdate({ gameStoryboardUseNovelAiCharacterPrompts: !useNovelAiCharacterPrompts })
              }
              overridden={novelAiOverridden}
              onReset={() => onUpdate({ gameStoryboardUseNovelAiCharacterPrompts: null })}
            />
            <AgentSettingsToggle
              label={localizeUi("ui.agents.storyboard.useTemplate")}
              description={localizeUi("ui.agents.storyboard.useTemplateDescription")}
              enabled={usePromptTemplate}
              onToggle={() => onUpdate({ gameStoryboardUsePromptTemplate: !usePromptTemplate })}
              overridden={useTemplateOverridden}
              onReset={() => onUpdate({ gameStoryboardUsePromptTemplate: null })}
            />
          </div>

          <AgentSettingsSubsection
            id="storyboard-planners"
            title={localizeUi("ui.chat.chatsettingsdrawer.storyboardPlanners")}
            description={localizeUi("ui.chat.chatsettingsdrawer.plannersSplitACompletedGmTurnIntoOrderedKeyframes")}
          >
            <div className="grid gap-2 md:grid-cols-2">
              <GamePromptTemplateSelect
                label={localizeUi("ui.agents.storyboard.stillPlanner")}
                description={localizeUi(
                  "ui.chat.chatsettingsdrawer.plansFinishedStillKeyframesAndWritesTheirImageDescriptions",
                )}
                options={stillPlannerOptions}
                selectedId={stillPlannerId}
                fallbackId={settings.illustrationPlannerTemplateId ?? ""}
                onChange={(id) =>
                  onUpdate({
                    gameStoryboardIllustrationPromptTemplateId:
                      id === settings.illustrationPlannerTemplateId ? null : id,
                  })
                }
              />
              <GamePromptTemplateSelect
                label={localizeUi("ui.agents.storyboard.animationPlanner")}
                description={localizeUi(
                  "ui.chat.chatsettingsdrawer.plansAnimationReadySourceImagesAndAMotionDirection",
                )}
                options={animationPlannerOptions}
                selectedId={animationPlannerId}
                fallbackId={settings.animationPlannerTemplateId ?? ""}
                onChange={(id) =>
                  onUpdate({
                    gameStoryboardAnimationPromptTemplateId:
                      id === settings.animationPlannerTemplateId ? null : id,
                  })
                }
              />
            </div>
          </AgentSettingsSubsection>

          <AgentSettingsSubsection
            id="storyboard-final-prompts"
            title={localizeUi("ui.chat.chatsettingsdrawer.finalGenerationPrompts")}
            description={localizeUi("ui.chat.chatsettingsdrawer.theseFormatEachPlannerResultIntoTheFinalRequest")}
          >
            <div className="grid gap-2 md:grid-cols-2">
              <GamePromptTemplateSelect
                label={localizeUi("ui.chat.chatsettingsdrawer.storyboardIllustrationPrompt")}
                description={localizeUi("ui.chat.chatsettingsdrawer.formatsEachPlannedKeyframeIntoTheFinalPromptSent")}
                options={settings.illustrationTemplates}
                selectedId={illustrationTemplateId}
                fallbackId={settings.illustrationTemplateId ?? ""}
                onChange={(id) =>
                  onUpdate({
                    gameStoryboardImagePromptTemplateId: id === settings.illustrationTemplateId ? null : id,
                  })
                }
              />
              <GamePromptTemplateSelect
                label={localizeUi("ui.chat.chatsettingsdrawer.storyboardVideoPrompt")}
                description={localizeUi("ui.chat.chatsettingsdrawer.combinesTheGeneratedKeyframeAndMotionPlanIntoThe")}
                options={settings.videoTemplates}
                selectedId={videoTemplateId}
                fallbackId={settings.videoTemplateId ?? ""}
                onChange={(id) =>
                  onUpdate({ gameStoryboardVideoPromptTemplateId: id === settings.videoTemplateId ? null : id })
                }
              />
            </div>
          </AgentSettingsSubsection>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--background)]/75 px-3 py-2 ring-1 ring-[var(--border)]">
            <p className="min-w-0 flex-1 text-[0.625rem] leading-snug text-[var(--muted-foreground)]">
              {localizeUi("ui.agents.storyboard.promptChainDescription")}
            </p>
            <button
              type="button"
              onClick={onOpenAgentSettings}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[var(--background)]/80 px-3 py-1.5 text-[0.6875rem] font-medium text-[var(--muted-foreground)] ring-1 ring-[var(--border)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
            >
              <Settings2 size="0.75rem" />
              <span>{localizeUi("ui.chat.chatsettingsdrawer.openSetup")}</span>
            </button>
          </div>
        </div>
      ) : null}
    </AgentSettingsCard>
  );
}

export default function StoryboardChatSettingsBridge({
  chatId,
  metadata,
  onClose,
}: StoryboardChatSettingsBridgeProps) {
  const { data: installedAgentManifests = [] } = useCapabilityAgentRegistry();
  const { data: agentConfigs } = useAgentConfigs();
  const { data: connections = [] } = useConnections();
  const updateMetadata = useUpdateChatMetadata();
  const connectionRows = connections as Array<{
    id: string;
    name: string;
    model?: string | null;
    provider?: string;
  }>;
  const installed = installedAgentManifests.some((agent) => agent.id === STORYBOARD_AGENT_ID);
  const storyboardConfig = (agentConfigs as AgentConfigRow[] | undefined)?.find(
    (config) => config.type === STORYBOARD_AGENT_ID,
  );
  const settings = useMemo(
    () =>
      normalizeStoryboardAgentSettings(
        mergeBuiltInAgentSettings(STORYBOARD_AGENT_ID, storyboardConfig?.settings),
      ),
    [storyboardConfig?.settings],
  );
  const promptConnections = useMemo(
    () =>
      filterLanguageGenerationConnections(connectionRows).map((connection) => ({
        id: connection.id,
        name: connection.name || "Connection",
        model: connection.model ?? null,
      })),
    [connectionRows],
  );
  const imageConnections = useMemo(
    () => connectionRows.filter((connection) => connection.provider === "image_generation"),
    [connectionRows],
  );
  const videoConnections = useMemo(
    () => connectionRows.filter((connection) => connection.provider === "video_generation"),
    [connectionRows],
  );
  const activeAgentIds = Array.isArray(metadata.activeAgentIds)
    ? metadata.activeAgentIds.filter((id): id is string => typeof id === "string")
    : [];
  const active = activeAgentIds.includes(STORYBOARD_AGENT_ID);

  if (!installed) return null;

  return (
    <StoryboardChatSettingsPanel
      cardId={`chat-settings-agent-menu-${chatId}-${STORYBOARD_AGENT_ID}`.replace(/[^a-zA-Z0-9_-]/g, "-")}
      active={active}
      settings={settings}
      metadata={metadata}
      promptConnections={promptConnections}
      imageConnections={imageConnections}
      videoConnections={videoConnections}
      onActiveChange={(enabled) =>
        updateMetadata.mutate({
          id: chatId,
          ...(enabled ? { enableAgents: true } : {}),
          activeAgentIds: enabled
            ? Array.from(new Set([...activeAgentIds, STORYBOARD_AGENT_ID]))
            : activeAgentIds.filter((id) => id !== STORYBOARD_AGENT_ID),
        })
      }
      onUpdate={(patch) => updateMetadata.mutate({ id: chatId, ...patch })}
      onOpenAgentSettings={() => {
        onClose();
        useUIStore.getState().openAgentDetail(STORYBOARD_AGENT_ID);
      }}
    />
  );
}
