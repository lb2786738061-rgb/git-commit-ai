import * as vscode from 'vscode';
import { CodeAssistant } from './codeAssistant';
import { CommitTreeItem } from './commitTreeItem';

export class CommitPanelProvider implements vscode.TreeDataProvider<CommitTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<CommitTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private stagedDiff: string = '';
  private suggestedCommitMessage: string = '';

  constructor(
    private context: vscode.ExtensionContext,
    private codeAssistant: CodeAssistant
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
            const diff = await repo.diffIndex();
            this.stagedDiff = diff;
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
      // Root level
      if (!this.stagedDiff) {
        return [
          new CommitTreeItem(
            'No staged changes',
            vscode.TreeItemCollapsibleState.None,
            { command: 'git.stage', title: 'Stage changes' }
          )
        ];
      }

      const items: CommitTreeItem[] = [];

      // Staged changes indicator
      items.push(new CommitTreeItem(
        'Staged Changes',
        vscode.TreeItemCollapsibleState.Collapsed,
        undefined,
        'files'
      ));

      // AI commit message suggestion
      if (this.suggestedCommitMessage) {
        items.push(new CommitTreeItem(
          `Suggested: ${this.suggestedCommitMessage.substring(0, 50)}...`,
          vscode.TreeItemCollapsibleState.None,
          { command: 'codesync.generateCommit', title: 'Generate new message' },
          'suggestion'
        ));
      } else {
        items.push(new CommitTreeItem(
          'Generate Commit Message',
          vscode.TreeItemCollapsibleState.None,
          { command: 'codesync.generateCommit', title: 'Generate' },
          'generate'
        ));
      }

      return items;
    } else if (element.contextValue === 'files') {
      // Show diff preview
      const diffPreview = this.stagedDiff.substring(0, 500) + (this.stagedDiff.length > 500 ? '\n... (truncated)' : '');
      return [
        new CommitTreeItem(
          diffPreview,
          vscode.TreeItemCollapsibleState.None,
          undefined,
          'diff'
        )
      ];
    }

    return [];
  }

  async generateCommitMessage() {
    if (!this.stagedDiff) {
      vscode.window.showWarningMessage('No staged changes to commit');
      return;
    }

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating commit message...',
        cancellable: false
      }, async () => {
        this.suggestedCommitMessage = await this.codeAssistant.generateCommitMessage(this.stagedDiff);
        this._onDidChangeTreeData.fire();

        // Show the message and ask for confirmation
        const result = await vscode.window.showInputBox({
          prompt: 'Edit commit message if needed',
          value: this.suggestedCommitMessage,
          placeHolder: 'Commit message'
        });

        if (result) {
          // Commit with the message
          const gitExtension = vscode.extensions.getExtension('vscode.git');
          if (gitExtension) {
            await gitExtension.activate();
            const git = gitExtension.exports.getAPI(1);
            if (git) {
              const repo = git.repositories[0];
              if (repo) {
                await repo.commit(result);
                vscode.window.showInformationMessage('Commit successful!');
                this.suggestedCommitMessage = '';
                this.refresh();
              }
            }
          }
        }
      });
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to generate commit message: ${error.message}`);
    }
  }
}
