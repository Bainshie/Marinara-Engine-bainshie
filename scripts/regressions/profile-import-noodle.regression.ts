import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dataDir = mkdtempSync(join(tmpdir(), "marinara-profile-import-noodle-"));
process.env.DATA_DIR = dataDir;
process.env.NODE_ENV = "test";
process.env.MARINARA_LITE = "true";

try {
  const { getDB } = await import("../../packages/server/src/db/connection.js");
  const { noodleAccounts } = await import("../../packages/server/src/db/schema/noodle.js");
  const { planProfileNoodleImport } =
    await import("../../packages/server/src/services/import/profile-import-noodle.js");
  const db = await getDB();

  await db.insert(noodleAccounts).values({
    id: "destination-account",
    kind: "character",
    entityId: "character-1",
    handle: "source_handle",
    displayName: "Destination",
    bio: "",
    avatarUrl: null,
    invited: "false",
    settings: JSON.stringify({
      privacy: { access: { hiddenFromAccountIds: ["source-account"], subscriptionIncludesPpv: false } },
      social: { followingAccountIds: ["source-account"], followingAccountTimestamps: { "source-account": "now" } },
    }),
    platform: "noodle",
    noodleAccountId: null,
    visibility: "public",
    publicAccountId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  });

  const warnings: Array<{ type: string; path?: string; message: string }> = [];
  const planned = await planProfileNoodleImport(
    db,
    {
      tables: {
        noodle_accounts: [
          {
            id: "source-account",
            kind: "character",
            entityId: "character-1",
            handle: "source_handle",
            displayName: "Imported",
            bio: "",
            avatarUrl: null,
            invited: "false",
            settings: JSON.stringify({
              privacy: { access: { hiddenFromAccountIds: ["source-account"], subscriptionIncludesPpv: false } },
              social: {
                followingAccountIds: ["source-account"],
                followingAccountTimestamps: { "source-account": "now" },
              },
            }),
            platform: "noodle",
            noodleAccountId: null,
            visibility: "public",
            publicAccountId: null,
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-01T00:00:00.000Z",
          },
        ],
        noodle_posts: [{ id: "post-1", authorAccountId: "source-account" }],
        noodle_account_subscriptions: [
          { id: "subscription-1", viewerAccountId: "source-account", creatorAccountId: "source-account" },
        ],
        noodle_post_unlocks: [{ id: "unlock-1", viewerAccountId: "source-account", postId: "post-1" }],
        noodle_interactions: [{ id: "interaction-1", actorAccountId: "source-account" }],
        noodle_activity_digests: [{ id: "digest-1", accountIds: JSON.stringify(["source-account"]) }],
        noodle_refresh_runs: [{ id: "run-1", activeAccountIds: JSON.stringify(["source-account"]) }],
      },
    },
    warnings,
  );

  assert.deepEqual(planned.tables.noodle_accounts?.[0]?.id, "destination-account");
  assert.equal(planned.tables.noodle_posts?.[0]?.authorAccountId, "destination-account");
  assert.equal(planned.tables.noodle_account_subscriptions?.[0]?.viewerAccountId, "destination-account");
  assert.equal(planned.tables.noodle_account_subscriptions?.[0]?.creatorAccountId, "destination-account");
  assert.equal(planned.tables.noodle_post_unlocks?.[0]?.viewerAccountId, "destination-account");
  assert.equal(planned.tables.noodle_interactions?.[0]?.actorAccountId, "destination-account");
  assert.equal(planned.tables.noodle_activity_digests?.[0]?.accountIds, '["destination-account"]');
  assert.equal(planned.tables.noodle_refresh_runs?.[0]?.activeAccountIds, '["destination-account"]');
  assert.equal(warnings.length, 0);

  const conflictWarnings: Array<{ type: string; path?: string; message: string }> = [];
  const conflict = await planProfileNoodleImport(
    db,
    {
      tables: {
        noodle_accounts: [
          {
            id: "different-account",
            kind: "persona",
            entityId: "persona-1",
            handle: "source_handle",
            displayName: "Persona",
            platform: "noodle",
            settings: "{}",
          },
        ],
      },
    },
    conflictWarnings,
  );
  assert.equal(conflict.tables.noodle_accounts?.[0]?.handle, "source_handle_2");
  assert.equal(conflictWarnings.length, 1);
} finally {
  const { closeDB } = await import("../../packages/server/src/db/connection.js");
  await closeDB();
  rmSync(dataDir, { recursive: true, force: true });
}

console.info("Profile import Noodle reconciliation regression passed");
