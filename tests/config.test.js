import assert from 'assert';
import { readConfig } from '../src/config.js';

console.log('🔄 Running tests for config.js...');

try {
  const config = readConfig();
  
  // Test presence of keys and format
  assert.ok(config, 'Config object should be defined');
  assert.ok(typeof config.apiKey === 'string', 'apiKey should be a string');
  assert.ok(config.apiBase.startsWith('http'), 'apiBase should be a valid URL');
  assert.ok(config.model.length > 0, 'model name should not be empty');
  assert.ok(typeof config.convention === 'string', '规范配置项必须为字符串');
  assert.ok(['angular', 'gitmoji'].includes(config.convention), '规范配置项的值不合法');
  assert.ok(typeof config.language === 'string', '语言配置项必须为字符串');
  
  console.log('✅ All config tests passed successfully!');
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}
