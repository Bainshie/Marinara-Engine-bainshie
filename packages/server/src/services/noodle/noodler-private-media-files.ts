import { mkdir, readdir, rename, stat, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DATA_DIR } from "../../utils/data-dir.js";
import { newId } from "../../utils/id-generator.js";
import { assertInsideDir, extensionFromImageMime } from "../../utils/security.js";

const PRIVATE_MEDIA_ROOT = join(DATA_DIR, "noodler", "media");
const DELETING_SUFFIX = ".deleting";
const ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000;

export type NoodlerPrivateMediaFile = {
  storageKey: string;
};

function mediaPath(storageKey: string): string {
  return assertInsideDir(PRIVATE_MEDIA_ROOT, join(PRIVATE_MEDIA_ROOT, storageKey));
}

export async function writeNoodlerPrivateMediaFile(buffer: Buffer, contentType: string): Promise<string> {
  await mkdir(PRIVATE_MEDIA_ROOT, { recursive: true });
  const storageKey = `${newId()}.${extensionFromImageMime(contentType)}`;
  await writeFile(mediaPath(storageKey), buffer, { flag: "wx", mode: 0o600 });
  return storageKey;
}

export function resolveNoodlerPrivateMediaPath(storageKey: string): string {
  return mediaPath(storageKey);
}

export async function removeNewNoodlerPrivateMediaFile(storageKey: string): Promise<void> {
  await unlink(mediaPath(storageKey)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}

export type StagedPrivateMediaDeletion = {
  commit(): Promise<number>;
  rollback(): Promise<number>;
};

export async function stageNoodlerPrivateMediaDeletion(
  assets: NoodlerPrivateMediaFile[],
): Promise<StagedPrivateMediaDeletion> {
  await mkdir(PRIVATE_MEDIA_ROOT, { recursive: true });
  const staged: Array<{ original: string; deleting: string }> = [];
  try {
    for (const asset of assets) {
      const original = mediaPath(asset.storageKey);
      const deleting = mediaPath(`${asset.storageKey}.${Date.now()}-${newId()}${DELETING_SUFFIX}`);
      try {
        await rename(original, deleting);
        staged.push({ original, deleting });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
  } catch (error) {
    await Promise.allSettled(staged.map(({ original, deleting }) => rename(deleting, original)));
    throw error;
  }
  return {
    async commit() {
      const results = await Promise.allSettled(staged.map(({ deleting }) => unlink(deleting)));
      return results.filter((result) => result.status === "rejected").length;
    },
    async rollback() {
      const results = await Promise.allSettled(staged.map(({ original, deleting }) => rename(deleting, original)));
      return results.filter((result) => result.status === "rejected").length;
    },
  };
}

export async function reconcileNoodlerPrivateMediaFiles(
  assetExists: (storageKey: string) => Promise<boolean>,
  limit = 20,
  minimumAgeMs = ORPHAN_GRACE_MS,
): Promise<number> {
  await mkdir(PRIVATE_MEDIA_ROOT, { recursive: true });
  const entries = await readdir(PRIVATE_MEDIA_ROOT, { withFileTypes: true });
  const cutoff = Date.now() - Math.max(0, minimumAgeMs);
  const boundedLimit = Math.max(0, Math.min(100, Math.floor(limit)));
  let reconciled = 0;
  for (const entry of entries) {
    if (reconciled >= boundedLimit) break;
    if (!entry.isFile()) continue;
    const deletingMatch = /^(.+)\.(\d+)-[^.]+\.deleting$/.exec(entry.name);
    if (deletingMatch) {
      const storageKey = deletingMatch[1]!;
      const stagedAt = Number(deletingMatch[2]);
      if (!Number.isFinite(stagedAt) || stagedAt > cutoff) continue;
      if (await assetExists(storageKey)) {
        await rename(mediaPath(entry.name), mediaPath(storageKey));
      } else {
        await unlink(mediaPath(entry.name));
      }
      reconciled += 1;
      continue;
    }
    if (entry.name.endsWith(DELETING_SUFFIX)) continue;
    try {
      const info = await stat(mediaPath(entry.name));
      if (info.mtimeMs > cutoff || (await assetExists(entry.name))) continue;
      await unlink(mediaPath(entry.name));
      reconciled += 1;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return reconciled;
}
