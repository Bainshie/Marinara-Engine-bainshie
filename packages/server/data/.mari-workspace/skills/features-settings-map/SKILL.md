---
name: "features-settings-map"
description: "Quick reference for where Marinara Engine's features and settings live in the UI, and what each one does. Use this first for 'does Marinara support X', 'where do I turn on Y', or 'what does Y do' questions instead of exploring source code."
---

# Marinara Engine — Features & Settings Map

A compact map of the app's surface. This is a living reference, not exhaustive — if
something you need isn't here, still fall back to workspace files/live app data, and
consider adding what you learn back into this skill for next time.

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

- **General** — language; **Enable streaming** + **Streaming speed** slider; **Disable
  auto-scroll while streaming** (stops the chat view jumping to bottom mid-response, e.g.
  on mobile while reading up-scroll); **Trim incomplete model endings**; **Messages per
  page**.
- **Appearance** — theme, app/chat background, accent color. **Notification Sounds** live
  here (Settings → Appearance → Notification Sounds), NOT browser-only — separate toggles
  for Conversation mode and Roleplay mode.
- **Themes** — custom theme management/sync.
- **Extensions** — misc feature toggles.
- **Import** — SillyTavern migration.
- **Advanced** — debug mode and lower-level settings.

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

## Notes for Future Edits

- This skill intentionally does not list file paths or implementation details — those
  drift with the code. Keep entries to "what it is / where it lives / what it does."
- When a new setting or feature ships, add a line here in the same style rather than
  relying on this assistant to re-discover it from source every time.
