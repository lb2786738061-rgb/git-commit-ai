import * as vscode from 'vscode';
import path from 'path';
import { GitOperations } from '../../shared/git/operations.js';
import { uploadProject, syncProject, pullProject } from '../../shared/git/upload.js';
import { generateCommitMessage } from '../../shared/ai/commit.js';
import { ConfigManager, Platform } from './configManager';

export interface RemoteInfo {
  name: string;
  url: string;
}

/**
 * Git 服务封装
 *
 * 直接复用 shared/ 中的实现，与 CLI、桌面版共用同一套逻辑：
 * - shared/git/operations.js  → Git 命令封装
 * - shared/git/upload.js      → 上传 / 同步流程
 * - shared/ai/commit.js       → AI 提交信息生成（带缓存与智能模型选择）
 */
export class GitService {
  constructor(private configManager: ConfigManager) {}

  /**
   * 推断当前操作的项目路径：优先当前打开文件所在目录，其次第一个工作区文件夹
   */
  static resolveProjectPath(): string | undefined {
    const activeUri = vscode.window.activeTextEditor?.document.uri;
    if (activeUri && activeUri.scheme === 'file') {
      return path.dirname(activeUri.fsPath);
    }
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  }

  /**
   * 是否是 Git 仓库
   */
  isRepository(projectPath: string): boolean {
    return GitOperations.isGitRepository(projectPath);
  }

  /**
   * 获取远程仓库列表
   */
  async getRemotes(projectPath: string): Promise<RemoteInfo[]> {
    return new GitOperations(projectPath).getRemotes();
  }

  /**
   * 获取当前分支
   */
  async getCurrentBranch(projectPath: string): Promise<string> {
    return new GitOperations(projectPath).getCurrentBranch();
  }

  /**
   * 获取工作区状态
   */
  async getStatus(projectPath: string): Promise<string> {
    return new GitOperations(projectPath).status();
  }

  /**
   * 上传项目到远程仓库（新建仓库 + 推送）
   * @param options 上传参数
   */
  async upload(options: {
    projectPath: string;
    platform: Platform;
    repoName: string;
    description: string;
    isPrivate: boolean;
    onProgress: (percent: number, message: string) => void;
  }): Promise<string> {
    return uploadProject({
      projectPath: options.projectPath,
      platform: options.platform,
      repoName: options.repoName,
      description: options.description,
      isPrivate: options.isPrivate,
      onProgress: options.onProgress
    });
  }

  /**
   * 拉取远程最新代码（多人协作防冲突）
   */
  async pull(options: {
    projectPath: string;
    onProgress: (percent: number, message: string) => void;
  }): Promise<{ success: boolean; branch?: string; message: string }> {
    return pullProject({
      projectPath: options.projectPath,
      onProgress: options.onProgress
    });
  }

  /**
   * 协同同步已有仓库（暂存 → 提交 → 融合远程最新代码 → 推送）
   * @param options 同步参数
   */
  async sync(options: {
    projectPath: string;
    message?: string;
    onProgress: (percent: number, message: string) => void;
  }): Promise<{ committed: boolean; commitMessage?: string; branch?: string; reason?: string; pulled?: boolean }> {
    return syncProject({
      projectPath: options.projectPath,
      message: options.message,
      bypassHooks: this.configManager.bypassHooks,
      onProgress: options.onProgress
    });
  }

  /**
   * 暂存全部改动并返回暂存区 diff
   */
  async stageAndGetDiff(projectPath: string): Promise<string> {
    const git = new GitOperations(projectPath);
    await git.addAll();
    return git.getStagedDiff();
  }

  /**
   * 生成提交信息（复用 shared/ai/commit.js，含缓存与智能模型选择）
   */
  async generateCommitMessage(diff: string): Promise<string> {
    return generateCommitMessage(diff, '');
  }
}
