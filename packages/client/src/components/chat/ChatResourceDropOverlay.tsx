import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bot, BookOpen, FileText, Image, Link, UserPlus, VenetianMask } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { Chat } from "@marinara-engine/shared";
import { useUpdateChat, useUpdateChatMetadata } from "../../hooks/use-chats";
import { usePersona } from "../../hooks/use-characters";
import { usePresets } from "../../hooks/use-presets";
import { useConnections } from "../../hooks/use-connections";
import { showConfirmDialog } from "../../lib/app-dialogs";
import {
  CHAT_RESOURCE_DRAG_MIME,
  clearActiveChatResourceDrag,
  getActiveChatResourceDrag,
  readChatResourceDragPayload,
  type ChatResourceDragPayload,
} from "../../lib/chat-resource-drag";
import {
  resolveChatResourceDropAction,
  type ChatResourceDropAction,
} from "../../lib/chat-resource-drop-capabilities";
import { getChatCharacterIds } from "../../lib/chat-macros";
import { chatBackgroundMetadataToUrl, chatBackgroundUrlToMetadata } from "../../lib/backgrounds";
import { useChatStore } from "../../stores/chat.store";
import { useUIStore } from "../../stores/ui.store";

type OverlayState = {
  payload: ChatResourceDragPayload;
  action: ChatResourceDropAction;
  rect: DOMRect;
};

function findDropSurface(target: EventTarget | null) {
  if (!(target instanceof Element) || target.closest("[data-chat-resource-drop-exclude]")) return null;
  return target.closest<HTMLElement>("[data-chat-resource-drop-surface]");
}

function getActionIcon(action: ChatResourceDropAction) {
  if (action.type === "add-characters") return <UserPlus size="1.25rem" />;
  if (action.type === "add-lorebooks") return <BookOpen size="1.25rem" />;
  if (action.type === "add-agents") return <Bot size="1.25rem" />;
  if (action.type === "set-persona") return <VenetianMask size="1.25rem" />;
  if (action.type === "set-preset") return <FileText size="1.25rem" />;
  if (action.type === "set-background") return <Image size="1.25rem" />;
  return <Link size="1.25rem" />;
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
      if (useChatStore.getState().activeChatId !== currentChat.id) return;
      let latestAction = resolveChatResourceDropAction(payload, currentChat);
      if (!latestAction) {
        toast.info(t("ui.chat.chatresourcedropoverlay.alreadyActive", { name: payload.label }));
        return;
      }

      if (latestAction.type === "add-agents" && latestAction.mustEnableAgents) {
        const confirmed = await showConfirmDialog({
          title: t("ui.chat.chatresourcedropoverlay.enableAgentsTitle"),
          message: t("ui.chat.chatresourcedropoverlay.enableAgentsMessage", { name: latestAction.label }),
          confirmLabel: t("ui.chat.chatresourcedropoverlay.enableAndAdd"),
        });
        if (!confirmed || useChatStore.getState().activeChatId !== currentChat.id) return;
        currentChat = useChatStore.getState().activeChat ?? chatRef.current;
        latestAction = resolveChatResourceDropAction(payload, currentChat);
        if (!latestAction) return;
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
          toast.success(t("ui.chat.chatresourcedropoverlay.addedToChat", { name: latestAction.label }), {
            action: {
              label: t("ui.chat.chatresourcedropoverlay.undo"),
              onClick: () => {
                const activeChat = useChatStore.getState().activeChat;
                if (!activeChat || activeChat.id !== currentChat.id || !sameIds(getChatCharacterIds(activeChat), nextIds)) {
                  toast.info(t("ui.chat.chatresourcedropoverlay.undoUnavailable"));
                  return;
                }
                updateChat.mutate({ id: currentChat.id, characterIds: previousIds });
              },
            },
          });
        } else if (latestAction.type === "add-lorebooks" || latestAction.type === "add-agents") {
          const metadata: Record<string, unknown> =
            currentChat.metadata && typeof currentChat.metadata === "object" ? currentChat.metadata : {};
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
                  const activeMetadata: Record<string, unknown> =
                    activeChat?.metadata && typeof activeChat.metadata === "object" ? activeChat.metadata : {};
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
            chatBackgroundMetadataToUrl(currentChat.metadata?.background),
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
                  chatBackgroundMetadataToUrl(activeChat?.metadata?.background),
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
          const metadata: Record<string, unknown> =
            currentChat.metadata && typeof currentChat.metadata === "object" ? currentChat.metadata : {};
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
          toast.success(t("ui.chat.chatresourcedropoverlay.appliedToChat", { name: latestAction.label }), {
            action: {
              label: t("ui.chat.chatresourcedropoverlay.undo"),
              onClick: () => {
                const activeChat = useChatStore.getState().activeChat;
                const activeMetadata: Record<string, unknown> =
                  activeChat?.metadata && typeof activeChat.metadata === "object" ? activeChat.metadata : {};
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
      event.dataTransfer.dropEffect = "copy";
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
  }, [applyAction, resolveOverlay]);

  if (!overlay) return null;
  return createPortal(
    <div
      className="pointer-events-none fixed z-[10010] flex items-center justify-center bg-[var(--background)]/35 p-6"
      style={{ left: overlay.rect.left, top: overlay.rect.top, width: overlay.rect.width, height: overlay.rect.height }}
      role="status"
      aria-live="polite"
    >
      <div className="flex max-w-sm items-center gap-3 rounded-lg border border-[var(--primary)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] shadow-xl">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)]">
          {getActionIcon(overlay.action)}
        </span>
        <span className="min-w-0 text-sm font-semibold">
          {overlay.action.type === "add-characters"
            ? t("ui.chat.chatresourcedropoverlay.addCharacters", { name: overlay.payload.label })
            : overlay.action.type === "add-lorebooks"
              ? t("ui.chat.chatresourcedropoverlay.addLorebooks", { name: overlay.payload.label })
              : overlay.action.type === "add-agents"
                ? t("ui.chat.chatresourcedropoverlay.addAgents", { name: overlay.payload.label })
                : overlay.action.type === "set-persona"
                  ? t("ui.chat.chatresourcedropoverlay.usePersona", { name: overlay.payload.label })
                  : overlay.action.type === "set-preset"
                    ? t("ui.chat.chatresourcedropoverlay.applyPreset", { name: overlay.payload.label })
                    : overlay.action.type === "set-connection"
                      ? t("ui.chat.chatresourcedropoverlay.useConnection", { name: overlay.payload.label })
                      : t("ui.chat.chatresourcedropoverlay.useBackground", { name: overlay.payload.label })}
        </span>
      </div>
    </div>,
    document.body,
  );
}
