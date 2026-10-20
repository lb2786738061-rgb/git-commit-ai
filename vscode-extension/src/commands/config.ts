import * as vscode from 'vscode';
import { ConfigManager, PLATFORMS, Platform } from '../configManager';

const MASK = '••••••••';

/**
 * 遮蔽敏感信息
 */
function mask(value: string): string {
  if (!value) return '(未配置)';
  return value.length <= 8 ? MASK : `${value.slice(0, 4)}${MASK}${value.slice(-4)}`;
}

/**
 * 配置平台 Token（写入 ~/.git-commit-ai.json，与 CLI 共用）
 */
export async function setTokenCommand(configManager: ConfigManager) {
  const platformPick = await vscode.window.showQuickPick(
    PLATFORMS.map(p => ({ label: p.label, id: p.id })),
    { title: '选择要配置 Token 的平台', placeHolder: 'GitHub / Gitee / GitLab' }
  );
  if (!platformPick) return;

  const platform = platformPick.id as Platform;
  const current = configManager.getToken(platform);

  const token = await vscode.window.showInputBox({
    title: `配置 ${platformPick.label} Token`,
    prompt: current ? '已有 Token，直接回车可取消' : '粘贴 Personal Access Token',
    value: current ? MASK : '',
    password: true,
    ignoreFocusOut: true
  });
  if (!token || token === MASK) return;

  await configManager.saveConfig({ [`${platform}Token`]: token });
  vscode.window.showInformationMessage(`✅ ${platformPick.label} Token 已保存到 ${configManager.configFilePath}`);
}

/**
 * 查看当前生效的配置
 */
export async function showConfigCommand(configManager: ConfigManager) {
  const config = configManager.getConfig();

  const lines = [
    '# CodeSync 当前配置',
    '',
    `- 配置文件: \`${configManager.configFilePath}\``,
    `- API Key: ${mask(config.apiKey)}`,
    `- API Base: ${config.apiBase}`,
    `- 模型: ${config.model}`,
    `- 智能模型选择: ${config.smartModel ? '开启' : '关闭'}`,
    `  - 快速模型: ${config.fastModel}`,
    `  - 强大模型: ${config.powerfulModel}`,
    `- 提交规范: ${config.convention}`,
    `- 提交语言: ${config.language}`,
    `- 缓存: ${config.enableCache ? '开启' : '关闭'}（TTL ${config.cacheTTL}ms）`,
    '',
    '## 平台 Token',
    '',
    `- GitHub: ${mask(config.githubToken)}`,
    `- Gitee: ${mask(config.giteeToken)}`,
    `- GitLab: ${mask(config.gitlabToken)}`,
    `- GitLab API: ${config.gitlabBase}`
  ];

  const doc = await vscode.workspace.openTextDocument({
    content: lines.join('\n'),
    language: 'markdown'
  });
  await vscode.window.showTextDocument(doc);
}
