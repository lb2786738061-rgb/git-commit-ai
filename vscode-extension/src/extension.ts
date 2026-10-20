import * as vscode from 'vscode';
import { CommitPanelProvider } from './commitPanelProvider';
import { CodeAssistant } from './codeAssistant';
import { ConfigManager } from './configManager';

let commitPanelProvider: CommitPanelProvider;
let codeAssistant: CodeAssistant;
let configManager: ConfigManager;

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeSync extension is now active!');

  // Initialize managers
  configManager = new ConfigManager();
  codeAssistant = new CodeAssistant(configManager);
  commitPanelProvider = new CommitPanelProvider(context, codeAssistant);

  // Register commit panel view
  const commitPanelView = vscode.window.createTreeView('codesync.commitPanel', {
    treeDataProvider: commitPanelProvider,
    showCollapseAll: false
  });

  // Register commands
  const commands = [
    vscode.commands.registerCommand('codesync.generateCommit', () => {
      commitPanelProvider.generateCommitMessage();
    }),
    vscode.commands.registerCommand('codesync.explainCode', () => {
      codeAssistant.explainCode();
    }),
    vscode.commands.registerCommand('codesync.annotateCode', () => {
      codeAssistant.annotateCode();
    }),
    vscode.commands.registerCommand('codesync.reviewCode', () => {
      codeAssistant.reviewCode();
    }),
    vscode.commands.registerCommand('codesync.refreshDiff', () => {
      commitPanelProvider.refresh();
    }),
    vscode.commands.registerCommand('codesync.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', 'codesync');
    })
  ];

  // Watch for git changes
  const gitExtension = vscode.extensions.getExtension('vscode.git');
  if (gitExtension) {
    gitExtension.activate().then(() => {
      const git = gitExtension.exports.getAPI(1);
      if (git) {
        git.onDidChangeState(() => {
          commitPanelProvider.refresh();
        });
      }
    });
  }

  // Register all disposables
  context.subscriptions.push(
    commitPanelView,
    ...commands
  );
}

export function deactivate() {
  console.log('CodeSync extension is now deactivated!');
}
