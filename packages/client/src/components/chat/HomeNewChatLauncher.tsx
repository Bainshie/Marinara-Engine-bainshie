import { useState } from "react";
import { BookOpen, Gamepad2, MessageSquare, Plus } from "lucide-react";
import { useTranslation as useUiTranslation } from "react-i18next";
import type { ChatMode } from "@marinara-engine/shared";
import { useApplyChatPreset, useChatPresets } from "../../hooks/use-chat-presets";
import { useCreateChat } from "../../hooks/use-chats";
import { useConnections } from "../../hooks/use-connections";
import { useChatStore } from "../../stores/chat.store";
import { useUIStore } from "../../stores/ui.store";
import { Modal } from "../ui/Modal";

type LaunchMode = Exclude<ChatMode, "visual_novel">;

const MODE_OPTIONS: Array<{
  mode: LaunchMode;
  labelKey: string;
  descriptionKey: string;
  icon: typeof MessageSquare;
}> = [
  {
    mode: "conversation",
    labelKey: "settings.modes.conversation",
    descriptionKey: "home.newChat.conversationDescription",
    icon: MessageSquare,
  },
  {
    mode: "roleplay",
    labelKey: "settings.modes.roleplay",
    descriptionKey: "home.newChat.roleplayDescription",
    icon: BookOpen,
  },
  {
    mode: "game",
    labelKey: "settings.modes.game",
    descriptionKey: "home.newChat.gameDescription",
    icon: Gamepad2,
  },
];

export function HomeNewChatLauncher() {
  const { t: localizeUi } = useUiTranslation();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const { data: connections } = useConnections();
  const { data: chatPresetsData } = useChatPresets();
  const createChat = useCreateChat();
  const applyChatPreset = useApplyChatPreset();

  const selectMode = (mode: LaunchMode) => {
    setSelectorOpen(false);
    const connectionRows = ((connections ?? []) as Array<{ id: string }>).filter((connection) => !!connection.id);
    const store = useChatStore.getState();
    if (connectionRows.length === 0) {
      store.setPendingNewChatMode(mode, "home");
      return;
    }

    const presets = chatPresetsData ?? [];
    const presetMode = mode === "conversation" || mode === "roleplay" ? mode : null;
    const starred = presetMode
      ? (presets.find((preset) => preset.mode === presetMode && preset.isActive && !preset.isDefault) ?? null)
      : null;
    const modeLabel = localizeUi(MODE_OPTIONS.find((option) => option.mode === mode)?.labelKey ?? mode);
    createChat.mutate(
      {
        name: localizeUi("home.newChat.defaultName", { mode: modeLabel }),
        mode,
        characterIds: [],
        connectionId: starred?.settings.connectionId ?? undefined,
        promptPresetId: starred?.settings.promptPresetId ?? undefined,
      },
      {
        onSuccess: (chat) => {
          useUIStore.getState().setSidebarOpen(true);
          store.setActiveChatId(chat.id);
          store.setShouldOpenSettings(true);
          store.setShouldOpenWizard(true);
          if (starred) {
            void applyChatPreset.mutateAsync({ presetId: starred.id, chatId: chat.id }).catch(() => {
              /* Non-fatal: the setup wizard still opens with system defaults. */
            });
          }
        },
      },
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setSelectorOpen(true)}
        className="mari-chrome-control mari-chrome-control--small h-8 px-3 py-0 text-xs"
      >
        <Plus size="0.75rem" />
        {localizeUi("home.actions.newChat")}
      </button>

      <Modal
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        title={localizeUi("home.newChat.chooseMode")}
        width="max-w-2xl"
      >
        <div className="grid gap-2 sm:grid-cols-3">
          {MODE_OPTIONS.map(({ mode, labelKey, descriptionKey, icon: Icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => selectMode(mode)}
              disabled={createChat.isPending}
              className="mari-chat-option-field group flex min-h-24 items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[var(--marinara-chat-chrome-highlight-bg-hover)] disabled:cursor-wait disabled:opacity-60"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--marinara-chat-chrome-highlight-bg)] text-[var(--marinara-chat-chrome-button-text-active)] ring-1 ring-[var(--marinara-chat-chrome-button-border-active)]">
                <Icon size="0.875rem" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-[var(--foreground)]">{localizeUi(labelKey)}</span>
                <span className="mt-1 block text-[0.6875rem] leading-relaxed text-[var(--muted-foreground)]">
                  {localizeUi(descriptionKey)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
