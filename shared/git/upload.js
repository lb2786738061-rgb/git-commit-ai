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
        console.warn('AI 生成提交信息失败，使用默认信息');
      }
    }

    // 4. 提交
    onProgress(50, '提交更改...');
    await git.commit(commitMessage);

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
