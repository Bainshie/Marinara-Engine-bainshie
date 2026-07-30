import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createFileNativeDB } from "../../packages/server/src/db/file-backed-store.js";
import { memoryChunks } from "../../packages/server/src/db/schema/index.js";
import { resolveRoleplayChatSummary } from "../../packages/server/src/routes/generate/generate-route-utils.js";
import { injectMemoryRecallContext } from "../../packages/server/src/services/generation/memory-recall-context.js";
import {
  chunkAndEmbedMessages,
  recallMemories,
  type MemoryRecallEmbeddingSource,
} from "../../packages/server/src/services/memory-recall.js";
import { createChatsStorage } from "../../packages/server/src/services/storage/chats.storage.js";

const summaryMetadata = {
  summary: "Settled history.\n\nDiscarded assistant response.",
  summaryEntries: [
    {
      id: "settled-summary",
      origin: "automated",
      content: "Settled history.",
      enabled: true,
      messageIds: ["older-user", "older-assistant"],
      createdAt: "2026-07-29T08:00:00.000Z",
      updatedAt: "2026-07-29T08:00:00.000Z",
    },
    {
      id: "contaminated-summary",
      origin: "automated",
      content: "Discarded assistant response.",
      enabled: true,
      messageIds: ["latest-user", "regenerated-assistant"],
      createdAt: "2026-07-29T10:00:00.000Z",
      updatedAt: "2026-07-29T10:00:00.000Z",
    },
  ],
};

assert.equal(
  resolveRoleplayChatSummary("roleplay", summaryMetadata),
  summaryMetadata.summary,
  "ordinary roleplay generations must retain the complete compiled summary",
);
assert.equal(
  resolveRoleplayChatSummary("roleplay", summaryMetadata, {
    excludeMessageIds: ["regenerated-assistant"],
  }),
  "Settled history.",
  "regeneration must drop every summary entry covering the response being replaced",
);
assert.equal(
  resolveRoleplayChatSummary("visual_novel", summaryMetadata, {
    excludeMessageIds: ["older-user", "regenerated-assistant"],
  }),
  null,
  "regeneration must omit the summary block when every entry covers an excluded message",
);
assert.equal(
  resolveRoleplayChatSummary("roleplay", summaryMetadata, {
    excludeMessageIds: ["message-not-covered-by-summary"],
  }),
  summaryMetadata.summary,
  "unrelated regeneration targets must leave the precompiled summary unchanged",
);
assert.equal(
  resolveRoleplayChatSummary(
    "roleplay",
    {
      summary: "Legacy summary without per-message provenance.",
    },
    {
      excludeMessageIds: ["regenerated-assistant"],
    },
  ),
  null,
  "regeneration must omit a legacy summary that cannot prove it excludes the discarded response",
);

const storageDir = mkdtempSync(join(tmpdir(), "marinara-regeneration-context-"));
process.env.FILE_STORAGE_DIR = storageDir;
const db = await createFileNativeDB();
const embeddingSource: MemoryRecallEmbeddingSource = {
  label: "regeneration regression",
  embed: async (texts) => texts.map(() => [1, 0]),
};

try {
  await db.insert(memoryChunks).values([
    {
      id: "settled-memory",
      chatId: "regen-chat",
      content: "Settled memory.",
      embedding: JSON.stringify([1, 0]),
      messageCount: 5,
      sourceChatId: null,
      firstMessageAt: "2026-07-29T08:00:00.000Z",
      lastMessageAt: "2026-07-29T09:00:00.000Z",
      createdAt: "2026-07-29T09:00:00.000Z",
    },
    {
      id: "contaminated-memory",
      chatId: "regen-chat",
      content: "Latest user prompt and discarded assistant response.",
      embedding: JSON.stringify([1, 0]),
      messageCount: 5,
      sourceChatId: null,
      firstMessageAt: "2026-07-29T09:30:00.000Z",
      lastMessageAt: "2026-07-29T10:00:00.000Z",
      createdAt: "2026-07-29T10:00:00.000Z",
    },
    {
      id: "newer-memory",
      chatId: "regen-chat",
      content: "Anything newer than the regenerated response.",
      embedding: JSON.stringify([1, 0]),
      messageCount: 5,
      sourceChatId: null,
      firstMessageAt: "2026-07-29T10:01:00.000Z",
      lastMessageAt: "2026-07-29T11:00:00.000Z",
      createdAt: "2026-07-29T11:00:00.000Z",
    },
  ]);

  const ordinaryRecall = await recallMemories(db, "Latest user prompt", ["regen-chat"], {
    embeddingSource,
  });
  assert.equal(ordinaryRecall.length, 3, "ordinary recall must continue considering every relevant memory chunk");

  const regenerationRecall = await recallMemories(db, "Latest user prompt", ["regen-chat"], {
    embeddingSource,
    excludeFromMessageAt: "2026-07-29T10:00:00.000Z",
  });
  assert.deepEqual(
    regenerationRecall.map((memory) => memory.content),
    ["Settled memory."],
    "regeneration recall must exclude chunks ending on or after the response being replaced",
  );

  const promptMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
  const recalledLines = await injectMemoryRecallContext({
    db,
    messages: promptMessages,
    currentInputMessages: [{ role: "user", content: "Latest user prompt" }],
    chatId: "regen-chat",
    embeddingSource,
    excludeFromMessageAt: "2026-07-29T10:00:00.000Z",
    contextLimit: undefined,
    sendProgress: () => {},
    wrapFormat: "none",
  });
  assert.deepEqual(recalledLines, ["Settled memory."]);
  assert.doesNotMatch(
    promptMessages[0]?.content ?? "",
    /discarded assistant response/u,
    "the injected Memories block must not contain the regenerated response",
  );

  const chatStorage = createChatsStorage(db);
  const editedChat = await chatStorage.create({
    name: "Edited memory regression",
    mode: "roleplay",
    characterIds: [],
    groupId: null,
    personaId: null,
    promptPresetId: null,
    connectionId: null,
  });
  assert.ok(editedChat);

  const originalLine = "Original assistant wording that must be forgotten.";
  const editedLine = "Edited assistant wording that must replace it.";
  const messageRows = [
    { role: "user" as const, content: "First user message." },
    { role: "assistant" as const, content: "First assistant message." },
    { role: "assistant" as const, content: originalLine },
    { role: "user" as const, content: "Second user message." },
    { role: "assistant" as const, content: "Final assistant message." },
  ];
  const createdMessages = [];
  for (const [index, message] of messageRows.entries()) {
    const timestamp = `2026-07-30T10:0${index}:00.000Z`;
    createdMessages.push(
      await chatStorage.createMessage(
        {
          chatId: editedChat.id,
          role: message.role,
          characterId: null,
          content: message.content,
        },
        { createdAt: timestamp, updatedAt: timestamp },
      ),
    );
  }

  await db.insert(memoryChunks).values({
    id: "stale-edited-memory",
    chatId: editedChat.id,
    content: messageRows.map((message) => message.content).join("\n\n"),
    embedding: JSON.stringify([1, 0]),
    messageCount: 5,
    sourceChatId: null,
    firstMessageAt: "2026-07-30T10:00:00.000Z",
    lastMessageAt: "2026-07-30T10:04:00.000Z",
    createdAt: "2026-07-30T10:04:00.000Z",
  });

  await chatStorage.updateMessageContent(createdMessages[2]!.id, editedLine);
  const afterEdit = (await db.select().from(memoryChunks)).filter((chunk) => chunk.chatId === editedChat.id);
  assert.equal(afterEdit.length, 0, "editing a message must invalidate every native chunk that covers it");

  await chunkAndEmbedMessages(
    db,
    editedChat.id,
    { userName: "User", characterNames: {} },
    { embeddingSource, readBehindMessageCount: 0 },
  );
  const rebuilt = (await db.select().from(memoryChunks)).filter((chunk) => chunk.chatId === editedChat.id);
  assert.equal(rebuilt.length, 1, "the next memory refresh must rebuild the invalidated chunk");
  assert.match(rebuilt[0]!.content, new RegExp(editedLine.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "u"));
  assert.doesNotMatch(
    rebuilt[0]!.content,
    new RegExp(originalLine.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "u"),
    "rebuilt Memory Recall context must not contain the superseded message version",
  );
} finally {
  await db._fileStore.close();
  rmSync(storageDir, { recursive: true, force: true });
}

console.info("Regeneration, edited-message, and memory-context regression passed.");
