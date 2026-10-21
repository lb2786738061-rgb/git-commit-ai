# 🎉 CodeSync v2.0 Feature Overview

## 📦 What is CodeSync?

CodeSync is a powerful Git operations + AI code assistant that lets anyone manage their code without knowing Git, with AI assistance to boost development efficiency.

**Core value**:
- ✅ One-click upload/download — no need to memorize Git commands
- ✅ AI generates well-formed commit messages automatically
- ✅ Smart code assistant (annotation, explanation, review)
- ✅ The agent uploads automatically — fully hands-off
- ✅ Team collaboration and CI/CD integration

---

## 🚀 Core Features

### 1. Simplified Git operations

#### One-click upload
```bash
# Upload the current project to GitHub
codesync upload --platform github --name my-project

# Upload to a private repository
codesync upload --platform github --name my-project --private

# Upload to Gitee / GitLab
codesync upload --platform gitee --name my-project
codesync upload --platform gitlab --name my-project
```

#### One-click download
```bash
# Download and install the dependencies automatically
codesync download https://github.com/user/repo.git --install

# Download to a specific directory
codesync download https://github.com/user/repo.git --dir ./my-folder
```

#### Smart update
```bash
# Detect changes, generate the commit message and push
codesync update
```

#### Version rollback
```bash
# Pick a commit interactively and roll back safely
codesync git revert
```

---

### 2. AI code assistant

#### Smart commit message generation
```bash
# Standard mode (interactive confirmation)
codesync ai commit

# Fast mode (commit immediately)
codesync ai commit --yes

# Choose a convention
codesync ai commit --convention gitmoji

# Choose a language
codesync ai commit --language en
```

#### Code annotation
```bash
# Generate detailed comments for a code file
codesync ai annotate -f src/app.js
```

#### Code explanation
```bash
# Explain what the code does, its parameters and the execution flow
codesync ai explain -f src/app.js
```

#### Code review
```bash
# A full review covering quality, potential bugs, performance and security
codesync ai review -f src/app.js
```

#### Automatic changelog
```bash
# Analyze every commit between two tags and generate the changelog
codesync git changelog --from=v1.0.0 --to=v1.1.0
```

---

### 3. 🤖 Smart code upload assistant (Agent) ⭐ New

**A fully automated code upload experience!**

#### Setup wizard (first run)
```bash
codesync agent-init
```

The wizard asks:
- The upload strategy (smart / immediate / batch / scheduled)
- The batch upload threshold
- The scheduled upload interval
- Whether to use AI to generate the commit message
- The commit convention and language
- Auto commit / auto push
- Whether a confirmation is required

#### Start the agent
```bash
codesync agent start
```

The agent will:
- Watch for file changes automatically
- Generate commit messages intelligently
- Commit and push automatically
- Require no manual interaction at all

#### Check the status
```bash
codesync agent status
```

#### Stop the agent
```bash
codesync agent stop
```

#### Advanced options
```bash
# Choose the upload strategy
codesync agent start --strategy smart
codesync agent start --strategy immediate
codesync agent start --strategy batch --batch-size 10
codesync agent start --strategy scheduled --interval 120

# Disable AI generation
codesync agent start --no-ai

# Skip the confirmation prompt
codesync agent start --yes

# Disable auto push
codesync agent start --no-push
```

**Detailed documentation**: [AGENT_GUIDE.md](AGENT_GUIDE.md)

---

### 4. AI code review bot

#### Install the bot
```bash
codesync review-bot install
```

#### Start the bot
```bash
codesync review-bot start
```

The bot will:
- Listen to GitHub / GitLab webhooks
- Analyze the PR / MR diff automatically
- Generate an AI review comment
- Support custom review rules

---

### 5. VS Code extension

#### Install
```bash
cd vscode-extension
npm install
npm run compile
```

#### Use it in VS Code
1. Open the CodeSync sidebar
2. Inspect the staged changes
3. Click "Generate Commit Message" to create a commit message
4. Right-click selected text and pick an AI command

---

### 6. Team collaboration

#### Initialize the team configuration
```bash
codesync team init
```

#### Install the enforcing hooks
```bash
codesync team enforce
```

Team members are then validated automatically when they commit.

---

### 7. Pre-commit hook templates ⭐ New

#### List the available templates
```bash
codesync hook list
```

Available templates:
- `eslint` - ESLint code checks
- `stylelint` - style checks
- `typescript` - TypeScript type checking
- `prettier` - code formatting
- `test` - run the tests
- `all` - combined checks
- `custom` - custom hook

#### Install a hook
```bash
# Install the ESLint hook
codesync hook install --template eslint

# Install the combined check hook
codesync hook install --template all --force
```

#### Remove the hook
```bash
codesync hook uninstall
```

---

### 8. Commit template library ⭐ New

#### List all templates
```bash
codesync template list
```

Built-in templates:
- `bug-fix` - bug fix
- `feature` - new feature
- `refactor` - code refactoring
- `documentation` - documentation update
- `breaking-change` - breaking change
- `performance` - performance optimization
- `test` - testing related
- `chore` - miscellaneous tasks

#### Use a template
```bash
codesync template use --name feature
```

#### Show the template details
```bash
codesync template show --name bug-fix
```

#### Add a custom template
```bash
codesync template add --name my-template --template "..." --description "..."
```

#### Remove a custom template
```bash
codesync template remove --name my-template
```

---

### 9. Web dashboard ⭐ New

#### Start the dashboard
```bash
codesync dashboard
```

#### Choose the port
```bash
codesync dashboard --port 3001
```

The dashboard provides:
- Project statistics
- Commit history visualization
- Contributor statistics
- Branch list
- File change statistics

Open: http://localhost:3001

---

### 10. Plugin system ⭐ New

#### List the installed plugins
```bash
codesync plugin list
```

#### Install a plugin
```bash
codesync plugin install --name my-plugin --type ai-provider --path ./plugins/my-plugin.js
```

Plugin types:
- `ai-provider` - AI service provider
- `platform` - Git platform adapter
- `pre-commit-hook` - pre-commit hook
- `post-commit-hook` - post-commit hook

#### Remove a plugin
```bash
codesync plugin uninstall --name my-plugin
```

#### Load a plugin
```bash
codesync plugin load --path ./plugins/custom-plugin.js
```

---

### 11. Automated deployment ⭐ New

#### List the supported deployment platforms
```bash
codesync deploy list
```

Supported platforms:
- `vercel` - Vercel deployment
- `netlify` - Netlify deployment
- `docker` - Docker image build
- `npm` - NPM package publishing

#### Configure the deployment hook
```bash
# Docker deployment
codesync deploy hook --platform docker

# Vercel deployment
codesync deploy hook --platform vercel
```

---

### 12. Release automation ⭐ New

#### Create a release
```bash
codesync release 1.0.0
```

#### Create a prerelease
```bash
codesync release 1.0.0-beta.1 --prerelease
```

#### Create a draft release
```bash
codesync release 1.0.0 --draft
```

Done automatically:
- Create the Git tag
- Push the tag to the remote
- Generate the release notes
- Create the GitHub release

---

### 13. Code search ⭐ New

#### Search the code
```bash
codesync search "function login"
```

#### Semantic search
```bash
codesync search "api authentication" --type semantic
```

#### Search in a specific file
```bash
codesync search "TODO" --file src/index.js
```

---

### 14. Security checks

#### Scan for sensitive information
```bash
# Scan the staged changes
codesync security scan

# Scan a specific file
codesync security scan --file src/config.js
```

#### Pre-commit hook detection
```bash
codesync security pre-commit
```

#### License compliance checks ⭐ New
```bash
codesync security license
```

It checks:
- Dependency licenses
- Compliance (MIT, Apache-2.0, BSD, ISC, etc.)
- Generates a license report

---

### 15. CI/CD integration

#### Install GitHub Actions
```bash
codesync ci install --platform github
```

#### Install GitLab CI
```bash
codesync ci install --platform gitlab
```

#### Remove the CI/CD configuration
```bash
codesync ci uninstall --platform github
```

---

### 16. Advanced Git operations

#### Show the commit history
```bash
codesync git log
```

#### Show the pending changes
```bash
codesync git diff
```

#### Analyze the project
```bash
codesync git analyze
```

#### Batch processing
```bash
codesync git batch
```

#### Amend a commit
```bash
codesync git amend
```

#### Squash commits
```bash
codesync git squash --number 5
```

#### Create a branch
```bash
codesync git branch --name feature/new-feature
```

---

### 17. Cache management

#### Show the cache statistics
```bash
codesync cache --stats
```

#### Clear all cached data
```bash
codesync cache --clear
```

#### Remove expired entries
```bash
codesync cache --expire
```

---

### 18. Configuration management

#### Interactive setup wizard
```bash
codesync init
```

#### Show the current configuration
```bash
codesync config --list
```

#### Set a configuration value
```bash
codesync config set apiKey=sk-xxx
codesync config set githubToken=ghp_xxx
codesync config set model=gpt-4o
```

---

## 📊 Feature Comparison

| Feature | CodeSync | Git commands | commitizen | aicommits |
|------|----------|----------|------------|-----------|
| One-click upload | ✅ | ❌ | ❌ | ❌ |
| One-click download | ✅ | ❌ | ❌ | ❌ |
| AI commit messages | ✅ | ❌ | Manual | ✅ |
| Agent auto upload | ✅ | ❌ | ❌ | ❌ |
| Code annotation / explanation / review | ✅ | ❌ | ❌ | ❌ |
| AI review bot | ✅ | ❌ | ❌ | ❌ |
| Pre-commit hook templates | ✅ | Manual | Partial | ❌ |
| Commit template library | ✅ | ❌ | Manual | ❌ |
| Web dashboard | ✅ | ❌ | ❌ | ❌ |
| Plugin system | ✅ | ❌ | ❌ | ❌ |
| Automated deployment | ✅ | ❌ | ❌ | ❌ |
| Release automation | ✅ | Manual | ❌ | ❌ |
| Code search | ✅ | grep | ❌ | ❌ |
| License detection | ✅ | ❌ | ❌ | ❌ |
| CI/CD integration | ✅ | Manual | ❌ | ❌ |
| VS Code extension | ✅ | ❌ | ❌ | ❌ |
| Desktop app | ✅ | ❌ | ❌ | ❌ |

---

## 🎯 Use Cases

### Scenario 1: A Git beginner uploads their first project

```bash
# You just finished a project and want to upload it to GitHub
# No need to know git init / add / commit / push

codesync init                                    # configure the API key
codesync upload --platform github --name my-first-project
# Done! The repository is created, committed and pushed automatically
```

### Scenario 2: A fully automated development flow

```bash
# Configure the agent
codesync agent-init

# Start the agent
codesync agent start

# Now develop normally, the agent automatically:
# - watches for file changes
# - generates the commit message
# - commits and pushes
# No manual interaction at all!
```

### Scenario 3: Quickly download and run an open-source project

```bash
codesync download https://github.com/vercel/next.js --install
# Auto-clone + automatic dependency installation
```

### Scenario 4: Team collaboration with enforced conventions

```bash
# The team lead initializes the team configuration
codesync team init

# Team members install the convention hooks
codesync team enforce

# Every commit is validated from now on
```

### Scenario 5: Understanding code with AI

```bash
# Add comments to code you don't understand
codesync ai annotate -f src/utils/calc.js

# Explain what the code does
codesync ai explain -f src/utils/calc.js

# Review the code quality
codesync ai review -f src/utils/calc.js
```

### Scenario 6: An automated release flow

```bash
# After development is done, create the release in one command
codesync release 2.0.0

# Done automatically:
# - create the tag
# - push the tag
# - generate the release notes
# - create the GitHub release
```

---

## 📚 Detailed documentation

- [README.md](README.md) - main documentation
- [AGENT_GUIDE.md](AGENT_GUIDE.md) - agent usage guide
- [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md) - implementation report
- [EXTENSIONS.md](EXTENSIONS.md) - feature extension roadmap

---

## 🚀 Quick Start

### 1. Install

```bash
git clone <repo-url>
cd git-commit-ai
npm install
npm run link:cli
```

### 2. Configure

```bash
codesync init
```

### 3. Start using it

```bash
# Upload a project
codesync upload --platform github --name my-project

# Or start the agent
codesync agent-init
codesync agent start
```

---

## 🤝 Contributing

Issues and pull requests are welcome!

---

## 📄 License

MIT License
