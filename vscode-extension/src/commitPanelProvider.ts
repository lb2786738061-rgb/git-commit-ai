import * as vscode from 'vscode';
import { CodeAssistant } from './codeAssistant';
import { CommitTreeItem } from './commitTreeItem';
import { GitService } from './gitService';
import { ConfigManager } from './configManager';

/**
 * 侧边栏面板：展示暂存区变更，并提供上传 / 提交推送 / 生成提交信息的入口
 */
export class CommitPanelProvider implements vscode.TreeDataProvider<CommitTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<CommitTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private stagedDiff: string = '';
  private suggestedCommitMessage: string = '';

  constructor(
    private context: vscode.ExtensionContext,
    private codeAssistant: CodeAssistant,
    private gitService: GitService,
    private configManager: ConfigManager
  ) {
    this.loadStagedDiff();
  }

  refresh(): void {
    this.loadStagedDiff();
    this._onDidChangeTreeData.fire();
  }

  private async loadStagedDiff() {
    try {
      const gitExtension = vscode.extensions.getExtension('vscode.git');
      if (gitExtension) {
        await gitExtension.activate();
        const git = gitExtension.exports.getAPI(1);
        if (git) {
          const repo = git.repositories[0];
          if (repo) {
            this.stagedDiff = await repo.diffIndex();
          }
        }
      }
    } catch (error) {
      console.error('Failed to load staged diff:', error);
      this.stagedDiff = '';
    }
  }

  getTreeItem(element: CommitTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: CommitTreeItem): Promise<CommitTreeItem[]> {
    if (!element) {
      const items: CommitTreeItem[] = [];

      // 上传到远程仓库
      items.push(
        new CommitTreeItem(
          '上传到远程仓库',
          vscode.TreeItemCollapsibleState.None,
          { command: 'codesync.upload', title: '上传到远程仓库' },
          'upload'
        )
      );

      // 拉取远程代码
      items.push(
        new CommitTreeItem(
          '拉取团队最新代码',
          vscode.TreeItemCollapsibleState.None,
          { command: 'codesync.pull', title: '拉取团队最新代码' },
          'cloud-download'
        )
      );

      // 提交并协同推送
      items.push(
        new CommitTreeItem(
          '提交并协同推送',
          vscode.TreeItemCollapsibleState.None,
          { command: 'codesync.sync', title: '提交并协同推送' },
          'sync'
        )
      );

      if (!this.stagedDiff) {
        items.push(
          new CommitTreeItem(
            '没有暂存的更改',
            vscode.TreeItemCollapsibleState.None,
            { command: 'git.stage', title: '暂存更改' },
            'empty'
          )
        );
        return items;
      }

      // 暂存区变更
      items.push(
        new CommitTreeItem(
          '暂存的更改',
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          'files'
        )
      );

      // AI 提交信息建议
      if (this.suggestedCommitMessage) {
        items.push(
          new CommitTreeItem(
            `建议: ${this.suggestedCommitMessage.substring(0, 50)}${
              this.suggestedCommitMessage.length > 50 ? '...' : ''
            }`,
            vscode.TreeItemCollapsibleState.None,
            { command: 'codesync.generateCommit', title: '重新生成' },
            'suggestion'
          )
        );
      } else {
        items.push(
          new CommitTreeItem(
            '生成提交信息',
            vscode.TreeItemCollapsibleState.None,
            { command: 'codesync.generateCommit', title: '生成' },
            'generate'
          )
        );
      }

      return items;
    } else if (element.contextValue === 'files') {
      const diffPreview =
        this.stagedDiff.substring(0, 500) +
        (this.stagedDiff.length > 500 ? '\n... (已截断)' : '');
      return [new CommitTreeItem(diffPreview, vscode.TreeItemCollapsibleState.None, undefined, 'diff')];
    }

    return [];
  }

  /**
   * 生成提交信息并直接提交
   */
  async generateCommitMessage() {
    if (!this.stagedDiff) {
      vscode.window.showWarningMessage('没有暂存的更改');
      return;
    }

    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: '正在生成提交信息...',
          cancellable: false
        },
        async () => {
          this.suggestedCommitMessage = await this.codeAssistant.generateCommitMessage(this.stagedDiff);
          this._onDidChangeTreeData.fire();

          const result = await vscode.window.showInputBox({
            title: '编辑并确认提交信息',
            value: this.suggestedCommitMessage,
            ignoreFocusOut: true
          });

          if (!result) return;

          const gitExtension = vscode.extensions.getExtension('vscode.git');
          if (!gitExtension) return;

          await gitExtension.activate();
          const git = gitExtension.exports.getAPI(1);
          const repo = git?.repositories?.[0];
          if (repo) {
            await repo.commit(result);
            vscode.window.showInformationMessage('✅ 提交成功');
            this.suggestedCommitMessage = '';
            this.refresh();
          }
        }
      );
    } catch (error: any) {
      const message = error?.message || String(error);
      if (message.includes('API Key')) {
        await this.configManager.showNoConfigWarning();
      } else {
        vscode.window.showErrorMessage(`生成提交信息失败: ${message}`);
      }
    }
  }
}
