# 🗺️ Project Roadmap & Update Plans

This document outlines the planned evolutionary phases and feature updates for `git-commit-ai`. We welcome contributions and feedback from the community to help shape these releases!

---

## 📌 Phase 1: Core Foundation & Stability (Current Status)
Focus on building a reliable, zero-dependency, and high-performance interactive CLI tool.

- [x] **Native ESM Implementation**: Built entirely on Node.js native ES Modules for cross-platform compatibility and minimal footprint.
- [x] **Secure Configuration Storage**: Implemented localized settings storage (~/.git-commit-ai.json) separated from Git repository workspaces.
- [x] **OpenAI Compatible Client**: Supporting all OpenAI-compatible API endpoints (OpenAI, DeepSeek, Groq, Ollama, etc.) with custom model parameters.
- [x] **Interactive CLI UX**: Implemented spinners (`ora`), colors (`picocolors`), and action selector menus (`prompts`).
- [x] **Standard Conventional Commits**: Out-of-the-box formatting conforming to Angular commit message specifications.
- [x] **Staged Diff Guards**: Intelligent handling of empty staged states and size boundaries.

---

## 🚀 Phase 2: Configuration Wizard & Context Optimization (Next Up)
Improving first-time user experience and optimizing LLM token consumption.

- [ ] **Interactive Onboarding Wizard**:
  - Implement a `gca init` command to guide users through entering their API keys, selecting model targets, and configuring endpoints via CLI prompts.
- [ ] **Lockfile & Asset Filtering**:
  - Implement a smart filter to remove voluminous non-code modifications (like `package-lock.json`, `pnpm-lock.yaml`, binaries, or SVGs) from the sent `git diff`. This decreases token consumption by up to **80%**.
- [ ] **Commit Style Customization**:
  - Add configuration choices for alternative commit message guidelines, specifically supporting **Emoji-style (Gitmoji)** formatting:
    - 🐛 `fix: bug description`
    - ✨ `feat: feature description`

---

## 🛠️ Phase 3: Developer Integration & Shell Hooks (Planned)
Deepening integration into daily git habits and automatons.

- [ ] **Git Pre-commit Hook Integration**:
  - Create native installation scripts (using lightweight Husky-style shells) to automatically trigger the CLI when a developer runs a standard `git commit` command without parameters.
- [ ] **Automatic Scope Detection**:
  - Implement a directory analyzer to guess and pre-fill the commit scope `<type>(<scope>)` based on which submodule or source folder contains the majority of the modifications.
- [ ] **Multilingual Commits Support**:
  - Allow users to configure the output language of the generated commit message (e.g., generating commit explanations in Chinese, Spanish, or Japanese, while keeping type headers in standard English).

---

## 📈 Phase 4: Extended Maintenance Automation (Long-term)
Expanding the scope of AI from individual commits to repository-level maintainer duties.

- [ ] **AI-powered Changelog Generator**:
  - Extend the CLI to analyze the log difference between two git tags or commit hashes and automatically generate high-quality, formatted weekly/monthly Release Notes.
- [ ] **Commit Message Validation Guard**:
  - Provide a standalone script that checks if manually written local commits follow Conventional Commit specifications and rejects them with helpful tips if they fail.
