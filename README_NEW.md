# 🚀 CodeSync v2.0 - Smart Git + AI Code Assistant

<div align="center">

**Simplify Git Operations + AI Code Assistant**

Say goodbye to cumbersome Git commands, so that anyone unfamiliar with Git can easily manage their code, and AI assistance boosts development efficiency.

[![npm version](https://img.shields.io/npm/v/codesync.svg)](https://www.npmjs.com/package/codesync)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Features](https://img.shields.io/badge/features-14%20new-green.svg)](FEATURES_COMPLETE.md)
[![Completion](https://img.shields.io/badge/completion-82.4%25-brightgreen.svg)](IMPLEMENTATION_REPORT.md)

[English](README_EN.md) | Simplified Chinese

</div>

---

## ✨ Core Features

### 🎯 One-Click Operations
- **One-Click Upload** - Automatically initializes the repository, generates the commit message with AI, creates the remote repository, and pushes
- **One-Click Download** - Automatically clones and automatically installs dependencies (npm/pnpm/yarn)
- **Smart Update** - Automatically detects changes, generates the commit message, and pushes to the remote

### 🤖 AI Code Assistant
- **Smart Commit** - Analyzes diff complexity, automatically selects the appropriate model, and generates a conventional commit message
- **Code Annotation** - Generates detailed Chinese comments for any code file
- **Code Explanation** - Explains in detail the code's functionality, key functions, and execution flow
- **Code Review** - Comprehensive review from the perspectives of quality, potential bugs, performance, and security
- **Automatic Changelog Generation** - Analyzes all commits between two version tags and automatically generates the changelog

### 🤖 Smart Code Upload Assistant ⭐ New Feature
- **Fully Automated** - Automatically monitors file changes, no manual operation required
- **Smart Strategy** - 4 upload strategies: smart, immediate, batch, scheduled
- **AI Generated** - Automatically generates conventional commit messages
- **Automatic Push** - Automatically commits and pushes to the remote repository

### 🎣 Pre-commit Hook Templates ⭐ New Feature
- **ESLint** - Code quality checks
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Test** - Automatically runs the tests
- **All** - Comprehensive checks

### 📝 Commit Template Library ⭐ New Feature
- **8 Built-in Templates** - Bug Fix, Feature, Refactor, Documentation, etc.
- **Custom Templates** - Supports custom commit templates
- **Template Variables** - Supports variables such as {{ticket}}, {{author}}, {{date}}

### 📊 Web Dashboard ⭐ New Feature
- **Project Statistics** - Commit counts, contributors, branch statistics
- **Commit History** - Visualized commit history
- **File Changes** - File change statistics

### 🔌 Plugin System ⭐ New Feature
- **Extensible Architecture** - Supports AI Provider, Platform, and Hook plugins
- **Plugin Management** - Install, uninstall, and load plugins
- **Community Ecosystem** - Supports community-contributed plugins

### 🚀 Automated Deployment ⭐ New Feature
- **Vercel** - Automatically deploys to Vercel
- **Netlify** - Automatically deploys to Netlify
- **Docker** - Automatically builds Docker images
- **NPM** - Automatically publishes to NPM

### 📦 Release Automation ⭐ New Feature
- **Automatic Tag** - Creates a Git Tag
- **Automatic Push** - Pushes the Tag to the remote
- **Automatic Notes** - Generates Release Notes
- **Automatic Creation** - Creates a GitHub Release

### 🔍 Code Search ⭐ New Feature
- **Text Search** - Fast search based on ripgrep
- **Semantic Search** - Intelligent search based on keywords
- **Context Display** - Shows the code context

### 🔒 Security Detection
- **Sensitive Information Scanning** - Detects API keys, tokens, and passwords
- **License Compliance** - Dependency license scanning and compliance checking

### 👥 Team Collaboration
- **Team Configuration Sync** - Unifies the team's commit conventions, API configuration, and model selection
- **Git Hook Enforcement** - Automatically validates the commit message format when team members commit

### 💻 VS Code Extension
- **Commit Message Sidebar** - View staged changes in real time and generate a commit message with one click
- **Right-Click Menu AI Features** - After selecting text, directly invoke AI explain/annotate/review
- **Real-time Diff Preview** - View staged code changes in the sidebar

---

## 🚀 Quick Start

### Installation

```bash
# Clone the project
git clone <repo-url>
cd git-commit-ai

# Install dependencies
npm install

# Link the CLI globally
npm run link:cli

# Verify the installation
codesync --version
```

### Configuration

```bash
# Interactive configuration wizard
codesync init
```

### Usage

#### Method 1: Manual Upload

```bash
# Upload the current project to GitHub
codesync upload --platform github --name my-project
```

#### Method 2: Agent Automatic Upload ⭐ Recommended

```bash
# Configure the agent
codesync agent-init

# Start the agent
codesync agent start

# Now just develop code normally, and the agent uploads automatically!
```

---

## 📖 Usage of Core Features

### 🤖 Smart Code Upload Assistant

```bash
# Configuration wizard
codesync agent-init

# Start the agent
codesync agent start

# View status
codesync agent status

# Stop the agent
codesync agent stop
```

**Detailed documentation**: [AGENT_GUIDE.md](AGENT_GUIDE.md)

### AI Smart Commit

```bash
# Analyze the diff and generate the commit message with AI
codesync ai commit

# Quick mode (commit directly)
codesync ai commit --yes

# Specify the convention
codesync ai commit --convention gitmoji
```

### AI Code Assistant

```bash
# Code annotation
codesync ai annotate -f src/app.js

# Code explanation
codesync ai explain -f src/app.js

# Code review
codesync ai review -f src/app.js
```

### Pre-commit Hook Templates

```bash
# List the available templates
codesync hook list

# Install the ESLint hook
codesync hook install --template eslint

# Install the comprehensive check hook
codesync hook install --template all
```

### Commit Template Library

```bash
# List all templates
codesync template list

# Use a template
codesync template use --name feature

# Add a custom template
codesync template add --name my-template --template "..."
```

### Web Dashboard

```bash
# Start the Dashboard
codesync dashboard

# Visit http://localhost:3001
```

### Plugin System

```bash
# List the installed plugins
codesync plugin list

# Install a plugin
codesync plugin install --name my-plugin --type ai-provider --path ./plugins/my-plugin.js
```

### Automated Deployment

```bash
# List the supported deployment platforms
codesync deploy list

# Configure Docker deployment
codesync deploy hook --platform docker
```

### Release Automation

```bash
# Create a Release
codesync release 1.0.0

# Create a pre-release version
codesync release 1.0.0-beta.1 --prerelease
```

### Code Search

```bash
# Search the code
codesync search "function login"

# Semantic search
codesync search "api authentication" --type semantic
```

### Security Detection

```bash
# Scan for sensitive information
codesync security scan

# License compliance detection
codesync security license
```

---

## 📋 Complete Command List

| Command | Description |
|------|------|
| `codesync upload` | Upload the current project to a remote repository |
| `codesync download <url>` | Clone a remote project locally |
| `codesync update` | Update the current project |
| `codesync ai commit` | Generate a commit message with AI |
| `codesync ai annotate -f <file>` | Code annotation |
| `codesync ai explain -f <file>` | Code explanation |
| `codesync ai review -f <file>` | Code review |
| `codesync agent-init` | Agent configuration wizard ⭐ |
| `codesync agent start` | Start the agent ⭐ |
| `codesync agent stop` | Stop the agent ⭐ |
| `codesync agent status` | View the agent status ⭐ |
| `codesync hook install` | Install a Pre-commit Hook ⭐ |
| `codesync template use` | Use a commit template ⭐ |
| `codesync dashboard` | Start the Web Dashboard ⭐ |
| `codesync plugin install` | Install a plugin ⭐ |
| `codesync deploy hook` | Configure a deployment hook ⭐ |
| `codesync release <version>` | Create a Release ⭐ |
| `codesync search <query>` | Code search ⭐ |
| `codesync security license` | License detection ⭐ |
| `codesync ci install` | Install the CI/CD configuration |
| `codesync team init` | Initialize the team configuration |
| `codesync cache --stats` | View cache statistics |
| `codesync config --list` | View the configuration |

**[View the complete feature documentation →](FEATURES_COMPLETE.md)**

---

## 🎯 Use Cases

### Scenario 1: A Git beginner uploads a project for the first time

```bash
codesync init
codesync upload --platform github --name my-first-project
# Done! The repository is created, the commit is made, and the push happens automatically
```

### Scenario 2: A fully automated development workflow ⭐

```bash
codesync agent-init
codesync agent start
# The agent automatically monitors file changes and uploads, with no manual operation required
```

### Scenario 3: Quickly download and run an open-source project

```bash
codesync download https://github.com/vercel/next.js --install
# Automatic clone + automatic dependency installation
```

### Scenario 4: Understanding code with AI assistance

```bash
codesync ai explain -f src/utils/calc.js
# AI explains the code's functionality in detail
```

### Scenario 5: Team collaboration with enforced commit conventions

```bash
codesync team init
codesync team enforce
# The commit message format is validated automatically
```

### Scenario 6: Automated Release workflow ⭐

```bash
codesync release 2.0.0
# Tags, Notes, and Releases are created automatically
```

---

## 📊 Feature Comparison

| Feature | CodeSync | Git Commands | commitizen | aicommits |
|------|----------|----------|------------|-----------|
| One-click upload | ✅ | ❌ | ❌ | ❌ |
| Agent automatic upload | ✅ | ❌ | ❌ | ❌ |
| AI commit message | ✅ | ❌ | Manual | ✅ |
| Code annotation/explanation/review | ✅ | ❌ | ❌ | ❌ |
| Pre-commit Hook templates | ✅ | Manual | Partial | ❌ |
| Commit template library | ✅ | ❌ | Manual | ❌ |
| Web Dashboard | ✅ | ❌ | ❌ | ❌ |
| Plugin system | ✅ | ❌ | ❌ | ❌ |
| Automated deployment | ✅ | ❌ | ❌ | ❌ |
| Release automation | ✅ | Manual | ❌ | ❌ |
| Code search | ✅ | grep | ❌ | ❌ |
| License detection | ✅ | ❌ | ❌ | ❌ |
| CI/CD integration | ✅ | Manual | ❌ | ❌ |
| VS Code extension | ✅ | ❌ | ❌ | ❌ |
| Desktop application | ✅ | ❌ | ❌ | ❌ |

---

## 📚 Documentation

- [README.md](README.md) - Main documentation
- [FEATURES_COMPLETE.md](FEATURES_COMPLETE.md) - Complete feature documentation
- [AGENT_GUIDE.md](AGENT_GUIDE.md) - Agent usage guide
- [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md) - Implementation report
- [EXTENSIONS.md](EXTENSIONS.md) - Feature expansion plan

---

## 🛠️ Development

```bash
# Install all dependencies
npm install

# Run the tests
npm test

# Link the CLI globally
npm run link:cli

# Start the desktop application
npm run install:desktop
cd desktop && npm run dev
```

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

## 📄 License

MIT License

---

<div align="center">

**[⬆ Back to Top](#-codesync-v20--smart-git--ai-code-assistant)**

Made with ❤️ by CodeSync Team

</div>
