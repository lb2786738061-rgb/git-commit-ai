import { execFileSync } from 'child_process';

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

