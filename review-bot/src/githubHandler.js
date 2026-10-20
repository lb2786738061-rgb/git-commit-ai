import { Octokit } from 'octokit';
import { AIReviewer } from './aiReviewer.js';

export class GitHubWebhookHandler {
  constructor(config) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.githubConfig.token
    });
    this.aiReviewer = new AIReviewer(config.openaiConfig, config.reviewConfig);
  }

  async handlePullRequest(payload) {
    const action = payload.action;
    const pr = payload.pull_request;
    const repository = payload.repository;

    console.log(`[GitHub] PR #${pr.number} - ${action}`);

    // Only review on opened or synchronize events
    if (action !== 'opened' && action !== 'synchronize') {
      console.log(`[GitHub] Skipping action: ${action}`);
      return;
    }

    // Check if review is enabled
    if (!this.config.reviewConfig.enabled) {
      console.log('[GitHub] Review is disabled');
      return;
    }

    // Check if user is whitelisted
    const author = pr.user.login;
    if (this.config.reviewConfig.whitelistedUsers.length > 0 &&
        !this.config.reviewConfig.whitelistedUsers.includes(author)) {
      console.log(`[GitHub] User ${author} is not whitelisted`);
      return;
    }

    try {
      // Fetch PR diff
      const diff = await this.fetchPRDiff(repository.owner.login, repository.name, pr.number);

      // Review with AI
      const review = await this.aiReviewer.review(diff, pr.title, pr.body);

      // Post review comment
      await this.postReviewComment(
        repository.owner.login,
        repository.name,
        pr.number,
        review
      );

      console.log(`[GitHub] Review posted for PR #${pr.number}`);
    } catch (error) {
      console.error('[GitHub] Error reviewing PR:', error);
    }
  }

  async fetchPRDiff(owner, repo, prNumber) {
    const response = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      mediaType: {
        format: 'diff'
      }
    });

    return response.data;
  }

  async postReviewComment(owner, repo, prNumber, review) {
    // Post as a comment on the PR
    await this.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: review
    });
  }
}
