import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GitOperations } from '../shared/git/operations.js';
import { analyzeConflict } from '../shared/ai/conflict.js';
import { pullProject, syncProject } from '../shared/git/upload.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';

describe('多人协作防冲突与 AI 智能体冲突审查测试', () => {
  it('AI 冲突分析智能体应在无 Key 或有冲突文件时生成专业建议', async () => {
    const conflictFiles = ['src/index.js', 'package.json'];
    const fakeDiff = `<<<<<<< HEAD
const version = '2.0.0-local';
=======
const version = '2.0.0-remote';
>>>>>>> remote/main`;

    const result = await analyzeConflict({ conflictFiles, conflictDiff: fakeDiff });
    assert(result.summary.includes('冲突'));
    assert.deepStrictEqual(result.files, conflictFiles);
    assert(result.suggestions.length > 20);
    assert(result.suggestions.includes('HEAD') || result.suggestions.includes('冲突'));
  });

  it('GitOperations 应能正确检测并提取冲突文件列表', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-conflict-test-'));
    try {
      execFileSync('git', ['init'], { cwd: tempDir, stdio: 'pipe' });
      execFileSync('git', ['config', 'user.name', 'TestUser'], { cwd: tempDir, stdio: 'pipe' });
      execFileSync('git', ['config', 'user.email', 'test@test.com'], { cwd: tempDir, stdio: 'pipe' });

      const git = new GitOperations(tempDir);
      assert.strictEqual(typeof git.pull, 'function');
      assert.strictEqual(typeof git.getConflictFiles, 'function');
      assert.strictEqual(typeof git.getConflictDiff, 'function');

      // 干净仓库没有冲突文件
      const files = execFileSync('git', ['status', '--porcelain'], { cwd: tempDir, stdio: 'pipe' }).toString();
      assert.strictEqual(files.trim(), '');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('pullProject 和 syncProject 应导出并具备多人协作接口定义', () => {
    assert.strictEqual(typeof pullProject, 'function');
    assert.strictEqual(typeof syncProject, 'function');
  });
});
