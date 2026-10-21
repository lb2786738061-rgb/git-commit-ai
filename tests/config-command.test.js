import assert from 'assert';
import { configCommand } from '../cli/src/commands/config.js';
import { readConfig, writeConfig } from '../shared/config.js';

console.log('🔄 正在运行 configCommand 参数兼容性测试...');

try {
  // 备份原配置
  const originalConfig = readConfig();

  // 1. 测试 codesync config set model=test-model-1
  await configCommand('set', ['model=test-model-1']);
  let updated = readConfig();
  assert.strictEqual(updated.model, 'test-model-1', '应该支持 set key=value');

  // 2. 测试 codesync config set model test-model-2 (空格分隔)
  await configCommand('set', ['model', 'test-model-2']);
  updated = readConfig();
  assert.strictEqual(updated.model, 'test-model-2', '应该支持 set key value (空格分隔)');

  // 3. 测试 codesync config model=test-model-3 (直接等号)
  await configCommand('model=test-model-3');
  updated = readConfig();
  assert.strictEqual(updated.model, 'test-model-3', '应该支持直接传 key=value');

  // 4. 测试原有 options 方式 codesync config --set model=test-model-4
  await configCommand({ set: 'model=test-model-4' });
  updated = readConfig();
  assert.strictEqual(updated.model, 'test-model-4', '应该兼容原有 --set 选项方式');

  // 5. 测试 githubToken 设置
  await configCommand('set', ['githubToken=ghp_test12345678']);
  updated = readConfig();
  assert.strictEqual(updated.githubToken, 'ghp_test12345678', 'githubToken 应该被成功设置');

  // 还原原配置
  writeConfig(originalConfig);

  console.log('✅ configCommand 参数兼容性测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
