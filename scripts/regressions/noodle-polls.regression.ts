import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  noodleGeneratedRefreshSchema,
  noodlePostUpdateSchema,
  noodlePollInputSchema,
  noodlePrivatePostUpdateSchema,
} from "../../packages/shared/src/schemas/noodle.schema.js";
import {
  createNoodlePoll,
  mergeNoodlePollVoteInteractions,
  readNoodlePollFromMetadata,
} from "../../packages/shared/src/utils/noodle-polls.js";
import type { NoodleInteraction, NoodlePost } from "../../packages/shared/src/types/noodle.js";
import type { DB } from "../../packages/server/src/db/connection.js";
import { createFileNativeDB } from "../../packages/server/src/db/file-backed-store.js";
import { createNoodleStorage } from "../../packages/server/src/services/storage/noodle.storage.js";

const poll = createNoodlePoll({ question: "  Best pasta? ", options: [" Penne ", "Farfalle", "Gnocchi"] });
assert.ok(poll);
assert.equal(poll.question, "Best pasta?");
assert.deepEqual(
  poll.options.map((option) => option.id),
  ["option-1", "option-2", "option-3"],
);
assert.equal(readNoodlePollFromMetadata({ poll })?.options[1]?.label, "Farfalle");

const pollPost = {
  id: "older-poll",
  metadata: { poll },
} as NoodlePost;
const persistedVote = {
  id: "vote-1",
  postId: pollPost.id,
  parentInteractionId: null,
  actorAccountId: "account-1",
  type: "vote",
  content: poll.options[1]?.id ?? null,
  imageUrl: null,
  actorSnapshot: null,
  createdAt: "2026-07-01T00:00:00.000Z",
} satisfies NoodleInteraction;
assert.deepEqual(
  mergeNoodlePollVoteInteractions([persistedVote], [pollPost], []),
  [persistedVote],
  "a temporarily incomplete refresh snapshot should retain a valid older poll vote",
);
const changedVote = { ...persistedVote, content: poll.options[2]?.id ?? null };
assert.deepEqual(
  mergeNoodlePollVoteInteractions([persistedVote], [pollPost], [changedVote]),
  [changedVote],
  "the server's newer vote for the same account should remain authoritative",
);
assert.deepEqual(
  mergeNoodlePollVoteInteractions([persistedVote], [], []),
  [],
  "votes must not resurrect a poll removed from the new snapshot",
);
assert.equal(noodlePollInputSchema.safeParse({ question: "Pick", options: ["Same", "same"] }).success, false);
assert.equal(noodlePollInputSchema.safeParse({ question: "Pick", options: ["Only one"] }).success, false);
assert.equal(noodlePostUpdateSchema.safeParse({ content: "", poll: { question: "Pick", options: ["A", "B"] } }).success, true);
assert.equal(
  noodlePrivatePostUpdateSchema.safeParse({ poll: { question: "Pick", options: ["A", "B"] } }).success,
  true,
);

const generated = noodleGeneratedRefreshSchema.parse({
  posts: [
    {
      tempId: "poll-1",
      authorHandle: "character_one",
      content: "Settle this for me.",
      poll: { question: "Choose", options: ["One", "Two"] },
    },
  ],
  interactions: [
    {
      actorHandle: "character_two",
      targetTempId: "poll-1",
      type: "vote",
      pollOptionIndex: 1,
    },
    {
      actorHandle: "character_one",
      targetPostId: "existing-post-1",
      parentInteractionId: "persona-comment-1",
      type: "reply",
      content: "A direct answer to the persona comment.",
    },
  ],
});
assert.equal(generated.posts[0]?.poll?.options.length, 2);
assert.equal(generated.interactions[0]?.pollOptionIndex, 1);
assert.equal(generated.interactions[1]?.parentInteractionId, "persona-comment-1");

const generatedWithNullPlaceholders = noodleGeneratedRefreshSchema.parse({
  interactions: [
    {
      actorHandle: "character_two",
      targetTempId: "poll-1",
      targetPostId: null,
      type: "like",
      content: null,
      pollOptionIndex: null,
    },
  ],
});
assert.equal(generatedWithNullPlaceholders.interactions[0]?.targetPostId, undefined);
assert.equal(generatedWithNullPlaceholders.interactions[0]?.pollOptionIndex, undefined);
assert.equal(
  noodleGeneratedRefreshSchema.safeParse({
    interactions: [{ actorHandle: "character_two", targetPostId: "post-1", type: "vote" }],
  }).success,
  false,
);
assert.equal(
  noodleGeneratedRefreshSchema.safeParse({
    interactions: [
      {
        actorHandle: "character_two",
        targetPostId: "post-1",
        parentInteractionId: "comment-1",
        type: "like",
      },
    ],
  }).success,
  false,
);
assert.equal(
  noodleGeneratedRefreshSchema.safeParse({
    interactions: [{ actorHandle: "character_two", targetPostId: "post-1", type: "vote", pollOptionIndex: null }],
  }).success,
  false,
);

const storageDir = mkdtempSync(join(tmpdir(), "marinara-noodle-poll-edit-"));
process.env.FILE_STORAGE_DIR = storageDir;
const fileDb = await createFileNativeDB();
try {
  const noodle = createNoodleStorage(fileDb as unknown as DB);
  const author = await noodle.upsertAccountFromProfile({
    kind: "character",
    entityId: "poll-edit-author",
    displayName: "Poll Edit Author",
  });
  const voter = await noodle.upsertAccountFromProfile({
    kind: "persona",
    entityId: "poll-edit-voter",
    displayName: "Poll Edit Voter",
  });
  const publicPost = await noodle.createPost({
    authorAccountId: author.id,
    content: "",
    metadata: { poll },
  });
  assert.ok(publicPost);
  assert.ok(
    await noodle.createInteraction(publicPost.id, {
      actorAccountId: voter.id,
      type: "vote",
      content: "option-1",
      parentInteractionId: null,
    }),
  );

  await noodle.updatePost(publicPost.id, {
    poll: { question: poll.question, options: poll.options.map((option) => option.label) },
  });
  assert.equal((await noodle.listInteractions([publicPost.id])).length, 1, "an unchanged poll must retain its votes");

  const editedPublicPost = await noodle.updatePost(publicPost.id, {
    poll: { question: "Best filled pasta?", options: ["Ravioli", "Tortellini"] },
  });
  assert.equal(readNoodlePollFromMetadata(editedPublicPost?.metadata)?.question, "Best filled pasta?");
  assert.deepEqual(await noodle.listInteractions([publicPost.id]), [], "changing a poll must reset its votes");

  const privateCreator = await noodle.createPrivateAccount(author.id, {
    displayName: "Poll Edit Stage",
    handle: "poll_edit_stage",
    bio: "",
    stagePersonality: "",
    disclosureMode: "secret",
  });
  assert.ok(privateCreator);
  const privatePost = await noodle.createPrivatePost({
    authorAccountId: privateCreator.id,
    content: "",
    metadata: { poll },
  });
  assert.ok(privatePost);
  assert.ok(
    await noodle.createPrivateInteraction(privatePost.id, {
      actorAccountId: voter.id,
      type: "vote",
      content: "option-2",
      parentInteractionId: null,
    }),
  );
  const editedPrivatePost = await noodle.updatePrivatePost(privatePost.id, {
    poll: { question: "Choose again", options: ["One", "Two"] },
  });
  assert.equal(readNoodlePollFromMetadata(editedPrivatePost?.metadata)?.question, "Choose again");
  assert.deepEqual(
    await noodle.listPrivateInteractions([privatePost.id]),
    [],
    "changing a private poll must reset its votes",
  );
} finally {
  await fileDb._fileStore.close();
  rmSync(storageDir, { recursive: true, force: true });
}

console.info("Noodle poll regression passed.");
