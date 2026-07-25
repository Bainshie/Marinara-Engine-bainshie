# LTX 2.3 Storyboards in Game Mode

This guide connects a local LTX 2.3 ComfyUI image-to-video workflow to Marinara Engine's Game Mode storyboards. Some players call this Story Mode; the controls in Marinara are labeled **Game Mode** and **Storyboards**.

The finished path is:

```text
GM narration
  -> Animation Planner
     -> imagePrompt -> image connection -> first-frame illustration
     -> narrationBeat -> LTX Director Video -> %prompt%
  -> first frame + prompt -> ComfyUI LTX 2.3 workflow -> MP4 clip
```

The generated illustration is the first frame of the clip. LTX therefore receives both a visual starting point and a prompt that concentrates on what moves next.

## Before you start

You need:

1. A working local ComfyUI installation that Marinara can reach.
2. An editable LTX 2.3 image-to-video workflow that completes successfully inside ComfyUI.
3. An API-format export of that workflow for the Marinara connection.
4. A Marinara image-generation connection for the first-frame illustrations.
5. A Game Mode chat with Storyboard support.

The editable ComfyUI workflow and its API export are different files. Edit and test the normal workflow in ComfyUI. After every node or model change, export it again in API format and replace the JSON stored on the Marinara connection. Do not paste the normal visual-editor workflow into Marinara.

See [ComfyUI Workflow Setup](../media/comfyui.md) for the general export and connection process.

## Choose an LTX 2.3 model

Choose the model format for the GPU architecture and the memory available after ComfyUI loads the text encoder, VAEs, and upscaler. Treat these as starting points, not promises that every workflow will fit every card.

| GPU family | Practical starting point | Notes |
| --- | --- | --- |
| RTX 30 series (Ampere) | An LTX 2.3 INT8/ConvRot checkpoint supported by the workflow | Useful for 3070, 3080, and 3090-class cards. Input-scaled FP8 matrix operations target newer hardware. |
| RTX 40 series (Ada) | Official FP8 or a compatible input-scaled FP8 checkpoint | Ada supports the accelerated FP8 path. Use BF16 only when there is enough VRAM for the complete workflow. |
| RTX 50 series (Blackwell) | Official LTX 2.3 NVFP4 when the installed ComfyUI, CUDA, and node versions support it | NVFP4 is the Blackwell-native low-precision path. FP8 remains a useful compatibility fallback. |
| High-memory workstation or data-center GPU | BF16 full or distilled model | Highest memory use. Prefer this only when quality or training flexibility matters more than iteration speed. |

The official beginner workflow uses these components:

- `ltx-2.3-22b-dev-fp8.safetensors`
- `ltx-2.3-22b-distilled-lora-384.safetensors`
- `gemma_3_12B_it_fp4_mixed.safetensors`
- `ltx-2.3-spatial-upscaler-x2-1.1.safetensors`

Custom workflows may use a distilled v1.1 checkpoint, a third-party quantization, different loader nodes, or different model folders. The filenames saved in the API workflow must exactly match the files visible to ComfyUI.

Official references:

- [LTX 2.3 image-to-video guide](https://docs.ltx.io/open-source-model/usage-guides/image-to-video)
- [LTX prompting guide](https://docs.ltx.io/open-source-model/usage-guides/prompting-guide)
- [LTX 2.3 model card](https://huggingface.co/Lightricks/LTX-2.3)
- [LTX 2.3 NVFP4 model card](https://huggingface.co/Lightricks/LTX-2.3-nvfp4)
- [Official LTX 2.3 ComfyUI examples](https://github.com/Lightricks/ComfyUI-LTXVideo/tree/master/example_workflows/2.3)
- [Community ComfyUI-separated and FP8 weights](https://huggingface.co/Kijai/LTX2.3_comfy)

## Prepare the ComfyUI API workflow

First queue the editable workflow directly in ComfyUI with a real source image and a simple prompt. Confirm that it saves an MP4 with audio before adapting its API export for Marinara.

The simple Marinara path uses one complete prompt in the LTX Director global prompt input:

```json
{
  "global_prompt": "%prompt%",
  "local_prompts": "",
  "segment_lengths": ""
}
```

The LTX Director node may still handle image conditioning, guide data, audio, and the two sampling stages. "Simple" refers to the prompt contract: Marinara sends one coherent image-to-video paragraph instead of a Prompt Relay timeline.

### Required placeholders

Replace the corresponding values in the API export with quoted Marinara placeholders:

| Placeholder | Supplied value |
| --- | --- |
| `%prompt%` | The complete prompt produced by the selected Storyboard Animation Planner and video template |
| `%reference_image_name%` | The first-frame image uploaded to ComfyUI |
| `%duration_seconds%` | The Storyboard clip duration in seconds |
| `%length%` | The duration converted to Marinara's 16 FPS frame contract |
| `%width%`, `%height%` | Dimensions selected from the video connection's resolution and aspect ratio |
| `%seed%` | A new random seed for the request |
| `%model%` | Optional model value from the connection when the workflow does not hard-code its loader model |

The reference segment inside LTX Director's `timeline_data` should use the uploaded filename:

```json
{
  "id": "marinara-reference",
  "start": 0,
  "length": 16,
  "prompt": "",
  "type": "image",
  "imageFile": "%reference_image_name%",
  "isEndFrame": false
}
```

Also make the timeline duration dynamic with `%length%`. If the LTX Director node exposes second-based duration inputs, use `%duration_seconds%` there instead of leaving a fixed five-second value.

Keep placeholder values quoted in a local ComfyUI workflow. Marinara parses the JSON and converts exact numeric placeholders to numbers before submitting it.

### Export after every edit

1. Queue the editable workflow in ComfyUI.
2. Confirm that the current graph produces a playable MP4.
3. Select **Save (API Format)**, **Export (API)**, or **Export to API**.
4. Add or confirm the placeholders in the new API JSON.
5. Replace the workflow stored on the Marinara connection.

Deleting a node and continuing to use an older API export can leave references to a node that no longer exists. ComfyUI then rejects the request before generation begins.

## Create the Marinara video connection

1. Open **Settings**, then **Connections**.
2. Add a **Video Generation** connection.
3. Choose **ComfyUI**.
4. Enter the ComfyUI base URL, normally `http://127.0.0.1:8188` when it runs on the same computer.
5. Paste the complete API-format workflow into **ComfyUI Workflow**.
6. Choose a five-second default duration, **16:9**, and a conservative starting resolution for the GPU.
7. Save the connection.

A text-only connection test cannot exercise `%reference_image_name%`. Validate image-to-video from a Gallery image or a Storyboard after saving the connection.

## Configure the Game Mode chat

Open the Game Mode chat, then open **Chat Settings** and select **Agents**.

### Illustrator

| Setting | Recommended value |
| --- | --- |
| **Game Illustrator** | On |
| **Image Connection** | The image provider that will create the first frame |
| **Send Avatar References** | On when character cards have useful reference images |
| Campaign art direction or style | Configure it for the visual style you want LTX to preserve |

The first-frame image has a large effect on animation quality. It should show the exact moment immediately before the planned movement, with the subject, route, hands, door, prop, or target clearly visible.

### Scene Videos

| Setting | Recommended value |
| --- | --- |
| **Video Connection** | The LTX 2.3 ComfyUI connection created above |

The general **Game Video Prompt** controls manual Gallery and Game Assets animations. Storyboard clips can select their own prompt without changing those other animation actions.

### Storyboards

Use this starting profile:

| Setting | Recommended starting value |
| --- | --- |
| **Automatic Storyboard Illustrations** | On |
| **Automatic Storyboard Animations** | Off while configuring; on for the manual animation test and later animated turns |
| **Keyframes per Turn** | 1 while testing; then 2 or 3 |
| **Animation Clip Duration** | 5 seconds |
| **Viewer Display** | Floating while testing |
| **Illustration Planner** | **Still Keyframes**; used when animations are off |
| **Animation Planner** | **LTX Simple Image-to-Video** |
| **Use Storyboard Template** | On |
| **Storyboard Illustration Prompt** | **Storyboard Illustration** |
| **Storyboard Video Prompt** | **LTX Director Video** |

**LTX Simple Image-to-Video** is the recommended default. It plans one animation-ready first frame and one direct 4–8 sentence motion prompt. It favors one primary action, one camera behavior, restrained environmental motion, and relevant audio or brief dialogue.

**LTX Director Storyboard** remains available as an advanced option. It provides more detailed duration-aware direction and continuity rules. Try it after the simple path is stable, or when a longer clip genuinely needs more connected phases. Both planners use the same `%prompt%` workflow contract.

**Storyboard Illustration** keeps the planner's first-frame description primary while adding character references, supplied appearance traits, and campaign art direction. Keep **Use Storyboard Template** on unless the selected image model requires a completely different direct prompt format.

**LTX Director Video** is intentionally small. It passes the Animation Planner's completed `narrationBeat` through the universal video prompt contract without surrounding it with another scene recap.

Each keyframe creates one image job and one video job. Starting with one keyframe prevents a short test from launching several expensive renders at once.

## Run the first test

Use a completed GM turn containing one obvious visual action, such as opening a door, looking toward a sound, taking a few steps, or saying one short line.

1. Set **Keyframes per Turn** to 1 and **Animation Clip Duration** to 5 seconds.
2. Leave automatic animation off while configuring the connections, then turn it on after the current GM turn is already complete.
3. Open the Gallery and choose **Create storyboard** for that completed GM turn. This manually starts the full illustration-and-animation path without waiting for another turn.
4. If prompt exposure is enabled, review the first-frame prompt before submitting it.
5. Confirm that the generated first frame is a physically useful starting pose.
6. Wait for the first-frame render and then the ComfyUI clip to finish.
7. Leave **Automatic Storyboard Animations** on for later turns only after the manual path works.

Use **Floating** viewer mode during setup because it makes it easier to inspect each image and clip. Switch to **Background** after the workflow is reliable if you want storyboard media integrated into the Game Mode scene.

## How the prompt handoff works

For each keyframe, the Animation Planner returns:

- `imagePrompt`: only the visible first frame at time T=0;
- `narrationBeat`: the complete LTX image-to-video prompt describing what happens next.

The **Storyboard Illustration Prompt** formats `imagePrompt` and sends it to the image connection. After that image exists, **LTX Director Video** resolves to the `narrationBeat`. Marinara places it in the normal video request's `prompt` field, replaces `%prompt%` in the ComfyUI workflow, uploads the first frame, and replaces `%reference_image_name%` with its ComfyUI filename.

There is no requirement to create two local prompt segments. A single global prompt is the normal path for these Storyboard presets.

## What makes a good LTX prompt

The source image already describes character appearance, composition, setting, lighting, palette, and texture. The video prompt should concentrate on motion:

- one flowing paragraph in present tense;
- one focused action that fits the clip duration;
- camera movement described relative to the subject;
- visible reactions through gaze, face, posture, breathing, or gesture;
- at most one useful environmental motion;
- ambient sound, effects, music, or brief quoted dialogue when relevant;
- a natural completion, settling motion, or brief hold at the end.

Avoid scene changes, cuts, teleportation, multiple unrelated actions, complex physics, crowded choreography, exact readable text, and repeated inventories of details already visible in the first frame.

Example:

```text
She pushes the door open and walks outside as the camera follows closely behind her. A light breeze moves her hair while her pace remains steady. She glances toward the empty street and says, "Stay close." Footsteps and distant traffic continue as the camera settles behind her.
```

## Troubleshooting

### ComfyUI returns HTTP 400 or "Prompt outputs failed validation"

The API workflow does not match the currently installed graph. Look for a deleted node, a dangling node ID, a missing custom node, an input renamed by a node update, or a model filename that no longer exists. Export a fresh API workflow from the working ComfyUI graph.

### Images are created but videos are not

Check **Automatic Storyboard Animations** and the Game Mode **Video Connection**. Animations require both the first-frame illustration and a selected video connection.

### LTX receives no starting image

Confirm that `%reference_image_name%` appears in the saved API workflow and feeds the LTX Director image segment. Marinara only uploads the first frame when that placeholder is present.

### The clip morphs, changes characters, or becomes chaotic

Return to **LTX Simple Image-to-Video**, use one keyframe, and test a turn with one action. A source image cannot cleanly become several locations, poses, and outcomes during a short continuous clip. Also check the first frame: a confusing starting pose produces a harder animation problem even with a good motion prompt.

### Every generation looks too similar

Replace any hard-coded sampling seed with `%seed%`. Once a useful result appears, temporarily fix that seed in the workflow only when comparing prompt or sampling changes.

### Generation runs out of memory

Reduce resolution first, then duration. Keep one keyframe per turn during testing, close other GPU applications, and avoid keeping a local language model loaded on the same low-VRAM GPU. A quantized checkpoint reduces model memory but does not remove the memory used by video latents, the text encoder, VAEs, audio, and upscaling.

### Marinara stops waiting but ComfyUI continues rendering

Closing the browser request or losing the client connection can stop Marinara's polling without cancelling a job already queued in ComfyUI. Check ComfyUI's queue, history, and output folder before starting the same render again.

### The workflow works in ComfyUI but fails from Marinara

Compare the saved connection JSON with the newest API export. Verify the base URL, placeholder spelling, required custom nodes, model paths, output node, dimensions, and duration fields. The editable graph can work while Marinara still holds an older exported snapshot.

For detailed server traces, enable debug logging and look for `[debug/game/storyboard-video]` and `[video-gen/comfyui]`. A healthy request shows the completed global prompt, an uploaded reference-image filename, duration, frame count, and a queued ComfyUI prompt ID.

## Related guides

- [Storyboard Engine Guide](storyboard.md)
- [ComfyUI Workflow Setup](../media/comfyui.md)
- [Scene Video Generation](../media/scene-video.md)
- [Game Mode: Getting Started](getting-started.md)
