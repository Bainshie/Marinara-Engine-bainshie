import { existsSync, rmSync, unlinkSync } from "fs";
import { join } from "path";
import type { NoodlerManagedPost } from "@marinara-engine/shared";
import { logger } from "../../lib/logger.js";
import { DATA_DIR } from "../../utils/data-dir.js";
import { assertInsideDir } from "../../utils/security.js";
import { stageImageToDisk, type StagedGalleryImage } from "../image/image-generation.js";

// NoodleR-owned private media lives under the gallery data dir but in a namespace whose
// path contains a slash, so the public gallery serve routes (which reject slashes in the
// chatId segment) can never reach it. Only the access-checked media endpoint serves it.
const GALLERY_DIR = join(DATA_DIR, "gallery");
const PRIVATE_MEDIA_PREFIX = "noodler-private/";

export type NoodlerPrivatePostMediaUpload = {
  buffer: Buffer;
  extension: string;
};

function stageUploadedPrivatePostMedia(
  accountId: string,
  upload: NoodlerPrivatePostMediaUpload,
): { privateMediaPath: string; stagedMedia: StagedGalleryImage } {
  const stagedMedia = stageImageToDisk(
    `${PRIVATE_MEDIA_PREFIX}${accountId}`,
    upload.buffer.toString("base64"),
    upload.extension,
  );
  return { privateMediaPath: stagedMedia.filePath, stagedMedia };
}

/** Access-checked serving URL for a private post's generated image. */
export function privatePostMediaUrl(postId: string): string {
  return `/api/noodle/noodler/posts/${encodeURIComponent(postId)}/media`;
}

/**
 * Promote uploaded private media and persist its stable post-owned references as one
 * compensating operation. A null result means the target disappeared before persistence.
 */
export async function persistPrivatePostWithUploadedMedia<T>(
  accountId: string,
  postId: string,
  upload: NoodlerPrivatePostMediaUpload,
  persist: (media: { imageUrl: string; privateMediaPath: string }) => Promise<T | null>,
): Promise<T | null> {
  const staged = stageUploadedPrivatePostMedia(accountId, upload);
  try {
    staged.stagedMedia.promote();
    const result = await persist({
      imageUrl: privatePostMediaUrl(postId),
      privateMediaPath: staged.privateMediaPath,
    });
    if (result === null) staged.stagedMedia.compensate();
    return result;
  } catch (error) {
    staged.stagedMedia.compensate();
    throw error;
  }
}

export function readPrivateMediaPath(post: Pick<NoodlerManagedPost, "metadata">): string | null {
  const value = (post.metadata as Record<string, unknown> | null | undefined)?.privateMediaPath;
  return typeof value === "string" && value.startsWith(PRIVATE_MEDIA_PREFIX) ? value : null;
}

/** Resolve a stored relative private-media path to an absolute path inside the gallery dir. */
export function resolvePrivateMediaAbsolutePath(relativePath: string): string | null {
  if (!relativePath.startsWith(PRIVATE_MEDIA_PREFIX)) return null;
  try {
    return assertInsideDir(GALLERY_DIR, join(GALLERY_DIR, relativePath));
  } catch {
    return null;
  }
}

/** Best-effort removal of an owned private-media file when its post is deleted. */
export function unlinkPrivateMedia(relativePath: string | null): void {
  if (!relativePath) return;
  const absolute = resolvePrivateMediaAbsolutePath(relativePath);
  if (!absolute) return;
  try {
    if (existsSync(absolute)) unlinkSync(absolute);
  } catch (error) {
    logger.warn(error, "[noodler] Failed to remove private media file %s", relativePath);
  }
}

/** Best-effort removal of a creator's whole owned private-media namespace on account deletion. */
export function removePrivateAccountMedia(accountId: string): void {
  const dir = resolvePrivateMediaAbsolutePath(`${PRIVATE_MEDIA_PREFIX}${accountId}`);
  if (!dir) return;
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch (error) {
    logger.warn(error, "[noodler] Failed to remove private media dir for account %s", accountId);
  }
}
