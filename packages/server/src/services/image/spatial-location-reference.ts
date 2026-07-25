import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { ResolvedOwnerSpatialProjection } from "@marinara-engine/shared";
import type { DB } from "../../db/connection.js";
import { logger } from "../../lib/logger.js";
import { DATA_DIR } from "../../utils/data-dir.js";
import { assertInsideDir } from "../../utils/security.js";
import { createGalleryStorage } from "../storage/gallery.storage.js";

const CHAT_GALLERY_ROOT = join(DATA_DIR, "gallery");

export const SPATIAL_LOCATION_REFERENCE_PROMPT_LINE =
  "Location handling: an attached location reference image is available. Use it to set the scene location.";

function resolveGalleryImagePath(image: { chatId: string; filePath: string }): string | null {
  const normalizedPath = image.filePath.replace(/\\/g, "/");
  const filename = basename(normalizedPath);
  const candidates = new Set([normalizedPath, `${image.chatId}/${filename}`]);
  for (const candidate of candidates) {
    if (!candidate || candidate.includes("..") || candidate.includes("\0")) continue;
    try {
      const resolved = assertInsideDir(CHAT_GALLERY_ROOT, join(CHAT_GALLERY_ROOT, candidate));
      if (existsSync(resolved)) return resolved;
    } catch {
      // Try the legacy chat-relative path before treating the reference as missing.
    }
  }
  return null;
}

export async function resolveSpatialLocationReferenceImage(args: {
  db: DB;
  chatId: string;
  projection: ResolvedOwnerSpatialProjection | null;
}): Promise<string | null> {
  const imageId = args.projection?.useReferenceImage ? args.projection.referenceImageId?.trim() : "";
  if (!imageId) return null;

  try {
    const image = await createGalleryStorage(args.db).getById(imageId);
    if (!image || image.chatId !== args.chatId) {
      logger.debug(
        "[spatial-reference] Ignoring missing or cross-chat gallery image %s for chat %s",
        imageId,
        args.chatId,
      );
      return null;
    }
    const filePath = resolveGalleryImagePath(image);
    if (!filePath) {
      logger.debug("[spatial-reference] Gallery image file %s is missing for chat %s", imageId, args.chatId);
      return null;
    }
    return (await readFile(filePath)).toString("base64");
  } catch (err) {
    logger.warn(err, "[spatial-reference] Failed to read gallery image %s for chat %s", imageId, args.chatId);
    return null;
  }
}

export function mergeSpatialLocationReferenceImages(
  locationReferenceImage: string | null,
  otherReferenceImages: string[],
  maximum: number,
): string[] {
  if (maximum <= 0) return [];
  return (locationReferenceImage ? [locationReferenceImage, ...otherReferenceImages] : otherReferenceImages).slice(
    0,
    maximum,
  );
}
