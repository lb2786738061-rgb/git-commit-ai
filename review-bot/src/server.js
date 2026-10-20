import express from 'express';
import bodyParser from 'body-parser';
import { GitHubWebhookHandler } from './githubHandler.js';
import { GitLabWebhookHandler } from './gitlabHandler.js';
import { ConfigManager } from './configManager.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// Load configuration
const config = new ConfigManager();

// Initialize webhook handlers
const githubHandler = new GitHubWebhookHandler(config);
const gitlabHandler = new GitLabWebhookHandler(config);

// Middleware
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CodeSync Review Bot is running' });
});

// GitHub webhook endpoint
app.post('/webhook/github', async (req, res) => {
  try {
    const event = req.headers['x-github-event'];
    const signature = req.headers['x-hub-signature-256'];

    console.log(`[GitHub] Received event: ${event}`);

    // Verify webhook signature (optional, recommended for production)
    if (config.githubWebhookSecret) {
      // TODO: Implement signature verification
    }

    if (event === 'pull_request') {
      await githubHandler.handlePullRequest(req.body);
    }

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('[GitHub] Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// GitLab webhook endpoint
app.post('/webhook/gitlab', async (req, res) => {
  try {
    const event = req.headers['x-gitlab-event'];
    const token = req.headers['x-gitlab-token'];

    console.log(`[GitLab] Received event: ${event}`);

    // Verify webhook token (optional, recommended for production)
    if (config.gitlabWebhookToken && token !== config.gitlabWebhookToken) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (event === 'Merge Request Hook') {
      await gitlabHandler.handleMergeRequest(req.body);
    }

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('[GitLab] Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 CodeSync Review Bot is running on port ${PORT}`);
  console.log(`📡 GitHub webhook: http://localhost:${PORT}/webhook/github`);
  console.log(`📡 GitLab webhook: http://localhost:${PORT}/webhook/gitlab`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
