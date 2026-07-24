# LTX Storyboard Prompt Relay

Status: Draft for maintainer review. Do not begin implementation until this document is approved.

## Problem

Storyboard animation planning already produces a generated keyframe illustration and a rich `narrationBeat`, while ComfyUI video generation already substitutes `%prompt%`, `%reference_image_name%`, `%length%`, dimensions, model, and seed. The current LTX Director workflow places `%prompt%` in `global_prompt`, leaves `local_prompts` and `segment_lengths` empty, and keeps one reference image at frame zero. LTX Director therefore runs as a normal single-prompt image-to-video workflow and bypasses Prompt Relay.

The previous Phase 1 branch is not a base for this work. It added an LTX-specific workflow compiler, replaced `|` delimiters with `/`, and assigned the entire frame count to one local prompt. That preserved the timed action text as prose but did not create temporal Prompt Relay segments.

Upstream confirms the smaller integration boundary: [LTX Director 2.0](https://github.com/WhatDreamsCost/WhatDreamsCost-ComfyUI#ltx-director-20) integrates Prompt Relay, and its [relay path](https://github.com/WhatDreamsCost/WhatDreamsCost-ComfyUI/blob/main/ltx_director.py#L776-L845) splits `local_prompts` on `|`, bypasses masking for zero or one segment, and distributes timing automatically when `segment_lengths` is empty.

## Desired data flow

1. The selected animation planner returns one `imagePrompt` for the exact T=0 frame and a `narrationBeat` containing 2-4 ordered, equal-duration action segments separated by `|`.
2. Storyboard image generation continues to create exactly one reference illustration per keyframe.
3. The Storyboard route continues to build the existing full video prompt for `%prompt%` and all non-ComfyUI or legacy workflows.
4. For Prompt Relay, the route also builds a separate stable global prompt from existing character, setting, art-style, lighting, and reference-continuity context. It must not include `narrationBeat`, timecodes, or the full first-frame action description.
5. A small sanitizer splits `narrationBeat` on `|`, trims segments, removes empty segments, and joins two or more valid segments with exactly ` | `. It does not infer unequal timing.
6. ComfyUI adds only `%global_prompt%` and `%local_prompts%` to its existing substitutions. It does not discover or patch LTX nodes and does not rewrite `timeline_data`.
7. The saved workflow keeps `segment_lengths` as the literal empty string, allowing LTX Director to distribute the clip evenly.
8. Existing `%reference_image_name%` and `%length%` substitution preserves the first-frame image segment and resolves six seconds to 96 frames at 16 FPS.

For a valid six-second keyframe, the effective LTX Director inputs are:

```text
global_prompt = persistent identity, setting, art style, lighting, and continuity only
local_prompts = first action beat | main action or impact | reaction and ending hold
segment_lengths = ""
length = 96
```

The saved `timeline_data` remains structurally unchanged apart from existing placeholder resolution. At minimum it retains:

```json
{
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

Any additional known-working LTX Director UI or state keys in the user's workflow remain untouched.

### Safe fallback

If the stable global prompt is empty or the sanitizer finds fewer than two non-empty local segments, the new relay handoff is not used. For a workflow containing the new placeholders, `%global_prompt%` resolves to an empty string and `%local_prompts%` resolves to one pipe-neutralized copy of the existing full prompt. Upstream then takes its single-prompt fast path. Workflows without the new placeholders remain byte-for-byte equivalent after substitution to their current behavior.

## Scope

- Update built-in animation-planner guidance so `narrationBeat` contains 2-4 equal-duration `|`-delimited temporal beats.
- Keep `imagePrompt` focused on the generated T=0 illustration; do not generate additional reference or middle images.
- Each local segment describes only changes during its equal share: primary motion, relevant camera behavior, environmental motion, sound or dialogue when applicable, and a final reaction or brief hold in the last segment.
- Build one stable global prompt without copying the temporal action plan into it.
- Add the two ComfyUI placeholders through the existing recursive substitution path.
- Log the exact final global prompt and local prompt string when request debug mode or `DEBUG_AGENTS` is enabled.
- Add focused deterministic regression coverage.

## Non-goals

- Character sheets, generated reference sheets, repeated reference generation, or multi-reference architecture.
- IC-LoRA, MSR, BFS, generated middle keyframes, or timeline-schema redesign.
- Seedance-specific request changes, generated audio controls, or provider-wide prompt compilation.
- A generalized LTX node finder, allowlisted input compiler, frame-rate reader, or duration/timeline patcher.
- Agent architecture, a Roleplay agent port, or changes in Marinara-Agents.
- Unequal segment timing in the first increment.
- Reusing, restoring, or cherry-picking the old Phase 1 branch wholesale.

## Implementation plan

1. In `packages/shared/src/constants/game-storyboard-prompts.ts`, revise animation-planner instructions to require 2-4 `|`-delimited equal-duration beats. Prohibit inline time-range labels for this first increment, preserve the T=0 `imagePrompt` boundary, and require the final segment to settle into a reaction or hold.
2. In `packages/server/src/routes/game.routes.ts`, build a stable relay global prompt beside the existing legacy video prompt. Use existing visible-character, setting, art-style, lighting/reference, and continuity context; exclude `narrationBeat`, timecodes, and changing actions.
3. In `packages/server/src/services/video/video-generation.ts`, add a small optional prompt-relay request value and pure sanitizer/substitution helper. Preserve `%prompt%`; add `%global_prompt%` and `%local_prompts%`; keep the existing reference upload, `%reference_image_name%`, `%length%`, dimensions, model, and seed behavior. Do not add a `segment_lengths` placeholder.
4. Thread the relay values only from Storyboard keyframe video generation. Other providers ignore them, and ordinary Gallery or Game scene-video generation continues using the existing full prompt.
5. Emit one debug record immediately before the ComfyUI queue request showing the final resolved global prompt and ordered local segments. Pass the existing Storyboard debug override through so both UI debug mode and `DEBUG_AGENTS` work.
6. Extend `scripts/regressions/prompt.regression.ts` with focused planner, sanitizer, fallback, and representative workflow assertions. Do not create or retain `.test.ts` files.

Expected implementation footprint: the four files above, with no schema, client UI, localization, version, release, or service changes.

## Acceptance criteria

- A three-segment `narrationBeat` produces exactly two `|` delimiters in resolved `local_prompts`.
- Whitespace and empty segments are removed without reordering the remaining beats.
- Missing or single-segment input takes the one-prompt fallback and cannot accidentally activate temporal masking.
- The valid global prompt contains stable continuity context but not the timestamped or delimited action plan.
- `segment_lengths` remains empty in the representative LTX Director workflow.
- A six-second request resolves `%length%` to 96 at the existing 16 FPS contract.
- The reference illustration remains an image segment beginning at frame zero, and additional timeline wrapper keys are preserved.
- `%prompt%`-only workflows produce the same resolved workflow as before this change.
- Non-ComfyUI providers and non-Storyboard video calls are unchanged.
- Debug mode records the final relay global and local values sent in the ComfyUI workflow.
- No character sheet, extra reference image, Seedance, agent, timeline-compiler, or generalized LTX work appears in the diff.

## Rollout and test plan

1. Add deterministic regressions for a valid three-segment beat, empty-segment cleanup, a malformed single segment, and a missing beat.
2. Resolve a representative saved LTX Director workflow and assert the global/local values, empty `segment_lengths`, 96-frame length, frame-zero reference image, and preservation of unrelated timeline keys.
3. Add a negative control using a legacy `%prompt%`-only workflow and assert identical resolved output.
4. Run `pnpm regression:prompt`, `pnpm check`, and `git diff --check`. `pnpm check` includes the repository build; do not restart the Marinara service.
5. If a live local review is requested, enable debug mode, generate one six-second three-beat Storyboard clip with the existing LTX workflow, and inspect the final ComfyUI request/logs. Treat provider rendering quality as manual evidence, not as a prerequisite for the deterministic contract tests.
