# Changelog

This file records the changes of the CodeSync VS Code extension.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and versioning follows [Semantic Versioning](https://semver.org/lang/en/).

---

## [1.0.0] - 2026-10-20

The first stable release, published together with CodeSync v2.0.

### Added

- **One-click upload to a remote repository** — `CodeSync: Upload Project to Remote Repository`
  Supports GitHub / Gitee / GitLab and runs the whole flow automatically: initialize the repository, generate `.gitignore`, stage the files, generate the commit message with AI, commit, create the repository on the platform, link the remote and push — with live progress
- **Commit and push** — `CodeSync: Commit and Push`
  Stage all changes → AI-generated commit message (editable in the input box) → commit → push to the current branch
- **Platform token configuration** — `CodeSync: Configure Platform Token`, which guides you through the upload flow when no token is set
- **Configuration viewer** — `CodeSync: Show Current Configuration`, with sensitive values masked
- **Sidebar entry points** — "Upload to Remote Repository" and "Commit and Push" buttons at the top of the panel
- **Marketplace icons** — new 128×128 / 256×256 PNG icons

### Changed

- **Unified configuration** — the extension now reads the shared `~/.git-commit-ai.json`, consistent with the CLI and the desktop app;
  the VS Code settings became optional overrides (precedence: VS Code settings > environment variables > config file)
- **Reuse of the shared core logic** — the upload and sync flows call `shared/git/upload.js` directly,
  and the AI capabilities call `shared/ai/commit.js` and `shared/ai/annotate.js`, so the behavior matches the CLI exactly
- **Removed the `openai` SDK dependency** — the native `fetch` is used to call any OpenAI-compatible API;
  the bundle shrank from ~14k lines to ~1.8k lines, and caching plus smart model selection came for free

### Fixed

- Fixed the extension failing to resolve the project path in a multi-root workspace (it now prefers the directory of the currently open file)
- Fixed the malformed request URL caused by a trailing slash in the API base URL

[1.0.0]: https://github.com/lb2786738061-rgb/git-commit-ai/releases/tag/v1.0.0
