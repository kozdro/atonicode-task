# Notes assistant

Small Electron + TypeScript app for macOS. Work in progress: the desktop shell is
implemented and Codex CLI can create/read notes. Recording, transcription, and
the connected assistant flow are not implemented.

## Run

Requires Node.js 22 and npm on macOS.

```sh
npm ci
npm start
```

The hold-to-talk button is deliberately disabled until recording is implemented.
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
- The renderer is unprivileged. Add preload and narrow IPC when wiring the flow.
- `notes/` is next to the source app, at the repository root. Note contents are
  ignored by Git.
- Planned transcription uses a hosted API and requires separate credentials.
  Assistant requests and note operations use Codex CLI.
- Cut: spoken replies, global hotkeys, wake word, streaming, note editor, database,
  persistent chat history, multiple providers, Windows, installers, signing,
  auto-update, and local speech models unless hosted transcription is unavailable.

## Next steps

Hold-to-record, transcription, complete flow, and essential error handling, in
that order. No custom notes sandbox or advanced lifecycle/permission handling in
this first slice.

## Validation so far

- Tested on macOS with Node 22.18.0, Electron 44.2.0, TypeScript 7.0.2, and
  Codex CLI 0.153.0 authenticated with ChatGPT.
- `npm run typecheck` and `npm run build` pass.
- `npm start` launches. A temporary Electron smoke harness verified page and CSS
  loading, the disabled voice button, no renderer `require`, and no vertical
  overflow at the initial window size. Captured and inspected the rendered window.
- `npm run test:codex` passes: file creation on disk and readback of a random
  reference through a separate CLI invocation. Temporary note removed afterward.
- Encountered and fixed inherited `ELECTRON_RUN_AS_NODE=1` preventing GUI launch.

## Submission notes

Keep incremental commits, the full unedited screen recording, and the Codex
session log from `~/.codex/sessions/`. Recording is managed outside this app.
Time spent: approximately 6 minutes on steps 1–2, including installation and checks;
earlier architecture planning is excluded. Full-project time remains to be tallied.
