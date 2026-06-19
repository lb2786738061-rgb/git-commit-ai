import assert from 'assert';
import { getSystemPrompt } from '../src/prompts.js';

console.log('🔄 正在运行 prompts.js 的单元测试...');

try {
  const angularPrompt = getSystemPrompt('angular');
  const gitmojiPrompt = getSystemPrompt('gitmoji');
  const chinesePrompt = getSystemPrompt('angular', 'zh');
  const japanesePrompt = getSystemPrompt('gitmoji', 'ja');

  // 验证提示词是否定义
  assert.ok(angularPrompt, 'Angular 提示词应正常定义');
  assert.ok(gitmojiPrompt, 'Gitmoji 提示词应正常定义');
  assert.ok(chinesePrompt, '中文提示词应正常定义');
  assert.ok(japanesePrompt, '日文提示词应正常定义');

  // 验证语言提示词中是否包含了对应语言指示
  assert.ok(chinesePrompt.includes('Chinese') || chinesePrompt.includes('Simplified Chinese'), '中文提示词中应包含 "Chinese" 语言约束');
  assert.ok(japanesePrompt.includes('Japanese'), '日文提示词中应包含 "Japanese" 语言约束');
  assert.ok(chinesePrompt.includes('Do NOT translate the commit <type>'), '非英文提示词中应包含不翻译 <type> 的指示');

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
