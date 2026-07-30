import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ResolvedOwnerSpatialProjection } from "../../packages/shared/src/types/spatial-context.js";

const root = mkdtempSync(join(tmpdir(), "marinara-spatial-reference-"));
const previousDataDir = process.env.DATA_DIR;
const previousStorageDir = process.env.FILE_STORAGE_DIR;
process.env.DATA_DIR = join(root, "data");
process.env.FILE_STORAGE_DIR = join(root, "storage");

const [
  { createFileNativeDB },
  { createGalleryStorage },
  { createGlobalGalleryStorage },
  { createCapabilityPersistenceHost },
  { chats },
  spatialReference,
  capabilityReferences,
] = await Promise.all([
  import("../../packages/server/src/db/file-backed-store.js"),
  import("../../packages/server/src/services/storage/gallery.storage.js"),
  import("../../packages/server/src/services/storage/global-gallery.storage.js"),
  import("../../packages/server/src/services/capability-packages/capability-persistence.service.js"),
  import("../../packages/server/src/db/schema/index.js"),
  import("../../packages/server/src/services/image/spatial-location-reference.js"),
  import("../../packages/server/src/services/image/global-gallery-capability-references.js"),
]);

const db = await createFileNativeDB();
const projection = (referenceImageId: string): ResolvedOwnerSpatialProjection => ({
  kind: "owner",
  chatId: "chat-1",
  ownerMode: "roleplay",
  definitionRevision: 1,
  currentLocationId: "location-1",
  breadcrumb: [{ id: "location-1", name: "Courtyard" }],
  description: "A stone courtyard.",
  modelMemory: null,
  referenceImageId,
  useReferenceImage: true,
  lorebookEntryIds: [],
  destinations: [],
  omittedDestinationCount: 0,
});

try {
  const chatBytes = Buffer.from("chat-gallery-reference");
  const chatPath = join(process.env.DATA_DIR, "gallery", "chat-1", "chat.png");
  mkdirSync(join(process.env.DATA_DIR, "gallery", "chat-1"), { recursive: true });
  writeFileSync(chatPath, chatBytes);
  const chatImage = await createGalleryStorage(db).create({
    chatId: "chat-1",
    filePath: "chat-1/chat.png",
  });
  assert.ok(chatImage);
  assert.equal(
    await spatialReference.resolveSpatialLocationReferenceImage({
      db,
      chatId: "chat-1",
      projection: projection(chatImage.id),
    }),
    chatBytes.toString("base64"),
  );

  assert.equal(
    await spatialReference.resolveSpatialLocationReferenceImage({
      db,
      chatId: "chat-2",
      projection: projection(chatImage.id),
    }),
    null,
    "legacy chat Gallery references must remain owner-scoped",
  );

  const globalBytes = Buffer.from("global-gallery-reference");
  const globalPath = join(process.env.DATA_DIR, "gallery", "global", "shared.png");
  mkdirSync(join(process.env.DATA_DIR, "gallery", "global"), { recursive: true });
  writeFileSync(globalPath, globalBytes);
  const globalImage = await createGlobalGalleryStorage(db).createImage({ filePath: "global/shared.png" });
  assert.ok(globalImage);
  const globalReferenceId = spatialReference.globalGallerySpatialReferenceId(globalImage.id);
  assert.equal(spatialReference.parseGlobalGallerySpatialReferenceId(globalReferenceId), globalImage.id);
  assert.equal(
    await spatialReference.resolveSpatialLocationReferenceImage({
      db,
      chatId: "chat-2",
      projection: projection(globalReferenceId),
    }),
    globalBytes.toString("base64"),
    "Global Gallery references must resolve for any chat",
  );

  const timestamp = "2026-07-29T00:00:00.000Z";
  const persistence = createCapabilityPersistenceHost(db);
  const document = await persistence.documents.create({
    id: "shared-world-reference",
    packageId: "hierarchical-maps",
    kind: "shared-world-map",
    name: "Shared world",
    description: "",
    data: { definition: { locations: [{ referenceImageId: globalReferenceId }] } },
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  await db.insert(chats).values({
    id: "chat-with-map-reference",
    name: "Chat map draft",
    mode: "roleplay",
    characterIds: "[]",
    metadata: JSON.stringify({
      spatialSharedWorldLink: {
        draft: { definition: { locations: [{ mapBackgroundImageId: globalReferenceId }] } },
      },
    }),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  assert.deepEqual(
    await capabilityReferences.findGlobalGalleryCapabilityReferences(db, globalImage.id),
    { documentCount: 1, chatCount: 1, totalCount: 2 },
    "Global Gallery deletion guards must find both account-owned worlds and chat-local drafts",
  );
  assert.deepEqual(
    await capabilityReferences.findGlobalGalleryCapabilityReferences(db, "missing"),
    { documentCount: 0, chatCount: 0, totalCount: 0 },
    "Deletion guards must match exact Global Gallery references",
  );
  assert.equal(await persistence.documents.remove("hierarchical-maps", document.id, document.revision), true);
  assert.deepEqual(await capabilityReferences.findGlobalGalleryCapabilityReferences(db, globalImage.id), {
    documentCount: 0,
    chatCount: 1,
    totalCount: 1,
  });

  assert.equal(
    await spatialReference.resolveSpatialLocationReferenceImage({
      db,
      chatId: "chat-1",
      projection: projection("global-gallery:"),
    }),
    null,
  );
  assert.equal(
    await spatialReference.resolveSpatialLocationReferenceImage({
      db,
      chatId: "chat-1",
      projection: projection("global-gallery:missing"),
    }),
    null,
  );
} finally {
  await db._fileStore.close();
  if (previousDataDir === undefined) delete process.env.DATA_DIR;
  else process.env.DATA_DIR = previousDataDir;
  if (previousStorageDir === undefined) delete process.env.FILE_STORAGE_DIR;
  else process.env.FILE_STORAGE_DIR = previousStorageDir;
  rmSync(root, { recursive: true, force: true });
}

process.stdout.write("Spatial location reference regression passed.\n");
