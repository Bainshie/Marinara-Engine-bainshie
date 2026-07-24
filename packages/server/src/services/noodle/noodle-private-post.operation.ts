import type {
  NoodleAccount,
  NoodlePrivateGenerationRequest,
  NoodlePrivatePostCreateInput,
  NoodlerManagedPost,
  NoodlerRefreshNowOutcome,
} from "@marinara-engine/shared";
import type { NoodleImagePromptReviewItem } from "./noodle-public-images.service.js";
import type { DB } from "../../db/connection.js";
import { logger } from "../../lib/logger.js";
import { createConnectionsStorage } from "../storage/connections.storage.js";
import { createNoodleStorage } from "../storage/noodle.storage.js";
import { generatePrivatePost } from "./noodle-private-generation.service.js";
import { tryNoodlePrivateAccountOperation } from "./noodle-private-account-operation-lock.js";
import { settleAgentJobsWithConcurrencyLimit } from "../agents/agent-concurrency.js";

export type GenerateNoodlePrivatePostResult =
  | { status: "generated"; post: NoodlerManagedPost; imagePromptReview: NoodleImagePromptReviewItem | null }
  | { status: "disabled" }
  | { status: "busy" }
  | { status: "connection_required" }
  | { status: "connection_not_found" }
  | { status: "private_account_not_found" };

export type CreateNoodlePrivatePostResult =
  | { status: "created"; post: NoodlerManagedPost }
  | { status: "disabled" }
  | { status: "busy" }
  | { status: "private_account_not_found" };

/**
 * Reusable generated-post application seam for HTTP now and Slice 8 scheduling later.
 * Provider and persistence failures intentionally throw for the caller to handle.
 */
export async function generateNoodlePrivatePost(
  db: DB,
  request: NoodlePrivateGenerationRequest,
): Promise<GenerateNoodlePrivatePostResult> {
  const noodle = createNoodleStorage(db);
  const settings = await noodle.getSettings();
  if (!settings.enableNoodler) return { status: "disabled" };

  const locked = await tryNoodlePrivateAccountOperation(request.targetAccountId, async () => {
    const account = await noodle.getPrivateAccountById(request.targetAccountId);
    if (!account) {
      return { status: "private_account_not_found" } as const;
    }
    const connectionId = request.connectionId ?? settings.generationConnectionId;
    if (!connectionId) return { status: "connection_required" } as const;
    const connection = await createConnectionsStorage(db).getWithKey(connectionId);
    if (!connection) return { status: "connection_not_found" } as const;
    const generated = await generatePrivatePost(db, { account, request, connection });
    return { status: "generated", post: generated.post, imagePromptReview: generated.imagePromptReview } as const;
  });
  return locked.acquired ? locked.value : { status: "busy" };
}

const MAX_CONCURRENT_MANUAL_REFRESH = 3;

export type NoodlerRefreshNowResult =
  | { status: "disabled" }
  | { status: "ok"; outcomes: NoodlerRefreshNowOutcome[] };

/**
 * Global "Refresh NoodleR now": runs every automation-enabled creator, prioritizing those
 * scheduled soonest, with bounded concurrency and per-creator typed outcomes so one
 * creator's failure never rolls back another's successful post. Each selected creator's
 * slot is consumed the same way an automatic run would consume it (advances `nextRunAt`
 * under its own cadence) rather than resetting to an unrelated default.
 */
export async function refreshAllNoodlerCreatorsNow(db: DB): Promise<NoodlerRefreshNowResult> {
  const noodle = createNoodleStorage(db);
  const settings = await noodle.getSettings();
  if (!settings.enableNoodler) return { status: "disabled" };

  const accounts = await noodle.listAutoPostEnabledAccounts();
  const nextRunAtMs = (account: NoodleAccount) => {
    const nextRunAt = account.settings.scheduler.autoPosting?.nextRunAt;
    return nextRunAt === null || nextRunAt === undefined ? Number.POSITIVE_INFINITY : Date.parse(nextRunAt);
  };
  const prioritized = [...accounts].sort((a, b) => nextRunAtMs(a) - nextRunAtMs(b));

  const nowIso = new Date().toISOString();
  const settled = await settleAgentJobsWithConcurrencyLimit(
    prioritized,
    MAX_CONCURRENT_MANUAL_REFRESH,
    async (account): Promise<NoodlerRefreshNowOutcome> => {
      const result = await generateNoodlePrivatePost(db, {
        mode: "private",
        targetAccountId: account.id,
        access: "subscriber",
      });
      // Consume the slot only on a real post; busy/failed/skipped runs leave any explicit
      // schedule edit intact instead of burning the creator's next automatic slot.
      if (result.status === "generated") await noodle.claimAutoPostRunNow(account.id, nowIso);
      return { accountId: account.id, status: result.status };
    },
  );

  const outcomes = settled.map((entry, index): NoodlerRefreshNowOutcome => {
    if (entry.status === "fulfilled") return entry.value;
    logger.error(entry.reason, "[noodler] Global refresh failed for creator %s", prioritized[index]!.id);
    return { accountId: prioritized[index]!.id, status: "error" };
  });
  return { status: "ok", outcomes };
}

export async function createNoodlePrivatePost(
  db: DB,
  input: NoodlePrivatePostCreateInput,
): Promise<CreateNoodlePrivatePostResult> {
  const noodle = createNoodleStorage(db);
  const settings = await noodle.getSettings();
  if (!settings.enableNoodler) return { status: "disabled" };

  const locked = await tryNoodlePrivateAccountOperation(input.targetAccountId, async () => {
    const post = await noodle.createPrivatePost({
      authorAccountId: input.targetAccountId,
      title: input.title,
      content: input.content,
      imageUrl: null,
      imagePrompt: null,
      source: "manual",
      access: input.access,
      ppvPrice: input.access === "ppv" ? (input.ppvPrice ?? null) : null,
      metadata: {},
    });
    if (!post) return { status: "private_account_not_found" } as const;
    return { status: "created", post } as const;
  });
  return locked.acquired ? locked.value : { status: "busy" };
}
