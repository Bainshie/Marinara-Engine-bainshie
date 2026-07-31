import assert from "node:assert/strict";
import { resolveChatResourceDropAction } from "../../packages/client/src/lib/chat-resource-drop-capabilities.js";
import { parseChatResourceDragPayload } from "../../packages/client/src/lib/chat-resource-drag.js";

const baseChat = {
  mode: "roleplay" as const,
  characterIds: ["character-1"],
  personaId: "persona-1",
  promptPresetId: "preset-1",
  connectionId: "connection-1",
  metadata: {
    activeLorebookIds: ["lorebook-1"],
    activeAgentIds: ["agent-1"],
    enableAgents: true,
    background: "current-background.png",
  },
};

assert.deepEqual(
  resolveChatResourceDropAction(
    { version: 1, kind: "character", ids: ["character-1", "character-2"], label: "Two characters" },
    baseChat,
  ),
  { type: "add-characters", ids: ["character-2"], label: "Two characters" },
);

assert.equal(
  resolveChatResourceDropAction(
    { version: 1, kind: "character", ids: ["character-1"], label: "Existing character" },
    baseChat,
  ),
  null,
);
assert.deepEqual(
  resolveChatResourceDropAction(
    {
      version: 1,
      kind: "background",
      ids: ["/api/backgrounds/file/new-background.png"],
      label: "New background",
    },
    baseChat,
  ),
  {
    type: "set-background",
    id: "/api/backgrounds/file/new-background.png",
    label: "New background",
  },
);
assert.equal(
  resolveChatResourceDropAction(
    {
      version: 1,
      kind: "background",
      ids: ["/api/backgrounds/file/current-background.png"],
      label: "Current background",
    },
    baseChat,
  ),
  null,
);

assert.deepEqual(
  resolveChatResourceDropAction(
    { version: 1, kind: "lorebook", ids: ["lorebook-2"], label: "New lorebook" },
    baseChat,
  ),
  { type: "add-lorebooks", ids: ["lorebook-2"], label: "New lorebook" },
);

assert.equal(
  resolveChatResourceDropAction(
    { version: 1, kind: "lorebook", ids: ["lorebook-1"], label: "Existing lorebook" },
    baseChat,
  ),
  null,
);

assert.deepEqual(
  resolveChatResourceDropAction(
    { version: 1, kind: "agent", ids: ["agent-2"], label: "New agent" },
    { ...baseChat, metadata: { ...baseChat.metadata, enableAgents: false } },
  ),
  { type: "add-agents", ids: ["agent-2"], label: "New agent", mustEnableAgents: true },
);

assert.equal(
  resolveChatResourceDropAction(
    { version: 1, kind: "agent", ids: ["agent-1"], label: "Existing agent" },
    baseChat,
  ),
  null,
);

assert.deepEqual(
  parseChatResourceDragPayload({
    version: 1,
    kind: "character",
    ids: ["character-1", "character-1", "character-2"],
    label: "  Characters  ",
  }),
  { version: 1, kind: "character", ids: ["character-1", "character-2"], label: "Characters" },
);
assert.equal(parseChatResourceDragPayload({ version: 2, kind: "character", ids: ["character-1"], label: "A" }), null);
assert.equal(parseChatResourceDragPayload({ version: 1, kind: "unknown", ids: ["resource-1"], label: "A" }), null);
assert.equal(parseChatResourceDragPayload({ version: 1, kind: "agent", ids: [], label: "A" }), null);

assert.deepEqual(
  resolveChatResourceDropAction(
    { version: 1, kind: "persona", ids: ["persona-2"], label: "New persona" },
    baseChat,
  ),
  { type: "set-persona", id: "persona-2", label: "New persona", replacesId: "persona-1" },
);
assert.equal(
  resolveChatResourceDropAction(
    { version: 1, kind: "persona", ids: ["persona-1"], label: "Current persona" },
    baseChat,
  ),
  null,
);
assert.deepEqual(
  resolveChatResourceDropAction(
    { version: 1, kind: "preset", ids: ["preset-2"], label: "New preset" },
    baseChat,
  ),
  { type: "set-preset", id: "preset-2", label: "New preset", replacesId: "preset-1" },
);
assert.equal(
  resolveChatResourceDropAction(
    { version: 1, kind: "preset", ids: ["preset-2"], label: "New preset" },
    { ...baseChat, mode: "conversation" },
  ),
  null,
);
assert.deepEqual(
  resolveChatResourceDropAction(
    { version: 1, kind: "connection", ids: ["connection-2"], label: "New connection" },
    baseChat,
  ),
  { type: "set-connection", id: "connection-2", label: "New connection", replacesId: "connection-1" },
);
assert.equal(
  resolveChatResourceDropAction(
    { version: 1, kind: "connection", ids: ["connection-1"], label: "Current connection" },
    baseChat,
  ),
  null,
);

console.info("Chat resource drop regressions passed.");
