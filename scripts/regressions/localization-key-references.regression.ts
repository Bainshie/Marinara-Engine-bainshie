import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

// Every localizeUi("…") reference must resolve to a key in en.json.
//
// Nothing else catches this. check-locales validates sortedness and coverage counts, and
// localization:ui-check only audits static JSX for un-localized strings — neither notices a
// reference pointing at a key that does not exist, and TypeScript sees only a string literal.
// A dangling key renders as raw text in the UI.
//
// A rename that touches component code and locale JSON separately is exactly how these drift,
// which is how ten Noodle keys broke during the platform rename.

const repoRoot = join(import.meta.dirname, "..", "..");
const en = JSON.parse(readFileSync(join(repoRoot, "packages/client/src/localization/locales/en.json"), "utf8")) as Record<
  string,
  unknown
>;

const files = execFileSync("git", ["ls-files", "packages/client/src"], { cwd: repoRoot, encoding: "utf8" })
  .split("\n")
  .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));

const missing = new Map<string, string>(); // key -> "key  (file)" for the failure message
for (const file of files) {
  let source: string;
  try {
    source = readFileSync(join(repoRoot, file), "utf8");
  } catch {
    continue; // deleted-but-tracked during a rename
  }
  for (const match of source.matchAll(/localizeUi\(\s*"([^"]+)"/g)) {
    const key = match[1];
    if (!(key in en)) missing.set(key, `${key}  (${file})`);
  }
}

// A known-bad allowlist rather than a hard zero — the tree already carries pre-existing
// dangling keys unrelated to this check's purpose, which is to stop NEW ones. Named rather
// than counted so that fixing one key and breaking another cannot cancel out.
// Shrink this list when you fix one; never grow it.
const KNOWN_MISSING = new Set([
  "ui.agents.customagentrepositoriesmodal.repositoryAgentsWillBeImported",
  "ui.characters.lorebooktab.reimportedEmbeddedLorebookEntries",
  "ui.characters.lorebooktab.importedEmbeddedLorebookEntries",
  "chat.branches.importedMessages",
  "chat.branches.switchCount",
  "chat.branches.deleteAllConfirmation",
  "chat.activeContext.skippedEntries",
  "chat.activeContext.activeEntries",
  "chat.summary.source.lastMessages",
  "chat.summary.source.selectedMessages",
  "chat.summary.headerActive",
  "chat.summary.automatic.updateInterval",
  "chat.summary.template.tokenEstimate",
  "ui.game.gamecharactersheet.regenerating",
  "ui.game.gamewidgetsetupeditor.importedWidgets",
  "ui.lorebooks.lorebookeditor.enabledEntriesWouldActivate",
  "ui.lorebooks.vectorizesection.reVectorizeAllEntriesWithConnection",
  "ui.lorebooks.lorebookfolderrow.entriesInThisFolder",
  "ui.modals.stbulkimportmodal.builtInPresetsDetectedAndUnchecked",
  "ui.modals.stbulkimportmodal.selectedItems",
  "ui.modals.stbulkimportmodal.importedCharacters",
  "ui.modals.stbulkimportmodal.importedChats",
  "ui.modals.stbulkimportmodal.importedGroupChats",
  "ui.modals.stbulkimportmodal.importedPresets",
  "ui.modals.stbulkimportmodal.importedLorebooks",
  "ui.modals.stbulkimportmodal.importedBackgrounds",
  "ui.modals.stbulkimportmodal.importedPersonas",
  "ui.modals.stbulkimportmodal.importWarnings",
  "ui.panels.importbutton.embeddedLorebookImportPrompt",
  "ui.panels.advancedsettings.deleteSelectedDataCategories",
  "ui.panels.extensionsettings.invalidExtensionEntriesSkipped",
]);

const unexpected = [...missing].filter(([key]) => !KNOWN_MISSING.has(key)).map(([, display]) => display);
assert.equal(
  unexpected.length,
  0,
  `${unexpected.length} localizeUi keys do not exist in en.json:\n${unexpected.join("\n")}`,
);

const fixed = [...KNOWN_MISSING].filter((key) => !missing.has(key));
assert.equal(
  fixed.length,
  0,
  `These keys resolve now — remove them from KNOWN_MISSING:\n${fixed.join("\n")}`,
);

process.stdout.write(`Localization key-reference regression passed (${missing.size} known-missing, none new).\n`);
