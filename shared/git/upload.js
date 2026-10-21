import { GitOperations } from './operations.js';
import { ensureGitignore } from './gitignore.js';
import { createGitHubRepo, createGiteeRepo, createGitLabRepo } from '../platform/index.js';
import { generateCommitMessage } from '../ai/commit.js';
import { analyzeConflict } from '../ai/conflict.js';

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
 * 安全拉取远程仓库最新代码（多人协作防冲突基础）
 * @param {object} options 拉取选项
 * @param {string} options.projectPath 项目路径
 * @param {string} [options.remote='origin'] 远程名称
 * @param {function} [options.onProgress] 进度回调
 * @returns {Promise<{success: boolean, message: string, conflict?: boolean, aiAnalysis?: any}>}
 */
export async function pullProject(options) {
  const {
    projectPath,
    remote = 'origin',
    onProgress = () => {}
  } = options;

  const git = new GitOperations(projectPath);

  if (!GitOperations.isGitRepository(projectPath)) {
    throw new Error('当前目录不是 Git 仓库');
  }

  try {
    onProgress(20, '检查当前分支...');
    const branch = await git.getCurrentBranch();

    onProgress(50, `正在从 ${remote}/${branch} 拉取远程最新代码...`);
    const output = await git.pull(remote, branch);

    onProgress(100, '拉取完成！已同步团队最新代码');
    return {
      success: true,
      branch,
      message: output.includes('Already up to date') ? '当前代码已是最新，无新更新' : '已成功合并远程最新代码'
    };
  } catch (error) {
    if (error.isConflict) {
      onProgress(85, '检测到多人代码冲突，正在唤醒 AI 智能体分析冲突...');
      const conflictFiles = await git.getConflictFiles();
      const conflictDiff = await git.getConflictDiff(conflictFiles);
      const aiAnalysis = await analyzeConflict({ conflictFiles, conflictDiff, projectPath });
      const conflictErr = new Error(`拉取冲突: 远程与本地代码发生冲突。\n\n【冲突文件】:\n${conflictFiles.map(f => ' - ' + f).join('\n')}\n\n【AI 智能体合并建议】:\n${aiAnalysis.suggestions}`);
      conflictErr.isConflict = true;
      conflictErr.conflictFiles = conflictFiles;
      conflictErr.aiAnalysis = aiAnalysis;
      throw conflictErr;
    }
    throw new Error(`更新失败: ${error.message}`);
  }
}

/**
 * 协同同步已有仓库：暂存改动 → 生成提交信息 → 提交 → 融合远程最新代码 → 推送到远程
 * @param {object} options 同步选项
 * @param {string} options.projectPath 项目路径
 * @param {string} [options.message] 提交信息（不传则由 AI 生成）
 * @param {string} [options.remote='origin'] 远程仓库名
 * @param {boolean} [options.bypassHooks=false] 是否跳过 Git 钩子校验
 * @param {function} options.onProgress 进度回调
 * @returns {Promise<{committed: boolean, commitMessage?: string, branch?: string, reason?: string, pulled?: boolean}>}
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
    onProgress(10, '检查本地改动...');
    await git.addAll();

    const diff = await git.getStagedDiff();
    const branch = await git.getCurrentBranch();

    let committed = false;
    let commitMessage = message;

    // 1. 若有本地改动，先安全提交到本地分支（防止拉取时覆盖工作区）
    if (diff && diff.trim()) {
      if (!commitMessage) {
        onProgress(30, 'AI 生成提交信息...');
        commitMessage = await generateCommitMessage(diff, '');
      }

      onProgress(50, '提交本地更改...');
      await git.commit(commitMessage, { bypassHooks });
      committed = true;
    } else {
      onProgress(40, '本地无新修改，准备拉取远程更新...');
    }

    // 2. 推送前先拉取远程更新以融合团队最新代码（多人协作核心步骤）
    onProgress(70, `拉取 ${remote}/${branch} 远程最新代码以防冲突...`);
    try {
      await git.pull(remote, branch);
    } catch (pullErr) {
      if (pullErr.isConflict) {
        onProgress(85, '检测到多人代码冲突，正在由 AI 智能体分析冲突...');
        const conflictFiles = await git.getConflictFiles();
        const conflictDiff = await git.getConflictDiff(conflictFiles);
        const aiAnalysis = await analyzeConflict({ conflictFiles, conflictDiff, projectPath });
        const conflictErr = new Error(`多人代码冲突: 远程与本地发生重叠冲突，已提交本地暂存，请解决冲突后推送。\n\n【冲突文件】:\n${conflictFiles.map(f => ' - ' + f).join('\n')}\n\n【AI 智能体合并建议】:\n${aiAnalysis.suggestions}`);
        conflictErr.isConflict = true;
        conflictErr.conflictFiles = conflictFiles;
        conflictErr.aiAnalysis = aiAnalysis;
        throw conflictErr;
      }
      throw pullErr;
    }

    // 3. 安全推送到远端
    if (committed) {
      onProgress(90, `推送到远程 ${remote}/${branch}...`);
      await git.push(remote, branch);
      onProgress(100, '协同同步完成！');
      return { committed: true, commitMessage, branch };
    } else {
      onProgress(100, '同步完成！已成功拉取团队最新代码');
      return { committed: false, pulled: true, branch, reason: 'already-latest' };
    }
  } catch (error) {
    throw new Error(`同步失败: ${error.message}`);
  }
}
