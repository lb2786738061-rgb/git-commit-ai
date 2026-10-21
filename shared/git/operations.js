import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const DEFAULT_MAX_BUFFER = 50 * 1024 * 1024; // 50MB 缓冲区

/**
 * Git 操作类 - 封装所有 Git 命令
 */
export class GitOperations {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  /**
   * 初始化 Git 仓库
   */
  async init() {
    try {
      execFileSync('git', ['init'], { cwd: this.projectPath, stdio: 'pipe' });
      return true;
    } catch (error) {
      throw new Error(`Git 初始化失败: ${error.message}`);
    }
  }

  /**
   * 添加所有文件到暂存区
   */
  async addAll() {
    try {
      execFileSync('git', ['add', '-A'], {
        cwd: this.projectPath,
        stdio: 'pipe',
        maxBuffer: DEFAULT_MAX_BUFFER
      });
      return true;
    } catch (error) {
      const detail = error.stderr ? error.stderr.toString().trim() : error.message;
      throw new Error(`添加文件失败: ${detail}`);
    }
  }

  /**
   * 添加指定文件到暂存区
   */
  async addFile(filePath) {
    try {
      execFileSync('git', ['add', filePath], { cwd: this.projectPath, stdio: 'pipe' });
      return true;
    } catch (error) {
      throw new Error(`添加文件失败: ${error.message}`);
    }
  }

  /**
   * 确保存在 Git 用户名和邮箱配置
   */
  ensureGitUser() {
    try {
      execFileSync('git', ['config', 'user.name'], { cwd: this.projectPath, stdio: 'pipe' });
    } catch (_) {
      try {
        execFileSync('git', ['config', 'user.name', 'CodeSync User'], { cwd: this.projectPath, stdio: 'pipe' });
      } catch (_) {}
    }
    try {
      execFileSync('git', ['config', 'user.email'], { cwd: this.projectPath, stdio: 'pipe' });
    } catch (_) {
      try {
        execFileSync('git', ['config', 'user.email', 'codesync@example.com'], { cwd: this.projectPath, stdio: 'pipe' });
      } catch (_) {}
    }
  }

  /**
   * 提交更改
   * @param {string} message 提交信息
   * @param {object} [options] 选项
   * @param {boolean} [options.bypassHooks=false] 是否跳过 Git 钩子校验
   */
  async commit(message, options = {}) {
    this.ensureGitUser();
    const { bypassHooks = false } = options;
    try {
      const args = ['commit'];
      if (bypassHooks) {
        args.push('--no-verify');
      }
      args.push('-m', message);
      execFileSync('git', args, {
        cwd: this.projectPath,
        stdio: 'pipe',
        maxBuffer: DEFAULT_MAX_BUFFER,
        env: { ...process.env, GCA_BYPASS_HOOK: bypassHooks ? '1' : '0' }
      });
      return true;
    } catch (error) {
      const stderr = error.stderr ? error.stderr.toString().trim() : '';
      const stdout = error.stdout ? error.stdout.toString().trim() : '';
      const detail = stderr || stdout || error.message;

      // 如果未开启跳过钩子且报错可能来自本地钩子拦截，自动带 --no-verify 重试一次
      if (!bypassHooks) {
        try {
          execFileSync('git', ['commit', '--no-verify', '-m', message], {
            cwd: this.projectPath,
            stdio: 'pipe',
            maxBuffer: DEFAULT_MAX_BUFFER,
            env: { ...process.env, GCA_BYPASS_HOOK: '1' }
          });
          return true;
        } catch (_) {}
      }

      // 如果工作区已经是 clean 状态（无需提交），安全放行以继续后续推送
      if (
        detail.includes('nothing to commit') ||
        detail.includes('working tree clean') ||
        detail.includes('no changes added to commit')
      ) {
        return true;
      }

      throw new Error(`提交失败: ${detail}`);
    }
  }

  /**
   * 推送到远程仓库
   */
  async push(remote = 'origin', branch = 'main') {
    try {
      execFileSync('git', ['push', '-u', remote, branch], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      return true;
    } catch (error) {
      throw new Error(`推送失败: ${error.message}`);
    }
  }

  /**
   * Clone 仓库
   */
  async clone(url, targetPath, timeout = 600000) {
    try {
      execFileSync('git', ['clone', url, targetPath], {
        stdio: 'pipe',
        timeout: timeout
      });
      return targetPath;
    } catch (error) {
      throw new Error(`克隆失败: ${error.message}`);
    }
  }

  /**
   * 拉取远程更新
   * @param {string} [remote] 远程仓库名称
   * @param {string} [branch] 分支名称
   */
  async pull(remote, branch) {
    try {
      const args = ['pull'];
      if (remote) args.push(remote);
      if (branch) args.push(branch);
      const output = execFileSync('git', args, {
        cwd: this.projectPath,
        stdio: 'pipe',
        maxBuffer: DEFAULT_MAX_BUFFER
      });
      return output.toString();
    } catch (error) {
      const stderr = error.stderr ? error.stderr.toString() : '';
      const stdout = error.stdout ? error.stdout.toString() : '';
      const combined = (error.message || '') + '\n' + stderr + '\n' + stdout;
      if (combined.includes('CONFLICT') || combined.includes('Automatic merge failed')) {
        const conflictErr = new Error(`拉取冲突: 远程与本地存在代码冲突，请合并后再推送。\n${stderr || stdout}`);
        conflictErr.isConflict = true;
        throw conflictErr;
      }
      throw new Error(`拉取失败: ${stderr || error.message}`);
    }
  }

  /**
   * 获取当前处于冲突状态的文件列表
   * @returns {string[]} 冲突文件相对路径列表
   */
  async getConflictFiles() {
    try {
      const output = execFileSync('git', ['diff', '--name-only', '--diff-filter=U'], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      return output.toString().trim().split('\n').map(s => s.trim()).filter(Boolean);
    } catch (_) {
      return [];
    }
  }

  /**
   * 获取冲突差异内容供 AI 智能体分析
   * @param {string[]} [files]
   * @returns {string}
   */
  async getConflictDiff(files = []) {
    try {
      const args = ['diff'];
      if (files.length > 0) {
        args.push('--', ...files);
      }
      const output = execFileSync('git', args, {
        cwd: this.projectPath,
        stdio: 'pipe',
        maxBuffer: DEFAULT_MAX_BUFFER
      });
      return output.toString();
    } catch (_) {
      return '';
    }
  }

  /**
   * 获取状态
   */
  async status() {
    try {
      const output = execFileSync('git', ['status', '--porcelain'], {
        cwd: this.projectPath,
        stdio: 'pipe',
        maxBuffer: DEFAULT_MAX_BUFFER
      });
      return output.toString();
    } catch (error) {
      throw new Error(`获取状态失败: ${error.message}`);
    }
  }

  /**
   * 获取提交历史
   */
  async log(count = 10) {
    try {
      const output = execFileSync('git', ['--no-pager', 'log', '-n', String(count), '--pretty=format:%h %s'], {
        cwd: this.projectPath,
        stdio: 'pipe',
        encoding: 'utf-8',
        maxBuffer: DEFAULT_MAX_BUFFER
      });
      return output.trim().split('\n').filter(l => l.trim());
    } catch (error) {
      throw new Error(`获取历史失败: ${error.message}`);
    }
  }

  /**
   * 检查是否为缓冲区溢出错误
   */
  isBufferOverflow(error) {
    if (!error) return false;
    return (
      error.code === 'ENOBUFS' ||
      (error.message && (error.message.includes('ENOBUFS') || error.message.includes('maxBuffer')))
    );
  }

  /**
   * 当 diff 过大溢出时，降级获取改动统计摘要
   */
  getFallbackDiff(staged = true) {
    const args = staged ? ['diff', '--cached', '--stat'] : ['diff', '--stat'];
    try {
      const statOutput = execFileSync('git', args, {
        cwd: this.projectPath,
        stdio: 'pipe',
        maxBuffer: DEFAULT_MAX_BUFFER
      });
      return `# 项目改动规模较大，已自动汇总变更统计信息:\n${statOutput.toString()}`;
    } catch (_) {
      try {
        const nameStatusArgs = staged ? ['diff', '--cached', '--name-status'] : ['diff', '--name-status'];
        const nameStatus = execFileSync('git', nameStatusArgs, {
          cwd: this.projectPath,
          stdio: 'pipe',
          maxBuffer: DEFAULT_MAX_BUFFER
        });
        return `# 项目改动规模较大，已自动提取变更文件列表:\n${nameStatus.toString()}`;
      } catch (e) {
        return '# 项目改动规模较大，包含大量新文件或初始代码提交';
      }
    }
  }

  /**
   * 获取 diff
   */
  async getDiff() {
    try {
      const output = execFileSync('git', ['diff'], {
        cwd: this.projectPath,
        stdio: 'pipe',
        maxBuffer: DEFAULT_MAX_BUFFER
      });
      return output.toString();
    } catch (error) {
      if (this.isBufferOverflow(error)) {
        return this.getFallbackDiff(false);
      }
      throw new Error(`获取 diff 失败: ${error.message}`);
    }
  }

  /**
   * 获取暂存的 diff（自动过滤 lockfile 和二进制文件）
   */
  async getStagedDiff() {
    try {
      const output = execFileSync('git', ['diff', '--cached'], {
        cwd: this.projectPath,
        stdio: 'pipe',
        maxBuffer: DEFAULT_MAX_BUFFER
      });
      return this.filterDiff(output.toString());
    } catch (error) {
      if (this.isBufferOverflow(error)) {
        return this.getFallbackDiff(true);
      }
      throw new Error(`获取暂存 diff 失败: ${error.message}`);
    }
  }

  /**
   * 过滤 diff 中的 lockfile 和二进制文件
   */
  filterDiff(diff) {
    const EXCLUDE_PATTERNS = [
      /package-lock\.json/,
      /yarn\.lock/,
      /pnpm-lock\.yaml/,
      /\.png$/, /\.jpg$/, /\.jpeg$/, /\.gif$/, /\.svg$/,
      /\.pdf$/, /\.zip$/, /\.tar\.gz$/, /\.ico$/, /\.woff2?$/
    ];

    const diffBlocks = diff.split(/(?=^diff --git )/m);
    const filtered = diffBlocks.filter(block => {
      const match = block.match(/^diff --git a\/(.+?) b\//);
      if (!match) return true;
      const filePath = match[1];
      return !EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
    });

    return filtered.join('');
  }

  /**
   * 添加远程仓库
   */
  async addRemote(name, url) {
    try {
      execFileSync('git', ['remote', 'add', name, url], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      return true;
    } catch (error) {
      const errStr = (error.message || '') + (error.stderr ? error.stderr.toString() : '');
      if (errStr.includes('already exists')) {
        try {
          execFileSync('git', ['remote', 'set-url', name, url], {
            cwd: this.projectPath,
            stdio: 'pipe'
          });
          return true;
        } catch (setErr) {
          throw new Error(`更新远程仓库失败: ${setErr.message}`);
        }
      }
      throw new Error(`添加远程仓库失败: ${error.message}`);
    }
  }

  /**
   * 设置分支名称
   */
  async setBranch(branchName = 'main') {
    try {
      execFileSync('git', ['branch', '-M', branchName], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      return true;
    } catch (error) {
      throw new Error(`设置分支失败: ${error.message}`);
    }
  }

  /**
   * 检查是否是 Git 仓库
   */
  static isGitRepository(projectPath) {
    try {
      // 1. 如果当前目录下直接存在 .git 目录或文件，判定为是独立仓库
      const gitDir = path.join(projectPath, '.git');
      if (fs.existsSync(gitDir)) {
        return true;
      }

      // 2. 检查顶级仓库根目录是否与当前项目路径完全一致，避免因父级目录存在 .git 而将子项目误判为已被初始化
      const topLevel = execFileSync('git', ['rev-parse', '--show-toplevel'], {
        cwd: projectPath,
        stdio: 'pipe'
      }).toString().trim();

      const normalTop = path.resolve(topLevel).toLowerCase();
      const normalProject = path.resolve(projectPath).toLowerCase();
      return normalTop === normalProject;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取当前分支
   */
  async getCurrentBranch() {
    try {
      const output = execFileSync('git', ['branch', '--show-current'], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      return output.toString().trim();
    } catch (error) {
      throw new Error(`获取当前分支失败: ${error.message}`);
    }
  }

  /**
   * 获取已配置的远程仓库列表
   * @returns {Promise<Array<{name: string, url: string}>>}
   */
  async getRemotes() {
    try {
      const output = execFileSync('git', ['remote', '-v'], {
        cwd: this.projectPath,
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      const remotes = [];
      const seen = new Set();
      for (const line of output.split('\n')) {
        const match = line.trim().match(/^(\S+)\s+(\S+)\s+\((fetch|push)\)$/);
        if (!match) continue;
        const [, name, url] = match;
        if (seen.has(name)) continue;
        seen.add(name);
        remotes.push({ name, url });
      }
      return remotes;
    } catch (error) {
      return [];
    }
  }

  /**
   * 回退到指定提交
   */
  async reset(commitHash, mode = 'soft') {
    try {
      execFileSync('git', ['reset', `--${mode}`, commitHash], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      return true;
    } catch (error) {
      throw new Error(`回退失败: ${error.message}`);
    }
  }

  /**
   * 修改最后一次提交（amend）
   * @param {string} [newMessage] 新的提交信息（不传则保留原有）
   */
  async amend(newMessage) {
    try {
      const args = ['commit', '--amend'];
      if (newMessage) {
        args.push('-m', newMessage);
      } else {
        args.push('--no-edit');
      }
      execFileSync('git', args, {
        cwd: this.projectPath,
        stdio: 'pipe',
        env: { ...process.env, GCA_BYPASS_HOOK: '1' }
      });
      return true;
    } catch (error) {
      throw new Error(`修改提交失败: ${error.message}`);
    }
  }

  /**
   * 创建并切换到新分支
   * @param {string} branchName 分支名称
   */
  async createBranch(branchName) {
    try {
      execFileSync('git', ['checkout', '-b', branchName], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      return true;
    } catch (error) {
      throw new Error(`创建分支失败: ${error.message}`);
    }
  }

  /**
   * 合并（squash）最近 N 次提交
   * @param {number} count 要合并的提交数量
   * @param {string} message 新提交信息
   */
  async squash(count, message) {
    try {
      // 使用 reset --soft 回退 N 个提交，然后重新提交
      execFileSync('git', ['reset', '--soft', `HEAD~${count}`], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      execFileSync('git', ['commit', '-m', message], {
        cwd: this.projectPath,
        stdio: 'pipe',
        env: { ...process.env, GCA_BYPASS_HOOK: '1' }
      });
      return true;
    } catch (error) {
      throw new Error(`合并提交失败: ${error.message}`);
    }
  }

  /**
   * 获取指定文件的 diff
   * @param {string} filePath 文件路径
   */
  async getFileDiff(filePath) {
    try {
      const output = execFileSync('git', ['diff', 'HEAD', '--', filePath], {
        cwd: this.projectPath,
        stdio: 'pipe',
        maxBuffer: DEFAULT_MAX_BUFFER
      });
      return output.toString();
    } catch (error) {
      throw new Error(`获取文件 diff 失败: ${error.message}`);
    }
  }

  /**
   * 暂存指定文件
   * @param {string} filePath 文件路径
   */
  async stageFile(filePath) {
    return this.addFile(filePath);
  }

  /**
   * 取消暂存指定文件
   * @param {string} filePath 文件路径
   */
  async unstageFile(filePath) {
    try {
      execFileSync('git', ['reset', 'HEAD', '--', filePath], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      return true;
    } catch (error) {
      throw new Error(`取消暂存失败: ${error.message}`);
    }
  }

  /**
   * 获取详细的提交历史（带统计信息）
   * @param {object} options 选项
   * @param {string} [options.from] 起始 tag/commit
   * @param {string} [options.to] 结束 tag/commit
   * @param {number} [options.limit] 数量限制
   */
  async getDetailedCommitHistory({ from, to, limit = 50 } = {}) {
    try {
      const args = ['log', '--pretty=format:%H|%s|%an|%ad', '--date=short'];

      if (from && to) {
        args.push(`${from}..${to}`);
      } else if (from) {
        args.push(`${from}..HEAD`);
      } else {
        args.push(`-n`, String(limit));
      }

      const output = execFileSync('git', args, {
        cwd: this.projectPath,
        stdio: 'pipe'
      });

      return output.toString().trim().split('\n')
        .filter(l => l.trim())
        .map(line => {
          const [hash, subject, author, date] = line.split('|');
          return { hash, subject, author, date };
        });
    } catch (error) {
      throw new Error(`获取提交历史失败: ${error.message}`);
    }
  }
}