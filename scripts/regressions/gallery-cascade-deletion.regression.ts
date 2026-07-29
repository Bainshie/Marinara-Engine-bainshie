import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { createFileNativeDB } from "../../packages/server/src/db/file-backed-store.js";
import { characterImages } from "../../packages/server/src/db/schema/index.js";
import { deleteChatGalleryImageEverywhere } from "../../packages/server/src/services/image/chat-gallery-cascade-deletion.js";
import { persistGeneratedImageToEntityGalleries } from "../../packages/server/src/services/image/generated-image-entity-gallery.js";
import { createCharacterGalleryStorage } from "../../packages/server/src/services/storage/character-gallery.storage.js";
import { createGalleryStorage } from "../../packages/server/src/services/storage/gallery.storage.js";
import { createPersonaGalleryStorage } from "../../packages/server/src/services/storage/persona-gallery.storage.js";

const storageRoot = mkdtempSync(join(tmpdir(), "marinara-gallery-cascade-storage-"));
const galleryRoot = mkdtempSync(join(tmpdir(), "marinara-gallery-cascade-files-"));
const outsideFile = `${galleryRoot}-outside.png`;
const previousStorageRoot = process.env.FILE_STORAGE_DIR;
process.env.FILE_STORAGE_DIR = storageRoot;

const writeGalleryFile = (relativePath: string, content = "generated-image") => {
  const filePath = join(galleryRoot, relativePath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
  return filePath;
};

const sourceMetadata = {
  prompt: "A generated scene with a character and persona.",
  provider: "image_generation",
  model: "regression-image-model",
  width: 1024,
  height: 1024,
};

const db = await createFileNativeDB();
try {
  const chatGallery = createGalleryStorage(db);
  const characterGallery = createCharacterGalleryStorage(db);
  const personaGallery = createPersonaGalleryStorage(db);
  const sourceRelativePath = "chat-1/generated.png";
  const sourceFile = writeGalleryFile(sourceRelativePath);
  const source = await chatGallery.create({
    chatId: "chat-1",
    filePath: sourceRelativePath,
    ...sourceMetadata,
  });
  assert.ok(source);

  await persistGeneratedImageToEntityGalleries({
    sourceFilePath: sourceRelativePath,
    sourceChatImageId: source.id,
    characterIds: ["character-1"],
    personaIds: ["persona-1"],
    characterGallery,
    personaGallery,
    galleryRoot,
    ...sourceMetadata,
  });
  await persistGeneratedImageToEntityGalleries({
    sourceFilePath: sourceRelativePath,
    characterIds: ["legacy-character"],
    personaIds: ["legacy-persona"],
    characterGallery,
    personaGallery,
    galleryRoot,
    ...sourceMetadata,
  });

  const linkedCharacter = (await characterGallery.listBySourceChatImageId(source.id))[0];
  const linkedPersona = (await personaGallery.listBySourceChatImageId(source.id))[0];
  const legacyCharacter = (await characterGallery.listAll()).find(
    (image) => image.characterId === "legacy-character",
  );
  const legacyPersona = (await personaGallery.listAll()).find((image) => image.personaId === "legacy-persona");
  assert.ok(linkedCharacter);
  assert.ok(linkedPersona);
  assert.ok(legacyCharacter);
  assert.ok(legacyPersona);

  const unrelatedPath = "characters/unrelated/same-bytes.png";
  writeGalleryFile(unrelatedPath);
  const unrelated = await characterGallery.create({
    characterId: "unrelated",
    filePath: unrelatedPath,
    ...sourceMetadata,
    prompt: "An independently saved duplicate with different metadata.",
  });
  assert.ok(unrelated);

  const differentContentPath = "characters/different-content/different-bytes.png";
  writeGalleryFile(differentContentPath, "different-image");
  const differentContent = await characterGallery.create({
    characterId: "different-content",
    filePath: differentContentPath,
    ...sourceMetadata,
  });
  assert.ok(differentContent);

  const otherSourcePath = "characters/other-source/same-bytes.png";
  writeGalleryFile(otherSourcePath);
  const otherSource = await characterGallery.create({
    characterId: "other-source",
    sourceChatImageId: "different-chat-image",
    filePath: otherSourcePath,
    ...sourceMetadata,
  });
  assert.ok(otherSource);

  const oldLegacyPath = "characters/old-legacy/same-bytes.png";
  writeGalleryFile(oldLegacyPath);
  await db.insert(characterImages).values({
    id: "old-legacy-image",
    characterId: "old-legacy",
    sourceChatImageId: null,
    filePath: oldLegacyPath,
    ...sourceMetadata,
    customKind: null,
    customName: null,
    createdAt: "2020-01-01T00:00:00.000Z",
  });

  writeFileSync(outsideFile, "generated-image");
  const unsafeLinked = await characterGallery.create({
    characterId: "unsafe-linked",
    sourceChatImageId: source.id,
    filePath: `../${basename(outsideFile)}`,
    ...sourceMetadata,
  });
  const missingLinked = await characterGallery.create({
    characterId: "missing-linked",
    sourceChatImageId: source.id,
    filePath: "characters/missing-linked/missing.png",
    ...sourceMetadata,
  });
  assert.ok(unsafeLinked);
  assert.ok(missingLinked);

  const deletion = await deleteChatGalleryImageEverywhere({ db, image: source, galleryRoot });
  assert.deepEqual(deletion, {
    characterCopiesRemoved: 4,
    personaCopiesRemoved: 2,
    filesRemoved: 5,
  });

  assert.equal(await chatGallery.getById(source.id), null);
  for (const removed of [linkedCharacter, legacyCharacter, unsafeLinked, missingLinked]) {
    assert.equal(await characterGallery.getById(removed.id), null);
  }
  for (const removed of [linkedPersona, legacyPersona]) {
    assert.equal(await personaGallery.getById(removed.id), null);
  }
  for (const removedFile of [
    sourceFile,
    join(galleryRoot, linkedCharacter.filePath),
    join(galleryRoot, legacyCharacter.filePath),
    join(galleryRoot, linkedPersona.filePath),
    join(galleryRoot, legacyPersona.filePath),
  ]) {
    assert.equal(existsSync(removedFile), false);
  }

  assert.ok(await characterGallery.getById(unrelated.id));
  assert.ok(await characterGallery.getById(differentContent.id));
  assert.ok(await characterGallery.getById(otherSource.id));
  assert.ok(await characterGallery.getById("old-legacy-image"));
  assert.equal(existsSync(join(galleryRoot, unrelatedPath)), true);
  assert.equal(existsSync(join(galleryRoot, differentContentPath)), true);
  assert.equal(existsSync(join(galleryRoot, otherSourcePath)), true);
  assert.equal(existsSync(join(galleryRoot, oldLegacyPath)), true);
  assert.equal(existsSync(outsideFile), true, "an unsafe stored path must never delete a file outside the gallery root");
} finally {
  await db._fileStore.close();
  if (previousStorageRoot === undefined) delete process.env.FILE_STORAGE_DIR;
  else process.env.FILE_STORAGE_DIR = previousStorageRoot;
  rmSync(storageRoot, { recursive: true, force: true });
  rmSync(galleryRoot, { recursive: true, force: true });
  rmSync(outsideFile, { force: true });
}

console.info("Chat gallery cascade deletion regression passed.");
