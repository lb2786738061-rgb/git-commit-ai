import * as vscode from 'vscode';
import { CommitPanelProvider } from './commitPanelProvider';
import { CodeAssistant } from './codeAssistant';
import { ConfigManager } from './configManager';
import { GitService } from './gitService';
import { uploadCommand } from './commands/upload';
import { syncCommand } from './commands/sync';
import { setTokenCommand, showConfigCommand } from './commands/config';

let commitPanelProvider: CommitPanelProvider;
let codeAssistant: CodeAssistant;
let configManager: ConfigManager;
let gitService: GitService;

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeSync extension is now active!');

  // Initialize managers
  configManager = new ConfigManager();
  codeAssistant = new CodeAssistant(configManager);
  gitService = new GitService(configManager);
  commitPanelProvider = new CommitPanelProvider(context, codeAssistant, gitService, configManager);

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
      configManager.openSettings();
    }),

    // 一键上传项目到远程仓库
    vscode.commands.registerCommand('codesync.upload', () => {
      uploadCommand(gitService, configManager);
    }),

    // 提交并推送
    vscode.commands.registerCommand('codesync.sync', () => {
      syncCommand(gitService, configManager);
    }),

    // 配置平台 Token
    vscode.commands.registerCommand('codesync.setToken', () => {
      setTokenCommand(configManager);
    }),

    // 查看当前配置
    vscode.commands.registerCommand('codesync.showConfig', () => {
      showConfigCommand(configManager);
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
  context.subscriptions.push(commitPanelView, ...commands);
}

export function deactivate() {
  console.log('CodeSync extension is now deactivated!');
}
