import { unlinkSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import type { DB } from "../../db/connection.js";
import { eq } from "../../db/file-query.js";
import { characterImages, chatImages, globalImages, personaImages } from "../../db/schema/index.js";
import { logger } from "../../lib/logger.js";
import { DATA_DIR } from "../../utils/data-dir.js";
import { assertInsideDir } from "../../utils/security.js";

export type StoredGalleryFile = {
  absolutePath: string;
  directory: string;
  filename: string;
};

export function storedGalleryFilename(filePath: string): string {
  return basename(filePath.replace(/\\/g, "/"));
}

export function resolveStoredGalleryFile(
  filePath: string,
  galleryRoot = join(DATA_DIR, "gallery"),
): StoredGalleryFile | null {
  if (!filePath || filePath.includes("\0")) return null;
  try {
    const absolutePath = assertInsideDir(galleryRoot, join(galleryRoot, filePath));
    return {
      absolutePath,
      directory: dirname(absolutePath),
      filename: basename(absolutePath),
    };
  } catch {
    return null;
  }
}

export function findGalleryRowByFilename<T extends { filePath: string }>(
  rows: readonly T[],
  filename: string,
): T | null {
  return rows.find((row) => storedGalleryFilename(row.filePath) === filename) ?? null;
}

export async function galleryFileHasReferences(db: DB, filePath: string): Promise<boolean> {
  const chatReference = await db
    .select({ id: chatImages.id })
    .from(chatImages)
    .where(eq(chatImages.filePath, filePath));
  if (chatReference.length > 0) return true;

  const characterReference = await db
    .select({ id: characterImages.id })
    .from(characterImages)
    .where(eq(characterImages.filePath, filePath));
  if (characterReference.length > 0) return true;

  const personaReference = await db
    .select({ id: personaImages.id })
    .from(personaImages)
    .where(eq(personaImages.filePath, filePath));
  if (personaReference.length > 0) return true;

  const globalReference = await db
    .select({ id: globalImages.id })
    .from(globalImages)
    .where(eq(globalImages.filePath, filePath));
  return globalReference.length > 0;
}

/**
 * Remove the physical file only after every gallery has released its metadata
 * reference. Invalid paths and cleanup failures leave at worst an orphan file,
 * never a broken live reference.
 */
export async function unlinkGalleryFileIfUnreferenced(input: {
  db: DB;
  filePath: string;
  /** Test-only filesystem override. */
  galleryRoot?: string;
}): Promise<boolean> {
  if (await galleryFileHasReferences(input.db, input.filePath)) return false;

  const storedFile = resolveStoredGalleryFile(input.filePath, input.galleryRoot);
  if (!storedFile) {
    logger.warn("[image-gallery] Skipped cleanup for unsafe gallery path %s", input.filePath);
    return false;
  }

  try {
    unlinkSync(storedFile.absolutePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    logger.warn(error, "[image-gallery] Could not remove unreferenced gallery file %s", input.filePath);
    return false;
  }
}
