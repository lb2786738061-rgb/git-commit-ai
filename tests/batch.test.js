import assert from 'assert';
import { getFileDiff, stageFile, unstageFile } from '../src/git.js';

console.log('🔄 正在运行 batch 功能的单元测试...');

try {
  // 测试 getFileDiff 函数存在
  assert.strictEqual(typeof getFileDiff, 'function', 'getFileDiff 应该是一个函数');
  assert.strictEqual(typeof stageFile, 'function', 'stageFile 应该是一个函数');
  assert.strictEqual(typeof unstageFile, 'function', 'unstageFile 应该是一个函数');

  console.log('✅ 所有 batch 功能单元测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
