export const CHAT_RESOURCE_DRAG_MIME = "application/x-marinara-chat-resource";

export type ChatResourceDragKind = "character" | "lorebook" | "agent" | "persona" | "preset" | "connection";

export type ChatResourceDragPayload = {
  version: 1;
  kind: ChatResourceDragKind;
  ids: string[];
  label: string;
};

let activeChatResourceDrag: ChatResourceDragPayload | null = null;

export function parseChatResourceDragPayload(value: unknown): ChatResourceDragPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const payload = value as Record<string, unknown>;
  if (payload.version !== 1) return null;
  if (
    payload.kind !== "character" &&
    payload.kind !== "lorebook" &&
    payload.kind !== "agent" &&
    payload.kind !== "persona" &&
    payload.kind !== "preset" &&
    payload.kind !== "connection"
  ) {
    return null;
  }
  if (!Array.isArray(payload.ids) || payload.ids.length === 0 || payload.ids.length > 100) return null;
  const ids = Array.from(
    new Set(payload.ids.filter((id): id is string => typeof id === "string" && id.trim().length > 0)),
  );
  if (ids.length === 0) return null;
  if (typeof payload.label !== "string" || !payload.label.trim()) return null;
  return { version: 1, kind: payload.kind, ids, label: payload.label.trim() };
}

export function readChatResourceDragPayload(dataTransfer: DataTransfer): ChatResourceDragPayload | null {
  const raw = dataTransfer.getData(CHAT_RESOURCE_DRAG_MIME);
  if (!raw) return activeChatResourceDrag;
  try {
    return parseChatResourceDragPayload(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeChatResourceDragPayload(dataTransfer: DataTransfer, payload: ChatResourceDragPayload) {
  activeChatResourceDrag = payload;
  dataTransfer.setData(CHAT_RESOURCE_DRAG_MIME, JSON.stringify(payload));
}

export function getActiveChatResourceDrag() {
  return activeChatResourceDrag;
}

export function clearActiveChatResourceDrag() {
  activeChatResourceDrag = null;
}

export function isChatResourceDrag(dataTransfer: DataTransfer) {
  return dataTransfer.types.includes(CHAT_RESOURCE_DRAG_MIME) || activeChatResourceDrag !== null;
}

export function isFileDrag(dataTransfer: DataTransfer) {
  return dataTransfer.types.includes("Files") || Array.from(dataTransfer.items).some((item) => item.kind === "file");
}
