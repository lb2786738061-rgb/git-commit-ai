# 🎉 新功能总览 (v2.0.0)

本文档总结了 git-commit-ai v2.0.0 新增的所有功能。

---

## ✨ 已完成的新功能

### 1. 交互式编辑器集成
- **功能**: 支持使用系统编辑器（vim, nano, VS Code 等）编辑提交信息
- **命令**: 在交互菜单中选择 "Edit message in editor"
- **环境变量**: 通过 `EDITOR` 或 `VISUAL` 环境变量指定编辑器
- **实现**: `src/git.js` 中的 `editWithEditor()` 函数

### 2. 提交历史分析
- **功能**: 分析提交历史质量，统计各类型提交占比，检测不符合规范的提交
- **命令**: `gca analyze`
- **选项**:
  - `--from <tag/commit>`: 起始的 tag 或 commit
  - `--to <tag/commit>`: 结束的 tag 或 commit
  - `--limit <number>`: 分析的提交数量限制
- **输出**: 类型分布图表、范围分布、不规范提交示例
- **实现**: `src/git.js` 中的 `getDetailedCommitHistory()` 函数

### 3. 批量提交支持
- **功能**: 批量处理未提交的文件，为每个文件生成独立的提交信息
- **命令**: `gca batch`
- **流程**: 暂存文件 → 生成提交信息 → 创建提交 → 取消暂存 → 处理下一个文件
- **实现**: `src/git.js` 中的 `getFileDiff()`, `stageFile()`, `unstageFile()` 函数

### 4. AI 模型智能选择
- **功能**: 根据代码复杂度自动选择模型（简单修改用快速模型，复杂改动用强大模型）
- **配置**:
  - `smartModel`: 启用/禁用智能选择
  - `fastModel`: 快速模型名称（默认: gpt-4o-mini）
  - `powerfulModel`: 强大模型名称（默认: gpt-4o）
  - `complexityThreshold`: 复杂度阈值（默认: 5000 字符）
- **实现**: `src/ai.js` 中的 `selectSmartModel()` 函数

### 5. 团队协作功能
- **功能**: 共享团队配置，强制执行团队提交规范
- **命令**:
  - `gca team --init`: 初始化团队配置文件
  - `gca team --show`: 查看团队配置
  - `gca team --enforce`: 安装强制执行钩子
- **配置文件**: `.git-commit-ai-team.json`（项目根目录）
- **选项**:
  - `convention`: 团队提交规范
  - `language`: 团队提交语言
  - `enforceConventional`: 强制执行规范
  - `requireScope`: 要求包含 scope
  - `maxSubjectLength`: 主题最大长度
- **实现**: `src/config.js` 中的 `readTeamConfig()`, `writeTeamConfig()` 函数

### 6. 性能优化（缓存机制）
- **功能**: 缓存 AI 响应，减少 API 调用，提升响应速度
- **配置**:
  - `enableCache`: 启用/禁用缓存
  - `cacheTTL`: 缓存过期时间（默认: 3600000ms = 1小时）
- **命令**:
  - `gca cache --stats`: 查看缓存统计
  - `gca cache --clear`: 清除所有缓存
  - `gca cache --expire`: 清理过期缓存
- **实现**: `src/cache.js` 模块（新建）

### 7. UI 增强
- **功能**: JSON 输出模式、主题系统
- **命令**: `gca --json` 输出 JSON 格式（用于 CI/CD 集成）
- **配置**:
  - `theme`: 主题（default, minimal, colorful）
  - `jsonOutput`: JSON 输出模式
- **实现**: `src/theme.js` 模块（新建）

### 8. 更多 Git 操作
- **功能**: Amend、Squash、Branch 操作
- **命令**:
  - `gca amend`: 修改最后一次提交
  - `gca squash --number <count>`: 合并最近的提交
  - `gca branch`: 基于提交主题创建新分支
- **实现**: `src/git.js` 中的 `amendCommit()`, `squashCommits()`, `createBranch()`, `getCurrentBranch()` 函数

### 9. PR 内容生成
- **功能**: 基于提交历史生成 Pull Request 标题和描述
- **命令**: `gca pr --from <tag/commit> --to <tag/commit> -o <file>`
- **输出**: PR 标题和 Markdown 格式的描述
- **实现**: `src/ai.js` 中的 `generatePRContent()` 函数

---

## 📦 新增文件

- `src/cache.js` - 缓存管理模块
- `src/theme.js` - 主题系统模块
- `tests/analyze.test.js` - 提交历史分析测试
- `tests/batch.test.js` - 批量提交测试
- `tests/smart-model.test.js` - 智能模型选择测试
- `tests/team.test.js` - 团队功能测试
- `tests/cache.test.js` - 缓存功能测试
- `tests/ui.test.js` - UI 增强测试
- `tests/git-operations.test.js` - Git 扩展操作测试

---

## 🔧 修改的文件

- `src/config.js` - 添加智能模型、缓存、UI、团队配置选项
- `src/git.js` - 添加编辑器、批量操作、Git 扩展操作函数
- `src/ai.js` - 添加智能模型选择、缓存集成、PR 内容生成
- `bin/cli.js` - 添加所有新命令和选项
- `package.json` - 更新版本到 2.0.0，添加测试脚本
- `README.md` - 更新功能列表和使用说明

---

## 🧪 测试覆盖

所有新功能都有对应的单元测试：
- ✅ analyze.test.js
- ✅ batch.test.js
- ✅ smart-model.test.js
- ✅ team.test.js
- ✅ cache.test.js
- ✅ ui.test.js
- ✅ git-operations.test.js

原有测试继续通过：
- ✅ config.test.js
- ✅ git.test.js
- ✅ prompts.test.js
- ✅ verify.test.js
- ✅ changelog.test.js

---

## 📋 配置项完整列表

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| apiKey | '' | API 密钥 |
| apiBase | 'https://api.openai.com/v1' | API 基础地址 |
| model | 'gpt-4o-mini' | 默认模型 |
| convention | 'angular' | 提交规范（angular/gitmoji） |
| language | 'en' | 提交语言 |
| smartModel | true | 启用智能模型选择 |
| fastModel | 'gpt-4o-mini' | 快速模型 |
| powerfulModel | 'gpt-4o' | 强大模型 |
| complexityThreshold | 5000 | 复杂度阈值（字符） |
| teamConfigPath | '.git-commit-ai-team.json' | 团队配置文件路径 |
| enableCache | true | 启用缓存 |
| cacheTTL | 3600000 | 缓存过期时间（毫秒） |
| theme | 'default' | UI 主题 |
| jsonOutput | false | JSON 输出模式 |

---

## 🎯 使用建议

1. **初始化配置**: 首次使用运行 `gca init` 进行交互式配置
2. **团队协作**: 在团队项目中运行 `gca team --init` 创建团队配置
3. **性能优化**: 启用缓存可以显著减少 API 调用
4. **智能模型**: 根据项目规模配置快速和强大模型
5. **CI/CD 集成**: 使用 `--json` 选项输出结构化数据

---

## 🚀 升级指南

从 v1.0.0 升级到 v2.0.0：

1. 更新代码：`git pull`
2. 重新安装依赖：`npm install`
3. 重新链接：`npm link`
4. 运行配置向导：`gca init`（可选，新配置项会使用默认值）
5. 测试功能：`gca --help` 查看所有可用命令

---

## 📝 版本历史

- **v2.0.0** (2026-10-18) - 重大更新，添加 8 个新功能
- **v1.0.0** (2026-06-30) - 初始版本，核心功能

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
