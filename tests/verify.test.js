import assert from 'assert';
import { verifyCommitMessage } from '../src/verify.js';

console.log('🔄 正在运行 verify 的单元测试...');

try {
  // 1. 测试常规 Conventional Commits (Angular)
  assert.deepStrictEqual(verifyCommitMessage('feat(cli): add verification command', 'angular'), { valid: true });
  assert.deepStrictEqual(verifyCommitMessage('fix: resolve memory leak', 'angular'), { valid: true });
  assert.deepStrictEqual(verifyCommitMessage('chore(deps)!: upgrade commander', 'angular'), { valid: true });
  
  // 校验无效 Angular 格式
  const res1 = verifyCommitMessage('added a new feature to code', 'angular');
  assert.strictEqual(res1.valid, false);
  assert.ok(res1.reason.includes('不符合 Conventional Commits 规范'));

  const res2 = verifyCommitMessage('feat: ', 'angular');
  assert.strictEqual(res2.valid, false);

  // 2. 测试 Gitmoji 格式
  assert.deepStrictEqual(verifyCommitMessage('✨ feat(auth): add google login', 'gitmoji'), { valid: true });
  assert.deepStrictEqual(verifyCommitMessage(':bug: fix: resolve null crash', 'gitmoji'), { valid: true });
  
  // 校验无效 Gitmoji 格式
  const res3 = verifyCommitMessage('feat(auth): add google login', 'gitmoji');
  assert.strictEqual(res3.valid, false);
  assert.ok(res3.reason.includes('Gitmoji 规范要求消息开头必须包含一个 Emoji'));

  const res4 = verifyCommitMessage('✨ feat: ', 'gitmoji');
  assert.strictEqual(res4.valid, false);

  // 3. 测试豁免机制
  assert.deepStrictEqual(verifyCommitMessage('Merge branch \'main\' into developer', 'angular'), { valid: true });
  assert.deepStrictEqual(verifyCommitMessage('Revert "feat: add button"', 'angular'), { valid: true });
  assert.deepStrictEqual(verifyCommitMessage('revert: feat: add button', 'angular'), { valid: true });
  assert.deepStrictEqual(verifyCommitMessage('Initial commit', 'angular'), { valid: true });
  assert.deepStrictEqual(verifyCommitMessage('init project structure', 'angular'), { valid: true });

  // 4. 测试超出长度限制 (100字符)
  const longSubject = 'feat(very-long-scope-name-for-demonstration-purposes): this subject is intentionally made very long to exceed the maximum character limit of one hundred';
  const res5 = verifyCommitMessage(longSubject, 'angular');
  assert.strictEqual(res5.valid, false);
  assert.ok(res5.reason.includes('超过了最大限制'));

  // 5. 空消息测试
  const res6 = verifyCommitMessage('');
  assert.strictEqual(res6.valid, false);
  assert.ok(res6.reason.includes('不能为空'));

  console.log('✅ 所有 verify 单元测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
