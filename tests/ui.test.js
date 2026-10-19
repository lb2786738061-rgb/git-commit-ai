import assert from 'assert';
import { getTheme, setTheme } from '../src/theme.js';

console.log('🔄 正在运行 UI 增强功能的单元测试...');

try {
  // 测试获取默认主题
  const defaultTheme = getTheme('default');
  assert.ok(defaultTheme, '应能获取默认主题');
  assert.strictEqual(typeof defaultTheme.cyan, 'function', 'cyan 应为函数');
  assert.strictEqual(typeof defaultTheme.green, 'function', 'green 应为函数');

  // 测试获取最小化主题
  const minimalTheme = getTheme('minimal');
  assert.ok(minimalTheme, '应能获取最小化主题');

  // 测试获取彩色主题
  const colorfulTheme = getTheme('colorful');
  assert.ok(colorfulTheme, '应能获取彩色主题');

  // 测试无效主题名称回退到默认
  const invalidTheme = getTheme('invalid-theme-name');
  assert.strictEqual(invalidTheme, defaultTheme, '无效主题应回退到默认主题');

  // 测试主题函数调用
  const result = defaultTheme.cyan('test');
  assert.strictEqual(typeof result, 'string', '主题函数应返回字符串');

  console.log('✅ 所有 UI 增强功能单元测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
