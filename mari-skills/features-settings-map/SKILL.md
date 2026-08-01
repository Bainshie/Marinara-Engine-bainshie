---
name: "features-settings-map"
description: "Quick reference for where Marinara Engine's features and settings live in the UI, and what each one does. Use this first for 'does Marinara support X', 'where do I turn on Y', or 'what does Y do' questions instead of exploring source code."
---

# Marinara Engine — Features & Settings Map

A compact map of the app's surface. This is a living reference, not exhaustive — if
something you need isn't here, still fall back to workspace files/live app data.

## Chat Modes

- **Conversation 💬** — casual DM-style texting, no narration/asterisks. Characters have
  weekly schedules (activity blocks → online/idle/dnd/offline status), can send up to 3
  autonomous follow-up messages with exponential backoff, support group DMs, can take
  selfies (Illustrator package), start audio calls (Calls package), and cross-post
  memories to other chats. Conversation characters can branch a **Scene** into a
  temporary Roleplay chat via `[scene: ...]` or `/scene`.
- **Roleplay 🎭** — traditional narrative writing. Driven by a Prompt Preset (sections +
  generation parameters). Supports pipeline Agents (world-building, combat, expressions,
  trackers, etc.) and VN-style character sprite overlays.
- **Game 🎮** — GM-led structured game surface (not roleplay-with-a-HUD; treat as a full
  third mode). The model acts as GM; the engine owns state, dice, combat rounds, journal,
  and asset generation. State machine: `exploration | dialogue | combat | travel_rest`.
  GM output tags: `[state:]`, `[qte:]`, `[choices:]`, `[dialogue:]`, `[reputation:]`,
  `[widget:]`, `[direction:]`, `[skill_check:]`, `[dice:]`, `[encounter:]`,
  `[session_end:]`, readable `[Note:]`/`[Book:]`. Tactical combat resolves server-side via
  `POST /game/combat/round` and `/game/combat/loot`; the UI sends `[combat_result]...[/combat_result]`
  back to the GM with the authoritative outcome. Auto-journal logs events as structured
  data (no LLM summarization).

## Right Panel / Top Bar (sidebar icons)

- **Characters** — AI personalities (V2 card spec). Full grid via **Open Full Library**.
- **Card Browser** (top bar) — search/download public character cards. Distinct from the
  Character Library, which is the user's own saved characters.
- **Personas** — the user's own identities for chats. Full grid via Persona Library.
- **Lorebooks** — keyword-triggered knowledge injection. Supports regex/case-sensitive/
  whole-word keys, sticky/cooldown/delay timing, weighted-lottery entry groups, recursive
  re-scanning of activated content, semantic (embedding) matching as a keyword fallback,
  and game-state-conditional activation. Scope: global, per-character, or per-chat.
- **Presets** (Prompt Presets) — controls Roleplay/Game prompt assembly: ordered sections
  (system/user/assistant role, optional groups), choice-block variables, and generation
  parameters (temperature, top-p, max tokens, etc.).
- **Connections** — API provider setup (OpenAI, Anthropic, Google Gemini, Google Vertex,
  Mistral, Cohere, OpenRouter, or Custom OpenAI-compatible). Also hosts **Text to Speech**
  and the built-in **Local Model** card (Google Gemma, offline, no API key — used to
  offload tracker agents / game scene analysis from the main chat model).
- **Agents** — pipeline sub-systems. Fresh installs start with none. Install/update/
  uninstall via **Agents → Download Agents** (see the `official_agent_catalog` block
  already in this prompt for the current first-party list — don't re-derive it from code).
  Each compatible agent is toggled per chat in Chat Settings.

## Settings Panel Tabs

- **General** — see **General Tab, Setting by Setting** below for the full breakdown.
- **Appearance** — theme, app/chat background, accent color.
- **Themes** — custom theme management/sync.
- **Extensions** — misc feature toggles.
- **Import** — SillyTavern migration.
- **Advanced** — debug mode and lower-level settings.

## General Tab, Setting by Setting

The General tab is organized into sections, top to bottom:

**App Behavior**
- **Language** — app language picker. Only English ships today; persisted for future
  translation PRs.
- **Confirm before deleting** — shows a confirmation dialog before permanently deleting
  chats, characters, or other items. Recommended on.
- **Achievements** — shows the Home achievements button and unlock notifications. When
  off, tracking stays silent in the current profile.
- **Music Player** — shows the compact Music Player (Spotify/YouTube/Custom, switchable
  from the player itself or the Music DJ agent settings).
- **Mini Mari surprise visits** — allows the rare Chibi Professor Mari message to appear
  while scrolling.
- **Professor Mari suggestions** — shows Professor Mari's quick suggestion chips and
  guided option chips after her replies.

**Notifications**
- **Notification Sounds** — plays a ping on new messages while you're on a different
  chat. Separate toggles for **Conversation mode**, **Roleplay mode**, **Game mode**, and
  **Only when Marinara is unfocused**.
- **Background Notifications** — private OS notification when an autonomous Conversation
  message arrives while Marinara isn't focused (message content hidden). Separate
  **Browser** (uses browser notification permission) and **Mobile app** (native Android,
  requires the installed Marinara app) toggles.
- **Generation Completion Notifications** — same private OS notification, but for a
  manually-started reply finishing in Conversation, Roleplay, Visual Novel, or Game mode
  while unfocused. Same **Browser** / **Mobile app** toggle split.

**Responses**
- **Enable streaming** — AI responses appear word-by-word as generated; off shows the
  full response at once after completion.
- **Streaming speed** — slider controlling typewriter speed of streamed tokens (only
  matters when streaming is on).
- **Disable auto-scroll while streaming** — stops the chat view jumping to bottom
  mid-response; useful on mobile so scrolling up to read isn't interrupted.
- **Trim incomplete model endings** — trims a trailing unfinished sentence from AI
  responses before saving; leaves complete responses and command-only endings alone.
- **Messages per page** — how many messages load at a time (Load More reveals older
  ones). 0 loads all messages at once.

**Input & Editing**
- **Send on Enter** — per-mode toggle (Roleplay / Conversations / Game) for whether
  Enter sends the message; off makes Enter a newline and requires the send button.
- **Quick replies** — adds alternate draft actions beside Send (one shows directly,
  multiple open from an ellipsis). Sub-options: **Post only** (add persona message
  without triggering a reply), **Guide reply** (use the draft as a `/guided` direction),
  **Impersonate** (generate a persona-side user reply).
- **Speech-to-text microphone** — shows a mic button on chat input bars for browser
  dictation.
- **Intuitive swipe navigation** — in Conversation/Roleplay, Left/Right Arrow (desktop)
  or horizontal touch swipes (mobile) move between alternate generations on the latest
  assistant message.
- **Reroll past the newest swipe** — with intuitive swipes on, Right Arrow/swipe-left on
  the newest swipe of the latest assistant message creates a new reroll instead of doing
  nothing.
- **Up Arrow edits last message** — in Conversation/Roleplay, Up Arrow with an empty
  chat input opens the most recent message (yours or the AI's) for editing.
- **Double-click edits messages** — double-click/double-tap a Roleplay message to open it
  for editing; off avoids accidental edits (edit buttons/shortcuts still work).

**Text Rules**
- **Bold dialogue in quotes** — bolds text inside dialogue quotation marks (`"..."`,
  `「...」`, `『...』`) in addition to the dialogue highlight color.
- **Convert LaTeX symbols** — turns model-written LaTeX commands (`\rightarrow`, `\neq`,
  `\times`, `\alpha`, etc.) into regular symbols for display; code snippets are left
  alone; saved message text is unchanged.
- **Quote style** — unifies straight/smart quotation marks in chat inputs and displayed
  AI output.

**Game Playback**
- **Instantly reveal game text** — Game mode narration appears fully immediately,
  skipping the typewriter effect (hides the narration speed control below).
- **Mouse-wheel + click navigation** — in Game mode, scroll up/down to step back/forward
  through past assistant turns; clicking the scene background advances like Next. While
  reviewing the past, Next becomes Return (clicking the background or pressing Return
  jumps back to where you were reading).
- **Game narration speed** — typewriter speed for Game mode narration text (hidden when
  instant reveal is on).
- **Game auto-play segment delay** — pause between narration segments when auto-play is
  enabled (▶ button next to Next).

## Per-Chat Settings (Chat Settings drawer)

- **Function Calling** section — enable tool use, per-chat tool allow-list.
  - **Force Dice Rolls** — only shown when `roll_dice` is an active tool. Forces
    `tool_choice` so the model must call a tool on its first response instead of
    skipping straight to text, injects a system instruction teaching the model the exact
    narrative format to report a resolved roll in, and post-hoc regex-corrects any
    hallucinated roll the model writes anyway if it still skips the tool. Exists because
    weaker/OSS models (GLM, DeepSeek) tend to invent dice results with a positivity bias
    instead of calling the tool.
  - **Roll Detection Pattern** — only shown once Force Dice Rolls is on. Custom regex
    override for the hallucination-fixer above; leaving it at the default also keeps the
    auto-injected format instruction active. Setting a custom pattern turns that
    auto-instruction off (the assumption is the user's own preset/character already
    teaches its own format, e.g. the GM Engine preset's "Action Resolution" section).
- **Agents** section — enable/disable installed pipeline agents for this specific chat.
- **Memory Recall** — semantic search over embedded chat history (local
  all-MiniLM-L6-v2, chunks of 5 messages, top-8 similarity results), toggleable per chat.

## Cross-Chat & Connected-Chat Systems

- **Cross-Chat Awareness** — temporal references ("yesterday", "last week", etc.) trigger
  a pull of relevant messages from a character's other chats, injected as an `<awareness>`
  block (~1500 token budget).
- **Connected chats** (Conversation ↔ Roleplay, bidirectional) — `<influence>` (one-shot
  steer into the roleplay's next generation), `<note>` (durable, capped-budget memory
  injected every generation until cleared), `<ooc>` (roleplay character breaks character
  into the connected conversation chat).

## App Data Storage — JSON Files, Not SQL

Marinara has **no SQL database**. There is no sqlite file, no `SELECT`/`INSERT` SQL
syntax, and no query engine to connect to. All user data (chats, messages, characters,
personas, lorebooks, presets, connections, themes, agents, etc.) lives as plain JSON
files on disk under `DATA_DIR/storage/tables/<table>.json` — one JSON array of row
objects per table, plus a `manifest.json` index. Writes are debounced and saved
atomically with a `.bak` backup per file. Never write or suggest SQL against this data —
it will not run against anything.

**To inspect or edit live app data, use the `mari db` CLI command group** (Professor
Mari's own tool for this, dry-run by default so nothing is saved without `--apply`):

- **Discovery** — `mari db status`, `tables` (list all table names), `schema <table>`
  (columns + primary key), `counts` (row count per table), `data-dir`.
- **Read** — `mari db list <table> [--limit <n>] [--offset <n>] [--parsed]`,
  `get <table> <id>`, `select <table> --where <expr>`, `search <table|all> <query>`
  (case-insensitive substring match across the whole row).
- **Write** — `insert|patch|replace|delete|transform <table> ...` — always dry-run
  unless `--apply` is passed; applying shows a Keep/Restore review card so changes stay
  reversible.

`--where <expr>` is **not SQL** — it's a JS boolean expression evaluated with `row` bound
to the parsed row object, e.g. `row.name === 'Foo' && row.enabled === 'true'`. Note many
boolean-looking columns are stored as the literal text `"true"`/`"false"`, not real
booleans, so compare them as strings. Some columns (e.g. `characters.data`,
`chats.metadata`) hold JSON-encoded text; `select`/`search` auto-parse them, and `list`/
`get` need `--parsed` to decode them.

For the common entities, prefer the friendlier wrapper command groups over raw `mari db`
table/column access — they use named fields instead of raw column names: `mari
characters`, `mari personas`, `mari lorebooks`, `mari chats` (read-only), `mari themes`.
Each supports `--help` for its exact subcommands.

## Notes for Future Edits

- This skill intentionally does not list file paths or implementation details — those
  drift with the code. Keep entries to "what it is / where it lives / what it does."
- When a new setting or feature ships, add a line here in the same style rather than
  relying on this assistant to re-discover it from source every time.
- This file ships with Marinara Engine (tracked in git, not per-user data) and is loaded
  automatically alongside any local custom skills. It's read-only from the Skills UI —
  edit this file directly and open a PR to change it.
