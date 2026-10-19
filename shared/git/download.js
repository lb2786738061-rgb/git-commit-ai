import { GitOperations } from './operations.js';
import fs from 'fs';
import path from 'path';

/**
 * 下载项目到本地
 * @param {object} options 下载选项
 * @param {string} options.repoUrl 仓库URL
 * @param {string} options.targetPath 目标路径
 * @param {boolean} options.installDeps 是否自动安装依赖
 * @param {function} options.onProgress 进度回调
 * @returns {Promise<string>} 项目路径
 */
export async function downloadProject(options) {
  const {
    repoUrl,
    targetPath,
    installDeps = false,
    onProgress = () => {}
  } = options;

  const git = new GitOperations(targetPath);

  try {
    // 1. Clone 仓库
    onProgress(30, '克隆仓库...');
    await git.clone(repoUrl, targetPath);

    // 2. 检查是否有 package.json
    const packageJsonPath = path.join(targetPath, 'package.json');
    if (installDeps && fs.existsSync(packageJsonPath)) {
      onProgress(60, '安装依赖...');
      await installDependencies(targetPath);
    }

    onProgress(100, '完成！');
    return targetPath;
  } catch (error) {
    throw new Error(`下载失败: ${error.message}`);
  }
}

/**
 * 安装项目依赖
 * @param {string} projectPath 项目路径
 */
async function installDependencies(projectPath) {
  const { execFileSync } = await import('child_process');

  try {
    // 尝试使用 npm
    execFileSync('npm', ['install'], {
      cwd: projectPath,
      stdio: 'pipe',
      timeout: 600000 // 10分钟超时
    });
  } catch (error) {
    try {
      // npm 失败，尝试使用 pnpm
      execFileSync('pnpm', ['install'], {
        cwd: projectPath,
        stdio: 'pipe',
        timeout: 600000
      });
    } catch (pnpmError) {
      try {
        // pnpm 失败，尝试使用 yarn
        execFileSync('yarn', ['install'], {
          cwd: projectPath,
          stdio: 'pipe',
          timeout: 600000
        });
      } catch (yarnError) {
        console.warn('自动安装依赖失败，请手动安装');
      }
    }
  }
}
