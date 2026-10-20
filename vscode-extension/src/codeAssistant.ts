import * as vscode from 'vscode';
import { generateAnnotation, explainCode, reviewCode } from '../../shared/ai/annotate.js';
import { generateCommitMessage as aiGenerateCommitMessage } from '../../shared/ai/commit.js';
import { ConfigManager } from './configManager';

/**
 * AI 代码助手
 *
 * 复用 shared/ai/ 下的实现，与 CLI、桌面版保持一致：
 * - shared/ai/annotate.js → 注解 / 解释 / 审查
 * - shared/ai/commit.js   → 提交信息生成（带缓存与智能模型选择）
 */
export class CodeAssistant {
  constructor(private config: ConfigManager) {}

  /**
   * 取得当前编辑器中选中的代码
   */
  private getSelectedCode(): { code: string; language: string } | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('没有活动的编辑器');
      return undefined;
    }

    const selectedText = editor.document.getText(editor.selection);
    if (!selectedText) {
      vscode.window.showWarningMessage('请先选中要分析的代码');
      return undefined;
    }

    return { code: selectedText, language: editor.document.languageId };
  }

  /**
   * 打开一个只读文档展示结果
   */
  private async showResult(content: string, language: string) {
    const doc = await vscode.workspace.openTextDocument({ content, language });
    await vscode.window.showTextDocument(doc);
  }

  /**
   * 统一的错误处理
   */
  private handleError(error: any, action: string) {
    const message = error?.message || String(error);
    if (message.includes('API Key')) {
      this.config.showNoConfigWarning();
    } else {
      vscode.window.showErrorMessage(`${action}失败: ${message}`);
    }
  }

  async explainCode() {
    const selected = this.getSelectedCode();
    if (!selected) return;

    try {
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: '正在解释代码...', cancellable: false },
        async () => {
          const result = await explainCode(selected.code, selected.language);
          await this.showResult(result, 'markdown');
        }
      );
    } catch (error: any) {
      this.handleError(error, '解释代码');
    }
  }

  async annotateCode() {
    const selected = this.getSelectedCode();
    if (!selected) return;

    try {
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: '正在生成注释...', cancellable: false },
        async () => {
          const result = await generateAnnotation(selected.code, selected.language);
          await this.showResult(result, selected.language);
        }
      );
    } catch (error: any) {
      this.handleError(error, '生成注释');
    }
  }

  async reviewCode() {
    const selected = this.getSelectedCode();
    if (!selected) return;

    try {
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: '正在审查代码...', cancellable: false },
        async () => {
          const result = await reviewCode(selected.code, selected.language);
          await this.showResult(result, 'markdown');
        }
      );
    } catch (error: any) {
      this.handleError(error, '代码审查');
    }
  }

  /**
   * 根据 diff 生成提交信息
   */
  async generateCommitMessage(diff: string): Promise<string> {
    return aiGenerateCommitMessage(diff, '');
  }
}
