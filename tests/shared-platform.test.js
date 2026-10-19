import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('🔄 Running tests for shared/platform/...');

try {
  const platformDir = path.join(process.cwd(), 'shared', 'platform');

  const githubPath = path.join(platformDir, 'github.js');
  const giteePath = path.join(platformDir, 'gitee.js');
  const gitlabPath = path.join(platformDir, 'gitlab.js');
  const indexPath = path.join(platformDir, 'index.js');

  assert.ok(fs.existsSync(githubPath), 'github.js should exist');
  assert.ok(fs.existsSync(giteePath), 'gitee.js should exist');
  assert.ok(fs.existsSync(gitlabPath), 'gitlab.js should exist');
  assert.ok(fs.existsSync(indexPath), 'index.js should exist');

  const { createGitHubRepo, getGitHubUser } = await import('../shared/platform/github.js');
  assert.strictEqual(typeof createGitHubRepo, 'function', 'createGitHubRepo should be a function');
  assert.strictEqual(typeof getGitHubUser, 'function', 'getGitHubUser should be a function');

  const { createGiteeRepo, getGiteeUser } = await import('../shared/platform/gitee.js');
  assert.strictEqual(typeof createGiteeRepo, 'function', 'createGiteeRepo should be a function');
  assert.strictEqual(typeof getGiteeUser, 'function', 'getGiteeUser should be a function');

  const { createGitLabRepo, getGitLabUser } = await import('../shared/platform/gitlab.js');
  assert.strictEqual(typeof createGitLabRepo, 'function', 'createGitLabRepo should be a function');
  assert.strictEqual(typeof getGitLabUser, 'function', 'getGitLabUser should be a function');

  const platformIndex = await import('../shared/platform/index.js');
  assert.strictEqual(typeof platformIndex.createGitHubRepo, 'function', 'index should export createGitHubRepo');
  assert.strictEqual(typeof platformIndex.createGiteeRepo, 'function', 'index should export createGiteeRepo');
  assert.strictEqual(typeof platformIndex.createGitLabRepo, 'function', 'index should export createGitLabRepo');

  console.log('✅ All shared/platform tests passed!');
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}