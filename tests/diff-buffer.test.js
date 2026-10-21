import assert from 'assert';
import { GitOperations } from '../shared/git/operations.js';

console.log('🔄 正在运行 Git 大规模 Diff 与缓冲区溢出降级测试...');

try {
  const git = new GitOperations(process.cwd());

  // 1. 测试 isBufferOverflow 能够识别 ENOBUFS 及 maxBuffer 溢出
  const enobufsError = new Error('spawnSync git ENOBUFS');
  enobufsError.code = 'ENOBUFS';
  assert.strictEqual(git.isBufferOverflow(enobufsError), true, '应该正确识别 code 为 ENOBUFS 的错误');

  const maxBufferError = new Error('maxBuffer length exceeded');
  assert.strictEqual(git.isBufferOverflow(maxBufferError), true, '应该正确识别包含 maxBuffer 的错误信息');

  const otherError = new Error('Permission denied');
  assert.strictEqual(git.isBufferOverflow(otherError), false, '普通错误不应被判定为溢出');

  // 2. 测试 getFallbackDiff 降级能力
  const fallbackStaged = git.getFallbackDiff(true);
  assert.ok(typeof fallbackStaged === 'string' && fallbackStaged.length > 0, '降级返回必须是非空字符串');
  assert.ok(fallbackStaged.includes('项目改动规模较大'), '降级内容中应包含友好提示');

  const fallbackUnstaged = git.getFallbackDiff(false);
  assert.ok(typeof fallbackUnstaged === 'string' && fallbackUnstaged.length > 0, '未暂存降级返回必须是非空字符串');

  console.log('✅ Git 大规模 Diff 与缓冲区溢出降级测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
