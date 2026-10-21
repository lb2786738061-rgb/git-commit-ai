import { GitOperations } from './operations.js';
import { ensureGitignore } from './gitignore.js';
import { createGitHubRepo, createGiteeRepo, createGitLabRepo } from '../platform/index.js';
import { generateCommitMessage } from '../ai/commit.js';

/**
 * 上传项目到远程仓库
 * @param {object} options 上传选项
 * @param {string} options.projectPath 项目路径
 * @param {string} options.platform 平台 (github/gitee/gitlab)
 * @param {string} options.repoName 仓库名称
 * @param {string} options.description 描述
 * @param {boolean} options.isPrivate 是否私有
 * @param {function} options.onProgress 进度回调
 * @returns {Promise<string>} 仓库URL
 */
export async function uploadProject(options) {
  const {
    projectPath,
    platform,
    repoName,
    description = '',
    isPrivate = false,
    onProgress = () => {}
  } = options;

  const git = new GitOperations(projectPath);

  try {
    // 1. 检查是否已初始化
    onProgress(10, '检查 Git 仓库...');
    const isRepo = GitOperations.isGitRepository(projectPath);
    if (!isRepo) {
      onProgress(15, '初始化 Git 仓库...');
      await git.init();
    }

    // 1.5. 确保 .gitignore 存在（自动检测项目类型并创建）
    const gitignoreResult = ensureGitignore(projectPath);
    if (gitignoreResult.created) {
      onProgress(20, `已生成 .gitignore (${gitignoreResult.type} 模板)...`);
    }

    // 2. 添加所有文件
    onProgress(30, '添加文件...');
    await git.addAll();

    // 3. 生成提交信息（使用AI）
    onProgress(40, '生成提交信息...');
    const diff = await git.getStagedDiff();
    let commitMessage = 'Initial commit';
    if (diff && diff.trim()) {
      try {
        commitMessage = await generateCommitMessage(diff, '');
      } catch (error) {
        console.warn(`\n⚠️  AI 生成提交信息失败 (${error.message})，将使用默认提交信息`);
      }
    }

    // 4. 提交
    onProgress(50, '提交更改...');
    await git.commit(commitMessage, { bypassHooks: true });

    // 5. 设置分支为 main
    onProgress(60, '设置分支...');
    await git.setBranch('main');

    // 6. 创建远程仓库
    onProgress(70, `在 ${platform} 创建仓库...`);
    let repoUrl;
    if (platform === 'github') {
      repoUrl = await createGitHubRepo(repoName, description, isPrivate);
    } else if (platform === 'gitee') {
      repoUrl = await createGiteeRepo(repoName, description, isPrivate);
    } else if (platform === 'gitlab') {
      repoUrl = await createGitLabRepo(repoName, description, isPrivate);
    } else {
      throw new Error(`不支持的平台: ${platform}，支持的平台: github, gitee, gitlab`);
    }

    // 7. 关联远程仓库
    onProgress(80, '关联远程仓库...');
    await git.addRemote('origin', repoUrl);

    // 8. 推送
    onProgress(90, '推送代码...');
    await git.push('origin', 'main');

    onProgress(100, '完成！');
    return repoUrl;
  } catch (error) {
    throw new Error(`上传失败: ${error.message}`);
  }
}

/**
 * 增量同步已有仓库：暂存改动 → 生成提交信息 → 提交 → 推送到远程
 * @param {object} options 同步选项
 * @param {string} options.projectPath 项目路径
 * @param {string} [options.message] 提交信息（不传则由 AI 生成）
 * @param {string} [options.remote='origin'] 远程仓库名
 * @param {boolean} [options.bypassHooks=false] 是否跳过 Git 钩子校验
 * @param {function} options.onProgress 进度回调
 * @returns {Promise<{committed: boolean, commitMessage?: string, branch?: string, reason?: string}>}
 */
export async function syncProject(options) {
  const {
    projectPath,
    message,
    remote = 'origin',
    bypassHooks = false,
    onProgress = () => {}
  } = options;

  const git = new GitOperations(projectPath);

  if (!GitOperations.isGitRepository(projectPath)) {
    throw new Error('当前目录不是 Git 仓库');
  }

  try {
    onProgress(10, '添加文件...');
    await git.addAll();

    onProgress(25, '检查变更...');
    const diff = await git.getStagedDiff();

    if (!diff || !diff.trim()) {
      onProgress(100, '没有需要提交的更改');
      return { committed: false, reason: 'no-changes' };
    }

    let commitMessage = message;
    if (!commitMessage) {
      onProgress(45, '生成提交信息...');
      commitMessage = await generateCommitMessage(diff, '');
    }

    onProgress(65, '提交更改...');
    await git.commit(commitMessage, { bypassHooks });

    onProgress(80, '推送到远程...');
    const branch = await git.getCurrentBranch();
    await git.push(remote, branch);

    onProgress(100, '同步完成！');
    return { committed: true, commitMessage, branch };
  } catch (error) {
    throw new Error(`同步失败: ${error.message}`);
  }
}
