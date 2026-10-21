# 📦 CodeSync v2.0

**极简 Git 操作 + AI 代码助手**

> 告别繁琐复杂的 Git 命令，让任何人都能轻松掌控代码版本，同时借助 AI 大幅提升日常研发效率。

[![npm version](https://img.shields.io/npm/v/codesync.svg)](https://www.npmjs.com/package/codesync)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Features](https://img.shields.io/badge/features-14%20new-green.svg)](FEATURES_COMPLETE.md)

[English](./README.md) | **简体中文**

---

## 🎉 v2.0 全新特性

- 🤖 **智能代码上传助手（Agent）** — 全自动监测变更、AI 生成提交信息并推送
- 🎣 **Pre-commit 钩子模板库** — 开箱即用支持 ESLint、Prettier、TypeScript 等规范校验
- 📝 **提交信息模板库** — 内置 8 种常用模板，支持灵活自定义与变量替换
- 📊 **Web 数据看板** — 项目代码提交量、贡献者、分支走势可视化
- 🔌 **插件扩展架构** — 支持 AI 供应商、代码托管平台与生命周期钩子插件
- 🚀 **自动化部署支持** — 一键接入 Vercel、Netlify、Docker、NPM 部署
- 📦 **自动化版本发布** — 单条命令完成版本打标、发布说明与 Release
- 🔍 **代码检索工具** — 支持全文搜索与语义检索
- 🔒 **合规与安全扫描** — 敏感信息防泄漏扫描与依赖开源许可证合规校验

**[查看完整新特性说明文档 →](FEATURES_COMPLETE.md)**

**一套核心，多端复用** —— 命令行工具（CLI）、桌面应用（Desktop）与 VS Code 插件全面共享 `shared/` 核心逻辑与 `~/.git-commit-ai.json` 配置文件，在任何客户端下行为完全一致。

**🎯 想直接在 VS Code 内推送代码？** → 查看 [VS Code 插件使用指南](#6-vs-code-插件使用指南)

![CodeSync 演示](./vscode-extension/media/demo.gif)

**📚 文档快速导航**

| 文档 | 说明 |
| --- | --- |
| [CHANGELOG.md](./CHANGELOG.md) | 完整版本更新日志 |
| [RELEASE_GUIDE.md](./RELEASE_GUIDE.md) | 版本发布指南（GitHub Release / npm / VS Code 市场） |
| [vscode-extension/README.md](./vscode-extension/README.md) | VS Code 插件详细使用说明 |
| [vscode-extension/PUBLISHING.md](./vscode-extension/PUBLISHING.md) | VS Code 插件发布指引 |
| [FEATURES_COMPLETE.md](./FEATURES_COMPLETE.md) | 完整功能特性清单 |
| [AGENT_GUIDE.md](./AGENT_GUIDE.md) | 智能上传助手（Agent）详细指南 |

---

## 🎯 解决了什么痛点？

| 开发痛点 | CodeSync 解决方案 |
| --- | --- |
| 记不住繁琐的 `git add . && git commit -m "..." && git push` | 一条 `codesync upload` 命令全自动完成 |
| 提交信息写得随意敷衍，导致 Code Review 困难 | AI 自动解析 Diff 差异，生成规范的 Angular / Gitmoji 格式提交说明 |
| 改动很小也要绞尽脑汁想提交信息 | 智能动态模型分流：大改动用高智能模型，小改动用轻量极速模型 |
| 阅读他人代码困难，需要逐行看逻辑 | `codesync ai annotate / explain / review` 一键生成注释、解释与审查建议 |
| 团队成员提交格式各异，规范难落地 | 团队统一配置文件 + Git Hooks 本地提交强校验 |
| 下载开源项目后需要手动识别并安装依赖 | `codesync download url --install` 自动识别包管理器并安装依赖 |
| 频繁切换 GitHub / Gitee / GitLab 平台操作迥异 | 统一接口，单条命令即可在三大平台上自动创建远程仓库并推送 |

---

## ✨ 核心特性

### 📤 极简 Git 流程
- **一键极速上传**：自动检测/初始化 Git 仓库、生成 `.gitignore`、AI 生成规范提交信息、在远程创建仓库并推送。
- **一键智能下载**：自动克隆项目，并智能识别 `npm` / `pnpm` / `yarn` 自动安装依赖。
- **智能增量更新**：自动检测本地文件变更，生成提交说明并推送到远端。
- **安全版本回滚**：可视化交互式选择历史提交，安全执行版本回滚。

### 🤖 AI 代码助手
- **智能提交信息**：分析 Diff 复杂度自动选择适配模型，生成高水准的规范提交说明。
- **智能代码注释**：为任意代码文件逐函数生成详尽的中文注释。
- **代码深度解释**：深入拆解代码实现逻辑、核心函数作用及执行流程。
- **全方位代码审查**：从代码质量、潜在缺陷、性能瓶颈、安全隐患四个维度给出专业审查意见。
- **自动生成变更日志**：自动对比两个 Git Tag 之间的全部提交并生成规范的更新日志。

### 🤖 自动化评审机器人（Review Bot）
- **PR 自动审查**：在 Pull Request / Merge Request 创建时自动由 AI 审查并发表评论。
- **多维度分析**：覆盖代码质量、漏洞、性能与安全合规。
- **多平台集成**：开箱即用支持 GitHub 与 GitLab Webhook。
- **灵活策略配置**：支持自定义审查严格度、回复语言及文件黑白名单过滤。

### 💻 VS Code 扩展插件
- **一键上传仓库**：无需离开编辑器，直接将当前项目推送到 GitHub / Gitee / GitLab 并自动建仓。
- **提交与推送**：暂存改动 → AI 生成提交说明（支持自由编辑） → 提交 → 推送到当前分支。
- **提交辅助侧边栏**：实时查看暂存区文件改动与 Diff 预览，一键生成提交说明。
- **右键上下文菜单**：在代码编辑器中选中任意代码片段，一键执行“解释代码”、“添加注释”或“代码审查”。
- **多语言适配**：支持生成中文、英文、日文等多种语言的提交信息。
- **配置与核心全面复用**：直接复用底层 `shared/` 模块与用户配置，体验与命令行无缝同步。

### 👥 团队协作规范
- **团队配置共享**：统一团队的提交规范、语言偏好、模型配置与 API 设置。
- **Git Hook 强制约束**：安装提交拦截钩子，在本地提交时自动校验格式，不符合规范禁止提交。
- **统一多平台**：支持 GitHub / Gitee / GitLab 统一操作体验。

### 🎨 提交信息风格规范
- **Angular 规范**：`feat:`、`fix:`、`docs:`、`style:`、`refactor:`、`test:`、`chore:` 等
- **Gitmoji 表情规范**：`✨`、`🐛`、`📝`、`🎨`、`♻️`、`✅`、`🔧` 等
- **多语言输出**：简体中文、英文、日本語等灵活切换

---

## 📦 安装与配置

### 环境要求
- Node.js >= 16.0
- 本地已安装 Git

### 1. 命令行工具（CLI）安装

```bash
# 克隆项目仓库
git clone <仓库地址>
cd git-commit-ai

# 安装依赖（一键安装所有工作区依赖）
npm install

# 将 CLI 工具全局软链接到系统
npm run link:cli

# 验证安装是否成功
codesync --version
```

### 2. 桌面客户端开发与运行

> **注意**：必须在本项目根目录下执行以下命令。

```bash
# 1. 确保终端处于当前项目根目录
cd e:\projects\git-commit-ai

# 2. 安装桌面端依赖
npm run install:desktop

# 3. 启动开发环境
npm run desktop:dev
# 或进入子目录运行：cd desktop && npm run dev
```

### 3. VS Code 插件开发与安装

```bash
# 安装插件依赖
cd vscode-extension
npm install

# 编译扩展
npm run compile

# 调试运行：在 VS Code 中打开 vscode-extension 目录并按 F5
```

---

## 🚀 快速上手

### 1. 配置 API 与平台凭证

首次使用建议通过交互式向导完成引导配置：

```bash
# 交互式配置向导（推荐，支持选择预设或输入自定义模型）
codesync init
```

也可以通过命令行直接手动配置：

```bash
# 配置 AI 接口密钥（必需）
codesync config set apiKey=sk-xxxx

# 配置各托管平台 Token（用于一键上传建仓）
codesync config set githubToken=ghp_xxxx            # GitHub Token
codesync config set giteeToken=xxxx                 # Gitee Token
codesync config set gitlabToken=glpat-xxxx          # GitLab Token

# 配置自定义 API 端点（如使用代理或中转接口）
codesync config set apiBase=https://api.openai.com/v1
```

#### 🔑 各平台 Token 获取指引

| 托管平台 | Token 类型 | 快速获取链接 | 说明与所需权限（Scope） |
| --- | --- | --- | --- |
| **GitHub** | 经典个人令牌 Personal Access Token (classic) | [https://github.com/settings/tokens](https://github.com/settings/tokens) 或 [一键直达经典令牌生成页](https://github.com/settings/tokens/new?scopes=repo&description=codesync) | 务必选择 **classic（经典）**，勾选 **`repo`** 权限（切勿使用细粒度 Token） |
| **Gitee** | 私人令牌（Private Token） | [https://gitee.com/profile/personal_access_tokens](https://gitee.com/profile/personal_access_tokens) | 勾选 **`projects`** 权限，用于读写仓库 |
| **GitLab** | 个人访问令牌 Personal Access Token | [https://gitlab.com/-/user_settings/personal_access_tokens](https://gitlab.com/-/user_settings/personal_access_tokens) | 勾选 **`api`** 权限 |
| **OpenAI** | API Key | [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) | 基础模型调用权限 |

> 查看当前全部配置与 Token 状态：`codesync config --list`

---

### 2. 一键上传本地项目

```bash
# 上传当前项目至 GitHub
codesync upload --platform github --name my-project

# 创建并上传为私有仓库
codesync upload --platform github --name my-project --private

# 上传至 Gitee 码云
codesync upload --platform gitee --name my-project

# 上传至 GitLab
codesync upload --platform gitlab --name my-project
```

---

### 3. 一键克隆与下载项目

```bash
# 下载远程项目并自动安装依赖（npm/pnpm/yarn）
codesync download https://github.com/user/repo.git --install

# 指定下载存放的目标目录
codesync download https://github.com/user/repo.git --path ./my-folder
```

---

### 4. AI 智能生成提交信息

```bash
# 标准交互模式（生成后提示确认）
codesync ai commit

# 快速模式（直接提交，跳过确认）
codesync ai commit --yes

# 选用 Gitmoji 表情风格
codesync ai commit --convention gitmoji

# 选用中文生成提交说明
codesync ai commit --language zh
```

---

### 5. AI 代码解析与审查

```bash
# 为指定代码文件生成详细中文注释
codesync ai annotate -f src/app.js

# 深入剖析代码执行逻辑与函数说明
codesync ai explain -f src/app.js

# 全方位审查代码质量与安全漏洞
codesync ai review -f src/app.js
```

---

### 6. VS Code 插件使用指南

![VS Code 插件面板](./vscode-extension/media/panel.png)

| 侧边栏面板 | 平台选择 | 上传执行进度 |
| --- | --- | --- |
| ![](./vscode-extension/media/panel.png) | ![](./vscode-extension/media/upload-platform.png) | ![](./vscode-extension/media/upload-progress.png) |

#### 6.1 安装方式

- **开发者调试模式**：进入 `vscode-extension` 目录运行 `npm install && npm run compile`，在 VS Code 中按 `F5` 启动调试。
- **打包安装（.vsix）**：
  ```bash
  cd vscode-extension
  npm run compile
  npx vsce package
  code --install-extension codesync-vscode-*.vsix
  ```
  安装完成后，VS Code 左侧活动栏将显示 **CodeSync** 图标。

#### 6.2 零冗余统一配置
插件内部**无需重复配置**，其自动读取 `~/.git-commit-ai.json`。在 CLI 中配置好后，插件即可直接使用。
也可以在 VS Code 中按 `Ctrl+Shift+P` 执行：
- `CodeSync: Configure Platform Token`：快速选择平台并填入 Token
- `CodeSync: Show Current Configuration`：查看已生效的配置详情
- `CodeSync: Open Settings`：打开图形化设置面板

#### 6.3 快捷命令列表

| 指令名称 | 触发入口 | 说明 |
| --- | --- | --- |
| `CodeSync: Upload Project to Remote Repository` | 侧边栏顶部 ⬆️ / 命令面板 | **一键上传项目**到 GitHub / Gitee / GitLab |
| `CodeSync: Commit and Push` | 侧边栏顶部 🔄 / 命令面板 | 暂存所有改动 → AI 生成提交信息 → 提交 → 推送 |
| `CodeSync: Generate Commit Message` | 侧边栏列表项 | 针对当前暂存区 Diff 差异生成提交说明 |
| `CodeSync: Explain Selected Code` | 编辑器右键菜单 | 详细解释选中的代码片段 |
| `CodeSync: Annotate Selected Code` | 编辑器右键菜单 | 为选中的代码生成详细中文注释 |
| `CodeSync: Review Selected Code` | 编辑器右键菜单 | 审查选中代码（质量/漏洞/性能/安全） |
| `CodeSync: Refresh Diff` | 侧边栏刷新图标 | 重新扫描并刷新当前暂存区差异 |

---

### 7. 常用进阶 Git 扩展

```bash
# 暂存当前所有改动 → AI 生成说明 → 提交并推送到远端分支
codesync push

# 跳过 AI 直接指定提交说明
codesync push -m "feat: 新增数据看板模块"

# 查看本地改动对比
codesync git diff

# 查看提交历史
codesync git log

# 自动生成版本更新日志（Changelog）
codesync git changelog --from=v1.0.0 --to=v1.1.0

# 项目技术栈与结构分析
codesync git analyze

# 交互式安全版本回滚
codesync git revert
```

---

### 8. 团队协作与规范强校验

```bash
# 初始化团队提交规范配置（生成 .git-commit-ai-team.json）
codesync team init

# 查看当前生效的团队规范
codesync team --show

# 安装 Git Hooks 强制执行规范（校验不通过将拒绝 commit）
codesync team --enforce
```

---

### 9. 智能代码上传助手（Agent）

自动感知文件变动、全流程静默托管提交与推送：

```bash
# 交互式初始化助手配置向导
codesync agent-init

# 启动智能上传助手（使用智能决策策略）
codesync agent start --strategy smart

# 批处理模式：累积达到 10 次变动后自动提交推送
codesync agent start --strategy batch --batch-size 10

# 定时轮询模式：每隔 120 秒检测并同步
codesync agent start --strategy scheduled --interval 120

# 查看助手运行状态
codesync agent status

# 停止助手守护进程
codesync agent stop
```

---

### 10. Pre-commit 钩子与模板管理

```bash
# 查看所有支持的质量校验钩子模板
codesync hook list

# 安装 ESLint 代码质量校验钩子
codesync hook install --template eslint

# 安装综合全套校验钩子（ESLint + Prettier + TypeScript + 单元测试）
codesync hook install --template all --force

# 卸载钩子
codesync hook uninstall
```

```bash
# 查看所有内置的提交信息模板
codesync template list

# 交互式选用特性开发（feature）模板
codesync template use --name feature

# 新增团队专用的提交说明模板
codesync template add --name custom-template --template "{{type}}({{scope}}): {{ticket}} - {{desc}}" --description "团队专用格式"
```

---

### 11. 安全与合规审计

```bash
# 扫描暂存区代码中是否存在敏感密钥与泄露风险
codesync security scan

# 针对指定敏感配置文件进行安全审计
codesync security scan --file src/config.js

# 扫描项目所有第三方依赖的开源许可证合规性
codesync security license
```

---

### 12. Web 数据看板

```bash
# 启动本地可视化数据看板（默认端口 3000）
codesync dashboard

# 自定义服务监听端口
codesync dashboard --port 3001
```

---

### 13. CI/CD 与自动化部署

```bash
# 一键生成并安装 GitHub Actions 工作流
codesync ci install --platform github

# 一键生成并安装 GitLab CI 配置
codesync ci install --platform gitlab

# 查看支持的一键部署平台列表（Vercel、Netlify、Docker 等）
codesync deploy list

# 快速配置 Docker 或 Vercel 部署钩子
codesync deploy hook --platform docker
codesync deploy hook --platform vercel

# 自动化发版（生成 Release、打标签）
codesync release 2.0.0
```

---

## 📋 完整命令速查手册

| 模块分类 | 命令用法 | 功能作用说明 |
| --- | --- | --- |
| **基础操作** | `codesync upload` | 一键初始化、建仓、提交并上传本地项目 |
| | `codesync download <url>` | 极速克隆项目并可选自动安装依赖 |
| | `codesync update` | 增量拉取团队最新改动（遇冲突自动唤醒 AI 智能体分析） |
| | `codesync push` | 暂存所有变更、AI 生成说明、提交并推送 |
| | `codesync sync` | 一键协同同步（AI 提交 + 自动拉取远程融合 + 推送远端） |
| **AI 助手** | `codesync ai commit` | 分析本地 Diff 差异，由 AI 生成标准提交说明 |
| | `codesync ai annotate -f <file>` | 为指定代码文件生成高质量中文注释 |
| | `codesync ai explain -f <file>` | 深度解析代码整体结构与业务执行流 |
| | `codesync ai review -f <file>` | 从质量、安全、性能多维度评审代码 |
| **团队协同** | `codesync team init` | 交互式生成团队提交规范配置文件 |
| | `codesync team --enforce` | 安装本地 Git 拦截钩子强制落地规范 |
| | `codesync team --show` | 查看团队规范的具体规则设定 |
| **版本工具** | `codesync git diff` | 查看本地改动对比与统计 |
| | `codesync git log` | 美化查看近期提交历史 |
| | `codesync git changelog` | 自动提取版本间提交生成更新日志 |
| | `codesync git revert` | 交互式安全版本回滚 |
| **系统配置** | `codesync init` | 首次使用的全交互式配置向导 |
| | `codesync config` | 打印当前生效的全部配置 |
| | `codesync config set <key>=<val>` | 快捷修改某项配置值 |
| **辅助服务** | `codesync dashboard` | 启动 Web 项目指标与提交统计看板 |
| | `codesync review-bot start` | 启动面向 PR 的自动化代码审查机器人 |
| | `codesync cache --clear` | 清理本地已缓存的 AI 请求数据 |

---

## ⚙️ 核心配置项列表

配置文件默认存放于 `~/.git-commit-ai.json`：

| 配置键名 | 说明 | 默认值 |
| --- | --- | --- |
| `apiKey` | AI 接口调用密钥（必需） | - |
| `apiBase` | AI 接口服务端点 | `https://api.openai.com/v1` |
| `model` | 默认调用的 AI 模型 | `gpt-4o-mini` |
| `smartModel` | 是否开启基于复杂度的模型调度 | `true` |
| `fastModel` | 处理简单/轻量任务的快速模型 | `gpt-4o-mini` |
| `powerfulModel` | 处理大型 Diff/重构任务的高性能模型 | `gpt-4o` |
| `complexityThreshold` | 触发大模型的 Diff 字符数阈值 | `5000` |
| `convention` | 提交信息规范风格（`angular` / `gitmoji`） | `angular` |
| `language` | 生成提交说明的语言（`zh` / `en` / `ja`） | `zh` |
| `githubToken` | GitHub 个人访问令牌（PAT） | - |
| `giteeToken` | Gitee 私人令牌 | - |
| `gitlabToken` | GitLab 访问令牌 | - |
| `gitlabBase` | 自建或官方 GitLab API 端点 | `https://gitlab.com/api/v4` |
| `enableCache` | 是否启用 AI 响应本地缓存 | `true` |
| `cacheTTL` | 缓存有效期（毫秒） | `3600000`（1小时） |

---

## 📁 目录架构全景

```
git-commit-ai/
├── shared/                    # 公共核心能力层（多端共享）
│   ├── git/
│   │   ├── operations.js     # Git 基础底层指令封装
│   │   ├── upload.js         # 一键上传与自动建仓工作流
│   │   ├── download.js       # 仓库克隆与依赖自动安装
│   │   └── gitignore.js      # 多语言 .gitignore 模板生成
│   ├── ai/
│   │   ├── commit.js         # AI 提交信息生成引擎与模型调度
│   │   ├── prompts.js        # 提示词库
│   │   ├── annotate.js       # 代码注释、解释与审查实现
│   │   └── cache.js          # AI 响应结果缓存池
│   ├── platform/             # 托管平台适配层
│   │   ├── github.js         # GitHub 接口适配
│   │   ├── gitee.js          # Gitee 接口适配
│   │   └── gitlab.js         # GitLab 接口适配
│   └── config.js             # 配置管理（读写 ~/.git-commit-ai.json）
├── cli/                      # 命令行应用（CLI 前端）
│   ├── bin/codesync.js       # CLI 命令入口与路由注册
│   └── src/commands/         # 各子命令业务实现
├── desktop/                  # 桌面端应用（Electron 前端）
│   ├── src/main.js           # Electron 主进程
│   ├── src/preload.js        # IPC 预加载脚本
│   └── pages/index.html      # 桌面端 UI 页面
├── vscode-extension/        # VS Code 插件前端
│   ├── src/extension.ts      # 插件激活入口
│   ├── src/codeAssistant.ts  # 右键 AI 助手
│   └── src/commands/         # 插件命令实现
├── dashboard/                # 项目数据可视化 Web 看板
├── review-bot/               # 代码评审机器人 Webhook 服务
├── tests/                    # 单元与集成测试套件
└── package.json              # 根目录工作区配置
```

---

## 🛠️ 本地参与开发

```bash
# 1. 在根目录一次性安装所有依赖
npm install

# 2. 运行全套单元测试
npm test

# 3. 本地软链接调试 CLI 命令
npm run link:cli

# 4. 启动 Electron 桌面应用
npm run install:desktop
cd desktop && npm run dev

# 5. 编译 VS Code 插件
cd vscode-extension
npm install
npm run compile
```

---

## 📄 开源许可证

本项目基于 [MIT License](./LICENSE) 协议开源。
