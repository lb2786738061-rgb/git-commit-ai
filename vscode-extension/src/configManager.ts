import * as vscode from 'vscode';

export class ConfigManager {
  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.config = vscode.workspace.getConfiguration('codesync');
  }

  get apiKey(): string {
    return this.config.get<string>('apiKey', '');
  }

  get apiBase(): string {
    return this.config.get<string>('apiBase', 'https://api.openai.com/v1');
  }

  get model(): string {
    return this.config.get<string>('model', 'gpt-4o-mini');
  }

  get convention(): string {
    return this.config.get<string>('convention', 'angular');
  }

  get language(): string {
    return this.config.get<string>('language', 'en');
  }

  get smartModel(): boolean {
    return this.config.get<boolean>('smartModel', true);
  }

  updateConfig() {
    this.config = vscode.workspace.getConfiguration('codesync');
  }

  async setApiKey(key: string): Promise<void> {
    await this.config.update('apiKey', key, vscode.ConfigurationTarget.Global);
  }

  async setApiBase(url: string): Promise<void> {
    await this.config.update('apiBase', url, vscode.ConfigurationTarget.Global);
  }

  async setModel(model: string): Promise<void> {
    await this.config.update('model', model, vscode.ConfigurationTarget.Global);
  }
}
