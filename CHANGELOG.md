# Changelog

This file records all important changes to the CodeSync project.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and versioning follows [Semantic Versioning](https://semver.org/lang/en/).

---

## [Unreleased]

### Added

- **VS Code extension: upload a project to a remote repository** — new `CodeSync: Upload Project to Remote Repository`
  command that reuses the CLI upload flow end to end (init repository → generate `.gitignore` → stage → AI-generated commit message → commit
  → create the repository on the platform → link the remote → push), supporting GitHub / Gitee / GitLab
- **VS Code extension: commit and push** — new `CodeSync: Commit and Push` command: stage all changes → AI-generated commit message
  (editable) → commit → push to the current branch
- **VS Code extension: token and configuration management** — new `CodeSync: Configure Platform Token` and
  `CodeSync: Show Current Configuration` commands
- **VS Code extension: sidebar entry points** — "Upload to Remote Repository" and "Commit and Push" buttons at the top of the panel
- **CLI: `codesync push` command** — stage → AI-generated commit message → commit → push, sharing `syncProject()` from
  `shared/git/upload.js` with the extension; supports `-m` for a custom message and `--bypass-hooks` to skip hook validation
- **Shared layer: `syncProject()`** — `shared/git/upload.js` gained an incremental sync flow used by the CLI, the desktop app and the extension
- **Shared layer: environment variable overrides** — `shared/config.js` can now override `smartModel` / `fastModel` /
  `powerfulModel` / `enableCache` / `cacheTTL` through environment variables
- **VS Code extension: Marketplace icons** — new 128×128 / 256×256 PNG icons
- **Docs** — the root `README.md` now includes a complete "VS Code Extension Guide" (installation, configuration, command reference, upload flow,
  settings and FAQ)
- **Docs** — added `CHANGELOG.md`, `vscode-extension/CHANGELOG.md`, `RELEASE_GUIDE.md` and
  `vscode-extension/PUBLISHING.md` (Marketplace publishing guide)
- **Media** — added 6 VS Code UI screenshots and a demo animation (`vscode-extension/media/`)
- **CI** — added `.github/workflows/publish-vscode.yml`, which packages and publishes the extension when a `vscode-v*` tag is pushed

### Changed

- **Unified configuration in the VS Code extension** — the extension no longer keeps its own configuration and now reads the shared
  `~/.git-commit-ai.json`; the VS Code settings became optional overrides (precedence: VS Code settings > environment variables > config file)
- **VS Code extension reuses the shared core** — `codeAssistant.ts` now uses `shared/ai/annotate.js` and
  `shared/ai/commit.js`, and the `openai` SDK dependency was dropped in favor of the native `fetch`; the bundle shrank from ~14k lines to ~1.8k lines
- **`shared/git/operations.js`** — `commit()` gained a `bypassHooks` option (actually applied through `--no-verify`);
  added a `getRemotes()` method
- **`shared/ai/annotate.js`** — fixed the malformed request URL caused by a trailing slash in the API base URL
- **VS Code extension scripts** — `npm run lint` now runs `tsc --noEmit` type checking (the previous eslint setup referenced a package that was never installed)

### Fixed

- Fixed the VS Code extension failing to resolve the project path in a multi-root workspace (it now prefers the directory of the currently open file)

---

## [2.0.0] - 2026-10-19

### Added

- **AI code upload assistant (CodeSync Agent)** — watches for file changes, generates commit messages automatically and commits/pushes for you
  - Four upload strategies: `smart` / `immediate` / `batch` / `scheduled`
  - Setup wizard `codesync agent-init`, configuration saved to `.codesync-agent.json` in the project root
  - Supports the Angular / Gitmoji conventions and Chinese / English / Japanese commit languages
- **Pre-commit hook templates** — `codesync hook install --template [eslint|stylelint|typescript|prettier|test|all|custom]`
- **Commit template library** — 8 built-in templates + custom templates + template variables
- **Web dashboard** — `codesync dashboard` starts a local server showing commit frequency, contributors and change trends
- **Plugin system** — `codesync plugin install/list/remove`, supporting AI providers, platforms and pre/post-commit hooks
- **Automated deployment** — Vercel / Netlify / Docker / NPM through `codesync deploy hook`
- **Release automation** — `codesync release <version>` generates release notes and creates the release
- **Code search** — `codesync search "query"`, with text and semantic search
- **License compliance checks** — scans dependency licenses and generates a compliance report
- **VS Code extension** — commit message sidebar, AI explain/annotate/review in the context menu, live diff preview
- **CI/CD integration** — `codesync ci install --platform github|gitlab`
- **Secret detection** — `codesync security scan` detects API keys, passwords and tokens
- **AI code review bot** — `codesync review-bot`, automatic PR reviews via GitHub / GitLab webhooks

### Changed

- Fully migrated to the npm workspaces architecture (`cli` / `desktop`)
- Extracted the `shared/` directory to unify the core logic of the CLI, the desktop app and the extension
- All Git operations are now wrapped in `shared/git/operations.js`

---

## [1.0.0] - 2026-06-25

### Added

- One-click upload to GitHub / Gitee / GitLab
- One-click download with automatic dependency installation
- Smart update (add → commit → push)
- Version rollback
- AI commit message generation (Angular / Gitmoji conventions, multi-language)
- Code annotation / explanation / review
- Automatic changelog generation
- Team configuration sync + Git hook enforcement
- AI response caching and smart model selection

[Unreleased]: https://github.com/lb2786738061-rgb/git-commit-ai/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/lb2786738061-rgb/git-commit-ai/releases/tag/v2.0.0
[1.0.0]: https://github.com/lb2786738061-rgb/git-commit-ai/releases/tag/v1.0.0
