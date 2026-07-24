import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  noodleAccountSchedulerPatchSchema,
  noodleAutoPostingSettingsSchema,
  noodleGeneratedPrivatePostSchema,
} from "../../packages/shared/src/schemas/noodle.schema.js";

const rootDir = mkdtempSync(join(tmpdir(), "marinara-noodle-private-media-"));
process.env.DATA_DIR = join(rootDir, "data");

const [{ protectPrivateGeneratedIdentity }, privateMedia] = await Promise.all([
  import("../../packages/server/src/services/noodle/noodle-private-generation.service.js"),
  import("../../packages/server/src/services/noodle/noodle-private-media.js"),
]);
const {
  persistPrivatePostWithUploadedMedia,
  privatePostMediaUrl,
  readPrivateMediaPath,
  resolvePrivateMediaAbsolutePath,
} = privateMedia;

// NoodleR-owned image enablement is the single one-image policy on the autoPosting subtree.
const settings = noodleAutoPostingSettingsSchema.parse({ imagesEnabled: true });
assert.equal(settings.imagesEnabled, true);
assert.equal(noodleAutoPostingSettingsSchema.parse({}).imagesEnabled, false);
// The client patch may carry the image toggle but never the server-owned nextRunAt.
assert.ok(noodleAccountSchedulerPatchSchema.parse({ autoPosting: { imagesEnabled: true } }));
// The removed per-run quota is rejected by the strict schema.
assert.throws(() => noodleAccountSchedulerPatchSchema.parse({ autoPosting: { maxImagesPerRun: 3 } }));

// The private generator surfaces its optional imagePrompt (no second text-model call) but
// never a poll.
const generated = noodleGeneratedPrivatePostSchema.parse({
  title: "Studio day",
  content: "Behind the scenes.",
  imagePrompt: "a cozy studio corner",
  poll: null,
});
assert.equal(generated.imagePrompt, "a cozy studio corner");
assert.ok(!("poll" in generated));
assert.equal(noodleGeneratedPrivatePostSchema.parse({ title: "x", content: "y" }).imagePrompt, null);

// Identity protection applies to the image prompt, not only post text.
const linked = { displayName: "Jane Doe", handle: "janedoe" };
assert.ok(!protectPrivateGeneratedIdentity("portrait of @janedoe smiling", "secret", linked)!.includes("janedoe"));
assert.ok(!protectPrivateGeneratedIdentity("portrait of Jane Doe smiling", "hinted", linked)!.includes("Jane Doe"));
// Open disclosure keeps the identity.
assert.ok(protectPrivateGeneratedIdentity("portrait of @janedoe", "open", linked)!.includes("janedoe"));

// Private media is only reachable through the access-checked endpoint namespace.
assert.equal(privatePostMediaUrl("post123"), "/api/noodle/noodler/posts/post123/media");
assert.equal(readPrivateMediaPath({ metadata: { privateMediaPath: "noodler-private/acc/img.png" } }), "noodler-private/acc/img.png");
assert.equal(readPrivateMediaPath({ metadata: { privateMediaPath: "some/other/img.png" } }), null);
assert.equal(readPrivateMediaPath({ metadata: {} }), null);
// Traversal and non-namespaced paths never resolve to an on-disk file.
assert.equal(resolvePrivateMediaAbsolutePath("noodler-private/../../etc/passwd"), null);
assert.equal(resolvePrivateMediaAbsolutePath("gallery/chat/img.png"), null);
assert.ok(
  resolvePrivateMediaAbsolutePath("noodler-private/acc/img.png")
    ?.replaceAll("\\", "/")
    .endsWith("noodler-private/acc/img.png"),
);

const upload = { buffer: Buffer.from("private image"), extension: "png" };
let nullResultPath = "";
const nullResult = await persistPrivatePostWithUploadedMedia("account", "missing-post", upload, async (media) => {
  nullResultPath = media.privateMediaPath;
  assert.equal(media.imageUrl, privatePostMediaUrl("missing-post"));
  assert.equal(existsSync(resolvePrivateMediaAbsolutePath(media.privateMediaPath)!), true);
  return null;
});
assert.equal(nullResult, null);
assert.equal(existsSync(resolvePrivateMediaAbsolutePath(nullResultPath)!), false);

let failedPath = "";
await assert.rejects(
  persistPrivatePostWithUploadedMedia("account", "failed-post", upload, async (media) => {
    failedPath = media.privateMediaPath;
    throw new Error("forced private post persistence failure");
  }),
  /forced private post persistence failure/,
);
assert.equal(existsSync(resolvePrivateMediaAbsolutePath(failedPath)!), false);

const persisted = await persistPrivatePostWithUploadedMedia("account", "saved-post", upload, async (media) => ({
  ...media,
  id: "saved-post",
}));
assert.equal(persisted?.imageUrl, privatePostMediaUrl("saved-post"));
assert.equal(existsSync(resolvePrivateMediaAbsolutePath(persisted!.privateMediaPath)!), true);

rmSync(rootDir, { recursive: true, force: true });
process.stdout.write("Noodle autopost image regression passed.\n");
