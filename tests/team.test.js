import assert from 'assert';
import { readTeamConfig, writeTeamConfig } from '../src/config.js';
import fs from 'fs';
import path from 'path';

console.log('🔄 正在运行团队功能的单元测试...');

try {
  const cwd = process.cwd();
  const teamConfigPath = path.join(cwd, '.git-commit-ai-team.json');

  // 清理可能存在的测试文件
  if (fs.existsSync(teamConfigPath)) {
    fs.unlinkSync(teamConfigPath);
  }

  // 测试写入团队配置
  const testConfig = {
    convention: 'angular',
    language: 'en',
    enforceConventional: true,
    requireScope: false,
    maxSubjectLength: 100
  };

  const writtenPath = writeTeamConfig(testConfig);
  assert.strictEqual(writtenPath, teamConfigPath, '应返回正确的配置文件路径');
  assert.ok(fs.existsSync(teamConfigPath), '配置文件应被创建');

  // 测试读取团队配置
  const readConfig = readTeamConfig();
  assert.ok(readConfig, '应能读取配置');
  assert.strictEqual(readConfig.convention, 'angular', 'convention 应正确');
  assert.strictEqual(readConfig.language, 'en', 'language 应正确');
  assert.strictEqual(readConfig.enforceConventional, true, 'enforceConventional 应正确');

  // 清理测试文件
  fs.unlinkSync(teamConfigPath);

  // 测试不存在的配置
  const nonExistent = readTeamConfig();
  assert.strictEqual(nonExistent, null, '不存在的配置应返回 null');

  console.log('✅ 所有团队功能单元测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
