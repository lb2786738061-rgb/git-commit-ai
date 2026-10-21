import * as vscode from 'vscode';
import { GitService } from '../gitService';
import { ConfigManager } from '../configManager';

/**
 * 拉取远程最新代码（多人协作防冲突）
 */
export async function pullCommand(gitService: GitService, configManager: ConfigManager) {
  const projectPath = GitService.resolveProjectPath();
  if (!projectPath) {
    vscode.window.showErrorMessage('请先打开一个项目文件夹');
    return;
  }

  if (!gitService.isRepository(projectPath)) {
    vscode.window.showErrorMessage('当前目录不是 Git 仓库，无法执行拉取');
    return;
  }

  try {
    const result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: '正在拉取远程团队最新代码...',
        cancellable: false
      },
      async (progress) => {
        return gitService.pull({
          projectPath,
          onProgress: (percent, msg) => {
            progress.report({ message: `${percent}% ${msg}` });
          }
        });
      }
    );

    vscode.window.showInformationMessage(`✅ ${result.message}（分支: ${result.branch || '当前分支'}）`);
  } catch (error: any) {
    const message = error?.message || String(error);
    if (message.includes('拉取冲突') || error?.isConflict) {
      vscode.window.showErrorMessage(message, { modal: true });
    } else {
      vscode.window.showErrorMessage(`拉取失败: ${message}`);
    }
  }
}
