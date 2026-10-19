import assert from 'assert';
import { amendCommit, squashCommits, createBranch, getCurrentBranch } from '../src/git.js';

console.log('🔄 正在运行 Git 扩展操作的单元测试...');

try {
  // 测试函数存在性
  assert.strictEqual(typeof amendCommit, 'function', 'amendCommit 应该是一个函数');
  assert.strictEqual(typeof squashCommits, 'function', 'squashCommits 应该是一个函数');
  assert.strictEqual(typeof createBranch, 'function', 'createBranch 应该是一个函数');
  assert.strictEqual(typeof getCurrentBranch, 'function', 'getCurrentBranch 应该是一个函数');

  console.log('✅ 所有 Git 扩展操作单元测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
