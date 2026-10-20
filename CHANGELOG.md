# 更新日志

本文件记录 CodeSync 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [未发布]

### 新增

- **VS Code 插件：上传代码到远程仓库** — 插件内新增 `CodeSync: Upload Project to Remote Repository`，
  完整复用 CLI 的上传流程（初始化仓库 → 生成 `.gitignore` → 暂存 → AI 生成提交信息 → 提交
  → 平台建仓 → 关联远程 → 推送），支持 GitHub / Gitee / GitLab
- **VS Code 插件：提交并推送** — 新增 `CodeSync: Commit and Push`，暂存全部改动 → AI 生成提交信息
  （可编辑）→ 提交 → 推送到当前分支
- **VS Code 插件：Token 与配置管理** — 新增 `CodeSync: Configure Platform Token`、
  `CodeSync: Show Current Configuration`
- **VS Code 插件：侧边栏入口** — 面板顶部新增「上传到远程仓库」「提交并推送」按钮
- **CLI：`codesync push` 命令** — 暂存 → AI 生成提交信息 → 提交 → 推送，与插件共用 `shared/git/upload.js`
  的 `syncProject()`；支持 `-m` 指定提交信息、`--bypass-hooks` 跳过钩子校验
- **共享层：`syncProject()`** — `shared/git/upload.js` 新增增量同步能力，CLI / 桌面版 / 插件三端共用
- **共享层：环境变量覆盖** — `shared/config.js` 支持通过环境变量覆盖 `smartModel` / `fastModel` /
  `powerfulModel` / `enableCache` / `cacheTTL`
- **VS Code 插件：Marketplace 图标** — 新增 128×128 / 256×256 PNG 图标
- **文档** — 根 `README.md` 新增完整的「VS Code 插件使用指南」（安装、配置、命令一览、上传流程、
  设置项、常见问题）
- **文档** — 新增 `CHANGELOG.md`、`vscode-extension/CHANGELOG.md`、`RELEASE_GUIDE.md` 与
  `vscode-extension/PUBLISHING.md`（Marketplace 发布指南）
- **宣传图** — 新增 VS Code 界面模拟截图 6 张与演示动效 GIF（`vscode-extension/media/`）
- **CI** — 新增 `.github/workflows/publish-vscode.yml`，打 `vscode-v*` 标签时自动打包并发布插件

### 变更

- **VS Code 插件统一配置** — 插件不再单独保存配置，改为读取共用的 `~/.git-commit-ai.json`；
  VS Code 设置项降级为可选覆盖项（优先级：VS Code 设置 > 环境变量 > 配置文件）
- **VS Code 插件复用共享核心** — `codeAssistant.ts` 改用 `shared/ai/annotate.js` 与
  `shared/ai/commit.js`，移除 `openai` SDK 依赖（改用原生 `fetch`），打包产物从约 14k 行缩减到约 1.8k 行
- **`shared/git/operations.js`** — `commit()` 新增 `bypassHooks` 选项（真正通过 `--no-verify` 生效）；
  新增 `getRemotes()` 方法
- **`shared/ai/annotate.js`** — 修复 API 地址末尾多余斜杠导致的请求地址拼接错误
- **VS Code 插件脚本** — `npm run lint` 改为 `tsc --noEmit` 类型检查（原先引用未安装的 eslint 导致报错）

### 修复

- 修复 VS Code 插件在多根工作区下无法定位项目路径的问题（优先使用当前打开文件所在目录）

---

## [2.0.0] - 2026-10-19

### 新增

- **AI 代码上传助手（CodeSync Agent）** — 监听文件变化、自动生成提交信息、自动提交推送
  - 四种上传策略：`smart`（智能）/ `immediate`（立即）/ `batch`（批量）/ `scheduled`（定时）
  - 配置向导 `codesync agent-init`，配置保存到项目根目录 `.codesync-agent.json`
  - 支持 Angular / Gitmoji 提交规范，中文 / 英文 / 日文提交语言
- **Pre-commit Hook 模板** — `codesync hook install --template [eslint|stylelint|typescript|prettier|test|all|custom]`
- **提交模板库** — 8 个内置模板 + 自定义模板 + 模板变量
- **Web Dashboard** — `codesync dashboard` 启动本地服务，查看提交频率、贡献者、变更趋势
- **插件系统** — `codesync plugin install/list/remove`，支持 AI Provider、Platform、Pre/Post-commit Hook
- **自动化部署** — Vercel / Netlify / Docker / NPM，`codesync deploy hook`
- **Release 自动化** — `codesync release <version>`，自动生成 Release Notes 并创建 Release
- **代码搜索** — `codesync search "查询"`，支持文本搜索与语义搜索
- **许可证合规检测** — 扫描依赖许可证并生成合规报告
- **VS Code 扩展** — 提交信息侧边栏、右键菜单 AI 解释/注解/审查、实时 Diff 预览
- **CI/CD 集成** — `codesync ci install --platform github|gitlab`
- **敏感信息检测** — `codesync security scan`，检测 API Key、密码、Token
- **AI 代码审查 Bot** — `codesync review-bot`，GitHub / GitLab Webhook 自动 PR 审查

### 变更

- 全面切换为 npm workspaces 架构（`cli` / `desktop`）
- 抽取 `shared/` 目录统一 CLI、桌面应用、扩展三端的核心逻辑
- Git 操作全面封装到 `shared/git/operations.js`

---

## [1.0.0] - 2026-06-25

### 新增

- 一键上传项目到 GitHub / Gitee / GitLab
- 一键下载项目并自动安装依赖
- 智能更新（add → commit → push）
- 版本回退
- AI 提交信息生成（Angular / Gitmoji 规范，多语言）
- 代码注解 / 解释 / 审查
- Changelog 自动生成
- 团队配置同步 + Git 钩子强制校验
- AI 响应缓存与智能模型选择

[未发布]: https://github.com/lb2786738061-rgb/git-commit-ai/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/lb2786738061-rgb/git-commit-ai/releases/tag/v2.0.0
[1.0.0]: https://github.com/lb2786738061-rgb/git-commit-ai/releases/tag/v1.0.0
