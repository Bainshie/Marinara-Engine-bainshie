import type { Chat } from "@marinara-engine/shared";
import type { ChatResourceDragPayload } from "./chat-resource-drag";

export type ChatResourceDropAction =
  | { type: "add-characters"; ids: string[]; label: string }
  | { type: "add-lorebooks"; ids: string[]; label: string }
  | { type: "add-agents"; ids: string[]; label: string; mustEnableAgents: boolean };

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

export function resolveChatResourceDropAction(
  payload: ChatResourceDragPayload,
  chat: Pick<Chat, "characterIds" | "metadata">,
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
