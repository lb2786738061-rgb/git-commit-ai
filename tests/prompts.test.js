import assert from 'assert';
import { getSystemPrompt } from '../src/prompts.js';

console.log('🔄 正在运行 prompts.js 的单元测试...');

try {
  const angularPrompt = getSystemPrompt('angular');
  const gitmojiPrompt = getSystemPrompt('gitmoji');

  // 验证提示词是否定义
  assert.ok(angularPrompt, 'Angular 提示词应正常定义');
  assert.ok(gitmojiPrompt, 'Gitmoji 提示词应正常定义');

  // 验证提示词中是否包含了正确的规范特征词
  assert.ok(angularPrompt.includes('Conventional Commits'), 'Angular 提示词中应包含 "Conventional Commits" 规范描述');
  assert.ok(gitmojiPrompt.includes('Gitmoji'), 'Gitmoji 提示词中应包含 "Gitmoji" 规范描述');

  // 验证表情符号映射关系是否存在于 Gitmoji 提示词中
  assert.ok(gitmojiPrompt.includes('✨ feat:'), 'Gitmoji 提示词中应定义 ✨ feat: 表情');
  assert.ok(gitmojiPrompt.includes('🐛 fix:'), 'Gitmoji 提示词中应定义 🐛 fix: 表情');
  assert.ok(gitmojiPrompt.includes('📝 docs:'), 'Gitmoji 提示词中应定义 📝 docs: 表情');
  assert.ok(gitmojiPrompt.includes('♻️ refactor:'), 'Gitmoji 提示词中应定义 ♻️ refactor: 表情');

  console.log('✅ 所有提示词测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
