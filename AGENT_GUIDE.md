# CodeSync Agent Guide

## 🤖 What is the CodeSync Agent?

The CodeSync Agent is a smart code upload assistant. It watches your project files for changes, generates commit messages intelligently and pushes them to the remote repository for you. No manual Git commands — uploading code becomes fully automatic.

---

## 🚀 Quick Start

### 1. Install the dependencies

```bash
cd cli
npm install
```

### 2. Configure the agent

For the first run, use the setup wizard:

```bash
codesync agent-init
```

The wizard asks the following questions:

- **Upload strategy**: how file changes should be uploaded
  - `smart` - smart strategy (recommended): decides based on file types and count
  - `immediate` - upload immediately after a file changes
  - `batch` - batch upload: uploads once the configured number of files has accumulated
  - `scheduled` - scheduled upload: uploads at a fixed interval

- **Batch upload threshold**: how many files accumulate before a batch upload (default 5)

- **Scheduled upload interval**: the upload interval in seconds for the scheduled strategy (default 60)

- **AI-generated commit messages**: whether to use AI to generate commit messages (recommended)

- **Commit convention**: Angular or Gitmoji

- **Commit language**: Chinese, English or Japanese

- **Auto commit**: whether to run `git commit` automatically

- **Auto push**: whether to push to the remote repository automatically

- **Confirm before uploading**: whether you must confirm each upload

- **Enable notifications**: whether notifications are enabled

The configuration is saved to `.codesync-agent.json` in the project root.

### 3. Start the agent

```bash
codesync agent start
```

Once started you will see:

```
🤖 CodeSync Agent starting...
──────────────────────────────────────────────────
✅ Agent started

📋 Configuration:
  Watch path: .
  Upload strategy: smart
  AI generation: enabled
  Auto commit: enabled
  Auto push: enabled
  Confirmation required: yes

💡 Tip:
  The agent watches for file changes and uploads automatically
  Press Ctrl+C to stop the agent
```

### 4. Get to work

You can now develop normally — the agent automatically:

1. Watches for file changes
2. Accumulates changes (depending on the strategy)
3. Generates a commit message (if the AI is enabled)
4. Commits automatically
5. Pushes to the remote repository

When files change you will see:

```
📝 ADD: src/newfile.js
📝 CHANGE: src/index.js
📤 Preparing to upload 2 files...
  Staging files...
  AI generating commit message...
  Commit message: feat(api): add new API endpoint
  Committing changes...
  Pushing to remote...
✅ Upload succeeded
```

### 5. Stop the agent

Press `Ctrl+C` to stop the agent. It will:

- Stop watching files
- Process the pending files (optional)
- Show the statistics

```
Received stop signal...
Stopping the agent...
3 files pending upload
Upload them before stopping? [Y/n] y
📤 Preparing to upload 3 files...
...
✅ Upload succeeded

📊 Statistics:
──────────────────────────────────────────────────
  Total commits: 12
  Total files: 34
  Running time: 1800s
  Last commit: 2026-10-20 15:30:45

✅ Agent stopped
```

---

## 📋 Upload Strategies in Detail

### Smart (recommended)

The smart strategy decides when to upload based on the following factors:

1. **File count**: upload immediately once the pending files reach the batch threshold (default 5)
2. **Important files**: upload immediately when an important file is detected (`package.json`, `.env`, `README.md`, etc.)
3. **Scheduled upload**: if the threshold is not reached, upload after the configured interval

Suitable for most development scenarios.

### Immediate

Uploads right after every file change.

**Pros**: near real-time, almost no latency
**Cons**: frequent commits, which may create a lot of commit history

Suitable for: real-time backup scenarios.

### Batch

Uploads once the configured number of file changes has accumulated.

**Pros**: fewer commits, a cleaner commit history
**Cons**: delayed, a failed batch has to be retried

Suitable for: bulk file modifications.

### Scheduled

Uploads at a fixed interval, regardless of how many files changed.

**Pros**: predictable commit rhythm
**Cons**: the delay can be long

Suitable for: scheduled backups and continuous integration.

---

## 🔧 Advanced Usage

### Command-line options

```bash
# Choose the upload strategy
codesync agent start --strategy immediate

# Batch upload with a threshold of 10
codesync agent start --strategy batch --batch-size 10

# Scheduled upload every 120 seconds
codesync agent start --strategy scheduled --interval 120

# Disable AI generation
codesync agent start --no-ai

# Skip the confirmation prompt
codesync agent start --yes

# Disable auto push
codesync agent start --no-push

# Use the Gitmoji convention
codesync agent start --convention gitmoji

# English commit messages
codesync agent start --language en
```

### Check the status

```bash
codesync agent status
```

Output:

```
📊 Agent status:
──────────────────────────────────────────────────
  Running state: running
  Pending files: 3
  Total commits: 12
  Total files: 34
  Last commit: 2026-10-20 15:30:45

  Pending files:
    - src/newfile.js
    - src/utils.js
    - README.md

⚙️  Configuration:
  Strategy: smart
  AI generation: enabled
  Auto commit: enabled
  Auto push: enabled
```

### Configuration file

Edit `.codesync-agent.json` to customize the behavior:

```json
{
  "strategy": "smart",
  "batchSize": 5,
  "interval": 60000,
  "useAI": true,
  "commitConvention": "angular",
  "commitLanguage": "zh",
  "autoCommit": true,
  "autoPush": true,
  "requireConfirmation": true,
  "notify": false,
  "ignored": [
    "**/node_modules/**",
    "**/.git/**",
    "**/dist/**",
    "**/build/**",
    "**/.DS_Store",
    "**/*.log"
  ]
}
```

**Configuration reference**:

- `strategy`: the upload strategy
- `batchSize`: the batch upload threshold
- `interval`: the scheduled upload interval (milliseconds)
- `useAI`: whether AI generates the commit message
- `commitConvention`: the commit convention (angular/gitmoji)
- `commitLanguage`: the commit language (zh/en/ja)
- `autoCommit`: whether to commit automatically
- `autoPush`: whether to push automatically
- `requireConfirmation`: whether a confirmation is required
- `notify`: whether notifications are enabled
- `ignored`: the ignored file/directory patterns

---

## 💡 Tips

### 1. Combine it with CI/CD

Once the agent pushes automatically, it can trigger your CI/CD pipeline:

```bash
# Configure the webhook
codesync ci install --platform github
```

### 2. Team collaboration

Team members can share the `.codesync-agent.json` file to keep the commit behavior consistent.

### 3. Development vs production

Different environments can use different configurations:

```bash
# Development: upload immediately, with confirmation
codesync agent start --strategy immediate --yes

# Production: batch upload, no confirmation
codesync agent start --strategy batch --yes
```

### 4. Multiple projects

Every project can have its own configuration file; use `--path` to point at the project directory:

```bash
codesync agent start --path /path/to/project
```

---

## ⚠️ Things to watch out for

1. **First run**: keep `requireConfirmation` enabled until you are sure the agent behaves as expected
2. **Sensitive files**: make sure sensitive files such as `.env` are in `.gitignore`
3. **Large files**: changes to large files can slow the upload down — exclude them in `ignored`
4. **Network**: keep the network stable to avoid failed pushes
5. **Conflicts**: when several people work on the same repository, handle merge conflicts carefully

---

## 🐛 Troubleshooting

### The agent does not start

**Problem**: "The current directory is not a Git repository"

**Fix**: run it from the root of the Git repository.

### The push fails

**Problem**: "Push failed (there may be no remote repository)"

**Fix**:
1. Configure the remote: `git remote add origin <url>`
2. Or disable auto push: `codesync agent start --no-push`

### AI generation fails

**Problem**: "Failed to generate the commit message with AI"

**Fix**:
1. Check the API key configuration: `codesync config --list`
2. Disable the AI: `codesync agent start --no-ai`

### Files are not watched

**Problem**: editing a file does not trigger an upload

**Fix**:
1. Check whether the file is in the `ignored` list
2. Check whether the file path is correct
3. Check the agent status: `codesync agent status`

---

## 📚 Related commands

```bash
# Configuration
codesync config --list
codesync config set apiKey=sk-xxx

# Manual upload
codesync upload --platform github --name my-project

# Git operations
codesync git status
codesync git log

# Show the agent configuration reference
codesync agent config
```

---

## 🎯 Best practices

1. **First run**: start with `codesync agent-init` to configure the agent
2. **Testing phase**: enable `requireConfirmation` to observe the behavior
3. **Production**: disable the confirmation and pick a suitable strategy
4. **Team collaboration**: share the configuration file to stay consistent
5. **Regular checks**: use `codesync agent status` to inspect the state
6. **Graceful stop**: press Ctrl+C to stop and process the pending files

---

## 📞 Support

If you run into a problem, see:

- Main documentation: `README.md`
- Implementation report: `IMPLEMENTATION_REPORT.md`
- Roadmap: `EXTENSIONS.md`
