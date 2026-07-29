import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, unlinkSync } from "node:fs";
import { basename, join } from "node:path";
import type { DB } from "../../db/connection.js";
import { logger } from "../../lib/logger.js";
import { DATA_DIR } from "../../utils/data-dir.js";
import { assertInsideDir } from "../../utils/security.js";
import { createCharacterGalleryStorage } from "../storage/character-gallery.storage.js";
import { createGalleryStorage } from "../storage/gallery.storage.js";
import { createPersonaGalleryStorage } from "../storage/persona-gallery.storage.js";

const LEGACY_COPY_CREATION_WINDOW_MS = 60_000;

type ChatGalleryImage = {
  id: string;
  chatId: string;
  filePath: string;
  prompt: string;
  provider: string;
  model: string;
  width: number | null;
  height: number | null;
  createdAt: string;
};

type EntityGalleryImage = {
  id: string;
  filePath: string;
  sourceChatImageId: string | null;
  prompt: string;
  provider: string;
  model: string;
  width: number | null;
  height: number | null;
  createdAt: string;
};

export type ChatGalleryCascadeDeletionResult = {
  characterCopiesRemoved: number;
  personaCopiesRemoved: number;
  filesRemoved: number;
};

function resolveSafeGalleryPath(galleryRoot: string, relativePath: string): string | null {
  if (!relativePath || relativePath.includes("\0")) return null;
  try {
    return assertInsideDir(galleryRoot, join(galleryRoot, relativePath));
  } catch {
    return null;
  }
}

function matchingLegacyMetadata(source: ChatGalleryImage, candidate: EntityGalleryImage): boolean {
  if (candidate.sourceChatImageId) return false;
  const sourceCreatedAt = Date.parse(source.createdAt);
  const candidateCreatedAt = Date.parse(candidate.createdAt);
  if (
    !Number.isFinite(sourceCreatedAt) ||
    !Number.isFinite(candidateCreatedAt) ||
    Math.abs(sourceCreatedAt - candidateCreatedAt) > LEGACY_COPY_CREATION_WINDOW_MS
  ) {
    return false;
  }
  return (
    candidate.prompt === source.prompt &&
    candidate.provider === source.provider &&
    candidate.model === source.model &&
    candidate.width === source.width &&
    candidate.height === source.height
  );
}

function fileDigest(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function exactFileCopy(sourcePath: string, candidatePath: string, sourceDigest: string): boolean {
  try {
    if (!existsSync(candidatePath) || statSync(candidatePath).size !== statSync(sourcePath).size) return false;
    return fileDigest(candidatePath) === sourceDigest;
  } catch {
    return false;
  }
}

function uniqueRows<T extends { id: string }>(rows: readonly T[]): T[] {
  return Array.from(new Map(rows.map((row) => [row.id, row])).values());
}

function existingChatGalleryPaths(galleryRoot: string, image: ChatGalleryImage): string[] {
  const filename = basename(image.filePath.replace(/\\/g, "/"));
  const candidates = new Set([image.filePath, `${image.chatId}/${filename}`]);
  return Array.from(candidates).flatMap((candidate) => {
    const resolved = resolveSafeGalleryPath(galleryRoot, candidate);
    return resolved && existsSync(resolved) ? [resolved] : [];
  });
}

function legacyExactCopies(
  galleryRoot: string,
  source: ChatGalleryImage,
  sourcePath: string | undefined,
  candidates: readonly EntityGalleryImage[],
): EntityGalleryImage[] {
  if (!sourcePath) return [];
  let sourceDigest: string;
  try {
    sourceDigest = fileDigest(sourcePath);
  } catch (error) {
    logger.warn(error, "[gallery/delete] Could not fingerprint legacy source image %s", source.id);
    return [];
  }
  return candidates.filter((candidate) => {
    if (!matchingLegacyMetadata(source, candidate)) return false;
    const candidatePath = resolveSafeGalleryPath(galleryRoot, candidate.filePath);
    return candidatePath ? exactFileCopy(sourcePath, candidatePath, sourceDigest) : false;
  });
}

/**
 * Delete an explicit chat-gallery image together with generated character and
 * persona copies. Deleting a whole chat intentionally does not use this path,
 * so entity galleries remain independent when chat history is removed.
 */
export async function deleteChatGalleryImageEverywhere(input: {
  db: DB;
  image: ChatGalleryImage;
  /** Test-only filesystem override. */
  galleryRoot?: string;
}): Promise<ChatGalleryCascadeDeletionResult> {
  const galleryRoot = input.galleryRoot ?? join(DATA_DIR, "gallery");
  const characterGallery = createCharacterGalleryStorage(input.db);
  const personaGallery = createPersonaGalleryStorage(input.db);
  const [linkedCharacterCopies, linkedPersonaCopies, allCharacterImages, allPersonaImages] = await Promise.all([
    characterGallery.listBySourceChatImageId(input.image.id),
    personaGallery.listBySourceChatImageId(input.image.id),
    characterGallery.listAll(),
    personaGallery.listAll(),
  ]);

  const chatPaths = existingChatGalleryPaths(galleryRoot, input.image);
  const sourcePath = chatPaths[0];
  const characterCopies = uniqueRows([
    ...linkedCharacterCopies,
    ...legacyExactCopies(galleryRoot, input.image, sourcePath, allCharacterImages),
  ]);
  const personaCopies = uniqueRows([
    ...linkedPersonaCopies,
    ...legacyExactCopies(galleryRoot, input.image, sourcePath, allPersonaImages),
  ]);

  const filePaths = new Set(chatPaths);
  for (const copy of [...characterCopies, ...personaCopies]) {
    const filePath = resolveSafeGalleryPath(galleryRoot, copy.filePath);
    if (filePath && existsSync(filePath)) filePaths.add(filePath);
    else if (!filePath)
      logger.warn(
        "[gallery/delete] Skipped unsafe linked gallery path for image %s while deleting chat image %s",
        copy.id,
        input.image.id,
      );
  }

  let filesRemoved = 0;
  for (const filePath of filePaths) {
    try {
      unlinkSync(filePath);
      filesRemoved += 1;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  const filename = basename(input.image.filePath.replace(/\\/g, "/"));
  const fallbackFilePath = `${input.image.chatId}/${filename}`;
  await input.db.transaction(async (tx) => {
    const txGallery = createGalleryStorage(tx);
    const txCharacterGallery = createCharacterGalleryStorage(tx);
    const txPersonaGallery = createPersonaGalleryStorage(tx);
    for (const copy of characterCopies) await txCharacterGallery.remove(copy.id);
    for (const copy of personaCopies) await txPersonaGallery.remove(copy.id);
    await txGallery.removeByChatAndFilePath(input.image.chatId, input.image.filePath);
    if (fallbackFilePath !== input.image.filePath) {
      await txGallery.removeByChatAndFilePath(input.image.chatId, fallbackFilePath);
    }
    await txGallery.remove(input.image.id);
  });

  return {
    characterCopiesRemoved: characterCopies.length,
    personaCopiesRemoved: personaCopies.length,
    filesRemoved,
  };
}
