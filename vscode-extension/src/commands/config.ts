import * as vscode from 'vscode';
import { ConfigManager, PLATFORMS, Platform } from '../configManager';

const MASK = '••••••••';

/**
 * 遮蔽敏感信息
 */
function mask(value: string): string {
  if (!value) return '(未配置)';
  return value.length <= 8 ? MASK : `${value.slice(0, 4)}${MASK}${value.slice(-4)}`;
}

/**
 * 预设的大模型服务商列表（专为新手小白整理）
 */
interface ModelProviderPreset {
  label: string;
  description: string;
  detail: string;
  apiBase: string;
  model: string;
  keyUrl: string;
}

const PROVIDER_PRESETS: ModelProviderPreset[] = [
  {
    label: '🌟 智谱 AI (GLM-4 / GLM-4-Flash)',
    description: '国内直连 / 免费及高性价比 / 极速响应',
    detail: '接口: https://open.bigmodel.cn/api/paas/v4/chat/completions',
    apiBase: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4-flash',
    keyUrl: 'https://open.bigmodel.cn/usercenter/apikeys'
  },
  {
    label: '🌟 DeepSeek (deepseek-chat)',
    description: '国内直连 / 超高代码与逻辑水准 / 性价比之王',
    detail: '接口: https://api.deepseek.com/v1',
    apiBase: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    keyUrl: 'https://platform.deepseek.com/api_keys'
  },
  {
    label: '🌟 阿里云通义千问 (Qwen-Plus)',
    description: '国内大厂云服务 / 稳定可靠',
    detail: '接口: https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiBase: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
    keyUrl: 'https://bailian.console.aliyun.com/'
  },
  {
    label: '🌟 月之暗面 Moonshot (Kimi)',
    description: '长文本与代码理解能力强',
    detail: '接口: https://api.moonshot.cn/v1',
    apiBase: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    keyUrl: 'https://platform.moonshot.cn/console/api-keys'
  },
  {
    label: '🌐 OpenAI 官方 (GPT-4o-mini)',
    description: '国际主流通用大模型（需要海外网络环境）',
    detail: '接口: https://api.openai.com/v1',
    apiBase: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    keyUrl: 'https://platform.openai.com/api-keys'
  },
  {
    label: '🛠️ 自定义 OpenAI 兼容接口',
    description: '自行指定接口地址与模型名称（中转站、本地Ollama等）',
    detail: '手动输入 API Base 与 Model',
    apiBase: '',
    model: '',
    keyUrl: ''
  }
];

/**
 * 新手一键配置向导
 */
export async function setupWizardCommand(configManager: ConfigManager) {
  // 第 1 步：选择大模型服务商
  const selectedProvider = await vscode.window.showQuickPick(PROVIDER_PRESETS, {
    title: '【新手向导 第1/3步】选择您的大模型提供商',
    placeHolder: '推荐国内新手选择【智谱 AI】或【DeepSeek】，无需网络代理即可畅快使用'
  });

  if (!selectedProvider) return;

  let finalApiBase = selectedProvider.apiBase;
  let finalModel = selectedProvider.model;

  // 如果选择自定义
  if (!finalApiBase) {
    const inputBase = await vscode.window.showInputBox({
      title: '输入接口地址 (API Base URL)',
      prompt: '例如：https://api.openai.com/v1 或您的本地服务地址',
      value: configManager.apiBase || 'https://api.openai.com/v1',
      ignoreFocusOut: true
    });
    if (!inputBase) return;
    finalApiBase = inputBase.trim();

    const inputModel = await vscode.window.showInputBox({
      title: '输入模型名称 (Model)',
      prompt: '例如：gpt-4o-mini, deepseek-chat, glm-4-flash',
      value: configManager.model || 'gpt-4o-mini',
      ignoreFocusOut: true
    });
    if (!inputModel) return;
    finalModel = inputModel.trim();
  }

  // 第 2 步：输入大模型 API Key
  const currentKey = configManager.apiKey;
  const keyPrompt = selectedProvider.keyUrl
    ? `获取密钥网址：${selectedProvider.keyUrl} （已配过可直接回车）`
    : '粘贴您的 API Key / Token（已配过可直接回车）';

  const inputKey = await vscode.window.showInputBox({
    title: `【新手向导 第2/3步】输入 ${selectedProvider.label.split(' ')[1] || '模型'} API Key`,
    prompt: keyPrompt,
    value: currentKey ? MASK : '',
    password: true,
    ignoreFocusOut: true
  });

  if (inputKey === undefined) return;

  const updates: Record<string, unknown> = {
    apiBase: finalApiBase,
    model: finalModel
  };

  if (inputKey && inputKey !== MASK) {
    updates.apiKey = inputKey.trim();
  }

  // 第 3 步：是否顺带配置代码平台 Token（用于一键上传代码与创建远程仓库）
  const tokenChoice = await vscode.window.showQuickPick(
    [
      {
        label: '🐙 配置 GitHub 个人令牌 (Personal Access Token)',
        description: '方便在 GitHub 上一键创建仓库并推送',
        id: 'github'
      },
      {
        label: '🦊 配置 Gitee 码云私人令牌 (Private Token)',
        description: '方便在 Gitee 码云上一键创建仓库并推送',
        id: 'gitee'
      },
      {
        label: '⏭️ 稍后再配，先完成大模型配置',
        description: '以后需要上传远程仓库时可随时在侧边栏单独配置',
        id: 'skip'
      }
    ],
    {
      title: '【新手向导 第3/3步】是否配置代码托管平台令牌？',
      placeHolder: '选择要配置的代码平台（支持跳过）'
    }
  );

  if (tokenChoice && tokenChoice.id !== 'skip') {
    const platform = tokenChoice.id as Platform;
    const currentToken = configManager.getToken(platform);
    const tokenTip =
      platform === 'github'
        ? 'GitHub 令牌创建网址：https://github.com/settings/tokens （需勾选 repo 权限）'
        : 'Gitee 令牌创建网址：https://gitee.com/profile/personal_access_tokens （需勾选 projects 权限）';

    const platformToken = await vscode.window.showInputBox({
      title: `配置 ${platform === 'github' ? 'GitHub' : 'Gitee'} 令牌`,
      prompt: tokenTip,
      value: currentToken ? MASK : '',
      password: true,
      ignoreFocusOut: true
    });

    if (platformToken && platformToken !== MASK) {
      updates[`${platform}Token`] = platformToken.trim();
    }
  }

  // 保存配置
  await configManager.saveConfig(updates);

  const viewAction = '查看生效配置';
  const settingsAction = '打开设置面板';
  const notice = await vscode.window.showInformationMessage(
    `🎉 CodeSync 配置已成功保存！当前模型：${finalModel}`,
    viewAction,
    settingsAction
  );

  if (notice === viewAction) {
    await showConfigCommand(configManager);
  } else if (notice === settingsAction) {
    await configManager.openSettings();
  }
}

/**
 * 配置平台 Token（写入 ~/.git-commit-ai.json，与 CLI 共用）
 */
export async function setTokenCommand(configManager: ConfigManager) {
  const platformPick = await vscode.window.showQuickPick(
    PLATFORMS.map(p => ({
      label: p.label,
      id: p.id,
      description:
        p.id === 'github'
          ? '需要 repo 权限（请选 classic 经典令牌）'
          : p.id === 'gitee'
          ? '需要 projects 权限'
          : '需要 api 权限'
    })),
    { title: '选择要配置 Token 的托管平台', placeHolder: 'GitHub / Gitee / GitLab' }
  );
  if (!platformPick) return;

  const platform = platformPick.id as Platform;
  const current = configManager.getToken(platform);

  const tip =
    platform === 'github'
      ? '请使用经典 Personal Access Token (classic) 并勾选 repo 权限'
      : platform === 'gitee'
      ? '请在 Gitee 设置中创建私人令牌并勾选 projects 权限'
      : '请在 GitLab 中创建个人访问令牌并勾选 api 权限';

  const token = await vscode.window.showInputBox({
    title: `配置 ${platformPick.label} 访问令牌`,
    prompt: tip,
    value: current ? MASK : '',
    password: true,
    ignoreFocusOut: true
  });
  if (!token || token === MASK) return;

  await configManager.saveConfig({ [`${platform}Token`]: token.trim() });
  vscode.window.showInformationMessage(`✅ ${platformPick.label} Token 已保存至 ${configManager.configFilePath}`);
}

/**
 * 查看当前生效的配置
 */
export async function showConfigCommand(configManager: ConfigManager) {
  const config = configManager.getConfig();

  const lines = [
    '# 🛠️ CodeSync 当前配置状态',
    '',
    '> **温馨提示**：CodeSync 采用统一共享配置机制。CLI 终端、桌面客户端与 VS Code 插件均共用此配置。',
    '',
    '## 1. 基础信息',
    `- 统一配置文件路径: \`${configManager.configFilePath}\``,
    `- 当前大模型 API Key: \`${mask(config.apiKey)}\``,
    `- 接口地址 (API Base): \`${config.apiBase || '(未设置，使用默认地址)'}\``,
    `- 当前选用模型: \`${config.model}\``,
    `- 智能模型自适应: \`${config.smartModel ? '已开启' : '已关闭'}\``,
    `  - 快速模型: \`${config.fastModel}\``,
    `  - 强大模型: \`${config.powerfulModel}\``,
    `- 提交信息规范: \`${config.convention}\``,
    `- 提交语言: \`${config.language}\``,
    `- 本地缓存: \`${config.enableCache ? '已开启' : '已关闭'}\` (缓存有效时长: ${config.cacheTTL} 毫秒)`,
    '',
    '## 2. 托管平台令牌状态 (用于一键建仓与上传推送)',
    `- GitHub 令牌: \`${mask(config.githubToken)}\``,
    `- Gitee 码云令牌: \`${mask(config.giteeToken)}\``,
    `- GitLab 令牌: \`${mask(config.gitlabToken)}\``,
    `- GitLab 服务地址: \`${config.gitlabBase}\``,
    '',
    '---',
    '### 💡 快捷修改方法：',
    '1. 侧边栏点击 **【一键配置向导】** 进行傻瓜式引导配置；',
    '2. 快捷键 `Ctrl + ,` 搜索 `codesync` 打开图形化设置页面直接修改；',
    '3. 在终端运行命令行工具修改：`codesync config set apiKey=你的Key`。'
  ];

  const doc = await vscode.workspace.openTextDocument({
    content: lines.join('\n'),
    language: 'markdown'
  });
  await vscode.window.showTextDocument(doc);
}

/**
 * 打开新手入门与使用指引（全中文保姆级教程）
 */
export async function openGuideCommand() {
  const guideContent = `# 📖 CodeSync 新手使用与配置完全指南

欢迎使用 **CodeSync**！本工具专为开发者设计，提供一键建仓上传、AI 自动生成规范提交信息、代码评审与注释等功能。
无论您使用的是命令行工具、桌面端还是当前 VS Code 插件，所有配置都是**全自动通用共享**的。

---

## 🎯 目录
1. [零基础 1 分钟快速配置大模型](#1-零基础-1-分钟快速配置大模型)
2. [常用功能怎么用？](#2-常用功能怎么用)
3. [常见代码平台 Token 获取指南](#3-常见代码平台-token-获取指南)
4. [常见问题解答（FAQ）](#4-常见问题解答faq)

---

## 1. 零基础 1 分钟快速配置大模型

CodeSync 生成提交信息与代码评审需要调用大模型服务。我们强烈推荐国内新手优先选择**智谱 AI** 或 **DeepSeek**，国内网络直连、成本极低且响应迅速。

### 🌟 推荐服务商参数对照表（直接抄作业）

| 服务商 | 推荐模型名称 (\`model\`) | 接口地址 (\`apiBase\`) | 获取 API Key 链接 |
| :--- | :--- | :--- | :--- |
| **智谱清言 (GLM)** | \`glm-4-flash\` 或 \`glm-4.6\` | \`https://open.bigmodel.cn/api/paas/v4/chat/completions\` | [open.bigmodel.cn](https://open.bigmodel.cn/usercenter/apikeys) |
| **DeepSeek** | \`deepseek-chat\` | \`https://api.deepseek.com/v1\` | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| **阿里通义千问** | \`qwen-plus\` | \`https://dashscope.aliyuncs.com/compatible-mode/v1\` | [dashscope.console.aliyun.com](https://dashscope.console.aliyun.com/) |
| **OpenAI (官方)** | \`gpt-4o-mini\` | \`https://api.openai.com/v1\` | [platform.openai.com](https://platform.openai.com/api-keys) |

### 🛠️ 如何配置？
- **最快捷方式**：在左侧 CodeSync 侧边栏中，点击 **【一键配置向导（新手推荐）】**，跟随弹窗指引选择厂商并粘贴 API Key 即可。
- **图形化方式**：按快捷键 \`Ctrl + ,\` 打开设置，搜索 \`codesync\`，在对应的输入框中填写即可。

---

## 2. 常用功能怎么用？

### 🚀 1. 一键上传本地项目到 GitHub / Gitee
无需在网页上手动新建仓库，CodeSync 自动帮您建仓、关联远程并推送：
1. 点击侧边栏顶部 **【上传到远程仓库】**；
2. 选择要上传到的平台（GitHub / Gitee / GitLab）；
3. 输入仓库名称、描述，选择公开（Public）或私有（Private）；
4. 插件将全自动完成：初始化 Git -> 生成 .gitignore -> 暂存文件 -> AI 生成首条提交信息 -> 网页建仓 -> 自动推送！

### 🤖 2. AI 智能生成规范提交信息 (Commit Message)
1. 在 VS Code 的源代码管理面板中将修改的文件**暂存 (Stage)**；
2. 点击侧边栏的 **【生成提交信息】** 按钮；
3. AI 会智能分析您的修改差异 (Diff)，自动生成符合国际规范的提交摘要；
4. 弹窗支持二次修改，按回车直接完成提交！

### 👥 3. 团队协作拉取与防冲突同步
- 点击侧边栏 **【拉取团队最新代码】**：自动拉取远端更新，防止代码冲突；
- 点击侧边栏 **【提交并协同推送】**：一次性完成“暂存 -> AI 生成提交 -> 提交 -> 推送”。

### 🔍 4. 选中代码智能解释与评审
在代码编辑器中**选中任意一段代码**，鼠标右键：
- **CodeSync: Explain Selected Code**（解释这段代码的作用与逻辑）
- **CodeSync: Annotate Selected Code**（为这段代码自动补充中文注释）
- **CodeSync: Review Selected Code**（对这段代码进行代码审查，找出潜在缺陷与安全隐患）

---

## 3. 常见代码平台 Token 获取指南

如果您需要使用“一键建仓上传”功能，必须向插件提供对应平台的个人访问令牌（Token）。

### 🐙 GitHub 个人令牌 (Personal Access Token)
1. 打开网页：[https://github.com/settings/tokens](https://github.com/settings/tokens)
2. 点击右上角 **Generate new token**，选择 **Generate new token (classic)**（经典令牌，切勿选择细粒度令牌）；
3. **Note**（备注）随便填，比如 \`codesync\`；
4. **Expiration**（有效期）可根据需要选择 90 天或永不过期；
5. **权限勾选**：勾选最上方的 **\`repo\`**（包含 repo:status, repo_deployment, public_repo 等全部仓库权限）；
6. 滑动到底部点击绿色按钮 **Generate token**；
7. 复制生成的 \`ghp_xxxx\` 格式令牌，在 CodeSync 侧边栏点击 **【配置平台 Token】** 粘贴保存。

### 🦊 Gitee 码云私人令牌
1. 打开网页：[https://gitee.com/profile/personal_access_tokens](https://gitee.com/profile/personal_access_tokens)
2. 点击右上角 **生成新 Token**；
3. 令牌描述填写 \`codesync\`；
4. **权限勾选**：勾选 **\`projects\`**（项目相关的读写权限）；
5. 点击提交，输入密码后复制生成的 Token 并保存至 CodeSync 中。

---

## 4. 常见问题解答（FAQ）

### Q1: 提示 "CodeSync API Key 未配置" 或大模型连接失败？
- 请检查您的 API Key 是否填写正确；
- 如果使用的是国内中转或兼容接口，请务必核对 **API Base URL** 是否完整填写，不能有遗漏或多余的斜杠；
- 如果使用的是官方 OpenAI 接口，需要确认您的网络环境是否可以直连访问海外接口。

### Q2: 提示 GitHub 无法建仓或 401/403 权限不足？
- 请确认创建 GitHub 令牌时，选择的是 **classic（经典令牌）**，并且务必勾选了 **\`repo\`** 权限。

### Q3: 为什么我在终端用过之后，插件不需要重新输入？
- CodeSync 贯彻统一配置理念，插件自动读取终端配置的 \`~/.git-commit-ai.json\` 文件，真正做到“一次配置，多端共享”！
`;

  const doc = await vscode.workspace.openTextDocument({
    content: guideContent,
    language: 'markdown'
  });
  await vscode.window.showTextDocument(doc);
}

