# Notes assistant

A small Electron + TypeScript desktop assistant for macOS. Requirements 1–4 are
complete: hold to record speech, see its transcript, send it through `codex exec`,
let Codex read or update files in `notes/`, and see the reply in the window.

## Setup and run

Prerequisites:

- macOS and Node.js >= 22.12.0 with npm.
- An OpenAI API key with speech-to-text access.
- An installed and authenticated Codex CLI. The verified version is 0.153.0.

Install and authenticate Codex if needed:

```sh
npm install -g @openai/codex@0.153.0
codex login
```

`codex` should normally be available on `PATH` after installation. Confirm with:

```sh
codex --version
codex login status
```

Export the transcription credential, install dependencies, and start the app from
the repository root:

```sh
export OPENAI_API_KEY="your-api-key"
npm ci
npm start
```

If the app reports that Codex CLI was not found even though it is installed, set
`CODEX_BIN` to the executable's absolute path before launch:

```sh
export CODEX_BIN="/absolute/path/to/codex"
npm start
```

On first use, allow Electron's microphone request. Hold **Hold to talk**, speak,
and release. The app moves through `Listening…`, `Transcribing…`, and `Thinking…`
before returning to `Ready`.

## What works

- Hold-to-talk starts on pointer down and stops on release, pointer cancellation,
  capture loss, or window focus loss.
- Recorded WebM/Opus audio is transcribed and displayed under **You said**.
- The transcript is passed to Codex CLI, which can read and write Markdown notes
  in the repository's `notes/` directory.
- Codex's plain-text reply is displayed under **Assistant**.
- Only one request runs at a time, and recoverable errors allow another attempt.
- Note state persists across app restarts because it lives on disk.

The complete flow was manually verified with two separate voice requests:

1. “Add milk to my shopping list.” created or updated `notes/shopping-list.md`.
2. After fully quitting and relaunching the app, “What's on my shopping list?”
   read the existing note and replied that the list contains milk.

## Architecture

The sandboxed renderer uses `getUserMedia` and `MediaRecorder`. A context-isolated
preload exposes two operations: `sendRecording(audio, mimeType)` and
`askAgent(text)`.

The main process sends recorded audio directly to OpenAI's speech-to-text endpoint
with built-in `fetch` and `FormData`; it does not create temporary files or convert
audio. `OPENAI_API_KEY` stays in the main process. The OpenAI API is used only for
speech-to-text.

After displaying the transcript, the renderer calls `askAgent`. The main process
runs `codex exec` with `notes/` as its working directory and returns the final CLI
message to the renderer. Assistant reasoning and all note reads and writes happen
through Codex CLI rather than a raw language-model API. Each request starts a fresh
Codex invocation; the files provide persistence.

## Checks

```sh
npm run typecheck
npm run build
```

The Codex persistence smoke check uses the authenticated account and makes two
real agent requests. It creates a unique temporary note, reads it through a fresh
Codex invocation, verifies the result, and removes that note:

```sh
npm run test:codex
```

## Tradeoffs and known limitations

- The app runs from a source checkout. It has no installer, signing, notarization,
  auto-update, or production release configuration.
- It has only been tested on macOS. Windows is unsupported and unverified.
- Speech-to-text is hosted, requires internet access and `OPENAI_API_KEY`, and uses
  `whisper-1`.
- Codex CLI requires its own installation and authentication. This is separate
  from the transcription API key.
- `notes/` is the source checkout's repository-root directory. Its contents are
  ignored by Git. The working directory and prompt guide Codex to this folder;
  there is no hardened filesystem-confinement layer.
- Provider and Codex failures are recoverable in the UI, but diagnostics are
  intentionally generic except for missing credentials, missing Codex CLI,
  microphone denial, empty transcription, and transcription HTTP status.
- There are no retries, streaming responses, conversation history, or cancellation
  of an in-flight transcription or Codex request.

Intentional cuts: spoken replies, global hotkeys, wake word, streaming
transcription, waveform UI, note browser/editor, database, persistent chat history,
multiple providers, Windows support, installers, signing, auto-update, and local
speech models.

## Next steps

If this moved beyond the task, the next work would be packaging and signing, Windows support, clearer provider/CLI diagnostics,
request cancellation and timeouts, and an optional local transcription path.

## Submission

Include the full unedited screen recording and the Codex session log from
`~/.codex/sessions/` with the repository or zip.

**Time spent:** 1h 28m
