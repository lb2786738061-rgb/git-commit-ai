# 🗺️ Project Roadmap & Update Plans

This document outlines the planned evolutionary phases and feature updates for `git-commit-ai`. We welcome contributions and feedback from the community to help shape these releases!

---

## 📌 Phase 1: Core Foundation & Stability ✅ COMPLETED

Focus on building a reliable, zero-dependency, and high-performance interactive CLI tool.

- [x] **Native ESM Implementation**: Built entirely on Node.js native ES Modules for cross-platform compatibility and minimal footprint.
- [x] **Secure Configuration Storage**: Implemented localized settings storage (`~/.git-commit-ai.json`) separated from Git repository workspaces.
- [x] **OpenAI Compatible Client**: Supporting all OpenAI-compatible API endpoints (OpenAI, DeepSeek, Groq, Ollama, etc.) with custom model parameters.
- [x] **Interactive CLI UX**: Implemented spinners (`ora`), colors (`picocolors`), and action selector menus (`prompts`).
- [x] **Standard Conventional Commits**: Out-of-the-box formatting conforming to Angular commit message specifications.
- [x] **Staged Diff Guards**: Intelligent handling of empty staged states and size boundaries.
- [x] **Lockfile & Asset Filtering**: Smart filter removes `package-lock.json`, `pnpm-lock.yaml`, binaries, and SVGs from diff, reducing token consumption by up to **80%**.
- [x] **Gitmoji Support**: Alternative emoji-style commit formatting (`✨`, `🐛`, `📝`, etc.).
- [x] **Interactive Onboarding Wizard**: `codesync init` command guides users through API keys, model selection, and endpoint configuration.
- [x] **Git Pre-commit Hook Integration**: Native installation scripts for `commit-msg` hooks that trigger CLI for commit message generation.
- [x] **Automatic Scope Detection**: Directory analyzer guesses and pre-fills commit scope based on which submodule contains the majority of modifications.
- [x] **Multilingual Commits Support**: Configurable output language for generated commit messages (Chinese, English, Japanese, etc.).
- [x] **AI-powered Changelog Generator**: Analyze log difference between two git tags/commit hashes and generate formatted Release Notes.
- [x] **Commit Message Validation Guard**: Standalone script checks if commits follow Conventional Commit specifications.

---

## 🚀 Phase 2: Multi-Platform & Team Collaboration ✅ COMPLETED

Expanding platform support and team workflow features.

- [x] **GitHub Platform Integration**: Create repos, get user info via GitHub API.
- [x] **Gitee Platform Integration**: Create repos, get user info via Gitee API.
- [x] **GitLab Platform Integration**: Create repos, get user info via GitLab API.
- [x] **Team Configuration Sync**: `codesync team init` initializes shared team settings.
- [x] **Team Enforcement Hooks**: `codesync team enforce` installs Git hooks that enforce team conventions on all members.
- [x] **Three-Platform Unified Interface**: Single command supports `--platform github/gitee/gitlab` seamlessly.

---

## 🛠️ Phase 3: Desktop Application ✅ COMPLETED

Cross-platform desktop GUI for non-CLI users.

- [x] **Electron Main Process**: Complete main process with IPC handlers for all features.
- [x] **Preload Security Bridge**: Secure contextBridge API exposure via `window.electronAPI`.
- [x] **Seven-Page Frontend UI**: Upload, Download, History, AI Commit, AI Code, Team, Settings pages.
- [x] **Custom Title Bar**: Frameless window with custom minimize/maximize/close controls.
- [x] **Toast Notification System**: User-friendly feedback for all operations.
- [x] **Platform Selector**: Visual GitHub/Gitee/GitLab selection for uploads.

---

## 🔧 Phase 4: Intelligence & Optimization (Current Development)

Smart model selection and advanced AI features.

- [x] **Smart Model Selection**: Automatically selects appropriate model based on diff complexity:
  - Simple changes → `fastModel` (e.g., `gpt-4o-mini`)
  - Complex changes → `smartModel` (e.g., `gpt-4o`)
  - Power tasks → `powerfulModel` (e.g., `gpt-4o`)
- [x] **Code Annotate**: `codesync ai annotate -f <file>` generates detailed Chinese comments.
- [x] **Code Explain**: `codesync ai explain -f <file>` explains code functionality, parameters, and flow.
- [x] **Code Review**: `codesync ai review -f <file>` reviews code quality, bugs, performance, and security.
- [x] **Project Analysis**: `codesync git analyze` analyzes project structure.
- [x] **Batch Operations**: `codesync git batch` for bulk Git operations.

---

## 📈 Phase 5: Testing & Polish (In Progress)

Comprehensive test coverage and reliability improvements.

- [x] **Shared Config Tests**: Test coverage for `shared/config.js`.
- [x] **Shared Git Operations Tests**: Test coverage for `shared/git/operations.js`.
- [x] **Shared Platform Tests**: Test coverage for `shared/platform/*.js`.
- [x] **Desktop App Tests**: Test coverage for all desktop application files.
- [ ] **Integration Tests**: End-to-end tests for upload/download/commit workflows.
- [ ] **CLI Smoke Tests**: Verify all commands work from a fresh installation.

---

## 🌟 Phase 6: Future Considerations (Backlog)

Long-term vision and community-requested features.

- [ ] **Plugin System**: Extensible plugin architecture for custom AI providers and platforms.
- [ ] **CI/CD Integration**: GitHub Actions / GitLab CI templates for automated commits.
- [ ] **VS Code Extension**: Inline commit suggestions directly in VS Code editor.
- [ ] **Web Dashboard**: Cloud-based project statistics and commit history visualization.
- [ ] **Multi-repo Management**: GUI for managing multiple project repositories.
- [ ] **Auto-deploy Hooks**: Trigger deployments after successful pushes.
- [ ] **Commit Template Library**: Reusable commit templates for common patterns.
- [ ] **AI-powered Code Review Bot**: Automated PR review comments via AI.

---

## 📊 Version History

| Version | Date    | Highlights                                                          |
| ------- | ------- | ------------------------------------------------------------------- |
| v1.0.0  | 2026-06 | Initial release with core AI commit generation                      |
| v1.1.0  | 2026-10 | Phase 1-4 completed: all features above                             |
| v2.0.0  | 2026-10 | Architecture redesign (npm workspaces, shared modules, desktop app) |

---

## 🤝 How to Contribute to the Roadmap

1. **Open an Issue**: Suggest new features or vote on existing ones.
2. **Submit a PR**: Implement features marked as "planned" or "backlog".
3. **Test and Report**: Help identify bugs in existing features.
4. **Share Feedback**: Tell us which features matter most to you.

---

_Last updated: 2026-10-18_
