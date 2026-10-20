import { execFileSync } from 'child_process';
import path from 'path';

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
      execFileSync('git', ['add', '.'], { cwd: this.projectPath, stdio: 'pipe' });
      return true;
    } catch (error) {
      throw new Error(`添加文件失败: ${error.message}`);
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
   * 提交更改
   */
  async commit(message) {
    try {
      execFileSync('git', ['commit', '-m', message], {
        cwd: this.projectPath,
        stdio: 'pipe',
        env: { ...process.env, GCA_BYPASS_HOOK: '1' }
      });
      return true;
    } catch (error) {
      throw new Error(`提交失败: ${error.message}`);
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
   */
  async pull() {
    try {
      execFileSync('git', ['pull'], { cwd: this.projectPath, stdio: 'pipe' });
      return true;
    } catch (error) {
      throw new Error(`拉取失败: ${error.message}`);
    }
  }

  /**
   * 获取状态
   */
  async status() {
    try {
      const output = execFileSync('git', ['status', '--porcelain'], {
        cwd: this.projectPath,
        stdio: 'pipe'
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
        encoding: 'utf-8'
      });
      return output.trim().split('\n').filter(l => l.trim());
    } catch (error) {
      throw new Error(`获取历史失败: ${error.message}`);
    }
  }

  /**
   * 获取 diff
   */
  async getDiff() {
    try {
      const output = execFileSync('git', ['diff'], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      return output.toString();
    } catch (error) {
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
        stdio: 'pipe'
      });
      return this.filterDiff(output.toString());
    } catch (error) {
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
      const result = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
        cwd: projectPath,
        stdio: 'pipe'
      });
      return result.toString().trim() === 'true';
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
        stdio: 'pipe'
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