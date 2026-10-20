# 更新日志

本文件记录 CodeSync VS Code 插件的变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [1.0.0] - 2026-10-20

首个正式版本，与 CodeSync v2.0 同步发布。

### 新增

- **一键上传项目到远程仓库** — `CodeSync: Upload Project to Remote Repository`
  支持 GitHub / Gitee / GitLab，自动完成初始化仓库、生成 `.gitignore`、暂存、AI 生成提交信息、
  提交、平台建仓、关联远程、推送的全流程，并实时显示进度
- **提交并推送** — `CodeSync: Commit and Push`
  暂存全部改动 → AI 生成提交信息（可在输入框中编辑）→ 提交 → 推送到当前分支
- **平台 Token 配置** — `CodeSync: Configure Platform Token`，未配置 Token 时上传流程会主动引导
- **配置查看** — `CodeSync: Show Current Configuration`，敏感值自动打码
- **侧边栏入口** — 面板顶部新增「上传到远程仓库」「提交并推送」按钮
- **Marketplace 图标** — 新增 128×128 / 256×256 PNG 图标

### 变更

- **统一配置** — 插件改为读取共用的 `~/.git-commit-ai.json`，与 CLI、桌面版一致；
  VS Code 设置项降级为可选覆盖项（优先级：VS Code 设置 > 环境变量 > 配置文件）
- **复用共享核心逻辑** — 上传与同步流程直接调用 `shared/git/upload.js`，
  AI 能力调用 `shared/ai/commit.js` 与 `shared/ai/annotate.js`，与 CLI 行为完全一致
- **移除 `openai` SDK 依赖** — 改用原生 `fetch` 调用兼容 OpenAI 的 API，
  打包产物从约 14k 行缩减到约 1.8k 行，同时自动获得缓存与智能模型选择能力

### 修复

- 修复多根工作区下无法定位项目路径的问题（优先使用当前打开文件所在目录）
- 修复 API 地址末尾多余斜杠导致的请求地址拼接错误

[1.0.0]: https://github.com/lb2786738061-rgb/git-commit-ai/releases/tag/v1.0.0
