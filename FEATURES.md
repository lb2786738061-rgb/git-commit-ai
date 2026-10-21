# 🎉 New Features Overview (v2.0.0)

This document summarizes all the new features added in git-commit-ai v2.0.0.

---

## ✨ Completed New Features

### 1. Interactive Editor Integration
- **Feature**: Supports editing the commit message with a system editor (vim, nano, VS Code, etc.)
- **Command**: Select "Edit message in editor" in the interactive menu
- **Environment Variable**: Specify the editor via the `EDITOR` or `VISUAL` environment variable
- **Implementation**: The `editWithEditor()` function in `src/git.js`

### 2. Commit History Analysis
- **Feature**: Analyzes commit history quality, counts the proportion of each commit type, and detects commits that do not follow the convention
- **Command**: `gca analyze`
- **Options**:
  - `--from <tag/commit>`: The starting tag or commit
  - `--to <tag/commit>`: The ending tag or commit
  - `--limit <number>`: The maximum number of commits to analyze
- **Output**: Type distribution chart, range distribution, examples of non-conforming commits
- **Implementation**: The `getDetailedCommitHistory()` function in `src/git.js`

### 3. Batch Commit Support
- **Feature**: Processes uncommitted files in bulk, generating an individual commit message for each file
- **Command**: `gca batch`
- **Flow**: Stage file → Generate commit message → Create commit → Unstage file → Process the next file
- **Implementation**: The `getFileDiff()`, `stageFile()`, and `unstageFile()` functions in `src/git.js`

### 4. AI Smart Model Selection
- **Feature**: Automatically selects a model based on code complexity (fast model for simple changes, powerful model for complex ones)
- **Configuration**:
  - `smartModel`: Enable/disable smart selection
  - `fastModel`: Name of the fast model (default: gpt-4o-mini)
  - `powerfulModel`: Name of the powerful model (default: gpt-4o)
  - `complexityThreshold`: Complexity threshold (default: 5000 characters)
- **Implementation**: The `selectSmartModel()` function in `src/ai.js`

### 5. Team Collaboration Features
- **Feature**: Shares team configuration and enforces team commit conventions
- **Commands**:
  - `gca team --init`: Initialize the team configuration file
  - `gca team --show`: View the team configuration
  - `gca team --enforce`: Install the enforcement hook
- **Configuration File**: `.git-commit-ai-team.json` (project root)
- **Options**:
  - `convention`: Team commit convention
  - `language`: Team commit language
  - `enforceConventional`: Enforce the convention
  - `requireScope`: Require a scope to be included
  - `maxSubjectLength`: Maximum subject length
- **Implementation**: The `readTeamConfig()` and `writeTeamConfig()` functions in `src/config.js`

### 6. Performance Optimization (Caching Mechanism)
- **Feature**: Caches AI responses, reducing API calls and improving response speed
- **Configuration**:
  - `enableCache`: Enable/disable the cache
  - `cacheTTL`: Cache expiration time (default: 3600000ms = 1 hour)
- **Commands**:
  - `gca cache --stats`: View cache statistics
  - `gca cache --clear`: Clear all caches
  - `gca cache --expire`: Clean up expired cache entries
- **Implementation**: The `src/cache.js` module (newly created)

### 7. UI Enhancements
- **Feature**: JSON output mode, theme system
- **Command**: `gca --json` outputs JSON format (for CI/CD integration)
- **Configuration**:
  - `theme`: Theme (default, minimal, colorful)
  - `jsonOutput`: JSON output mode
- **Implementation**: The `src/theme.js` module (newly created)

### 8. More Git Operations
- **Feature**: Amend, Squash, and Branch operations
- **Commands**:
  - `gca amend`: Modify the last commit
  - `gca squash --number <count>`: Squash the most recent commits
  - `gca branch`: Create a new branch based on the commit subject
- **Implementation**: The `amendCommit()`, `squashCommits()`, `createBranch()`, and `getCurrentBranch()` functions in `src/git.js`

### 9. PR Content Generation
- **Feature**: Generates Pull Request titles and descriptions based on commit history
- **Command**: `gca pr --from <tag/commit> --to <tag/commit> -o <file>`
- **Output**: PR title and a description in Markdown format
- **Implementation**: The `generatePRContent()` function in `src/ai.js`

---

## 📦 New Files

- `src/cache.js` - Cache management module
- `src/theme.js` - Theme system module
- `tests/analyze.test.js` - Commit history analysis tests
- `tests/batch.test.js` - Batch commit tests
- `tests/smart-model.test.js` - Smart model selection tests
- `tests/team.test.js` - Team feature tests
- `tests/cache.test.js` - Cache feature tests
- `tests/ui.test.js` - UI enhancement tests
- `tests/git-operations.test.js` - Git extended operation tests

---

## 🔧 Modified Files

- `src/config.js` - Added smart model, cache, UI, and team configuration options
- `src/git.js` - Added editor, batch operation, and Git extended operation functions
- `src/ai.js` - Added smart model selection, cache integration, and PR content generation
- `bin/cli.js` - Added all new commands and options
- `package.json` - Updated the version to 2.0.0 and added test scripts
- `README.md` - Updated the feature list and usage instructions

---

## 🧪 Test Coverage

All new features have corresponding unit tests:
- ✅ analyze.test.js
- ✅ batch.test.js
- ✅ smart-model.test.js
- ✅ team.test.js
- ✅ cache.test.js
- ✅ ui.test.js
- ✅ git-operations.test.js

The existing tests continue to pass:
- ✅ config.test.js
- ✅ git.test.js
- ✅ prompts.test.js
- ✅ verify.test.js
- ✅ changelog.test.js

---

## 📋 Complete List of Configuration Options

| Option | Default Value | Description |
|--------|--------|------|
| apiKey | '' | API key |
| apiBase | 'https://api.openai.com/v1' | API base URL |
| model | 'gpt-4o-mini' | Default model |
| convention | 'angular' | Commit convention (angular/gitmoji) |
| language | 'en' | Commit language |
| smartModel | true | Enable smart model selection |
| fastModel | 'gpt-4o-mini' | Fast model |
| powerfulModel | 'gpt-4o' | Powerful model |
| complexityThreshold | 5000 | Complexity threshold (characters) |
| teamConfigPath | '.git-commit-ai-team.json' | Team configuration file path |
| enableCache | true | Enable caching |
| cacheTTL | 3600000 | Cache expiration time (milliseconds) |
| theme | 'default' | UI theme |
| jsonOutput | false | JSON output mode |

---

## 🎯 Usage Recommendations

1. **Initialize configuration**: Run `gca init` for interactive configuration on first use
2. **Team collaboration**: Run `gca team --init` in a team project to create the team configuration
3. **Performance optimization**: Enabling the cache can significantly reduce API calls
4. **Smart model**: Configure the fast and powerful models according to the project size
5. **CI/CD integration**: Use the `--json` option to output structured data

---

## 🚀 Upgrade Guide

Upgrading from v1.0.0 to v2.0.0:

1. Update the code: `git pull`
2. Reinstall dependencies: `npm install`
3. Re-link: `npm link`
4. Run the configuration wizard: `gca init` (optional, new options will use default values)
5. Test the features: `gca --help` to view all available commands

---

## 📝 Version History

- **v2.0.0** (2026-10-18) - Major update, adding 8 new features
- **v1.0.0** (2026-06-30) - Initial version, core features

---

## 🤝 Contributing

Issues and Pull Requests are welcome!
