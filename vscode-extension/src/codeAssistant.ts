import * as vscode from 'vscode';
import OpenAI from 'openai';
import { ConfigManager } from './configManager';

export class CodeAssistant {
  private openai: OpenAI | null = null;

  constructor(private config: ConfigManager) {
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    if (this.config.apiKey) {
      this.openai = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: this.config.apiBase
      });
    }
  }

  private ensureOpenAI(): OpenAI {
    if (!this.openai) {
      throw new Error('API Key not configured. Please set it in settings.');
    }
    return this.openai;
  }

  private async showNoConfigWarning() {
    const result = await vscode.window.showWarningMessage(
      'CodeSync API Key is not configured',
      'Open Settings',
      'Cancel'
    );

    if (result === 'Open Settings') {
      vscode.commands.executeCommand('workbench.action.openSettings', 'codesync.apiKey');
    }
  }

  async explainCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText) {
      vscode.window.showWarningMessage('Please select some code first');
      return;
    }

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Explaining code...',
        cancellable: false
      }, async () => {
        const explanation = await this.generateExplanation(selectedText);

        // Show in a new document
        const doc = await vscode.workspace.openTextDocument({
          content: explanation,
          language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
      });
    } catch (error: any) {
      if (error.message.includes('API Key')) {
        await this.showNoConfigWarning();
      } else {
        vscode.window.showErrorMessage(`Failed to explain code: ${error.message}`);
      }
    }
  }

  async annotateCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText) {
      vscode.window.showWarningMessage('Please select some code first');
      return;
    }

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Annotating code...',
        cancellable: false
      }, async () => {
        const annotatedCode = await this.generateAnnotation(selectedText);

        // Show in a new document
        const doc = await vscode.workspace.openTextDocument({
          content: annotatedCode,
          language: editor.document.languageId
        });
        await vscode.window.showTextDocument(doc);
      });
    } catch (error: any) {
      if (error.message.includes('API Key')) {
        await this.showNoConfigWarning();
      } else {
        vscode.window.showErrorMessage(`Failed to annotate code: ${error.message}`);
      }
    }
  }

  async reviewCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText) {
      vscode.window.showWarningMessage('Please select some code first');
      return;
    }

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Reviewing code...',
        cancellable: false
      }, async () => {
        const review = await this.generateReview(selectedText);

        // Show in a new document
        const doc = await vscode.workspace.openTextDocument({
          content: review,
          language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
      });
    } catch (error: any) {
      if (error.message.includes('API Key')) {
        await this.showNoConfigWarning();
      } else {
        vscode.window.showErrorMessage(`Failed to review code: ${error.message}`);
      }
    }
  }

  private async generateExplanation(code: string): Promise<string> {
    const openai = this.ensureOpenAI();

    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert code explainer. Explain the code clearly, covering its purpose, key functions, parameters, return values, and execution flow. Use markdown formatting.'
        },
        {
          role: 'user',
          content: `Explain this code:\n\n\`\`\`\n${code}\n\`\`\``
        }
      ],
      temperature: 0.3
    });

    return response.choices[0].message.content || 'No explanation generated.';
  }

  private async generateAnnotation(code: string): Promise<string> {
    const openai = this.ensureOpenAI();

    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert code annotator. Add detailed comments to the code. Keep the original code structure, only add comments. Do not change the code logic.'
        },
        {
          role: 'user',
          content: `Add detailed comments to this code:\n\n\`\`\`\n${code}\n\`\`\``
        }
      ],
      temperature: 0.2
    });

    return response.choices[0].message.content || code;
  }

  private async generateReview(code: string): Promise<string> {
    const openai = this.ensureOpenAI();

    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer. Review the code for quality, potential bugs, performance issues, and security concerns. Provide constructive feedback with specific suggestions. Use markdown formatting.'
        },
        {
          role: 'user',
          content: `Review this code:\n\n\`\`\`\n${code}\n\`\`\``
        }
      ],
      temperature: 0.3
    });

    return response.choices[0].message.content || 'No review generated.';
  }

  async generateCommitMessage(diff: string): Promise<string> {
    const openai = this.ensureOpenAI();

    const convention = this.config.convention;
    const language = this.config.language;

    let systemPrompt = '';
    if (convention === 'angular') {
      systemPrompt = `You are an expert commit message writer. Generate commit messages following the Angular convention: type(scope): subject. Types: feat, fix, docs, style, refactor, test, chore. Write in ${language}. Keep the subject under 72 characters.`;
    } else if (convention === 'gitmoji') {
      systemPrompt = `You are an expert commit message writer. Generate commit messages using Gitmoji convention: emoji type(subject): subject. Common emojis: ✨ (feat), 🐛 (fix), 📝 (docs), 🎨 (style), ♻️ (refactor), ✅ (test), 🔧 (chore). Write in ${language}. Keep the subject under 72 characters.`;
    } else {
      systemPrompt = `You are an expert commit message writer. Generate clear, concise commit messages. Write in ${language}. Keep the subject under 72 characters.`;
    }

    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Generate a commit message for these changes:\n\n\`\`\`diff\n${diff}\n\`\`\``
        }
      ],
      temperature: 0.2
    });

    return response.choices[0].message.content || 'No commit message generated.';
  }
}
