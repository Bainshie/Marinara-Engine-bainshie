// ──────────────────────────────────────────────
// Regression: Documentation language (docs/i18n overlays)
//
// Pins the invariants the Documentation Language feature depends on:
//  - the English doc walk excludes docs/i18n (no translated files leak into
//    the English index),
//  - the overlay resolver serves a translation when present, falls back to
//    English per-file, and refuses path traversal,
//  - the shipped Spanish tree mirrors English paths exactly (no orphans),
//    covers every user-facing doc, and every file keeps a leading H1,
//  - translated files never rewrite relative link targets.
// ──────────────────────────────────────────────
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeDocsLanguage, DEFAULT_DOCS_LANGUAGE } from "../../packages/shared/src/constants/docs-languages.ts";
import { discoverDocLanguages, resolvePhysical } from "../../packages/server/src/routes/docs.routes.ts";

const repoRoot = join(fileURLToPath(import.meta.url), "..", "..", "..");
const docsDir = join(repoRoot, "docs");
const esDir = join(docsDir, "i18n", "es");

/** Folders the docs viewer excludes from the English walk (mirror of the route's set). */
const EXCLUDED_TOP_DIRS = new Set(["evidence", "pr-evidence", "screenshots", "examples", "i18n"]);
/** Folders intentionally left English-only (contributor/internal docs). */
const UNTRANSLATED_DIRS = new Set(["development"]);

function walkMarkdown(dir: string, base: string, skipTopDirs: ReadonlySet<string>): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const rel = relative(base, full).split(sep).join("/");
    if (entry.isDirectory()) {
      if (!rel.includes("/") && skipTopDirs.has(entry.name)) continue;
      out.push(...walkMarkdown(full, base, skipTopDirs));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      out.push(rel);
    }
  }
  return out;
}

// ── Shared normalizer contract ──
assert.equal(normalizeDocsLanguage("es"), "es");
assert.equal(normalizeDocsLanguage(" ES "), "es");
assert.equal(normalizeDocsLanguage("pt-BR"), "pt-br");
assert.equal(normalizeDocsLanguage("en"), "en");
assert.equal(normalizeDocsLanguage("../es"), null);
assert.equal(normalizeDocsLanguage("es/.."), null);
assert.equal(normalizeDocsLanguage(""), null);
assert.equal(normalizeDocsLanguage(42), null);
assert.equal(normalizeDocsLanguage(null), null);
assert.equal(DEFAULT_DOCS_LANGUAGE, "en");

// ── Language discovery ──
const languages = await discoverDocLanguages();
assert.ok(languages.includes("en"), "discovery must always include English");
assert.ok(languages.includes("es"), "the shipped Spanish tree must be discovered");

// ── Overlay resolution: translated, fallback, and English-identity paths ──
const translated = resolvePhysical("es", ["FAQ.md"]);
assert.equal(translated.language, "es", "FAQ.md must resolve to its Spanish overlay");
assert.ok(translated.file.split(sep).join("/").endsWith("docs/i18n/es/FAQ.md"));

const fallback = resolvePhysical("es", ["development", "frontend.md"]);
assert.equal(fallback.language, "en", "untranslated docs must fall back to English per-file");
assert.ok(fallback.file.split(sep).join("/").endsWith("docs/development/frontend.md"));

const english = resolvePhysical("en", ["FAQ.md"]);
assert.equal(english.language, "en");
assert.ok(english.file.split(sep).join("/").endsWith("docs/FAQ.md"));

// Traversal attempts must throw (assertInsideDir), never resolve outside docs/.
assert.throws(() => resolvePhysical("es", ["..", "package.json"]));
assert.throws(() => resolvePhysical("es", ["..", "..", "etc", "passwd"]));

// ── The English walk must not see the i18n tree ──
const englishDocs = walkMarkdown(docsDir, docsDir, EXCLUDED_TOP_DIRS);
assert.ok(englishDocs.length > 0, "English docs must exist");
assert.ok(
  englishDocs.every((path) => !path.startsWith("i18n/")),
  "the English doc walk must exclude docs/i18n",
);

// ── Spanish tree mirrors English paths: no orphans, full user-facing coverage ──
assert.ok(existsSync(esDir), "docs/i18n/es must ship with this feature");
const spanishDocs = walkMarkdown(esDir, esDir, new Set());
const englishSet = new Set(englishDocs);

const orphans = spanishDocs.filter((path) => !englishSet.has(path));
assert.deepEqual(orphans, [], `Spanish files without an English counterpart: ${orphans.join(", ")}`);

const spanishSet = new Set(spanishDocs);
const missing = englishDocs.filter((path) => {
  const topDir = path.includes("/") ? path.split("/")[0] : "";
  return topDir !== "" && UNTRANSLATED_DIRS.has(topDir) ? false : !spanishSet.has(path);
});
assert.deepEqual(missing, [], `User-facing docs missing a Spanish translation: ${missing.join(", ")}`);

// ── Structural invariants of every translated file ──
const LINK_RE = /\]\(([^()\s]+\.md(?:#[^)]*)?)\)/gi;
for (const path of spanishDocs) {
  const esContent = readFileSync(join(esDir, ...path.split("/")), "utf8");
  const firstLine = esContent.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
  assert.ok(firstLine.startsWith("# "), `${path}: translated file must keep a leading H1`);

  // Relative .md link targets must be a subset of the English file's targets —
  // translators may only change link TEXT, never destinations.
  const enContent = readFileSync(join(docsDir, ...path.split("/")), "utf8");
  const enTargets = new Set([...enContent.matchAll(LINK_RE)].map((match) => match[1]));
  for (const match of esContent.matchAll(LINK_RE)) {
    assert.ok(
      enTargets.has(match[1]),
      `${path}: link target "${match[1]}" does not exist in the English source`,
    );
  }
}

console.log(
  `docs-language regression passed: ${englishDocs.length} English docs, ${spanishDocs.length} Spanish translations, languages: ${languages.join(", ")}`,
);
