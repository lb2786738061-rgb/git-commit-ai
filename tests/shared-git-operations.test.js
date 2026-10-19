import assert from 'assert';
import { GitOperations } from '../shared/git/operations.js';

console.log('🔄 Running tests for shared/git/operations.js...');

try {
  assert.strictEqual(typeof GitOperations, 'function', 'GitOperations should be a class');
  assert.strictEqual(typeof GitOperations.isGitRepository, 'function', 'isGitRepository should be static');

  const git = new GitOperations(process.cwd());
  assert.strictEqual(typeof git.init, 'function', 'init should be a function');
  assert.strictEqual(typeof git.addAll, 'function', 'addAll should be a function');
  assert.strictEqual(typeof git.addFile, 'function', 'addFile should be a function');
  assert.strictEqual(typeof git.commit, 'function', 'commit should be a function');
  assert.strictEqual(typeof git.push, 'function', 'push should be a function');
  assert.strictEqual(typeof git.pull, 'function', 'pull should be a function');
  assert.strictEqual(typeof git.status, 'function', 'status should be a function');
  assert.strictEqual(typeof git.log, 'function', 'log should be a function');
  assert.strictEqual(typeof git.getDiff, 'function', 'getDiff should be a function');
  assert.strictEqual(typeof git.getStagedDiff, 'function', 'getStagedDiff should be a function');
  assert.strictEqual(typeof git.filterDiff, 'function', 'filterDiff should be a function');
  assert.strictEqual(typeof git.addRemote, 'function', 'addRemote should be a function');
  assert.strictEqual(typeof git.setBranch, 'function', 'setBranch should be a function');
  assert.strictEqual(typeof git.getCurrentBranch, 'function', 'getCurrentBranch should be a function');
  assert.strictEqual(typeof git.reset, 'function', 'reset should be a function');
  assert.strictEqual(typeof git.amend, 'function', 'amend should be a function');
  assert.strictEqual(typeof git.createBranch, 'function', 'createBranch should be a function');
  assert.strictEqual(typeof git.squash, 'function', 'squash should be a function');
  assert.strictEqual(typeof git.getFileDiff, 'function', 'getFileDiff should be a function');
  assert.strictEqual(typeof git.stageFile, 'function', 'stageFile should be a function');
  assert.strictEqual(typeof git.unstageFile, 'function', 'unstageFile should be a function');
  assert.strictEqual(typeof git.getDetailedCommitHistory, 'function', 'getDetailedCommitHistory should be a function');

  const testDiff = `diff --git a/package-lock.json b/package-lock.json
--- a/package-lock.json
+++ b/package-lock.json
@@ -1,1 +1,1 @@
-old
+new
diff --git a/src/index.js b/src/index.js
--- a/src/index.js
+++ b/src/index.js
@@ -1,1 +1,1 @@
-old
+new
diff --git a/image.png b/image.png
Binary files differ`;

  const filtered = git.filterDiff(testDiff);
  assert.ok(!filtered.includes('package-lock.json'), 'Should filter out lockfiles');
  assert.ok(!filtered.includes('image.png'), 'Should filter out binary files');
  assert.ok(filtered.includes('src/index.js'), 'Should keep source files');

  console.log('✅ All shared/git/operations tests passed!');
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}