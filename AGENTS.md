# Project guidelines

## Goal
Build the smallest Electron + TypeScript desktop assistant that satisfies task requirements 1–4.

## Principles
- Prefer the smallest diff that works.
- Do not add abstractions without a current need.
- Avoid unnecessary dependencies.
- Keep renderer unprivileged.
- Use preload + narrow IPC APIs.
- Keep file operations scoped to `notes/`.
- Do not work on stretch features until requirements 1–4 are complete.
- After each meaningful change, run the relevant build/typecheck and report what changed.
- If a requirement is ambiguous, choose the simplest reasonable interpretation and call it out.

## Definition of done
- Electron app runs on macOS.
- Hold-to-talk records speech.
- Speech becomes text.
- Text is sent through Codex CLI, not a raw LLM API.
- Codex can read/write `notes/`.
- Reply appears in the UI.
- README explains setup, tradeoffs, cuts, next steps, and time spent.