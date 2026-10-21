import * as vscode from 'vscode';
import { CommitPanelProvider } from './commitPanelProvider';
import { CodeAssistant } from './codeAssistant';
import { ConfigManager } from './configManager';
import { GitService } from './gitService';
import { uploadCommand } from './commands/upload';
import { syncCommand } from './commands/sync';
import { pullCommand } from './commands/pull';
import { setTokenCommand, showConfigCommand, setupWizardCommand, openGuideCommand } from './commands/config';

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

    // 拉取远程团队最新代码（多人协作防冲突）
    vscode.commands.registerCommand('codesync.pull', () => {
      pullCommand(gitService, configManager);
    }),

    // 提交并协同推送
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
    }),

    // 新手一键配置向导
    vscode.commands.registerCommand('codesync.setupWizard', () => {
      setupWizardCommand(configManager);
    }),

    // 新手入门与使用指引
    vscode.commands.registerCommand('codesync.openGuide', () => {
      openGuideCommand();
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
