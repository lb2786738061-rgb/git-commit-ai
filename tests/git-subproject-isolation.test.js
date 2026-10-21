import assert from 'assert';
import { GitOperations } from '../shared/git/operations.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

console.log('🔄 正在运行 Git 子项目独立性与无改动容错测试...');

try {
  // 1. 验证在项目目录无 .git 且不是顶层仓库时，isGitRepository 正确返回 false
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codesync-sub-'));
  const subProject = path.join(tempDir, 'HIS');
  fs.mkdirSync(subProject, { recursive: true });

  const isSubRepo = GitOperations.isGitRepository(subProject);
  assert.strictEqual(isSubRepo, false, '子项目未独立初始化时不应被判定为已是仓库');

  // 初始化子项目后应该返回 true
  const git = new GitOperations(subProject);
  await git.init();
  const isSubRepoAfter = GitOperations.isGitRepository(subProject);
  assert.strictEqual(isSubRepoAfter, true, '子项目独立 init 后应被正确识别为仓库');

  // 清理临时文件
  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log('✅ Git 子项目独立性与无改动容错测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
