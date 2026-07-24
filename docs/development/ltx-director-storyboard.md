# LTX Director Storyboard

Status: Draft for maintainer review. Implementation remains paused until this document is approved.

## Problem

The current Storyboard path produces one first-frame illustration and one prose `narrationBeat`. The selected Storyboard Video Prompt then combines that action plan, character names, setting, art style, and a large excerpt of the first-frame image prompt into one `%prompt%`. ComfyUI sends that entire string to LTX Director as `global_prompt`, while `local_prompts` and `segment_lengths` remain empty. LTX Director therefore takes its single-prompt path instead of its multi-segment temporal path.

The live six-second Storyboard setting resolves `%length%` to 96 frames at Marinara's existing 16 FPS contract, but the saved LTX workflow still contains hard-coded five-second UI fields. The frame count is effective at runtime; the seconds fields are inconsistent metadata.

This is an opt-in addition. Do not edit, rename, remove, migrate, or change the defaults of any existing Storyboard Planner or Game/Storyboard Video Prompt. In particular, keep Anime Episode Director and Anime Game Video unchanged.

## Confirmed upstream behavior

- [LTX Director 2.0](https://github.com/WhatDreamsCost/WhatDreamsCost-ComfyUI#ltx-director-20) already integrates Prompt Relay.
- Its [relay encoder](https://github.com/WhatDreamsCost/WhatDreamsCost-ComfyUI/blob/main/ltx_director.py#L776-L845) splits `local_prompts` on `|`, bypasses temporal masking for zero or one segment, and automatically distributes timing when `segment_lengths` is empty.
- `guide_strength` belongs to image/video guide segments, not Prompt Relay text segments.
- `timeline_data` supplies media guides. It does not need repeated copies of the same first-frame image to activate text segmentation.
- LTX Director's editor can represent later prompt-only periods as `type: "text"` segments, but API execution accepts `local_prompts` and `segment_lengths` directly. UI round-trip generation is not required in this first increment.
- Official LTX guidance favors a chronological, present-tense description with concrete action, relative camera movement, visible physical emotion, environmental behavior, and relevant audio. It also warns against overloaded scenes and overcomplicated prompts. See the [LTX prompting guide](https://docs.ltx.io/open-source-model/usage-guides/prompting-guide) and [official LTX-2 repository](https://github.com/Lightricks/LTX-2#prompting-for-ltx-2).

## Product decision

Add two new built-in choices that are designed to be selected together:

1. **LTX Director Storyboard** — a new Animation Planner.
2. **LTX Director Video** — a new Storyboard Video Prompt.

Existing choices and saved selections remain unchanged. A user opts in by selecting both new templates in Chat Settings.

### New planner output

Keep the existing Storyboard JSON shape and storage model:

- `imagePrompt` describes the exact T=0 first frame.
- `narrationBeat` contains 2-4 ordered local prompts separated by `|`.
- No new character-sheet, reference-sheet, keyframe, schema, or database fields are introduced.

Each local prompt covers one equal part of the clip and describes only what changes during that period:

- primary subject or object movement;
- camera behavior relative to the subject;
- secondary hair, clothing, weather, particles, lighting, or prop movement;
- exact quoted dialogue or a concrete audio event when relevant;
- a reaction, settling motion, or brief hold in the final segment.

Use present tense, literal visible behavior, and one continuous shot. Do not put timecode labels, persistent appearance inventories, scene resets, cuts, or multiple unrelated actions in the local prompts.

Apply the official guide across the complete LTX Director prompt rather than repeating every element in every segment:

| LTX prompting element | Director input |
| --- | --- |
| shot type, scene, character appearance, lighting, palette, atmosphere, art style | stable global prompt |
| chronological action and visible physical emotion | local prompts |
| when and how the camera moves relative to the subject | relevant local prompt |
| ambient sound, effects, music, or quoted dialogue | relevant local prompt |

Across the global anchor and active local beat, favor flowing descriptive sentences and concrete cinematography. Keep the complete fallback prompt compact rather than mechanically duplicating all global details inside every beat.

Example:

```text
She lowers into a ready stance as rain moves through her hair and the camera holds low | She lunges and draws her sword while the camera tracks beside her, steel cutting through the rain | Sparks scatter at impact, then she settles into a guarded pose as the ringing blade fades
```

### New LTX Director Video Prompt

The new LTX Director Video template produces the stable global anchor. It should be short and contain only:

- continuity with the supplied first-frame illustration;
- persistent visible character identity, face, hair, clothing, and equipment;
- stable setting, weather, composition, lighting, palette, and art style;
- constraints against identity drift, new subjects, costume changes, scene changes, and cuts.

It must not include `narrationSummary`, pipe-delimited beats, timecodes, or the full `illustrationPrompt`. The reference image remains authoritative for precise visible detail, which avoids repeating a large T=0 action description in every temporal segment.

Example:

```text
Continuous anime shot matching the supplied first-frame illustration. Preserve the exact visible characters, faces, hair, clothing, equipment, shrine setting, rain, composition, lighting, palette, and cel-shaded art style throughout. Keep identity and scene continuity stable; do not add subjects, change costumes, cut, or reset the scene.
```

For `%prompt%` compatibility, the Storyboard route also composes one conventional LTX fallback prompt from this global anchor plus the ordered local beats. This fallback is concise, chronological, and contains the action, but it is separate from `global_prompt`. Legacy workflows therefore still receive a complete prompt when the new LTX templates are selected.

## Desired data flow

1. The selected LTX planner returns one T=0 `imagePrompt` and a pipe-delimited `narrationBeat`.
2. Storyboard image generation creates exactly one reference illustration, as it does now.
3. A small sanitizer splits `narrationBeat` on `|`, trims segments, and removes empty values. It accepts 2-4 segments; if more than four survive, retain the first three and the final segment so the ending hold is not discarded.
4. The selected LTX Director Video template renders the stable global prompt without the action plan or full first-frame prompt.
5. The Storyboard route creates a small LTX Director prompt payload beside the normal video request:

   ```ts
   {
     globalPrompt: string,
     localPrompts: string,
     segmentLengths: ""
   }
   ```

6. The ComfyUI adapter resolves the Director fields only where the saved workflow contains the new placeholders.
7. LTX Director receives the stable global prompt, two or more pipe-delimited local prompts, automatic equal timing, and one first-frame image guide.

If fewer than two valid segments remain, pass at most one pipe-neutralized local prompt. LTX Director then takes its documented single-prompt fast path and combines it with the global anchor. If no action survives, `%prompt%` remains the complete fallback.

For any video request without an LTX Director prompt payload, resolve `%global_prompt%` to the existing `%prompt%` value and resolve `%local_prompts%` and `%segment_lengths%` to empty strings. This lets the same updated ComfyUI connection continue serving ordinary Gallery, Game scene-video, and other non-Storyboard calls through LTX Director's single-prompt path.

## ComfyUI contract

Add four narrow substitutions while retaining every existing substitution:

| Placeholder | Value |
| --- | --- |
| `%global_prompt%` | Stable prompt from the new LTX Director Video template |
| `%local_prompts%` | Sanitized local beats separated by pipe delimiters |
| `%segment_lengths%` | Empty string in this increment for automatic equal timing |
| `%duration_seconds%` | The same resolved request duration used to calculate `%length%` |

Keep `%prompt%`, `%reference_image_name%`, `%length%`, `%width%`, `%height%`, `%seed%`, and `%model%` unchanged.

For the current LTX Director node, use:

```json
{
  "start_second": 0,
  "end_second": "%duration_seconds%",
  "duration_seconds": "%duration_seconds%",
  "start_frame": 0,
  "end_frame": "%length%",
  "duration_frames": "%length%",
  "global_prompt": "%global_prompt%",
  "local_prompts": "%local_prompts%",
  "segment_lengths": "%segment_lengths%",
  "guide_strength": "1.00",
  "frame_rate": 16
}
```

Keep the known-working timeline wrapper and one image segment at frame zero. Leave its nested `global_prompt` empty because the direct LTX Director input is authoritative; interpolating arbitrary prompt text into serialized `timeline_data` could invalidate its JSON. Numeric duration and reference-image placeholders remain safe:

```text
{
  "global_prompt": "",
  "normalStartFrame": 0,
  "normalDurationFrames": %length%,
  "segments": [
    {
      "id": "marinara-reference",
      "start": 0,
      "length": 16,
      "prompt": "",
      "type": "image",
      "imageFile": "%reference_image_name%",
      "isEndFrame": false
    }
  ],
  "motionSegments": [],
  "audioSegments": []
}
```

Do not duplicate the reference image at every prompt boundary. That would create additional image guides, not merely text segments. Do not add `%timeline_data%`, `%guide_strength%`, node discovery, or a generalized workflow compiler in this increment.

## Implementation plan

1. Add the new LTX planner constant and option in `packages/shared/src/constants/game-storyboard-prompts.ts`. Do not change any existing template text, IDs, order-dependent defaults, or selection behavior.
2. Add the new LTX Director Video constant and option in `packages/shared/src/constants/game-video-prompts.ts`. Use the existing video-template variables, but intentionally omit action and full illustration variables from this template's text. Do not change existing templates.
3. In `packages/server/src/routes/game.routes.ts`, recognize the opt-in LTX pairing, sanitize the planner beats, render the stable global prompt, and compose the complete `%prompt%` fallback. Thread the optional LTX Director prompt payload and existing debug mode only for Storyboard keyframe video generation.
4. In `packages/server/src/services/video/video-generation.ts`, extend the optional request shape and existing recursive replacement map with `%global_prompt%`, `%local_prompts%`, `%segment_lengths%`, and `%duration_seconds%`. When Director data is absent, use the existing full prompt as the global value and empty local/length values. Do not inspect node types or rewrite workflows.
5. Immediately before the ComfyUI queue request, use the shared Pino debug override to record the final resolved global prompt, ordered local prompts, and segment-length value. Do not log image data or API keys.
6. Extend `scripts/regressions/prompt.regression.ts` with focused deterministic coverage. Do not create or retain `.test.ts` files.

Expected implementation footprint: the five files above. No client UI, localization, storage schema, migration, version, service restart, or Marinara-Agents work is expected.

## Acceptance criteria

- Every existing Storyboard Planner and Video Prompt string remains unchanged; existing defaults and saved selections remain unchanged.
- The two new LTX choices appear as opt-in built-ins and can be selected independently through the existing settings controls.
- A three-segment LTX `narrationBeat` produces exactly two `|` delimiters in `local_prompts`.
- Whitespace and empty segments are removed without reordering; an over-four result keeps the first three and final segment.
- The global prompt contains no pipe-delimited action plan, timecodes, or full first-frame illustration prompt.
- `%segment_lengths%` resolves to an empty string, so LTX Director distributes valid segments evenly.
- A six-second request resolves `%duration_seconds%` to 6 and `%length%` to 96.
- Exactly one reference illustration remains at frame zero with one `guide_strength` value.
- Missing or malformed segmentation safely takes LTX Director's one-prompt path.
- A workflow containing only existing placeholders resolves exactly as it did before this change.
- Non-Storyboard requests using the updated LTX workflow fall back to the existing full prompt through LTX Director's single-prompt path; non-ComfyUI and existing prompt-template paths are unchanged.
- Debug mode records the exact LTX Director global and local values sent to ComfyUI.
- No character/reference sheets, repeated images, generated middle frames, Seedance work, agent architecture, generalized LTX compiler, or old Phase 1 restoration appears in the diff.

## Rollout and test plan

1. Add regressions for valid two-, three-, and four-segment plans; whitespace/empty cleanup; over-four capping; one segment; and missing input.
2. Resolve a representative LTX workflow and assert the global/local values, empty segment lengths, six-second/96-frame fields, one frame-zero reference, one guide strength, and preservation of unrelated timeline wrapper keys.
3. Add a negative control using an existing `%prompt%`-only workflow and existing prompt selections, asserting identical resolved output.
4. Run `pnpm regression:prompt`, `pnpm check`, and `git diff --check`. Do not build or restart the service separately unless requested or required for later local review.
5. After code review, manually select LTX Director Storyboard and LTX Director Video, then update the saved `ltx-2.3-distilled` workflow with the four new placeholders. Generate one six-second, three-beat clip in debug mode and inspect the queued values and rendered continuity.

No issue or PR will be opened until the implementation is ready and the user requests it.
