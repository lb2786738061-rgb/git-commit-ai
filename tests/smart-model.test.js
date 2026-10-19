import assert from 'assert';
import { readConfig, writeConfig } from '../src/config.js';

console.log('🔄 正在运行智能模型选择功能的单元测试...');

try {
  // 读取当前配置
  const config = readConfig();

  // 验证智能模型配置项在默认配置中存在
  // 如果现有配置没有这些项，writeConfig 会从 DEFAULT_CONFIG 合并
  const updatedConfig = writeConfig({});

  // 验证智能模型配置项存在
  assert.ok('smartModel' in updatedConfig, '配置应包含 smartModel 选项');
  assert.ok('fastModel' in updatedConfig, '配置应包含 fastModel 选项');
  assert.ok('powerfulModel' in updatedConfig, '配置应包含 powerfulModel 选项');
  assert.ok('complexityThreshold' in updatedConfig, '配置应包含 complexityThreshold 选项');

  // 验证默认值
  assert.strictEqual(typeof updatedConfig.smartModel, 'boolean', 'smartModel 应为布尔值');
  assert.strictEqual(typeof updatedConfig.fastModel, 'string', 'fastModel 应为字符串');
  assert.strictEqual(typeof updatedConfig.powerfulModel, 'string', 'powerfulModel 应为字符串');
  assert.strictEqual(typeof updatedConfig.complexityThreshold, 'number', 'complexityThreshold 应为数字');

  // 恢复原有配置
  writeConfig(config);

  console.log('✅ 所有智能模型选择功能单元测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
