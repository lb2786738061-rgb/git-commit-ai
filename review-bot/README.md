# CodeSync AI Code Review Bot

Automated PR/MR review bot powered by AI. Integrates with GitHub and GitLab to provide intelligent code reviews on pull requests.

## Features

- 🤖 **AI-Powered Reviews**: Uses OpenAI GPT models to analyze code changes
- 🔍 **Multi-Dimension Analysis**: Reviews code quality, bugs, performance, and security
- 🎯 **Configurable Severity**: Adjust review strictness (low/medium/high)
- 🌍 **Multi-Language Support**: Generate reviews in English, Chinese, or Japanese
- 🔒 **Smart Filtering**: Skip blacklisted files and large diffs
- 👥 **User Whitelisting**: Only review PRs from specific users
- 📦 **Dual Platform**: Supports both GitHub and GitLab

## Installation

1. Clone the repository and navigate to the review-bot directory:
```bash
cd review-bot
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Configuration

### Required Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `GITHUB_TOKEN` or `GITLAB_TOKEN`: Platform token for posting reviews

### Optional Environment Variables

- `OPENAI_API_BASE`: OpenAI API base URL (default: https://api.openai.com/v1)
- `OPENAI_MODEL`: AI model to use (default: gpt-4o-mini)
- `GITHUB_WEBHOOK_SECRET`: GitHub webhook secret for signature verification
- `GITLAB_WEBHOOK_TOKEN`: GitLab webhook token for verification
- `GITLAB_URL`: GitLab instance URL (default: https://gitlab.com)
- `REVIEW_ENABLED`: Enable/disable reviews (default: true)
- `REVIEW_SEVERITY`: Review strictness (low/medium/high, default: medium)
- `REVIEW_LANGUAGE`: Review language (en/zh/ja, default: en)
- `MAX_REVIEW_FILES`: Maximum number of files to review (default: 10)
- `MAX_DIFF_SIZE`: Maximum diff size in characters (default: 10000)
- `WHITELISTED_USERS`: Comma-separated list of whitelisted users
- `BLACKLISTED_FILES`: Comma-separated list of files to skip

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The bot will start on port 3000 (configurable via PORT environment variable).

### Webhook Endpoints

- **GitHub**: `http://your-server:3000/webhook/github`
- **GitLab**: `http://your-server:3000/webhook/gitlab`
- **Health Check**: `http://your-server:3000/health`

## Setting Up Webhooks

### GitHub

1. Go to your repository Settings → Webhooks
2. Click "Add webhook"
3. Payload URL: `http://your-server:3000/webhook/github`
4. Content type: `application/json`
5. Secret: (optional) set `GITHUB_WEBHOOK_SECRET` in .env
6. Events: Select "Pull requests"
7. Click "Add webhook"

### GitLab

1. Go to your project Settings → Webhooks
2. Click "Add webhook"
3. URL: `http://your-server:3000/webhook/gitlab`
4. Secret token: (optional) set `GITLAB_WEBHOOK_TOKEN` in .env
5. Trigger: Check "Merge request events"
6. Click "Add webhook"

## Review Example

The bot will post a review comment on each PR/MR with the following structure:

```markdown
## 🤖 AI Code Review

### Summary
This PR adds user authentication functionality. The implementation is solid but has a few potential issues.

### 🔴 Critical Issues
- Line 45: Potential SQL injection vulnerability - use parameterized queries
- Line 78: Missing null check for user object

### 🟡 Suggestions
- Consider adding input validation for the email field
- The password hashing could use a stronger algorithm

### 💡 Best Practices
- Add error handling for database connection failures
- Consider using environment variables for sensitive configuration

### ✅ Good Practices
- Clean code structure
- Good use of async/await
```

## Deployment

### Using PM2

```bash
npm install -g pm2
pm2 start src/server.js --name codesync-review-bot
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t codesync-review-bot .
docker run -p 3000:3000 --env-file .env codesync-review-bot
```

## Monitoring

Check bot health:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "CodeSync Review Bot is running"
}
```

## Troubleshooting

### Bot not posting reviews

1. Check if the bot is running: `curl http://localhost:3000/health`
2. Check logs for errors
3. Verify your API keys and tokens are correct
4. Ensure webhooks are properly configured

### Review skipped

1. Check if the user is whitelisted
2. Verify the diff size is under `MAX_DIFF_SIZE`
3. Check if files are in the blacklist
4. Ensure `REVIEW_ENABLED` is set to `true`

### AI API errors

1. Verify `OPENAI_API_KEY` is correct
2. Check if you have sufficient API credits
3. Try a different model if the current one is unavailable

## License

MIT
