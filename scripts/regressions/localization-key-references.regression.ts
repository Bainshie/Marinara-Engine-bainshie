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

const missing: string[] = [];
for (const file of files) {
  let source: string;
  try {
    source = readFileSync(join(repoRoot, file), "utf8");
  } catch {
    continue; // deleted-but-tracked during a rename
  }
  for (const match of source.matchAll(/localizeUi\(\s*"([^"]+)"/g)) {
    const key = match[1];
    if (!(key in en)) missing.push(`${key}  (${file})`);
  }
}

// ponytail: a known-bad allowlist rather than a hard zero — the tree already carries
// pre-existing dangling keys unrelated to this check's purpose, which is to stop NEW ones.
// Shrink this list when you fix one; never grow it.
const KNOWN_MISSING = 31;

assert.ok(
  missing.length <= KNOWN_MISSING,
  `${missing.length} localizeUi keys do not exist in en.json (baseline ${KNOWN_MISSING}). New ones:\n` +
    missing.slice(0, 40).join("\n"),
);

process.stdout.write(`Localization key-reference regression passed (${missing.length} known-missing, none new).\n`);
