// ──────────────────────────────────────────────
// Routes: In-app documentation (serves docs/*.md)
// ──────────────────────────────────────────────
import type { FastifyInstance } from "fastify";
import {
  DEFAULT_DOCS_LANGUAGE,
  DOCS_LANGUAGE_LABELS,
  DOCS_LANGUAGE_SETTINGS_KEY,
  normalizeDocsLanguage,
} from "@marinara-engine/shared";
import { logger } from "../lib/logger.js";
import { existsSync } from "fs";
import { readdir, readFile, realpath, stat } from "fs/promises";
import { join, resolve } from "path";
import { getMonorepoRoot } from "../config/runtime-config.js";
import { assertInsideDir } from "../utils/security.js";
import { createAppSettingsStorage } from "../services/storage/app-settings.storage.js";

const DOCS_DIR = resolve(getMonorepoRoot(), "docs");

/** Translated doc trees live at docs/i18n/<code>/, mirroring the English folder/file names 1:1 */
const I18N_DIRNAME = "i18n";

/** Internal artifact folders (plus the translation root) excluded from the English doc walk */
const EXCLUDED_DIRS = new Set(["evidence", "pr-evidence", "screenshots", "examples", I18N_DIRNAME]);

/** Max markdown file size served: 5 MB (real docs are well under 100 KB) */
const MAX_DOC_BYTES = 5 * 1024 * 1024;

/** Root-level docs pinned to the top of the index, in this order */
const PINNED_DOCS = ["FAQ.md", "INSTALLATION.md", "UPGRADING.md", "CONFIGURATION.md", "TROUBLESHOOTING.md"];

/**
 * Category folders in browse order: new-user flow first (getting started,
 * install, connect a provider, then the three chat modes side by side),
 * reference material later, developer docs last. Folders missing from this
 * list sort alphabetically after the listed ones, so a new category still
 * shows up without a code change.
 */
const DIR_ORDER = [
  "home",
  "installation",
  "connections",
  "conversation",
  "roleplay",
  "game",
  "characters",
  "chats",
  "lorebooks",
  "agents",
  "media",
  "prompts",
  "noodle",
  "appearance",
  "settings",
  "data",
  "extending",
  "integrations",
  "development",
];

/**
 * Reading order inside each category folder: overview and getting-started
 * guides first, then task guides, then reference. Files missing from a list
 * sort alphabetically after the listed ones.
 */
const DOC_ORDER: Record<string, string[]> = {
  home: ["welcome.md", "tutorial.md", "professor-mari.md", "achievements.md"],
  installation: ["windows.md", "macos-linux.md", "containers.md", "android-termux.md", "ios-pwa.md"],
  connections: [
    "connecting-to-a-provider.md",
    "providers-reference.md",
    "subscription-clis.md",
    "local-self-hosted.md",
    "local-model.md",
    "organizing-connections.md",
  ],
  conversation: [
    "getting-started.md",
    "profiles.md",
    "schedules.md",
    "calls.md",
    "selfies.md",
    "emoji-stickers-gifs.md",
    "table-games.md",
  ],
  roleplay: [
    "getting-started.md",
    "backgrounds.md",
    "hud-and-trackers.md",
    "combat-encounters.md",
    "narrative-director.md",
    "scenes.md",
  ],
  game: [
    "getting-started.md",
    "combat.md",
    "party-and-npcs.md",
    "sessions-and-saves.md",
    "map-time-weather.md",
    "dice-and-skill-checks.md",
    "hud-widgets.md",
    "game-assets.md",
    "storyboard.md",
    "ltx-2-3-storyboards.md",
  ],
  characters: [
    "creating-and-editing-characters.md",
    "personas.md",
    "choosing-your-persona.md",
    "sprites.md",
    "galleries.md",
    "library-organization.md",
    "colors-and-stats.md",
    "import-export.md",
    "bot-browser.md",
  ],
  chats: [
    "managing-chats.md",
    "sending-and-streaming.md",
    "messages.md",
    "branches.md",
    "guided-and-impersonate.md",
    "peek-prompt.md",
    "chat-settings.md",
    "slash-commands.md",
    "group-chats.md",
    "connected-chats.md",
    "export-import.md",
  ],
  lorebooks: [
    "overview.md",
    "entries.md",
    "token-budgets.md",
    "semantic-search.md",
    "linking-to-characters.md",
    "import-export.md",
  ],
  agents: [
    "agents-overview.md",
    "built-in-agents.md",
    "custom-agents.md",
    "knowledge-sources.md",
    "memory.md",
    "approvals-and-agent-suite.md",
  ],
  media: [
    "image-providers.md",
    "comfyui.md",
    "style-profiles.md",
    "illustrator-agent.md",
    "scene-backgrounds.md",
    "scene-video.md",
    "animated-expressions.md",
    "tts-setup.md",
    "music.md",
  ],
  prompts: [
    "presets.md",
    "preset-variables.md",
    "macros.md",
    "conditional-prompts.md",
    "generation-parameters.md",
    "chat-settings-presets.md",
    "prompt-overrides.md",
  ],
  noodle: ["overview.md", "settings.md"],
  appearance: ["appearance-settings.md", "fonts.md", "chat-backgrounds.md", "custom-css-themes.md", "card-css-theming.md"],
  data: ["importing-from-sillytavern.md", "backup-and-restore.md", "where-data-is-stored.md", "clearing-data.md"],
  extending: ["regex-scripts.md", "custom-tools.md"],
  integrations: ["home-assistant.md", "discord-mirror.md", "message-translation.md", "haptic-feedback.md"],
  development: [
    "architecture-map.md",
    "frontend.md",
    "file-storage.md",
    "noodle-internals.md",
    "ios-pwa-safe-area.md",
  ],
};

interface DocSummary {
  /** Path relative to the docs folder, forward slashes (e.g. "installation/windows.md") */
  path: string;
  /** First `# ` heading in the file, or the filename when no heading exists */
  title: string;
  /** Subfolder relative to docs ("" for root-level guides) */
  dir: string;
  /** File modification time (ISO). Reflects install/update time on fresh clones. */
  updatedAt: string;
  /** Language actually served for this doc ("en" when a translation is missing) */
  language: string;
}

interface DocSearchSnippet {
  line: number;
  text: string;
}

interface DocSearchResult extends DocSummary {
  matches: number;
  snippets: DocSearchSnippet[];
}

/** Max snippet lines returned per document */
const MAX_SNIPPETS_PER_DOC = 3;

/**
 * Trim a matched line to a readable snippet. The sidebar only shows the first
 * ~40 characters, so window the slice to keep the matched term near the start.
 */
function toSnippet(line: string, matchIndex: number): string {
  const leading = line.length - line.trimStart().length;
  const trimmed = line.trim();
  const index = Math.max(0, matchIndex - leading);
  const start = index <= 30 ? 0 : index - 30;
  const slice = trimmed.slice(start, start + 160);
  return `${start > 0 ? "…" : ""}${slice}${start + 160 < trimmed.length ? "…" : ""}`;
}

function isSafeSegment(value: string): boolean {
  return (
    value.length > 0 &&
    value !== "." &&
    value !== ".." &&
    !value.includes("/") &&
    !value.includes("\\") &&
    !value.includes("\0")
  );
}

async function assertRealDocsPath(candidatePath: string): Promise<string> {
  const [root, candidate] = await Promise.all([realpath(DOCS_DIR), realpath(candidatePath)]);
  return assertInsideDir(root, candidate);
}

async function extractTitle(filePath: string, fallback: string): Promise<string> {
  try {
    const head = (await readFile(filePath, "utf8")).slice(0, 4096);
    return head.match(/^#\s+(.+?)\s*$/m)?.[1] ?? fallback;
  } catch {
    return fallback;
  }
}

async function collectDocs(dir: string, relativeDir: string): Promise<DocSummary[]> {
  const docs: DocSummary[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (relativeDir === "" && EXCLUDED_DIRS.has(entry.name)) continue;
      const childRelative = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      docs.push(...(await collectDocs(join(dir, entry.name), childRelative)));
      continue;
    }
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".md")) continue;
    const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
    const filePath = join(dir, entry.name);
    try {
      docs.push({
        path: relativePath,
        title: await extractTitle(filePath, entry.name.replace(/\.md$/i, "")),
        dir: relativeDir,
        updatedAt: (await stat(filePath)).mtime.toISOString(),
        language: DEFAULT_DOCS_LANGUAGE,
      });
    } catch {
      // File vanished between readdir and stat; skip it rather than failing the whole index.
    }
  }

  return docs;
}

/** Position of `value` in `list`; unlisted values sort after every listed one. */
function rankIn(list: string[] | undefined, value: string): number {
  const index = list ? list.indexOf(value) : -1;
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

// Root-level guides first (pinned ones ahead of the rest), then category
// folders in DIR_ORDER, each folder's docs in DOC_ORDER reading order.
// Alphabetical fallbacks keep unlisted folders and files browsable.
function docSortKey(doc: DocSummary): [number, number, string, number, string] {
  if (doc.dir === "") {
    return [0, rankIn(PINNED_DOCS, doc.path), "", 0, doc.path];
  }
  const fileName = doc.path.slice(doc.dir.length + 1);
  return [1, rankIn(DIR_ORDER, doc.dir), doc.dir, rankIn(DOC_ORDER[doc.dir], fileName), fileName];
}

// ──────────────────────────────────────────────
// Documentation language (docs/i18n/<code>/ trees overlay the English paths)
// ──────────────────────────────────────────────

type AppSettingsStorage = ReturnType<typeof createAppSettingsStorage>;

/** Root folder holding a language's translated tree. English is the docs root itself. */
function langRoot(code: string): string {
  return code === DEFAULT_DOCS_LANGUAGE ? DOCS_DIR : join(DOCS_DIR, I18N_DIRNAME, code);
}

/** A code is usable only when it is well-formed, path-safe, and present on disk. */
function isInstalledLanguage(code: string): boolean {
  if (code === DEFAULT_DOCS_LANGUAGE) return true;
  return isSafeSegment(code) && existsSync(langRoot(code));
}

/** Languages present at this commit: "en" plus every valid folder under docs/i18n/ */
export async function discoverDocLanguages(): Promise<string[]> {
  const dir = join(DOCS_DIR, I18N_DIRNAME);
  if (!existsSync(dir)) return [DEFAULT_DOCS_LANGUAGE];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const codes = entries
      .filter((entry) => entry.isDirectory() && normalizeDocsLanguage(entry.name) === entry.name)
      .map((entry) => entry.name)
      .sort();
    return [DEFAULT_DOCS_LANGUAGE, ...codes];
  } catch (err) {
    logger.warn(err, "Failed to list documentation languages");
    return [DEFAULT_DOCS_LANGUAGE];
  }
}

interface StoredDocsLanguage {
  /** Normalized stored code, or null when the stored value is unparseable/invalid */
  code: string | null;
  /** Whether any value is stored at all */
  present: boolean;
}

async function readStoredDocsLanguage(storage: AppSettingsStorage): Promise<StoredDocsLanguage> {
  const raw = await storage.get(DOCS_LANGUAGE_SETTINGS_KEY);
  if (raw === null) return { code: DEFAULT_DOCS_LANGUAGE, present: false };
  try {
    return { code: normalizeDocsLanguage((JSON.parse(raw) as { language?: unknown } | null)?.language), present: true };
  } catch {
    return { code: null, present: true };
  }
}

/**
 * Language the viewer serves right now. The stored choice is never mutated here:
 * when its tree is absent at this commit (downgrade/channel switch) serving simply
 * degrades to English, and a later update restores the choice automatically.
 */
async function getActiveDocLanguage(storage: AppSettingsStorage): Promise<string> {
  const stored = await readStoredDocsLanguage(storage);
  if (!stored.code) return DEFAULT_DOCS_LANGUAGE;
  return isInstalledLanguage(stored.code) ? stored.code : DEFAULT_DOCS_LANGUAGE;
}

/** ?lang= override when valid and installed, else the stored active language. */
async function resolveRequestLanguage(lang: unknown, storage: AppSettingsStorage): Promise<string> {
  const requested = typeof lang === "string" ? normalizeDocsLanguage(lang) : null;
  if (requested && isInstalledLanguage(requested)) return requested;
  return getActiveDocLanguage(storage);
}

/**
 * English is the canonical path set; a translated file is an overlay on an English
 * path. Falls back to the English file when the overlay is missing, so untranslated
 * docs still open instead of breaking cross-doc links.
 */
export function resolvePhysical(code: string, segments: string[]): { file: string; language: string } {
  if (code !== DEFAULT_DOCS_LANGUAGE) {
    const candidate = assertInsideDir(DOCS_DIR, join(langRoot(code), ...segments));
    if (existsSync(candidate)) return { file: candidate, language: code };
  }
  return { file: assertInsideDir(DOCS_DIR, join(DOCS_DIR, ...segments)), language: DEFAULT_DOCS_LANGUAGE };
}

/** The English index with translated titles/mtimes overlaid where a translation exists. */
async function collectLocalizedDocs(code: string): Promise<DocSummary[]> {
  const base = await collectDocs(DOCS_DIR, "");
  if (code === DEFAULT_DOCS_LANGUAGE) return base;
  return Promise.all(
    base.map(async (doc) => {
      const { file, language } = resolvePhysical(code, doc.path.split("/"));
      if (language === DEFAULT_DOCS_LANGUAGE) return doc;
      try {
        return {
          ...doc,
          language,
          title: await extractTitle(file, doc.title),
          updatedAt: (await stat(file)).mtime.toISOString(),
        };
      } catch {
        return doc;
      }
    }),
  );
}

interface DocLanguageInfo {
  code: string;
  label: string;
  englishLabel: string;
  /** Number of English paths with a translated overlay present ("en" reports total) */
  translated: number;
  total: number;
}

interface DocsLanguageStatus {
  active: string;
  available: DocLanguageInfo[];
  integrity: {
    ok: boolean;
    /** A value is stored but it is not a usable language code */
    unknownLanguage: boolean;
    /** Stored language is valid but its tree is absent at this commit */
    activeRootMissing: boolean;
  };
}

async function buildLanguageStatus(storage: AppSettingsStorage): Promise<DocsLanguageStatus> {
  const [stored, known, base] = await Promise.all([
    readStoredDocsLanguage(storage),
    discoverDocLanguages(),
    collectDocs(DOCS_DIR, ""),
  ]);
  const available = known.map((code) => {
    const labels = DOCS_LANGUAGE_LABELS[code] ?? { label: code, englishLabel: code };
    const translated =
      code === DEFAULT_DOCS_LANGUAGE
        ? base.length
        : base.filter((doc) => existsSync(join(langRoot(code), ...doc.path.split("/")))).length;
    return { code, label: labels.label, englishLabel: labels.englishLabel, translated, total: base.length };
  });
  const unknownLanguage = stored.present && stored.code === null;
  const activeRootMissing =
    stored.code !== null && stored.code !== DEFAULT_DOCS_LANGUAGE && !isInstalledLanguage(stored.code);
  return {
    active: stored.code && isInstalledLanguage(stored.code) ? stored.code : DEFAULT_DOCS_LANGUAGE,
    available,
    integrity: { ok: !unknownLanguage && !activeRootMissing, unknownLanguage, activeRootMissing },
  };
}

export async function docsRoutes(app: FastifyInstance) {
  const storage = createAppSettingsStorage(app.db);

  /** List available documentation files plus the on-disk docs folder path */
  app.get<{ Querystring: { lang?: string } }>("/", async (req, reply) => {
    if (!existsSync(DOCS_DIR)) {
      return reply.status(404).send({ error: "Documentation folder not found" });
    }
    try {
      const language = await resolveRequestLanguage(req.query.lang, storage);
      const docs = await collectLocalizedDocs(language);
      docs.sort((a, b) => {
        const ka = docSortKey(a);
        const kb = docSortKey(b);
        return (
          ka[0] - kb[0] ||
          ka[1] - kb[1] ||
          ka[2].localeCompare(kb[2]) ||
          ka[3] - kb[3] ||
          ka[4].localeCompare(kb[4])
        );
      });
      return { root: DOCS_DIR, language, docs };
    } catch (err) {
      logger.error(err, "Failed to list documentation files");
      return reply.status(500).send({ error: "Failed to list documentation files" });
    }
  });

  /** Full-text search across all documentation files (case-insensitive substring) */
  app.get("/search", async (req, reply) => {
    const { q, lang } = req.query as { q?: string; lang?: string };
    const query = typeof q === "string" ? q.trim().slice(0, 200) : "";
    if (query.length < 2) {
      return reply.status(400).send({ error: "Query must be at least 2 characters" });
    }
    if (!existsSync(DOCS_DIR)) {
      return reply.status(404).send({ error: "Documentation folder not found" });
    }

    try {
      const language = await resolveRequestLanguage(lang, storage);
      const needle = query.toLowerCase();
      const results: DocSearchResult[] = [];

      for (const doc of await collectLocalizedDocs(language)) {
        let content: string;
        try {
          const { file: filePath } = resolvePhysical(language, doc.path.split("/"));
          if ((await stat(filePath)).size > MAX_DOC_BYTES) continue;
          content = await readFile(filePath, "utf8");
        } catch {
          continue;
        }
        const snippets: DocSearchSnippet[] = [];
        let matches = 0;

        content.split(/\r?\n/).forEach((line, index) => {
          const matchIndex = line.toLowerCase().indexOf(needle);
          if (matchIndex === -1) return;
          matches++;
          if (snippets.length < MAX_SNIPPETS_PER_DOC) {
            snippets.push({ line: index + 1, text: toSnippet(line, matchIndex) });
          }
        });

        // Count a title hit only when no content line matched (the H1 the title
        // came from is already counted by the line scan).
        if (matches === 0 && doc.title.toLowerCase().includes(needle)) matches = 1;

        if (matches > 0) results.push({ ...doc, matches, snippets });
      }

      results.sort((a, b) => b.matches - a.matches || a.path.localeCompare(b.path));
      return { query, language, results };
    } catch (err) {
      logger.error(err, "Failed to search documentation files");
      return reply.status(500).send({ error: "Failed to search documentation files" });
    }
  });

  /** Serve a single markdown file from the docs folder */
  app.get("/content", async (req, reply) => {
    const { path: docPath, lang } = req.query as { path?: string; lang?: string };
    if (!docPath || typeof docPath !== "string") {
      return reply.status(400).send({ error: "Missing path" });
    }

    const segments = docPath.split("/");
    const filename = segments[segments.length - 1];
    if (!segments.every(isSafeSegment) || !filename || !filename.toLowerCase().endsWith(".md")) {
      return reply.status(400).send({ error: "Invalid path" });
    }
    // Lowercase so the exclusion can't be bypassed on case-insensitive filesystems
    if (segments[0] && EXCLUDED_DIRS.has(segments[0].toLowerCase())) {
      return reply.status(400).send({ error: "Invalid path" });
    }

    const language = await resolveRequestLanguage(lang, storage);
    let filePath: string;
    let servedLanguage = DEFAULT_DOCS_LANGUAGE;
    try {
      const { file: candidatePath, language: fileLanguage } = resolvePhysical(language, segments);
      if (!existsSync(candidatePath)) {
        return reply.status(404).send({ error: "Not found" });
      }
      filePath = await assertRealDocsPath(candidatePath);
      servedLanguage = fileLanguage;
    } catch {
      return reply.status(400).send({ error: "Invalid path" });
    }

    try {
      const info = await stat(filePath);
      if (!info.isFile() || info.size > MAX_DOC_BYTES) {
        return reply.status(400).send({ error: "Invalid path" });
      }
      const content = await readFile(filePath, "utf8");
      const title = content.slice(0, 4096).match(/^#\s+(.+?)\s*$/m)?.[1] ?? filename;
      return { path: docPath, language: servedLanguage, title, content, updatedAt: info.mtime.toISOString() };
    } catch (err) {
      logger.error(err, "Failed to read documentation file");
      return reply.status(500).send({ error: "Failed to read documentation file" });
    }
  });

  /** Active docs language, discovered languages with coverage, and integrity flags */
  app.get("/language", async () => buildLanguageStatus(storage));

  /** Switch the served documentation language. Writes one setting; never touches docs/. */
  app.put("/language", async (req, reply) => {
    const body = req.body as { language?: unknown } | null;
    const code = normalizeDocsLanguage(body?.language);
    if (!code) {
      return reply
        .status(400)
        .send({ error: "Unsupported documentation language", code: "unsupported-language" });
    }
    if (!isInstalledLanguage(code)) {
      return reply.status(409).send({
        error: "That documentation language is not included in this version",
        code: "not-present-on-this-version",
      });
    }
    await storage.set(DOCS_LANGUAGE_SETTINGS_KEY, JSON.stringify({ language: code }));
    logger.info("Documentation language set to %s", code);
    return buildLanguageStatus(storage);
  });

  /** Failsafe: reset a dangling or corrupt stored language to English. Never mutates docs/. */
  app.post("/language/fix", async () => {
    const before = await buildLanguageStatus(storage);
    if (before.integrity.ok) {
      return { ...before, repaired: false };
    }
    await storage.set(DOCS_LANGUAGE_SETTINGS_KEY, JSON.stringify({ language: DEFAULT_DOCS_LANGUAGE }));
    logger.warn(
      "Documentation language reset to English (unknownLanguage=%s, activeRootMissing=%s)",
      before.integrity.unknownLanguage,
      before.integrity.activeRootMissing,
    );
    return { ...(await buildLanguageStatus(storage)), repaired: true };
  });
}
