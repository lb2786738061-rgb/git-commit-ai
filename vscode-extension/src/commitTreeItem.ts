import * as vscode from 'vscode';

export class CommitTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly contextValue?: string,
    iconId?: string
  ) {
    super(label, collapsibleState);

    const icon = iconId || contextValue;
    if (icon) {
      const ICON_MAP: Record<string, string> = {
        generate: 'edit',
        suggestion: 'lightbulb',
        diff: 'diff',
        files: 'files',
        upload: 'cloud-upload',
        'cloud-download': 'cloud-download',
        pull: 'cloud-download',
        sync: 'sync',
        empty: 'info',
        settings: 'gear',
        wizard: 'wand',
        key: 'key',
        guide: 'book',
        config: 'settings-gear',
        status: 'output'
      };
      const themeIconName = ICON_MAP[icon] || icon;
      this.iconPath = new vscode.ThemeIcon(themeIconName);
    }
  }
}
