import type { DB } from "../../db/connection.js";
import { capabilityDocuments, chats } from "../../db/schema/index.js";

const GLOBAL_GALLERY_REFERENCE_PREFIX = "global-gallery:";
const MAX_SCANNED_VALUES = 200_000;

export interface GlobalGalleryCapabilityReferenceSummary {
  documentCount: number;
  chatCount: number;
  totalCount: number;
}

function parseStoredJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function containsExactReference(value: unknown, referenceId: string): boolean {
  const pending: unknown[] = [parseStoredJson(value)];
  let scanned = 0;
  const enqueue = (nested: unknown): boolean => {
    if (scanned + pending.length >= MAX_SCANNED_VALUES) return false;
    pending.push(nested);
    return true;
  };
  while (pending.length > 0) {
    const current = pending.pop();
    scanned += 1;
    if (scanned > MAX_SCANNED_VALUES) {
      // A malformed or unexpectedly large record should fail closed rather than
      // allow deletion of an asset it may still own.
      return true;
    }
    if (current === referenceId) return true;
    if (Array.isArray(current)) {
      for (const nested of current) {
        if (!enqueue(nested)) return true;
      }
      continue;
    }
    if (current && typeof current === "object") {
      for (const key in current) {
        if (!Object.prototype.hasOwnProperty.call(current, key)) continue;
        if (!enqueue((current as Record<string, unknown>)[key])) return true;
      }
    }
  }
  return false;
}

/**
 * Finds durable package documents and chat-local drafts that still own a
 * Global Gallery reference. Deletion is rare, so an exact scan keeps this
 * generic for current and future capability packages without coupling the
 * gallery route to a package-specific JSON shape.
 */
export async function findGlobalGalleryCapabilityReferences(
  db: DB,
  imageId: string,
): Promise<GlobalGalleryCapabilityReferenceSummary> {
  const referenceId = `${GLOBAL_GALLERY_REFERENCE_PREFIX}${imageId}`;
  const [documents, chatRecords] = await Promise.all([
    db.select({ data: capabilityDocuments.data }).from(capabilityDocuments),
    db.select({ metadata: chats.metadata }).from(chats),
  ]);
  const documentCount = documents.filter((document) => containsExactReference(document.data, referenceId)).length;
  const chatCount = chatRecords.filter((chat) => containsExactReference(chat.metadata, referenceId)).length;
  return {
    documentCount,
    chatCount,
    totalCount: documentCount + chatCount,
  };
}
