# CodeSync VS Code Extension

AI-powered Git commit message generator and code assistant for Visual Studio Code.

## Features

- **Commit Message Generation**: Automatically generate conventional commit messages based on your staged changes
- **Code Explanation**: Get detailed explanations of selected code
- **Code Annotation**: Add intelligent comments to your code
- **Code Review**: Get AI-powered code reviews with quality, bug, and security insights
- **Real-time Diff Preview**: See your staged changes in the side panel
- **Multiple Commit Conventions**: Support for Angular and Gitmoji conventions
- **Multi-language**: Generate commit messages in English, Chinese, or Japanese

## Installation

### Development Mode

1. Install dependencies:
```bash
cd vscode-extension
npm install
```

2. Build the extension:
```bash
npm run compile
```

3. Open in VS Code:
```bash
code .
```

4. Press `F5` to launch a new VS Code window with the extension loaded

### Production Mode

Package the extension:
```bash
npm install -g vsce
vsce package
```

Install the `.vsix` file in VS Code.

## Configuration

Configure the extension in VS Code settings:

- `codesync.apiKey`: Your OpenAI API key (required)
- `codesync.apiBase`: API base URL (default: https://api.openai.com/v1)
- `codesync.model`: AI model to use (default: gpt-4o-mini)
- `codesync.convention`: Commit message convention (angular/gitmoji)
- `codesync.language`: Commit message language (en/zh/ja)
- `codesync.smartModel`: Enable smart model selection

## Usage

### Generate Commit Messages

1. Stage your changes in Git
2. Open the CodeSync panel in the activity bar
3. Click "Generate Commit Message"
4. Review and edit the suggested message
5. Confirm to commit

### Code Assistant

Select code in the editor and use the context menu:
- **Explain Code**: Get a detailed explanation
- **Annotate Code**: Add intelligent comments
- **Review Code**: Get AI-powered review

## Development

### Build
```bash
npm run compile
```

### Watch Mode
```bash
npm run watch
```

### Lint
```bash
npm run lint
```

## License

MIT
