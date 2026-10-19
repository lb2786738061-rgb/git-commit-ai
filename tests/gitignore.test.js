/**
 * 测试 .gitignore 自动生成功能
 */
import { detectProjectType, generateGitignore, ensureGitignore } from '../shared/git/gitignore.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const TEST_DIR = path.join(os.tmpdir(), 'codesync-gitignore-test');

// 清理（兼容 Windows）
function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
cleanDir(TEST_DIR);
fs.mkdirSync(TEST_DIR, { recursive: true });

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log('✅', msg);
    passed++;
  } else {
    console.log('❌', msg);
    failed++;
  }
}

// ── 测试 1: .NET 项目检测 ──
{
  const dir = path.join(TEST_DIR, 'dotnet-proj');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'MyApp.csproj'), '<Project></Project>');
  const type = detectProjectType(dir);
  assert(type === 'dotnet', `检测 .NET 项目类型 (got: ${type})`);
}

// ── 测试 2: Node.js 项目检测 ──
{
  const dir = path.join(TEST_DIR, 'node-proj');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'package.json'), '{}');
  const type = detectProjectType(dir);
  assert(type === 'node', `检测 Node.js 项目类型 (got: ${type})`);
}

// ── 测试 3: Python 项目检测 ──
{
  const dir = path.join(TEST_DIR, 'python-proj');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'requirements.txt'), 'requests');
  const type = detectProjectType(dir);
  assert(type === 'python', `检测 Python 项目类型 (got: ${type})`);
}

// ── 测试 4: Java 项目检测 ──
{
  const dir = path.join(TEST_DIR, 'java-proj');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'pom.xml'), '<project></project>');
  const type = detectProjectType(dir);
  assert(type === 'java', `检测 Java 项目类型 (got: ${type})`);
}

// ── 测试 5: 未知项目 → general ──
{
  const dir = path.join(TEST_DIR, 'unknown-proj');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'README.md'), '# Hello');
  const type = detectProjectType(dir);
  assert(type === 'general', `未知项目返回 general (got: ${type})`);
}

// ── 测试 6: 子目录检测（backend/ 里有 .csproj） ──
{
  const dir = path.join(TEST_DIR, 'subdir-proj');
  fs.mkdirSync(path.join(dir, 'backend'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'backend', 'App.csproj'), '<Project></Project>');
  const type = detectProjectType(dir);
  assert(type === 'dotnet', `子目录 .NET 检测 (got: ${type})`);
}

// ── 测试 7: ensureGitignore 创建新文件 ──
{
  const dir = path.join(TEST_DIR, 'ensure-new');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'package.json'), '{}');
  const result = ensureGitignore(dir);
  assert(result.created === true, `ensureGitignore 创建新文件`);
  assert(result.type === 'node', `ensureGitignore 检测类型正确 (got: ${result.type})`);
  assert(fs.existsSync(result.path), `.gitignore 文件已创建`);
  const content = fs.readFileSync(result.path, 'utf-8');
  assert(content.includes('node_modules'), `.gitignore 包含 node_modules 排除`);
}

// ── 测试 8: ensureGitignore 不覆盖已有文件 ──
{
  const dir = path.join(TEST_DIR, 'ensure-existing');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '.gitignore'), '# custom\n');
  const result = ensureGitignore(dir);
  assert(result.created === false, `ensureGitignore 不覆盖已有文件`);
  assert(result.type === 'existing', `ensureGitignore 返回 existing (got: ${result.type})`);
  const content = fs.readFileSync(path.join(dir, '.gitignore'), 'utf-8');
  assert(content === '# custom\n', `原有 .gitignore 内容未被修改`);
}

// ── 测试 9: generateGitignore 各类型模板 ──
{
  const types = ['dotnet', 'node', 'python', 'java', 'go', 'ruby', 'php', 'general'];
  for (const t of types) {
    const content = generateGitignore(t);
    assert(content.length > 50, `${t} 模板长度合理 (${content.length} chars)`);
  }
}

// ── 清理 ──
cleanDir(TEST_DIR);

console.log('\n' + '─'.repeat(50));
console.log(`Total: ${passed + failed} | ✅ ${passed} | ❌ ${failed}`);
console.log('─'.repeat(50));

if (failed > 0) process.exit(1);