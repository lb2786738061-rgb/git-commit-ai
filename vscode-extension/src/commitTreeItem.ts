import * as vscode from 'vscode';

export class CommitTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly contextValue?: string
  ) {
    super(label, collapsibleState);

    if (contextValue === 'generate') {
      this.iconPath = new vscode.ThemeIcon('edit');
      this.contextValue = 'generate';
    } else if (contextValue === 'suggestion') {
      this.iconPath = new vscode.ThemeIcon('lightbulb');
      this.contextValue = 'suggestion';
    } else if (contextValue === 'diff') {
      this.iconPath = new vscode.ThemeIcon('diff');
      this.contextValue = 'diff';
    } else if (contextValue === 'files') {
      this.iconPath = new vscode.ThemeIcon('files');
      this.contextValue = 'files';
    } else if (contextValue === 'upload') {
      this.iconPath = new vscode.ThemeIcon('cloud-upload');
      this.contextValue = 'upload';
    } else if (contextValue === 'sync') {
      this.iconPath = new vscode.ThemeIcon('sync');
      this.contextValue = 'sync';
    } else if (contextValue === 'empty') {
      this.iconPath = new vscode.ThemeIcon('info');
      this.contextValue = 'empty';
    }
  }
}
