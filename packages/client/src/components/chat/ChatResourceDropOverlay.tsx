import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bot, BookOpen, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { Chat } from "@marinara-engine/shared";
import { useUpdateChat, useUpdateChatMetadata } from "../../hooks/use-chats";
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
import { useChatStore } from "../../stores/chat.store";

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
  return <Bot size="1.25rem" />;
}

function sameIds(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export function ChatResourceDropOverlay({ chat }: { chat: Chat }) {
  const { t } = useTranslation();
  const updateChat = useUpdateChat();
  const updateMetadata = useUpdateChatMetadata();
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
    async (action: ChatResourceDropAction) => {
      const payload: ChatResourceDragPayload = {
        version: 1,
        kind:
          action.type === "add-characters" ? "character" : action.type === "add-lorebooks" ? "lorebook" : "agent",
        ids: action.ids,
        label: action.label,
      };
      let currentChat = useChatStore.getState().activeChat ?? chatRef.current;
      if (useChatStore.getState().activeChatId !== currentChat.id) return;
      let latestAction = resolveChatResourceDropAction(payload, currentChat);
      if (!latestAction) {
        toast.info(t("ui.chat.chatresourcedropoverlay.alreadyActive", { name: action.label }));
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
        } else {
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
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("ui.chat.chatresourcedropoverlay.failed"));
      }
    },
    [t, updateChat, updateMetadata],
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
      void applyAction(next.action);
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
      className="pointer-events-none fixed z-[90] flex items-center justify-center bg-[var(--background)]/35 p-6"
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
              : t("ui.chat.chatresourcedropoverlay.addAgents", { name: overlay.payload.label })}
        </span>
      </div>
    </div>,
    document.body,
  );
}
