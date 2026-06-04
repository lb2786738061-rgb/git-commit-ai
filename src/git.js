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
    const output = execFileSync('git', ['commit', '-m', message], { stdio: 'pipe' });
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
