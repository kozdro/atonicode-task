# Notes assistant

Small Electron + TypeScript app for macOS. Work in progress: the desktop shell is
implemented; recording, transcription, and the connected assistant flow are not.

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

## Scope and tradeoffs

- Plain HTML/CSS and TypeScript; no framework, bundler, or application libraries.
- The renderer is unprivileged. Add preload and narrow IPC when wiring the flow.
- `notes/` is next to the source app, at the repository root. Note contents are
  ignored by Git.
- Planned transcription uses a hosted API and requires separate credentials.
  Assistant requests and note operations will use Codex CLI.
- Cut: spoken replies, global hotkeys, wake word, streaming, note editor, database,
  persistent chat history, multiple providers, Windows, installers, signing,
  auto-update, and local speech models unless hosted transcription is unavailable.

## Next steps

Prove Codex note creation/readback, then hold-to-record, transcription, complete
flow, and essential error handling, in that order. No custom notes sandbox or
advanced lifecycle/permission handling in this first slice.

## Submission notes

Keep incremental commits, the full unedited screen recording, and the Codex
session log from `~/.codex/sessions/`. Recording is managed outside this app.
Actual implementation time and validation results will be updated as work proceeds.
