import assert from 'assert';
import { getDetailedCommitHistory } from '../src/git.js';

console.log('🔄 正在运行 analyze 功能的单元测试...');

try {
  // 测试获取详细提交历史
  const history = getDetailedCommitHistory();
  assert.ok(Array.isArray(history), '应返回数组');
  
  if (history.length > 0) {
    const firstCommit = history[0];
    assert.ok(firstCommit.hash, '提交应包含 hash');
    assert.ok(firstCommit.type, '提交应包含 type');
    assert.ok(firstCommit.subject, '提交应包含 subject');
    assert.ok(firstCommit.author, '提交应包含 author');
    assert.ok(firstCommit.date, '提交应包含 date');
    
    // 验证 hash 格式
    assert.ok(/^[a-f0-9]{8}$/.test(firstCommit.hash), 'hash 应为 8 位十六进制');
    
    // 验证日期格式
    assert.ok(/^\d{4}-\d{2}-\d{2}/.test(firstCommit.date), '日期应为 ISO 格式');
  }

  console.log('✅ 所有 analyze 功能单元测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
