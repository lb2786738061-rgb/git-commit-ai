import * as vscode from 'vscode';
import path from 'path';
import { GitService } from '../gitService';
import { ConfigManager, Platform, PLATFORMS } from '../configManager';
import { syncCommand } from './sync';

/**
 * 上传项目到远程仓库
 *
 * 完整复用 CLI 的 `codesync upload` 能力（shared/git/upload.js）：
 * 初始化仓库 → 生成 .gitignore → 暂存 → AI 生成提交信息 → 提交
 * → 在平台创建仓库 → 关联远程 → 推送
 */
export async function uploadCommand(gitService: GitService, configManager: ConfigManager) {
  const projectPath = GitService.resolveProjectPath();
  if (!projectPath) {
    vscode.window.showErrorMessage('请先打开一个项目文件夹');
    return;
  }

  // 已有远程仓库时，引导到「提交并推送」
  if (gitService.isRepository(projectPath)) {
    const remotes = await gitService.getRemotes(projectPath);
    if (remotes.length > 0) {
      const choice = await vscode.window.showInformationMessage(
        `当前项目已关联远程仓库 ${remotes[0].url}，直接提交并推送即可。`,
        '提交并推送',
        '仍然新建仓库'
      );
      if (choice === '提交并推送') {
        await syncCommand(gitService, configManager);
        return;
      }
      if (!choice) return;
    }
  }

  // 1. 选择平台
  const platformPick = await vscode.window.showQuickPick(
    PLATFORMS.map(p => ({
      label: p.label,
      description: p.id === configManager.defaultPlatform ? '默认' : undefined,
      id: p.id
    })),
    { title: '选择代码托管平台', placeHolder: 'GitHub / Gitee / GitLab' }
  );
  if (!platformPick) return;
  const platform = platformPick.id as Platform;

  // 2. 仓库名称
  const repoName = await vscode.window.showInputBox({
    title: '仓库名称',
    value: path.basename(projectPath),
    ignoreFocusOut: true,
    validateInput: value => (value.trim() ? null : '仓库名称不能为空')
  });
  if (!repoName) return;

  // 3. 仓库描述
  const description = await vscode.window.showInputBox({
    title: '仓库描述（可选）',
    placeHolder: '一句话描述这个项目',
    ignoreFocusOut: true
  });
  if (description === undefined) return;

  // 4. 可见性
  const visibilityPick = await vscode.window.showQuickPick(
    [
      { label: '公开', description: '任何人都可以看到', isPrivate: false },
      { label: '私有', description: '仅自己和协作者可见', isPrivate: true }
    ],
    { title: '仓库可见性', placeHolder: '选择公开或私有' }
  );
  if (!visibilityPick) return;
  const isPrivate = visibilityPick.isPrivate;

  // 5. 确认
  const confirm = await vscode.window.showQuickPick(
    [
      {
        label: `$(check) 确认上传到 ${platformPick.label}`,
        description: `${repoName}${isPrivate ? '（私有）' : '（公开）'}`,
        id: 'yes'
      },
      { label: '$(close) 取消', id: 'no' }
    ],
    { title: '确认上传信息', placeHolder: '确认无误后开始上传' }
  );
  if (!confirm || confirm.id !== 'yes') return;

  // 6. 检查 Token
  if (!configManager.getToken(platform)) {
    const token = await vscode.window.showInputBox({
      title: `配置 ${platformPick.label} Token`,
      prompt: `未检测到 ${platformPick.label} Token，粘贴 Personal Access Token（保存到 ~/.git-commit-ai.json，与 CLI 共用）`,
      password: true,
      ignoreFocusOut: true
    });
    if (!token) {
      vscode.window.showErrorMessage(`缺少 ${platformPick.label} Token，已取消上传`);
      return;
    }
    await configManager.saveConfig({ [`${platform}Token`]: token });
  }

  // 7. 执行上传
  try {
    const repoUrl = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `正在上传到 ${platformPick.label}...`,
        cancellable: false
      },
      async (progress) => {
        return gitService.upload({
          projectPath,
          platform,
          repoName: repoName.trim(),
          description: description.trim(),
          isPrivate,
          onProgress: (percent, message) => {
            progress.report({ message: `${percent}% ${message}` });
          }
        });
      }
    );

    const action = await vscode.window.showInformationMessage(
      `✅ 上传成功: ${repoUrl}`,
      '复制链接',
      '打开仓库'
    );
    if (action === '复制链接') {
      await vscode.env.clipboard.writeText(repoUrl);
    } else if (action === '打开仓库') {
      await vscode.env.openExternal(vscode.Uri.parse(repoUrl));
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`上传失败: ${error?.message || error}`);
  }
}
