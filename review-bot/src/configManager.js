import dotenv from 'dotenv';
import 'dotenv/config';

export class ConfigManager {
  constructor() {
    this.loadConfig();
  }

  loadConfig() {
    // OpenAI Configuration
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.openaiApiBase = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';
    this.openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    // GitHub Configuration
    this.githubToken = process.env.GITHUB_TOKEN || '';
    this.githubWebhookSecret = process.env.GITHUB_WEBHOOK_SECRET || '';

    // GitLab Configuration
    this.gitlabToken = process.env.GITLAB_TOKEN || '';
    this.gitlabWebhookToken = process.env.GITLAB_WEBHOOK_TOKEN || '';
    this.gitlabUrl = process.env.GITLAB_URL || 'https://gitlab.com';

    // Review Configuration
    this.reviewEnabled = process.env.REVIEW_ENABLED !== 'false';
    this.reviewSeverity = process.env.REVIEW_SEVERITY || 'medium'; // low, medium, high
    this.reviewLanguage = process.env.REVIEW_LANGUAGE || 'en';
    this.maxReviewFiles = parseInt(process.env.MAX_REVIEW_FILES || '10', 10);
    this.maxDiffSize = parseInt(process.env.MAX_DIFF_SIZE || '10000', 10); // characters

    // Whitelist/Blacklist
    this.whitelistedUsers = (process.env.WHITELISTED_USERS || '').split(',').filter(Boolean);
    this.blacklistedFiles = (process.env.BLACKLISTED_FILES || '').split(',').filter(Boolean);
  }

  get openaiConfig() {
    return {
      apiKey: this.openaiApiKey,
      apiBase: this.openaiApiBase,
      model: this.openaiModel
    };
  }

  get githubConfig() {
    return {
      token: this.githubToken,
      webhookSecret: this.githubWebhookSecret
    };
  }

  get gitlabConfig() {
    return {
      token: this.gitlabToken,
      webhookToken: this.gitlabWebhookToken,
      url: this.gitlabUrl
    };
  }

  get reviewConfig() {
    return {
      enabled: this.reviewEnabled,
      severity: this.reviewSeverity,
      language: this.reviewLanguage,
      maxFiles: this.maxReviewFiles,
      maxDiffSize: this.maxDiffSize,
      whitelistedUsers: this.whitelistedUsers,
      blacklistedFiles: this.blacklistedFiles
    };
  }

  validate() {
    const errors = [];

    if (!this.openaiApiKey) {
      errors.push('OPENAI_API_KEY is required');
    }

    if (!this.githubToken && !this.gitlabToken) {
      errors.push('At least one of GITHUB_TOKEN or GITLAB_TOKEN is required');
    }

    return errors;
  }
}
