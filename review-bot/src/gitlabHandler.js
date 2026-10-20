import { Gitlab } from '@gitbeaker/node';
import { AIReviewer } from './aiReviewer.js';

export class GitLabWebhookHandler {
  constructor(config) {
    this.config = config;
    this.gitlab = new Gitlab({
      token: config.gitlabConfig.token,
      host: config.gitlabConfig.url
    });
    this.aiReviewer = new AIReviewer(config.openaiConfig, config.reviewConfig);
  }

  async handleMergeRequest(payload) {
    const action = payload.object_attributes.action;
    const mr = payload.object_attributes;
    const project = payload.project;

    console.log(`[GitLab] MR !${mr.iid} - ${action}`);

    // Only review on opened or update events
    if (action !== 'open' && action !== 'update') {
      console.log(`[GitLab] Skipping action: ${action}`);
      return;
    }

    // Check if review is enabled
    if (!this.config.reviewConfig.enabled) {
      console.log('[GitLab] Review is disabled');
      return;
    }

    // Check if user is whitelisted
    const author = mr.author.username;
    if (this.config.reviewConfig.whitelistedUsers.length > 0 &&
        !this.config.reviewConfig.whitelistedUsers.includes(author)) {
      console.log(`[GitLab] User ${author} is not whitelisted`);
      return;
    }

    try {
      // Fetch MR diff
      const diff = await this.fetchMRDiff(project.id, mr.iid);

      // Review with AI
      const review = await this.aiReviewer.review(diff, mr.title, mr.description);

      // Post review comment
      await this.postReviewComment(project.id, mr.iid, review);

      console.log(`[GitLab] Review posted for MR !${mr.iid}`);
    } catch (error) {
      console.error('[GitLab] Error reviewing MR:', error);
    }
  }

  async fetchMRDiff(projectId, mrIid) {
    const mr = await this.gitlab.MergeRequests.show(projectId, mrIid);
    const diffs = await this.gitlab.MergeRequests.allDiffs(projectId, mrIid);

    return diffs.map(d => d.diff).join('\n');
  }

  async postReviewComment(projectId, mrIid, review) {
    await this.gitlab.MergeRequests.addNote(projectId, mrIid, review);
  }
}
