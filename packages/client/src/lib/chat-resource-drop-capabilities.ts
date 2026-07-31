import type { Chat } from "@marinara-engine/shared";
import type { ChatResourceDragPayload } from "./chat-resource-drag";

export type ChatResourceDropAction =
  | { type: "add-characters"; ids: string[]; label: string }
  | { type: "add-lorebooks"; ids: string[]; label: string }
  | { type: "add-agents"; ids: string[]; label: string; mustEnableAgents: boolean }
  | { type: "set-persona"; id: string; label: string; replacesId: string | null }
  | { type: "set-preset"; id: string; label: string; replacesId: string | null }
  | { type: "set-connection"; id: string; label: string; replacesId: string | null };

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

export function resolveChatResourceDropAction(
  payload: ChatResourceDragPayload,
  chat: Pick<Chat, "characterIds" | "metadata" | "mode" | "personaId" | "promptPresetId" | "connectionId">,
): ChatResourceDropAction | null {
  const metadata: Record<string, unknown> =
    chat.metadata && typeof chat.metadata === "object" ? chat.metadata : {};

  if (payload.kind === "character") {
    const currentIds = new Set(readStringArray(chat.characterIds));
    const ids = payload.ids.filter((id) => !currentIds.has(id));
    return ids.length > 0 ? { type: "add-characters", ids, label: payload.label } : null;
  }

  if (payload.kind === "lorebook") {
    const currentIds = new Set(readStringArray(metadata.activeLorebookIds));
    const ids = payload.ids.filter((id) => !currentIds.has(id));
    return ids.length > 0 ? { type: "add-lorebooks", ids, label: payload.label } : null;
  }

  if (payload.kind === "agent") {
    const currentIds = new Set(readStringArray(metadata.activeAgentIds));
    const ids = payload.ids.filter((id) => !currentIds.has(id));
    return ids.length > 0
      ? {
          type: "add-agents",
          ids,
          label: payload.label,
          mustEnableAgents: metadata.enableAgents !== true,
        }
      : null;
  }

  const id = payload.ids[0];
  if (!id) return null;
  if (payload.kind === "persona") {
    return chat.personaId === id
      ? null
      : { type: "set-persona", id, label: payload.label, replacesId: chat.personaId ?? null };
  }
  if (payload.kind === "preset") {
    if (chat.mode === "conversation" || chat.promptPresetId === id) return null;
    return { type: "set-preset", id, label: payload.label, replacesId: chat.promptPresetId ?? null };
  }
  return chat.connectionId === id
    ? null
    : { type: "set-connection", id, label: payload.label, replacesId: chat.connectionId ?? null };
}
