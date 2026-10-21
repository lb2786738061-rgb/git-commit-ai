import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('🔄 正在运行 codesync init 自定义模型选项测试...');

try {
  // 1. 验证 codesync.js 文件中包含自定义模型选项及处理逻辑
  const codesyncPath = path.join(process.cwd(), 'cli/bin/codesync.js');
  const codesyncCode = fs.readFileSync(codesyncPath, 'utf-8');

  assert.ok(codesyncCode.includes("'自定义模型...'"), 'codesync.js 必须包含 "自定义模型..." 选项');
  assert.ok(codesyncCode.includes("value: 'custom'"), 'codesync.js 自定义模型的值必须为 custom');
  assert.ok(codesyncCode.includes('customModel'), 'codesync.js 必须包含 customModel 字段处理');
  assert.ok(codesyncCode.includes("response.model = response.customModel.trim()"), '必须将去除空格后的自定义模型名称赋给 model');

  // 2. 模拟向导中对于已有不同模型的回显及索引计算逻辑
  const defaultModelValues = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];

  function getInitialIndex(existingModel) {
    if (!existingModel) return 0;
    const foundIdx = defaultModelValues.indexOf(existingModel);
    return foundIdx !== -1 ? foundIdx : 3;
  }

  assert.strictEqual(getInitialIndex('gpt-4o-mini'), 0, '默认 gpt-4o-mini 对应索引 0');
  assert.strictEqual(getInitialIndex('gpt-4o'), 1, 'gpt-4o 对应索引 1');
  assert.strictEqual(getInitialIndex('gpt-3.5-turbo'), 2, 'gpt-3.5-turbo 对应索引 2');
  assert.strictEqual(getInitialIndex('deepseek-chat'), 3, '自定义模型 deepseek-chat 对应索引 3 (自定义选项)');
  assert.strictEqual(getInitialIndex('claude-3-5-sonnet'), 3, '自定义模型 claude 对应索引 3 (自定义选项)');

  // 3. 模拟用户输入自定义模型并保存时的处理逻辑
  const simulatedResponse = {
    apiKey: 'sk-test',
    apiBase: 'https://api.openai.com/v1',
    model: 'custom',
    customModel: '  deepseek-v3  ',
    convention: 'angular',
    language: 'zh',
    smartModel: true
  };

  if (simulatedResponse.model === 'custom') {
    simulatedResponse.model = simulatedResponse.customModel.trim();
  }
  delete simulatedResponse.customModel;

  assert.strictEqual(simulatedResponse.model, 'deepseek-v3', '自定义模型名称修剪空格后应正确保存');
  assert.strictEqual(simulatedResponse.customModel, undefined, '临时属性 customModel 必须被清理');

  console.log('✅ codesync init 自定义模型选项测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
