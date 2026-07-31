import assert from "node:assert/strict";
import { resolveChatResourceDropAction } from "../../packages/client/src/lib/chat-resource-drop-capabilities.js";
import { parseChatResourceDragPayload } from "../../packages/client/src/lib/chat-resource-drag.js";

const baseChat = {
  characterIds: ["character-1"],
  metadata: {
    activeLorebookIds: ["lorebook-1"],
    activeAgentIds: ["agent-1"],
    enableAgents: true,
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
assert.equal(parseChatResourceDragPayload({ version: 1, kind: "preset", ids: ["preset-1"], label: "A" }), null);
assert.equal(parseChatResourceDragPayload({ version: 1, kind: "agent", ids: [], label: "A" }), null);

console.info("Chat resource drop regressions passed.");
