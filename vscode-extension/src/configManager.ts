import * as vscode from 'vscode';
import { readConfig, writeConfig, getConfigFilePath } from '../../shared/config.js';

/**
 * VS Code 设置项 → 环境变量映射。
 * 环境变量优先级高于配置文件，因此 VS Code 里的显式设置可以直接覆盖
 * shared/ 模块读取到的配置，无需重复实现一套配置逻辑。
 */
const ENV_MAP: Array<{ key: string; env: string; type: 'string' | 'boolean' }> = [
  { key: 'apiKey', env: 'OPENAI_API_KEY', type: 'string' },
  { key: 'apiBase', env: 'OPENAI_API_BASE', type: 'string' },
  { key: 'model', env: 'OPENAI_MODEL', type: 'string' },
  { key: 'convention', env: 'COMMIT_CONVENTION', type: 'string' },
  { key: 'language', env: 'COMMIT_LANGUAGE', type: 'string' },
  { key: 'smartModel', env: 'COMMIT_SMART_MODEL', type: 'boolean' },
  { key: 'fastModel', env: 'COMMIT_FAST_MODEL', type: 'string' },
  { key: 'powerfulModel', env: 'COMMIT_POWERFUL_MODEL', type: 'string' },
  { key: 'githubToken', env: 'GITHUB_TOKEN', type: 'string' },
  { key: 'giteeToken', env: 'GITEE_TOKEN', type: 'string' },
  { key: 'gitlabToken', env: 'GITLAB_TOKEN', type: 'string' },
  { key: 'gitlabBase', env: 'GITLAB_BASE', type: 'string' }
];

export type Platform = 'github' | 'gitee' | 'gitlab';

export const PLATFORMS: Array<{ id: Platform; label: string }> = [
  { id: 'github', label: 'GitHub' },
  { id: 'gitee', label: 'Gitee' },
  { id: 'gitlab', label: 'GitLab' }
];

/**
 * 配置管理器
 *
 * 单一数据源为 `~/.git-commit-ai.json`（与 CLI、桌面版共用），
 * VS Code 设置仅作为可选的覆盖项，读取 shared 模块时通过环境变量注入。
 */
export class ConfigManager {
  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.config = vscode.workspace.getConfiguration('codesync');
    this.applyOverrides();
  }

  /**
   * 读取用户在 VS Code 中显式设置过的值（忽略默认值）
   */
  private explicitValue(key: string): unknown {
    const inspected = this.config.inspect(key);
    if (!inspected) return undefined;
    return inspected.workspaceFolderValue ?? inspected.workspaceValue ?? inspected.globalValue;
  }

  /**
   * 将 VS Code 中显式设置的值注入环境变量，供 shared/ 模块读取
   */
  applyOverrides(): void {
    for (const item of ENV_MAP) {
      const value = this.explicitValue(item.key);
      if (value === undefined || value === null || value === '') continue;
      process.env[item.env] = item.type === 'boolean' ? (value ? 'true' : 'false') : String(value);
    }
  }

  /**
   * 获取当前生效的完整配置（配置文件 + 环境变量覆盖）
   */
  getConfig() {
    this.applyOverrides();
    return readConfig();
  }

  get apiKey(): string {
    return this.getConfig().apiKey;
  }

  get apiBase(): string {
    return this.getConfig().apiBase;
  }

  get model(): string {
    return this.getConfig().model;
  }

  get convention(): string {
    return this.getConfig().convention;
  }

  get language(): string {
    return this.getConfig().language;
  }

  get smartModel(): boolean {
    return this.getConfig().smartModel;
  }

  get githubToken(): string {
    return this.getConfig().githubToken;
  }

  get giteeToken(): string {
    return this.getConfig().giteeToken;
  }

  get gitlabToken(): string {
    return this.getConfig().gitlabToken;
  }

  /**
   * 获取指定平台的 Token
   */
  getToken(platform: Platform): string {
    const config = this.getConfig();
    if (platform === 'github') return config.githubToken;
    if (platform === 'gitee') return config.giteeToken;
    return config.gitlabToken;
  }

  /**
   * 默认使用的平台
   */
  get defaultPlatform(): Platform {
    const value = this.config.get<string>('platform', 'github');
    return (PLATFORMS.some(p => p.id === value) ? value : 'github') as Platform;
  }

  /**
   * 是否跳过 Git 钩子校验
   */
  get bypassHooks(): boolean {
    return this.config.get<boolean>('bypassHooks', false);
  }

  /**
   * 配置文件路径
   */
  get configFilePath(): string {
    return getConfigFilePath();
  }

  /**
   * 写入共享配置（与 CLI / 桌面版同一份文件）
   */
  async saveConfig(partial: Record<string, unknown>): Promise<void> {
    this.applyOverrides();
    writeConfig(partial as any);
    this.config = vscode.workspace.getConfiguration('codesync');
  }

  /**
   * 在设置界面中打开 CodeSync 配置
   */
  async openSettings(query?: string): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.openSettings', query ? `codesync.${query}` : 'codesync');
  }

  /**
   * API Key 未配置时提示用户
   */
  async showNoConfigWarning(): Promise<void> {
    const result = await vscode.window.showWarningMessage(
      'CodeSync API Key 未配置',
      '打开设置',
      '配置 API Key'
    );

    if (result === '打开设置') {
      await this.openSettings('apiKey');
    } else if (result === '配置 API Key') {
      const key = await vscode.window.showInputBox({
        prompt: '输入 OpenAI API Key（保存到 ~/.git-commit-ai.json，与 CLI 共用）',
        password: true,
        ignoreFocusOut: true
      });
      if (key) {
        await this.saveConfig({ apiKey: key });
        vscode.window.showInformationMessage('✅ API Key 已保存');
      }
    }
  }
}
