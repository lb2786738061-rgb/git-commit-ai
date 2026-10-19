#!/usr/bin/env node
/**
 * 本地上传测试 - 使用本地 bare repo 模拟远程仓库
 * 用法: node local-test-upload.js
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { GitOperations } from '../../shared/git/operations.js';

const TEST_DIR = path.join(os.tmpdir(), 'codesync-upload-test');

// 清理旧测试目录
if (fs.existsSync(TEST_DIR)) {
  execFileSync('rm', ['-rf', TEST_DIR]);
}

// 1. 创建本地 bare repo（模拟远程）
const bareRepoPath = path.join(TEST_DIR, 'remote.git');
const testProjectPath = path.join(TEST_DIR, 'my-project');

execFileSync('git', ['init', '--bare', bareRepoPath], { stdio: 'pipe' });
console.log('✅ 创建模拟远程仓库:', bareRepoPath);

// 2. 创建测试项目
fs.mkdirSync(testProjectPath, { recursive: true });
fs.writeFileSync(path.join(testProjectPath, 'index.js'), 'console.log("Hello World");\n');
fs.writeFileSync(path.join(testProjectPath, 'README.md'), '# My Project\n');
console.log('✅ 创建测试项目:', testProjectPath);

// 3. 模拟上传流程（跳过 API 调用，直接用本地 bare repo）
const git = new GitOperations(testProjectPath);

async function run() {
  // init
  if (!GitOperations.isGitRepository(testProjectPath)) {
    await git.init();
    console.log('✅ 初始化 Git 仓库');
  }

  // add
  await git.addAll();
  console.log('✅ 添加文件');

  // commit
  await git.commit('feat: initial commit - 本地测试');
  console.log('✅ 提交更改');

  // set branch
  await git.setBranch('main');
  console.log('✅ 设置分支为 main');

  // add remote（指向本地 bare repo）
  await git.addRemote('origin', bareRepoPath);
  console.log('✅ 关联远程仓库');

  // push
  await git.push('origin', 'main');
  console.log('✅ 推送代码');

  // 验证：clone 回来
  const clonePath = path.join(TEST_DIR, 'clone-test');
  const git2 = new GitOperations(clonePath);
  await git2.clone(bareRepoPath, clonePath);
  console.log('✅ 验证克隆成功:', clonePath);

  const files = fs.readdirSync(clonePath);
  console.log('✅ 克隆的文件:', files);

  console.log('\n🎉 本地上传测试全部通过！');
  console.log('测试目录:', TEST_DIR);
}

run().catch(err => {
  console.error('❌ 测试失败:', err.message);
  process.exit(1);
});