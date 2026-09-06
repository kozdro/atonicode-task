# Notes assistant

Small Electron + TypeScript app for macOS. Hold-to-record audio is transcribed and
displayed in the window. Codex CLI can create/read notes independently; transcripts
are not connected to Codex yet.

## Run

Requires Node.js 22 and npm on macOS. Export `OPENAI_API_KEY` in the terminal that
launches the app. It needs OpenAI API access for transcription, separately from
Codex login. The app reads the environment directly; it does not load `.env` files.

```sh
npm ci
npm start
```

Hold the button to record; release to finish. Allow Electron's microphone prompt
on first use, then hold again if the permission dialog interrupted the gesture.
The status shows `Ready`, `Listening…`, `Transcribing…`, or an error, with brief
permission/finishing states. Release outside the button, pointer cancellation,
capture loss, or window focus loss also stop recording and release the microphone.
Only one recording can be active, including while permission or transcription is
pending. During transcription the button is disabled; it becomes available again on success or
failure. The returned transcript appears unchanged in “You said”.

Recording uses `getUserMedia` and `MediaRecorder` in the renderer. The preload
exposes only `sendRecording(audio: ArrayBuffer, mimeType: string): Promise<string>`.
Main uploads the existing WebM/Opus bytes directly to OpenAI's transcription
endpoint using `whisper-1` and built-in `fetch`/`FormData`. There are no temporary
audio files, conversion tools, SDK dependencies, or retries. The API key stays in
main; only the transcript returns to the renderer. Nothing is sent to Codex.

Missing credentials, a failed request, or an empty transcript show an error and
allow another recording. After changing the launch environment, restart the app.
HTTP failures show the status code without exposing the provider response body.

The macOS start command clears `ELECTRON_RUN_AS_NODE`, which some coding-agent
environments set and which otherwise prevents Electron from opening a window.

## Checks

```sh
npm run typecheck
npm run build
```

For a real CLI integration check, install the tested Codex CLI version and log in:

```sh
npm install -g @openai/codex@0.153.0
codex login
npm run test:codex
```

This uses your Codex account and makes two real agent requests. It creates a
unique Markdown shopping note in `notes/`, verifies its contents on disk, then
asks a fresh invocation to read it. The check removes its temporary note afterward.
No other notes are changed by the test harness.

If `codex` is not on your PATH, set `CODEX_BIN` to its absolute executable path:

```sh
CODEX_BIN=/absolute/path/to/codex npm run test:codex
```

The runner uses `codex exec` with `notes/` as its working directory and an explicit
notes-only prompt. `workspace-write` enables normal CLI file editing; this is not
a custom security boundary. `--ignore-user-config` keeps personal configuration
out of the run while reusing saved CLI authentication. Prompts go through stdin,
and the final reply comes from stdout. The function is not connected to the UI yet.

## Scope and tradeoffs

- Plain HTML/CSS and TypeScript; no framework, bundler, or application libraries.
- The renderer is unprivileged; the preload exposes only the recorded-audio handoff.
- The renderer compiles as a plain browser script using `moduleDetection: legacy`;
  main and preload still compile as CommonJS. No bundler is needed.
- `notes/` is next to the source app, at the repository root. Note contents are
  ignored by Git.
- Transcription uses a hosted API and requires separate credentials and internet.
  Assistant requests and note operations use Codex CLI.
- Cut: spoken replies, global hotkeys, wake word, streaming, note editor, database,
  persistent chat history, multiple providers, Windows, installers, signing,
  auto-update, and local speech models unless hosted transcription is unavailable.

## Next steps

Connect the transcript to Codex, then handle essential failures in the full flow. No
custom notes sandbox or advanced lifecycle/permission handling in this first slice.

## Validation so far

- Tested on macOS with Node 22.18.0, Electron 44.2.0, TypeScript 7.0.2, and
  Codex CLI 0.153.0 authenticated with ChatGPT.
- `npm run typecheck` and `npm run build` pass.
- `npm start` launches. Captured and inspected the rendered window, including
  `Ready` and `Listening…` states. The renderer has no `require` and its bridge
  exposes only `sendRecording`.
- Native microphone permission changed from `not-determined` to `granted`; the
  user confirmed seeing and allowing Electron's macOS permission prompt.
- A temporary Electron harness drove real microphone recording through press and
  release (inside/outside), pointer cancellation, capture loss, window blur, and
  repeated holds. Each recording reached main as WebM/Opus, returned to `Ready`,
  and stopped all microphone tracks. Captured audio decoded successfully.
- The same check verified a second press cannot start a concurrent recording.
  With a deliberately delayed microphone request, release prevented a late start.
  Simulated permission denial displayed an error; the next real recording worked.
- Transcription checks used real microphone audio with mocked HTTP responses:
  main received WebM directly, the request used multipart upload, `Transcribing…`
  disabled recording, and exact response text appeared in the UI. Missing key,
  HTTP/network failures, and empty text all allowed another recording. No automatic
  retries occurred. Preload removes Electron's internal IPC prefix from errors.
- Live OpenAI check: the user launched with `OPENAI_API_KEY` exported and confirmed
  that speaking “Toast” displayed “Toast” in the UI, with processing states shown.
  A second recording replaced the transcript and the app returned to `Ready`.
- `npm run test:codex` passes: file creation on disk and readback of a random
  reference through a separate CLI invocation. Temporary note removed afterward.
- Encountered and fixed inherited `ELECTRON_RUN_AS_NODE=1` preventing GUI launch.

## Submission notes

Keep incremental commits, the full unedited screen recording, and the Codex
session log from `~/.codex/sessions/`. Recording is managed outside this app.
Time spent: approximately 6 minutes on steps 1–2, 7 minutes on recording, and
7 minutes on transcription, including checks and the manual verification wait.
Earlier architecture planning is excluded. Full-project time remains to be tallied.
