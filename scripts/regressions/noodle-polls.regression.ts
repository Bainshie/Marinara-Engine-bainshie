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
    poll: { question: "Best filled pasta?", options: ["Ravioli", "Tortellini", "Gnocchi", "Lasagna"] },
  });
  const editedPublicPoll = readNoodlePollFromMetadata(editedPublicPost?.metadata);
  assert.equal(editedPublicPoll?.question, "Best filled pasta?");
  assert.deepEqual(
    editedPublicPoll?.options.map((option) => option.id),
    ["option-1", "option-2", "option-3", "option-4"],
    "editing a poll must retain option IDs by position and assign a deterministic ID to an added option",
  );
  assert.equal(
    (await noodle.listInteractions([publicPost.id]))[0]?.content,
    "option-1",
    "editing a public poll must retain its existing votes",
  );
  await noodle.updatePost(publicPost.id, { poll: null });
  assert.equal(
    (await noodle.listInteractions([publicPost.id]))[0]?.content,
    "option-1",
    "removing a public poll must retain its historical votes",
  );
  const recreatedPublicPost = await noodle.updatePost(publicPost.id, {
    poll: { question: "Try again?", options: ["Rigatoni", "Orecchiette"] },
  });
  assert.deepEqual(
    readNoodlePollFromMetadata(recreatedPublicPost?.metadata)?.options.map((option) => option.id),
    ["option-5", "option-6"],
    "recreating a poll must not reuse IDs from removed options",
  );

  const concurrentPublicPost = await noodle.createPost({
    authorAccountId: author.id,
    content: "",
    metadata: { poll },
  });
  assert.ok(concurrentPublicPost);
  await noodle.updatePost(concurrentPublicPost.id, { poll: null });
  await Promise.all([
    noodle.updatePost(concurrentPublicPost.id, {
      poll: { question: "Four choices", options: ["A", "B", "C", "D"] },
    }),
    noodle.updatePost(concurrentPublicPost.id, {
      poll: { question: "Two choices", options: ["E", "F"] },
    }),
  ]);
  const concurrentPublicResult = await noodle.getPostById(concurrentPublicPost.id);
  assert.deepEqual(
    readNoodlePollFromMetadata(concurrentPublicResult?.metadata)?.options.map((option) => option.id),
    ["option-4", "option-5"],
    "a concurrent edit must retain the IDs allocated by an earlier recreation",
  );
  assert.deepEqual(
    concurrentPublicResult?.metadata.pollOptionIds,
    ["option-1", "option-2", "option-3", "option-4", "option-5", "option-6", "option-7"],
    "a concurrent edit must retain the full option ID history from the transaction-local current row",
  );

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

  const subscriberPost = await noodle.createPrivatePost({
    authorAccountId: privateCreator.id,
    content: "",
    access: "subscriber",
    metadata: { poll },
  });
  assert.ok(subscriberPost);
  assert.equal(
    await noodle.createPrivateInteraction(subscriberPost.id, {
      actorAccountId: voter.id,
      type: "vote",
      content: "option-1",
      parentInteractionId: null,
    }),
    null,
    "a private subscriber poll must reject a viewer without a current subscription",
  );
  assert.ok(await noodle.subscribe(voter.id, privateCreator.id));
  assert.ok(
    await noodle.createPrivateInteraction(subscriberPost.id, {
      actorAccountId: voter.id,
      type: "vote",
      content: "option-1",
      parentInteractionId: null,
    }),
    "a current subscriber may vote on a private subscriber poll",
  );
  await noodle.unsubscribe(voter.id, privateCreator.id);
  assert.equal(
    await noodle.createPrivateInteraction(subscriberPost.id, {
      actorAccountId: voter.id,
      type: "vote",
      content: "option-2",
      parentInteractionId: null,
    }),
    null,
    "revoking a subscription must prevent a later private poll vote update",
  );
  assert.equal(
    (await noodle.listPrivateInteractions([subscriberPost.id]))[0]?.content,
    "option-1",
    "a rejected private vote update must leave the existing vote unchanged",
  );

  const ppvPost = await noodle.createPrivatePost({
    authorAccountId: privateCreator.id,
    content: "",
    access: "ppv",
    ppvPrice: 5,
    metadata: { poll },
  });
  assert.ok(ppvPost);
  assert.ok(await noodle.subscribe(voter.id, privateCreator.id));
  assert.equal(
    await noodle.createPrivateInteraction(ppvPost.id, {
      actorAccountId: voter.id,
      type: "vote",
      content: "option-1",
      parentInteractionId: null,
    }),
    null,
    "a subscription alone must not authorize a PPV poll when subscriptionIncludesPpv is disabled",
  );
  assert.ok(await noodle.unlockPost(voter.id, ppvPost.id));
  assert.ok(
    await noodle.createPrivateInteraction(ppvPost.id, {
      actorAccountId: voter.id,
      type: "vote",
      content: "option-1",
      parentInteractionId: null,
    }),
    "a current unlock must authorize a PPV poll vote",
  );

  const includedPpvViewer = await noodle.upsertAccountFromProfile({
    kind: "persona",
    entityId: "included-ppv-voter",
    displayName: "Included PPV Voter",
  });
  assert.ok(await noodle.subscribe(includedPpvViewer.id, privateCreator.id));
  assert.ok(
    await noodle.patchAccountSettings(privateCreator.id, {
      subtree: "privacy",
      patch: { access: { subscriptionIncludesPpv: true } },
    }),
  );
  assert.ok(
    await noodle.createPrivateInteraction(ppvPost.id, {
      actorAccountId: includedPpvViewer.id,
      type: "vote",
      content: "option-2",
      parentInteractionId: null,
    }),
    "subscriptionIncludesPpv and a current subscription must authorize a PPV poll vote",
  );

  const hiddenPost = await noodle.createPrivatePost({
    authorAccountId: privateCreator.id,
    content: "",
    metadata: { poll },
  });
  assert.ok(hiddenPost);
  assert.ok(
    await noodle.patchAccountSettings(privateCreator.id, {
      subtree: "privacy",
      patch: { access: { hiddenFromAccountIds: [includedPpvViewer.id] } },
    }),
  );
  assert.equal(
    await noodle.createPrivateInteraction(hiddenPost.id, {
      actorAccountId: includedPpvViewer.id,
      type: "vote",
      content: "option-1",
      parentInteractionId: null,
    }),
    null,
    "hidden-from must block private poll voting even on a public-access post",
  );

  const personaCreator = await noodle.createPrivateAccount(voter.id, {
    displayName: "Voter Stage",
    handle: "voter_stage",
    bio: "",
    stagePersonality: "",
    disclosureMode: "secret",
  });
  assert.ok(personaCreator);
  const selfPost = await noodle.createPrivatePost({
    authorAccountId: personaCreator.id,
    content: "",
    metadata: { poll },
  });
  assert.ok(selfPost);
  assert.equal(
    await noodle.createPrivateInteraction(selfPost.id, {
      actorAccountId: voter.id,
      type: "vote",
      content: "option-1",
      parentInteractionId: null,
    }),
    null,
    "a creator-linked viewer must not persist a private self-vote",
  );

  const editedPrivatePost = await noodle.updatePrivatePost(privatePost.id, {
    poll: { question: "Choose again", options: ["One", "Two"] },
  });
  assert.equal(readNoodlePollFromMetadata(editedPrivatePost?.metadata)?.question, "Choose again");
  assert.equal(
    (await noodle.listPrivateInteractions([privatePost.id]))[0]?.content,
    "option-2",
    "editing a private poll must retain its existing votes",
  );
  await noodle.updatePrivatePost(privatePost.id, { poll: null });
  assert.equal(
    (await noodle.listPrivateInteractions([privatePost.id]))[0]?.content,
    "option-2",
    "removing a private poll must retain its historical votes",
  );
} finally {
  await fileDb._fileStore.close();
  rmSync(storageDir, { recursive: true, force: true });
}

console.info("Noodle poll regression passed.");
