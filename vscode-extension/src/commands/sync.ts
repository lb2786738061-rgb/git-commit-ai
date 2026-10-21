import * as vscode from 'vscode';
import { GitService } from '../gitService';
import { ConfigManager } from '../configManager';

/**
 * 提交并推送（增量同步）
 *
 * 复用 CLI 的 `codesync update` 能力：
 * 暂存全部改动 → AI 生成提交信息（可编辑） → 提交 → 推送到远程
 */
export async function syncCommand(gitService: GitService, configManager: ConfigManager) {
  const projectPath = GitService.resolveProjectPath();
  if (!projectPath) {
    vscode.window.showErrorMessage('请先打开一个项目文件夹');
    return;
  }

  if (!gitService.isRepository(projectPath)) {
    const choice = await vscode.window.showErrorMessage(
      '当前目录不是 Git 仓库',
      '初始化并上传'
    );
    if (choice === '初始化并上传') {
      const { uploadCommand } = await import('./upload');
      await uploadCommand(gitService, configManager);
    }
    return;
  }

  const remotes = await gitService.getRemotes(projectPath);
  if (remotes.length === 0) {
    const choice = await vscode.window.showWarningMessage(
      '当前项目没有关联远程仓库',
      '创建仓库并上传'
    );
    if (choice === '创建仓库并上传') {
      const { uploadCommand } = await import('./upload');
      await uploadCommand(gitService, configManager);
    }
    return;
  }

  try {
    // 1. 暂存并生成提交信息
    const diff = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: '正在分析变更...', cancellable: false },
      async () => gitService.stageAndGetDiff(projectPath)
    );

    if (!diff || !diff.trim()) {
      vscode.window.showInformationMessage('没有需要提交的更改');
      return;
    }

    const suggested = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: '正在生成提交信息...', cancellable: false },
      async () => gitService.generateCommitMessage(diff)
    );

    // 2. 允许用户编辑提交信息
    const message = await vscode.window.showInputBox({
      title: '确认提交信息',
      value: suggested,
      ignoreFocusOut: true,
      validateInput: value => (value.trim() ? null : '提交信息不能为空')
    });
    if (!message) return;

    // 3. 提交并推送
    const result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: '正在提交并推送...',
        cancellable: false
      },
      async (progress) => {
        return gitService.sync({
          projectPath,
          message: message.trim(),
          onProgress: (percent, msg) => {
            progress.report({ message: `${percent}% ${msg}` });
          }
        });
      }
    );

    if (result.committed) {
      const action = await vscode.window.showInformationMessage(
        `✅ 协同同步成功：已自动融合远程最新代码并推送到 ${result.branch} 分支`,
        '查看提交'
      );
      if (action === '查看提交') {
        await vscode.commands.executeCommand('git.viewHistory');
      }
    } else if (result.pulled) {
      vscode.window.showInformationMessage(`✅ 已成功拉取团队最新代码（分支: ${result.branch || '当前分支'}）`);
    } else {
      vscode.window.showInformationMessage('当前工作区已是最新，无待同步项');
    }
  } catch (error: any) {
    const message = error?.message || String(error);
    if (message.includes('API Key')) {
      await configManager.showNoConfigWarning();
    } else if (message.includes('多人代码冲突') || error?.isConflict) {
      vscode.window.showErrorMessage(message, { modal: true });
    } else {
      vscode.window.showErrorMessage(`同步失败: ${message}`);
    }
  }
}
