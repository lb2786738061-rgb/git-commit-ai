import { execFileSync, spawn } from 'child_process';

/**
 * Checks if git is installed and if the current working directory is a git repository.
 * @returns {boolean}
 */
export function isGitRepository() {
  try {
    const result = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'pipe' });
    return result.toString().trim() === 'true';
  } catch (error) {
    return false;
  }
}

const EXCLUDE_PATTERNS = [
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lockb',
  '*.png',
  '*.jpg',
  '*.jpeg',
  '*.gif',
  '*.svg',
  '*.webp',
  '*.ico',
  '*.pdf',
  '*.zip',
  '*.gz',
  '*.tar',
  '*.mp4',
  '*.mp3'
];

/**
 * Returns the staged changes (git diff --cached) with lockfiles and media files filtered out.
 * @returns {string}
 */
export function getStagedDiff() {
  try {
    const excludeArgs = EXCLUDE_PATTERNS.map(pattern => `:(exclude)${pattern}`);
    return execFileSync('git', ['diff', '--cached', '--', '.', ...excludeArgs], {
      stdio: 'pipe',
      maxBuffer: 15 * 1024 * 1024 // 15MB buffer limit for massive diffs
    }).toString();
  } catch (error) {
    throw new Error('Failed to run git diff. Make sure you are inside a git repository and git is installed.');
  }
}

/**
 * Returns the list of staged file names.
 * @returns {string[]}
 */
export function getStagedFiles() {
  try {
    const output = execFileSync('git', ['diff', '--cached', '--name-only'], { stdio: 'pipe' }).toString().trim();
    return output ? output.split(/\r?\n/) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Returns the list of modified or untracked files that are not staged.
 * @returns {string[]}
 */
export function getUnstagedFiles() {
  try {
    const output = execFileSync('git', ['status', '--porcelain'], { stdio: 'pipe' }).toString().trim();
    if (!output) return [];
    
    return output
      .split(/\r?\n/)
      .map(line => {
        const status = line.slice(0, 2);
        const file = line.slice(3).trim();
        // If it has unstaged modifications (e.g. " M", "??", " D", "A ")
        // Standard porcelain status is "XY file" where X is index, Y is worktree
        const isUnstaged = status[1] === 'M' || status[1] === 'D' || status[0] === '?' || status[1] === '?';
        return isUnstaged ? file : null;
      })
      .filter(Boolean);
  } catch (error) {
    return [];
  }
}

/**
 * 获取指定文件的 diff
 * @param {string} filePath 文件路径
 * @returns {string} diff 内容
 */
export function getFileDiff(filePath) {
  try {
    const excludeArgs = EXCLUDE_PATTERNS.map(pattern => `:(exclude)${pattern}`);
    return execFileSync('git', ['diff', '--', filePath, ...excludeArgs], {
      stdio: 'pipe',
      maxBuffer: 15 * 1024 * 1024
    }).toString();
  } catch (error) {
    throw new Error(`Failed to get diff for ${filePath}`);
  }
}

/**
 * 暂存指定文件
 * @param {string} filePath 文件路径
 */
export function stageFile(filePath) {
  try {
    execFileSync('git', ['add', filePath], { stdio: 'pipe' });
  } catch (error) {
    throw new Error(`Failed to stage ${filePath}`);
  }
}

/**
 * 取消暂存指定文件
 * @param {string} filePath 文件路径
 */
export function unstageFile(filePath) {
  try {
    execFileSync('git', ['reset', filePath], { stdio: 'pipe' });
  } catch (error) {
    throw new Error(`Failed to unstage ${filePath}`);
  }
}

/**
 * 修改最后一次提交
 * @param {string} message 新的提交信息
 * @returns {string} git 输出
 */
export function amendCommit(message) {
  try {
    const output = execFileSync('git', ['commit', '--amend', '-m', message], {
      stdio: 'pipe',
      env: { ...process.env, GCA_BYPASS_HOOK: '1' }
    });
    return output.toString();
  } catch (error) {
    const errMsg = error.stderr ? error.stderr.toString().trim() : error.message;
    throw new Error(errMsg || 'Git amend failed.');
  }
}

/**
 * 合并最近的提交
 * @param {number} count 要合并的提交数量
 * @param {string} message 合并后的提交信息
 * @returns {string} git 输出
 */
export function squashCommits(count, message) {
  try {
    // 使用 git reset --soft 回退，然后重新提交
    execFileSync('git', ['reset', '--soft', `HEAD~${count}`], { stdio: 'pipe' });
    const output = execFileSync('git', ['commit', '-m', message], {
      stdio: 'pipe',
      env: { ...process.env, GCA_BYPASS_HOOK: '1' }
    });
    return output.toString();
  } catch (error) {
    const errMsg = error.stderr ? error.stderr.toString().trim() : error.message;
    throw new Error(errMsg || 'Git squash failed.');
  }
}

/**
 * 基于提交主题创建新分支
 * @param {string} branchName 分支名称
 * @returns {string} git 输出
 */
export function createBranch(branchName) {
  try {
    const output = execFileSync('git', ['checkout', '-b', branchName], { stdio: 'pipe' });
    return output.toString();
  } catch (error) {
    const errMsg = error.stderr ? error.stderr.toString().trim() : error.message;
    throw new Error(errMsg || 'Git branch creation failed.');
  }
}

/**
 * 获取当前分支名称
 * @returns {string} 分支名称
 */
export function getCurrentBranch() {
  try {
    const output = execFileSync('git', ['branch', '--show-current'], { stdio: 'pipe' }).toString().trim();
    return output;
  } catch (error) {
    throw new Error('Failed to get current branch.');
  }
}

/**
 * Commits the staged changes with the provided message using direct argument parsing.
 * Safe from shell injection and platform quotation issues.
 * @param {string} message 
 * @returns {string} The git commit output
 */
export function commitChanges(message) {
  try {
    const output = execFileSync('git', ['commit', '-m', message], {
      stdio: 'pipe',
      env: { ...process.env, GCA_BYPASS_HOOK: '1' }
    });
    return output.toString();
  } catch (error) {
    const errMsg = error.stderr ? error.stderr.toString().trim() : error.message;
    throw new Error(errMsg || 'Git commit failed.');
  }
}

/**
 * Pushes the committed changes to the remote repository.
 * @returns {string} The git push output
 */
export function pushChanges() {
  try {
    const output = execFileSync('git', ['push'], { stdio: 'pipe' });
    return output.toString();
  } catch (error) {
    const errMsg = error.stderr ? error.stderr.toString().trim() : error.message;
    throw new Error(errMsg || 'Git push failed.');
  }
}

/**
 * 根据暂存文件智能检测推荐的提交范围 (Scope)。
 * @param {string[]} files 
 * @returns {string} 推荐的范围
 */
export function detectScope(files) {
  if (!files || files.length === 0) return '';
  
  // 忽略常见的开发无关、通用顶层或测试顶层目录
  const ignoreDirs = new Set(['src', 'lib', 'app', 'tests', 'test', 'spec', 'packages']);
  const scopes = [];

  for (const file of files) {
    const normalized = file.replace(/\\/g, '/');
    const parts = normalized.split('/');
    
    // 如果是在根目录下的文件，例如 package.json, 可以推荐 "npm"
    if (parts.length <= 1) {
      if (parts[0] === 'package.json' || parts[0] === 'package-lock.json') {
        scopes.push('npm');
      }
      continue;
    }
    
    // 寻找非忽略的第一个目录作为范围候选
    let scopeCandidate = '';
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!ignoreDirs.has(part)) {
        scopeCandidate = part;
        break;
      }
    }
    
    // 如果所有目录都是被忽略的（比如 src/index.js），则使用第一层目录名称（例如 "src"）
    if (!scopeCandidate && parts.length > 1) {
      scopeCandidate = parts[0];
    }
    
    if (scopeCandidate) {
      scopes.push(scopeCandidate.toLowerCase());
    }
  }

  if (scopes.length === 0) return '';

  // 统计每个范围出现的频次
  const counts = {};
  let maxCount = 0;
  let dominantScope = '';

  for (const s of scopes) {
    counts[s] = (counts[s] || 0) + 1;
    if (counts[s] > maxCount) {
      maxCount = counts[s];
      dominantScope = s;
    }
  }

  return dominantScope;
}

/**
 * 获取指定范围内的 Git 提交记录历史。
 * @param {string} [from] 起始 tag 或 commit
 * @param {string} [to] 结束 tag 或 commit
 * @returns {string[]}
 */
export function getCommitHistory(from, to) {
  try {
    const range = from && to ? `${from}..${to}` : from ? `${from}..HEAD` : '';
    const args = ['log'];
    if (range) {
      args.push(range);
    } else {
      // 默认抓取最近 20 条提交
      args.push('-n', '20');
    }
    // 获取简短的哈希和提交主题
    args.push('--pretty=format:%h %s');
    
    const output = execFileSync('git', args, { stdio: 'pipe' }).toString().trim();
    return output ? output.split(/\r?\n/) : [];
  } catch (error) {
    const errMsg = error.stderr ? error.stderr.toString().trim() : error.message;
    throw new Error(errMsg || '获取 Git 提交记录失败。');
  }
}

/**
 * 获取本地所有 tags 列表，按创建时间倒序排列。
 * @returns {string[]}
 */
export function getLatestTags() {
  try {
    const output = execFileSync('git', ['tag', '--sort=-creatordate'], { stdio: 'pipe' }).toString().trim();
    return output ? output.split(/\r?\n/) : [];
  } catch (error) {
    return [];
  }
}

/**
 * 获取详细的提交历史（包含完整信息和格式化）
 * @param {string} [from] 起始 tag 或 commit
 * @param {string} [to] 结束 tag 或 commit
 * @param {number} [limit=50] 限制返回的提交数量
 * @returns {Array<{hash: string, type: string, scope: string, subject: string, author: string, date: string}>}
 */
export function getDetailedCommitHistory(from, to, limit = 50) {
  try {
    const range = from && to ? `${from}..${to}` : from ? `${from}..HEAD` : '';
    const args = ['log'];
    if (range) {
      args.push(range);
    } else {
      args.push('-n', limit.toString());
    }
    // 获取详细信息：hash, type, scope, subject, author, date
    args.push('--pretty=format:%H|%s|%an|%ai');
    
    const output = execFileSync('git', args, { stdio: 'pipe' }).toString().trim();
    if (!output) return [];

    return output.split(/\r?\n/).map(line => {
      const [hash, subject, author, date] = line.split('|');
      // 解析提交类型和范围
      const typeMatch = subject.match(/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\(([^)]+)\))?/);
      const type = typeMatch ? typeMatch[1] : 'other';
      const scope = typeMatch ? (typeMatch[2] || '') : '';

      return {
        hash: hash.substring(0, 8),
        type,
        scope,
        subject,
        author,
        date
      };
    });
  } catch (error) {
    const errMsg = error.stderr ? error.stderr.toString().trim() : error.message;
    throw new Error(errMsg || '获取详细提交历史失败。');
  }
}

/**
 * 使用系统编辑器编辑文本内容
 * @param {string} initialContent 初始内容
 * @returns {Promise<string>} 编辑后的内容
 */
export function editWithEditor(initialContent) {
  return new Promise((resolve, reject) => {
    const editor = process.env.EDITOR || process.env.VISUAL || 'vim';
    const os = require('os');
    const path = require('path');
    const fs = require('fs');
    
    // 创建临时文件
    const tmpDir = os.tmpdir();
    const tmpFile = path.join(tmpDir, `git-commit-ai-${Date.now()}.txt`);
    
    try {
      fs.writeFileSync(tmpFile, initialContent, 'utf-8');
    } catch (err) {
      reject(new Error(`Failed to create temp file: ${err.message}`));
      return;
    }

    // 启动编辑器
    const editorArgs = editor.split(' ');
    const editorCmd = editorArgs[0];
    const editorParams = editorArgs.slice(1).concat(tmpFile);

    const child = spawn(editorCmd, editorParams, {
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      try {
        const editedContent = fs.readFileSync(tmpFile, 'utf-8');
        fs.unlinkSync(tmpFile);
        
        if (code !== 0) {
          reject(new Error(`Editor exited with code ${code}`));
          return;
        }
        
        resolve(editedContent);
      } catch (err) {
        reject(new Error(`Failed to read edited content: ${err.message}`));
      }
    });

    child.on('error', (err) => {
      try {
        if (fs.existsSync(tmpFile)) {
          fs.unlinkSync(tmpFile);
        }
      } catch (_) {}
      reject(new Error(`Failed to launch editor: ${err.message}`));
    });
  });
}

