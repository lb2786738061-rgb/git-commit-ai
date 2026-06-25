import assert from 'assert';
import { getChangelogPrompt } from '../src/prompts.js';
import { getCommitHistory, getLatestTags } from '../src/git.js';

console.log('🔄 正在运行 changelog 的单元测试...');

try {
  // 1. 测试 getChangelogPrompt
  const promptEn = getChangelogPrompt('en');
  assert.ok(promptEn.includes('English'), '英文提示词应包含 English');

  const promptZh = getChangelogPrompt('zh');
  assert.ok(promptZh.includes('Chinese') || promptZh.includes('Simplified Chinese'), '中文提示词应包含 Chinese');

  const promptJa = getChangelogPrompt('ja');
  assert.ok(promptJa.includes('Japanese'), '日文提示词应包含 Japanese');

  // 2. 测试 Git 提交记录与 Tag 查询的健壮性
  // 鉴于测试在实际的 git 仓库（E:\projects\git-commit-ai）中执行
  const tags = getLatestTags();
  assert.ok(Array.isArray(tags), '获取 tags 应返回一个数组');

  const history = getCommitHistory();
  assert.ok(Array.isArray(history), '默认获取提交历史应返回一个数组');
  if (history.length > 0) {
    // 检查提交记录格式
    assert.ok(history[0].match(/^[a-f0-9]+ .+/), '历史记录行格式应形如 "hash message"');
  }

  console.log('✅ 所有 changelog 单元测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
