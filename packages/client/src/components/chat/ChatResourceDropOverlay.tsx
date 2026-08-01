import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Ban, Bot, BookOpen, FileText, Image, Link, UserPlus, VenetianMask } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { Chat } from "@marinara-engine/shared";
import { useUpdateChat, useUpdateChatMetadata } from "../../hooks/use-chats";
import { usePersona } from "../../hooks/use-characters";
import { usePresets } from "../../hooks/use-presets";
import { useConnections } from "../../hooks/use-connections";
import { api } from "../../lib/api-client";
import { showConfirmDialog } from "../../lib/app-dialogs";
import {
  CHAT_RESOURCE_DRAG_MIME,
  CHAT_RESOURCE_ASSIGN_EVENT,
  requestChatAgentSetup,
  clearActiveChatResourceDrag,
  getActiveChatResourceDrag,
  readChatResourceDragPayload,
  type ChatResourceDragPayload,
} from "../../lib/chat-resource-drag";
import {
  resolveChatResourceDropAction,
  type ChatResourceDropAction,
  type ChatResourceDropBlock,
  type ChatResourceDropResult,
} from "../../lib/chat-resource-drop-capabilities";
import { getChatCharacterIds } from "../../lib/chat-macros";
import { parseChatMetadata } from "../../lib/chat-display";
import { chatBackgroundMetadataToUrl, chatBackgroundUrlToMetadata } from "../../lib/backgrounds";
import { useChatStore } from "../../stores/chat.store";
import { useUIStore } from "../../stores/ui.store";
import { ChoiceSelectionModal } from "../presets/ChoiceSelectionModal";
import { ChatCharacterDropOptions } from "./ChatCharacterDropOptions";

type CharacterDropOptions = { chatId: string; characterId: string; characterName: string; askGreeting: boolean };

type OverlayState = {
  payload: ChatResourceDragPayload;
  action: ChatResourceDropResult;
  rect: DOMRect;
};

function findDropSurface(target: EventTarget | null) {
  if (!(target instanceof Element) || target.closest("[data-chat-resource-drop-exclude]")) return null;
  return target.closest<HTMLElement>("[data-chat-resource-drop-surface]");
}

function getActionIcon(action: ChatResourceDropResult) {
  if (action.type === "blocked") return <Ban size="1.5rem" />;
  if (action.type === "add-characters") return <UserPlus size="1.5rem" />;
  if (action.type === "add-lorebooks") return <BookOpen size="1.5rem" />;
  if (action.type === "add-agents") return <Bot size="1.5rem" />;
  if (action.type === "set-persona") return <VenetianMask size="1.5rem" />;
  if (action.type === "set-preset") return <FileText size="1.5rem" />;
  if (action.type === "set-background") return <Image size="1.5rem" />;
  return <Link size="1.5rem" />;
}

/** Each resource keeps its library colour (lorebooks amber, personas emerald, …) while it is dragged. */
const ACTION_ACCENT_CLASS: Record<ChatResourceDropAction["type"], string> = {
  "add-characters": "mari-panel-gradient--characters",
  "add-lorebooks": "mari-panel-gradient--lorebooks",
  "add-agents": "mari-panel-gradient--agents",
  "set-persona": "mari-panel-gradient--personas",
  "set-preset": "mari-panel-gradient--presets",
  "set-connection": "mari-panel-gradient--connections",
  "set-background": "mari-panel-gradient--backgrounds",
};

const ACTION_TITLE_KEY: Record<ChatResourceDropAction["type"], string> = {
  "add-characters": "ui.chat.chatresourcedropoverlay.addCharacters",
  "add-lorebooks": "ui.chat.chatresourcedropoverlay.addLorebooks",
  "add-agents": "ui.chat.chatresourcedropoverlay.addAgents",
  "set-persona": "ui.chat.chatresourcedropoverlay.usePersona",
  "set-preset": "ui.chat.chatresourcedropoverlay.applyPreset",
  "set-connection": "ui.chat.chatresourcedropoverlay.useConnection",
  "set-background": "ui.chat.chatresourcedropoverlay.useBackground",
};

const ACTION_HINT_KEY: Record<ChatResourceDropAction["type"], string> = {
  "add-characters": "ui.chat.chatresourcedropoverlay.hintCharacters",
  "add-lorebooks": "ui.chat.chatresourcedropoverlay.hintLorebooks",
  "add-agents": "ui.chat.chatresourcedropoverlay.hintAgents",
  "set-persona": "ui.chat.chatresourcedropoverlay.hintPersona",
  "set-preset": "ui.chat.chatresourcedropoverlay.hintPreset",
  "set-connection": "ui.chat.chatresourcedropoverlay.hintConnection",
  "set-background": "ui.chat.chatresourcedropoverlay.hintBackground",
};

function blockedKey(action: ChatResourceDropBlock) {
  if (action.reason === "preset-unsupported-mode") return "ui.chat.chatresourcedropoverlay.presetUnsupportedMode";
  if (action.reason === "agent-unsupported-mode") return "ui.chat.chatresourcedropoverlay.agentUnsupportedMode";
  if (action.reason === "connection-kind") return "ui.chat.chatresourcedropoverlay.connectionUnsupportedKind";
  return "ui.chat.chatresourcedropoverlay.alreadyActive";
}

function sameIds(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function hasPresetChoices(value: unknown) {
  return !!value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;
}

export function ChatResourceDropOverlay({ chat }: { chat: Chat }) {
  const { t } = useTranslation();
  const updateChat = useUpdateChat();
  const updateMetadata = useUpdateChatMetadata();
  const { data: currentPersona } = usePersona(chat.personaId);
  const { data: presets = [] } = usePresets();
  const { data: connections = [] } = useConnections();
  const chatRef = useRef(chat);
  const [overlay, setOverlay] = useState<OverlayState | null>(null);
  const [choicePresetId, setChoicePresetId] = useState<string | null>(null);
  const [characterOptions, setCharacterOptions] = useState<CharacterDropOptions | null>(null);
  chatRef.current = chat;

  const resolveOverlay = useCallback((target: EventTarget | null, dataTransfer: DataTransfer) => {
    if (!dataTransfer.types.includes(CHAT_RESOURCE_DRAG_MIME) && !getActiveChatResourceDrag()) return null;
    const surface = findDropSurface(target);
    if (!surface) return null;
    const payload = readChatResourceDragPayload(dataTransfer);
    if (!payload) return null;
    const currentChat = chatRef.current;
    const action = resolveChatResourceDropAction(payload, currentChat);
    return action ? { payload, action, rect: surface.getBoundingClientRect() } : null;
  }, []);

  const applyAction = useCallback(
    async (payload: ChatResourceDragPayload) => {
      let currentChat = useChatStore.getState().activeChat ?? chatRef.current;
      if (useChatStore.getState().activeChatId !== currentChat.id) {
        toast.info(t("ui.chat.chatresourcedropoverlay.chatChanged"));
        return;
      }
      let latestAction = resolveChatResourceDropAction(payload, currentChat);
      if (!latestAction) return;
      if (latestAction.type === "blocked") {
        toast.info(t(blockedKey(latestAction), { name: latestAction.label }));
        return;
      }

      if (latestAction.type === "add-agents") {
        requestChatAgentSetup(latestAction.ids);
        return;
      }

      if (latestAction.type === "set-connection") {
        const connectionId = latestAction.id;
        const connection = (connections as Array<{ id: string; model?: string | null; provider?: string | null }>).find(
          (item) => item.id === connectionId,
        );
        if (!connection?.model?.trim() && connection?.provider !== "grok_subscription") {
          useUIStore.getState().openConnectionDetail(connectionId);
          toast.info(t("ui.chat.chatresourcedropoverlay.connectionNeedsSetup", { name: latestAction.label }));
          return;
        }
      }

      if (
        (latestAction.type === "set-persona" ||
          latestAction.type === "set-preset" ||
          latestAction.type === "set-connection") &&
        latestAction.replacesId
      ) {
        const replacementAction = latestAction;
        const currentName =
          replacementAction.type === "set-persona"
            ? (currentPersona?.name ?? t("ui.chat.chatresourcedropoverlay.currentPersona"))
            : replacementAction.type === "set-preset"
              ? ((presets as Array<{ id: string; name: string }>).find(
                  (item) => item.id === replacementAction.replacesId,
                )?.name ?? t("ui.chat.chatresourcedropoverlay.currentPreset"))
              : ((connections as Array<{ id: string; name: string }>).find(
                    (item) => item.id === replacementAction.replacesId,
                  )?.name ?? t("ui.chat.chatresourcedropoverlay.currentConnection"));
        const confirmed = await showConfirmDialog({
          title:
            replacementAction.type === "set-persona"
              ? t("ui.chat.chatresourcedropoverlay.replacePersonaTitle")
              : replacementAction.type === "set-preset"
                ? t("ui.chat.chatresourcedropoverlay.replacePresetTitle")
                : t("ui.chat.chatresourcedropoverlay.switchConnectionTitle"),
          message: t("ui.chat.chatresourcedropoverlay.replaceMessage", {
            current: currentName,
            next: replacementAction.label,
          }),
          confirmLabel:
            replacementAction.type === "set-connection"
              ? t("ui.chat.chatresourcedropoverlay.switch")
              : t("ui.chat.chatresourcedropoverlay.replace"),
        });
        if (!confirmed || useChatStore.getState().activeChatId !== currentChat.id) return;
        currentChat = useChatStore.getState().activeChat ?? chatRef.current;
        latestAction = resolveChatResourceDropAction(payload, currentChat);
        if (!latestAction) return;
        if (latestAction.type === "blocked") {
          toast.info(t(blockedKey(latestAction), { name: latestAction.label }));
          return;
        }
        if (
          (latestAction.type === "set-persona" ||
            latestAction.type === "set-preset" ||
            latestAction.type === "set-connection") &&
          latestAction.replacesId !== replacementAction.replacesId
        ) {
          toast.info(t("ui.chat.chatresourcedropoverlay.chatChanged"));
          return;
        }
      }

      try {
        if (latestAction.type === "add-characters") {
          const previousIds = getChatCharacterIds(currentChat);
          const nextIds = Array.from(new Set([...previousIds, ...latestAction.ids]));
          await updateChat.mutateAsync({
            id: currentChat.id,
            characterIds: nextIds,
          });
          if (latestAction.ids.length === 1) {
            setCharacterOptions({
              chatId: currentChat.id,
              characterId: latestAction.ids[0]!,
              characterName: latestAction.label,
              askGreeting: currentChat.mode !== "conversation",
            });
          }
          toast.success(t("ui.chat.chatresourcedropoverlay.addedToChat", { name: latestAction.label }), {
            action: {
              label: t("ui.chat.chatresourcedropoverlay.undo"),
              onClick: () => {
                const activeChat = useChatStore.getState().activeChat;
                if (!activeChat || activeChat.id !== currentChat.id || !sameIds(getChatCharacterIds(activeChat), nextIds)) {
                  toast.info(t("ui.chat.chatresourcedropoverlay.undoUnavailable"));
                  return;
                }
                setCharacterOptions(null);
                updateChat.mutate({ id: currentChat.id, characterIds: previousIds });
              },
            },
          });
        } else if (latestAction.type === "add-lorebooks" || latestAction.type === "add-agents") {
          const metadata = parseChatMetadata(currentChat.metadata);
          const key = latestAction.type === "add-lorebooks" ? "activeLorebookIds" : "activeAgentIds";
          const previousIds = Array.isArray(metadata[key])
            ? metadata[key].filter((id): id is string => typeof id === "string")
            : [];
          const nextIds = Array.from(new Set([...previousIds, ...latestAction.ids]));
          const previousEnableAgents = metadata.enableAgents === true;
          await updateMetadata.mutateAsync({
            id: currentChat.id,
            [key]: nextIds,
            ...(latestAction.type === "add-agents" && latestAction.mustEnableAgents ? { enableAgents: true } : {}),
          });
          toast.success(
            t(
              latestAction.type === "add-lorebooks"
                ? "ui.chat.chatresourcedropoverlay.addedToContext"
                : "ui.chat.chatresourcedropoverlay.addedToChat",
              { name: latestAction.label },
            ),
            {
              action: {
                label: t("ui.chat.chatresourcedropoverlay.undo"),
                onClick: () => {
                  const activeChat = useChatStore.getState().activeChat;
                  const activeMetadata = parseChatMetadata(activeChat?.metadata);
                  const activeIds = Array.isArray(activeMetadata[key])
                    ? activeMetadata[key].filter((id): id is string => typeof id === "string")
                    : [];
                  if (!activeChat || activeChat.id !== currentChat.id || !sameIds(activeIds, nextIds)) {
                    toast.info(t("ui.chat.chatresourcedropoverlay.undoUnavailable"));
                    return;
                  }
                  updateMetadata.mutate({
                    id: currentChat.id,
                    [key]: previousIds,
                    ...(latestAction.type === "add-agents" ? { enableAgents: previousEnableAgents } : {}),
                  });
                },
              },
            },
          );
        } else if (latestAction.type === "set-background") {
          const previousBackground = chatBackgroundUrlToMetadata(
            chatBackgroundMetadataToUrl(parseChatMetadata(currentChat.metadata).background),
          );
          const previousBackgroundUrl = useUIStore.getState().chatBackground;
          const nextBackground = chatBackgroundUrlToMetadata(latestAction.id);
          useUIStore.getState().setChatBackground(latestAction.id);
          try {
            await updateMetadata.mutateAsync({ id: currentChat.id, background: nextBackground });
          } catch (error) {
            useUIStore.getState().setChatBackground(previousBackgroundUrl);
            throw error;
          }
          toast.success(t("ui.chat.chatresourcedropoverlay.appliedToChat", { name: latestAction.label }), {
            action: {
              label: t("ui.chat.chatresourcedropoverlay.undo"),
              onClick: () => {
                const activeChat = useChatStore.getState().activeChat;
                const activeBackground = chatBackgroundUrlToMetadata(
                  chatBackgroundMetadataToUrl(parseChatMetadata(activeChat?.metadata).background),
                );
                if (!activeChat || activeChat.id !== currentChat.id || activeBackground !== nextBackground) {
                  toast.info(t("ui.chat.chatresourcedropoverlay.undoUnavailable"));
                  return;
                }
                useUIStore.getState().setChatBackground(previousBackgroundUrl);
                updateMetadata.mutate({ id: currentChat.id, background: previousBackground });
              },
            },
          });
        } else {
          const field =
            latestAction.type === "set-persona"
              ? "personaId"
              : latestAction.type === "set-preset"
                ? "promptPresetId"
                : "connectionId";
          const previousId = latestAction.replacesId;
          const metadata = parseChatMetadata(currentChat.metadata);
          const previousPresetChoices = metadata.presetChoices;
          if (latestAction.type === "set-preset") {
            await updateMetadata.mutateAsync({ id: currentChat.id, presetChoices: {} });
          }
          try {
            await updateChat.mutateAsync({ id: currentChat.id, [field]: latestAction.id });
          } catch (error) {
            if (latestAction.type === "set-preset") {
              await updateMetadata
                .mutateAsync({ id: currentChat.id, presetChoices: previousPresetChoices ?? {} })
                .catch(() => undefined);
            }
            throw error;
          }
          if (latestAction.type === "set-preset") {
            try {
              const presetFull = await api.get<{ choiceBlocks?: unknown[] }>(`/prompts/${latestAction.id}/full`);
              if ((presetFull.choiceBlocks?.length ?? 0) > 0) setChoicePresetId(latestAction.id);
            } catch {
              setChoicePresetId(null);
            }
          }
          toast.success(t("ui.chat.chatresourcedropoverlay.appliedToChat", { name: latestAction.label }), {
            action: {
              label: t("ui.chat.chatresourcedropoverlay.undo"),
              onClick: () => {
                const activeChat = useChatStore.getState().activeChat;
                const activeMetadata = parseChatMetadata(activeChat?.metadata);
                if (
                  !activeChat ||
                  activeChat.id !== currentChat.id ||
                  activeChat[field] !== latestAction.id ||
                  (latestAction.type === "set-preset" && hasPresetChoices(activeMetadata.presetChoices))
                ) {
                  toast.info(t("ui.chat.chatresourcedropoverlay.undoUnavailable"));
                  return;
                }
                if (latestAction.type === "set-preset") {
                  updateMetadata.mutate({ id: currentChat.id, presetChoices: previousPresetChoices ?? {} });
                }
                updateChat.mutate({ id: currentChat.id, [field]: previousId });
              },
            },
          });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("ui.chat.chatresourcedropoverlay.failed"));
      }
    },
    [connections, currentPersona?.name, presets, t, updateChat, updateMetadata],
  );

  useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      if (!event.dataTransfer) return;
      const next = resolveOverlay(event.target, event.dataTransfer);
      if (!next) {
        setOverlay(null);
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = next.action.type === "blocked" ? "none" : "copy";
      setOverlay(next);
    };
    const handleDrop = (event: DragEvent) => {
      if (!event.dataTransfer) return;
      const next = resolveOverlay(event.target, event.dataTransfer);
      setOverlay(null);
      clearActiveChatResourceDrag();
      if (!next) return;
      event.preventDefault();
      event.stopPropagation();
      if (next.action.type === "blocked") {
        toast.info(t(blockedKey(next.action), { name: next.action.label }));
        return;
      }
      void applyAction(next.payload);
    };
    const clear = () => {
      setOverlay(null);
      clearActiveChatResourceDrag();
    };
    window.addEventListener("dragover", handleDragOver, true);
    window.addEventListener("drop", handleDrop, true);
    window.addEventListener("dragend", clear, true);
    return () => {
      window.removeEventListener("dragover", handleDragOver, true);
      window.removeEventListener("drop", handleDrop, true);
      window.removeEventListener("dragend", clear, true);
    };
  }, [applyAction, resolveOverlay, t]);

  useEffect(() => {
    const assign = (event: Event) => {
      const payload = (event as CustomEvent<ChatResourceDragPayload>).detail;
      if (payload) void applyAction(payload);
    };
    window.addEventListener(CHAT_RESOURCE_ASSIGN_EVENT, assign);
    return () => window.removeEventListener(CHAT_RESOURCE_ASSIGN_EVENT, assign);
  }, [applyAction]);

  return (
    <>
      {overlay &&
        createPortal(
          <div
            className={`mari-chat-drop-zone pointer-events-none fixed z-[10010] flex items-center justify-center p-8 ${
              overlay.action.type === "blocked"
                ? "mari-chat-drop-zone--blocked"
                : ACTION_ACCENT_CLASS[overlay.action.type]
            }`}
            style={{
              left: overlay.rect.left,
              top: overlay.rect.top,
              width: overlay.rect.width,
              height: overlay.rect.height,
            }}
            role="status"
            aria-live="polite"
          >
            <div
              className={`mari-chat-drop-card flex max-w-md items-center gap-4 rounded-2xl border-2 bg-[var(--card)]/95 px-6 py-5 shadow-2xl backdrop-blur-sm ${
                overlay.action.type === "blocked" ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
              }`}
            >
              <span
                className={
                  overlay.action.type === "blocked"
                    ? "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--destructive)]/15 text-[var(--destructive)]"
                    : "mari-chat-drop-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                }
              >
                {getActionIcon(overlay.action)}
              </span>
              <span className="min-w-0">
                <span className="block text-base font-semibold leading-snug">
                  {overlay.action.type === "blocked"
                    ? t(blockedKey(overlay.action), { name: overlay.payload.label })
                    : t(ACTION_TITLE_KEY[overlay.action.type], { name: overlay.payload.label })}
                </span>
                <span className="mt-1 block text-xs font-normal leading-relaxed text-[var(--muted-foreground)]">
                  {overlay.action.type === "blocked"
                    ? t("ui.chat.chatresourcedropoverlay.cannotDropHint")
                    : t(ACTION_HINT_KEY[overlay.action.type])}
                </span>
              </span>
            </div>
          </div>,
          document.body,
        )}
      <ChoiceSelectionModal
        open={choicePresetId !== null}
        onClose={() => setChoicePresetId(null)}
        presetId={choicePresetId}
        chatId={chat.id}
        existingChoices={{}}
        chatFloatingPanel
      />
      {characterOptions && (
        <ChatCharacterDropOptions
          key={`${characterOptions.chatId}:${characterOptions.characterId}`}
          {...characterOptions}
          onClose={() => setCharacterOptions(null)}
        />
      )}
    </>
  );
}
