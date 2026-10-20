# 🚀 CodeSync v2.0 - 智能 Git + AI 代码助手

<div align="center">

**简化 Git 操作 + AI 代码助手**

告别繁琐的 Git 命令，让不会 Git 的人也能轻松管理代码，AI 辅助提升开发效率。

[![npm version](https://img.shields.io/npm/v/codesync.svg)](https://www.npmjs.com/package/codesync)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Features](https://img.shields.io/badge/features-14%20new-green.svg)](FEATURES_COMPLETE.md)
[![Completion](https://img.shields.io/badge/completion-82.4%25-brightgreen.svg)](IMPLEMENTATION_REPORT.md)

[English](README_EN.md) | 简体中文

</div>

---

## ✨ 核心特性

### 🎯 一键操作
- **一键上传** - 自动初始化仓库、AI 生成提交信息、创建远程仓库、推送
- **一键下载** - 自动克隆、自动安装依赖（npm/pnpm/yarn）
- **智能更新** - 自动检测变更、生成提交信息、推送到远程

### 🤖 AI 代码助手
- **智能提交** - 分析 diff 复杂度，自动选择合适模型，生成规范的提交信息
- **代码注解** - 为任意代码文件生成详细中文注释
- **代码解释** - 详细解释代码功能、关键函数、执行流程
- **代码审查** - 从质量、潜在 bug、性能、安全性角度全面审查
- **自动生成 Changelog** - 分析两个版本标签之间的所有提交，自动生成更新日志

### 🤖 智能代码上传助手 ⭐ 新功能
- **完全自动化** - 自动监听文件变化，无需手动操作
- **智能策略** - 4 种上传策略：智能、立即、批量、定时
- **AI 生成** - 自动生成规范的提交信息
- **自动推送** - 自动提交并推送到远程仓库

### 🎣 Pre-commit Hook 模板 ⭐ 新功能
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **TypeScript** - 类型检查
- **Test** - 自动运行测试
- **All** - 综合检查

### 📝 提交模板库 ⭐ 新功能
- **8 个内置模板** - Bug Fix、Feature、Refactor、Documentation 等
- **自定义模板** - 支持自定义提交模板
- **模板变量** - 支持 {{ticket}}、{{author}}、{{date}} 等变量

### 📊 Web Dashboard ⭐ 新功能
- **项目统计** - 提交数量、贡献者、分支统计
- **提交历史** - 可视化提交历史
- **文件变更** - 文件变更统计

### 🔌 插件系统 ⭐ 新功能
- **可扩展架构** - 支持 AI Provider、Platform、Hook 插件
- **插件管理** - 安装、卸载、加载插件
- **社区生态** - 支持社区贡献插件

### 🚀 自动化部署 ⭐ 新功能
- **Vercel** - 自动部署到 Vercel
- **Netlify** - 自动部署到 Netlify
- **Docker** - 自动构建 Docker 镜像
- **NPM** - 自动发布到 NPM

### 📦 Release 自动化 ⭐ 新功能
- **自动 Tag** - 创建 Git Tag
- **自动推送** - 推送 Tag 到远程
- **自动 Notes** - 生成 Release Notes
- **自动创建** - 创建 GitHub Release

### 🔍 代码搜索 ⭐ 新功能
- **文本搜索** - 基于 ripgrep 的快速搜索
- **语义搜索** - 基于关键词的智能搜索
- **上下文显示** - 显示代码上下文

### 🔒 安全检测
- **敏感信息扫描** - API Key、Token、密码检测
- **许可证合规** - 依赖许可证扫描和合规性检查

### 👥 团队协作
- **团队配置同步** - 统一团队的提交规范、API 配置、模型选择
- **Git 钩子强制校验** - 团队成员提交时自动校验提交信息格式

### 💻 VS Code 扩展
- **提交信息侧边栏** - 实时查看暂存区更改，一键生成提交信息
- **右键菜单 AI 功能** - 选中文本后可直接调用 AI 解释/注解/审查
- **实时 Diff 预览** - 在侧边栏查看暂存区代码变更

---

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone <repo-url>
cd git-commit-ai

# 安装依赖
npm install

# 全局链接 CLI
npm run link:cli

# 验证安装
codesync --version
```

### 配置

```bash
# 交互式配置向导
codesync init
```

### 使用

#### 方式 1：手动上传

```bash
# 上传当前项目到 GitHub
codesync upload --platform github --name my-project
```

#### 方式 2：智能体自动上传 ⭐ 推荐

```bash
# 配置智能体
codesync agent-init

# 启动智能体
codesync agent start

# 现在正常开发代码，智能体自动上传！
```

---

## 📖 核心功能使用

### 🤖 智能代码上传助手

```bash
# 配置向导
codesync agent-init

# 启动智能体
codesync agent start

# 查看状态
codesync agent status

# 停止智能体
codesync agent stop
```

**详细文档**: [AGENT_GUIDE.md](AGENT_GUIDE.md)

### AI 智能提交

```bash
# 分析 diff，AI 生成提交信息
codesync ai commit

# 快速模式（直接提交）
codesync ai commit --yes

# 指定规范
codesync ai commit --convention gitmoji
```

### AI 代码助手

```bash
# 代码注解
codesync ai annotate -f src/app.js

# 代码解释
codesync ai explain -f src/app.js

# 代码审查
codesync ai review -f src/app.js
```

### Pre-commit Hook 模板

```bash
# 列出可用模板
codesync hook list

# 安装 ESLint Hook
codesync hook install --template eslint

# 安装综合检查 Hook
codesync hook install --template all
```

### 提交模板库

```bash
# 列出所有模板
codesync template list

# 使用模板
codesync template use --name feature

# 添加自定义模板
codesync template add --name my-template --template "..."
```

### Web Dashboard

```bash
# 启动 Dashboard
codesync dashboard

# 访问 http://localhost:3001
```

### 插件系统

```bash
# 列出已安装插件
codesync plugin list

# 安装插件
codesync plugin install --name my-plugin --type ai-provider --path ./plugins/my-plugin.js
```

### 自动化部署

```bash
# 列出支持的部署平台
codesync deploy list

# 配置 Docker 部署
codesync deploy hook --platform docker
```

### Release 自动化

```bash
# 创建 Release
codesync release 1.0.0

# 创建预发布版本
codesync release 1.0.0-beta.1 --prerelease
```

### 代码搜索

```bash
# 搜索代码
codesync search "function login"

# 语义搜索
codesync search "api authentication" --type semantic
```

### 安全检测

```bash
# 扫描敏感信息
codesync security scan

# 许可证合规检测
codesync security license
```

---

## 📋 完整命令列表

| 命令 | 说明 |
|------|------|
| `codesync upload` | 上传当前项目到远程仓库 |
| `codesync download <url>` | 克隆远程项目到本地 |
| `codesync update` | 更新当前项目 |
| `codesync ai commit` | AI 生成提交信息 |
| `codesync ai annotate -f <file>` | 代码注解 |
| `codesync ai explain -f <file>` | 代码解释 |
| `codesync ai review -f <file>` | 代码审查 |
| `codesync agent-init` | 智能体配置向导 ⭐ |
| `codesync agent start` | 启动智能体 ⭐ |
| `codesync agent stop` | 停止智能体 ⭐ |
| `codesync agent status` | 查看智能体状态 ⭐ |
| `codesync hook install` | 安装 Pre-commit Hook ⭐ |
| `codesync template use` | 使用提交模板 ⭐ |
| `codesync dashboard` | 启动 Web Dashboard ⭐ |
| `codesync plugin install` | 安装插件 ⭐ |
| `codesync deploy hook` | 配置部署钩子 ⭐ |
| `codesync release <version>` | 创建 Release ⭐ |
| `codesync search <query>` | 代码搜索 ⭐ |
| `codesync security license` | 许可证检测 ⭐ |
| `codesync ci install` | 安装 CI/CD 配置 |
| `codesync team init` | 初始化团队配置 |
| `codesync cache --stats` | 查看缓存统计 |
| `codesync config --list` | 查看配置 |

**[查看完整功能文档 →](FEATURES_COMPLETE.md)**

---

## 🎯 使用场景

### 场景 1：Git 新手第一次上传项目

```bash
codesync init
codesync upload --platform github --name my-first-project
# 完成！自动创建仓库、自动提交、自动推送
```

### 场景 2：完全自动化的开发流程 ⭐

```bash
codesync agent-init
codesync agent start
# 智能体自动监听文件变化并上传，无需手动操作
```

### 场景 3：快速下载并运行开源项目

```bash
codesync download https://github.com/vercel/next.js --install
# 自动克隆 + 自动安装依赖
```

### 场景 4：AI 辅助理解代码

```bash
codesync ai explain -f src/utils/calc.js
# AI 详细解释代码功能
```

### 场景 5：团队协作，强制提交规范

```bash
codesync team init
codesync team enforce
# 自动校验提交信息格式
```

### 场景 6：自动化 Release 流程 ⭐

```bash
codesync release 2.0.0
# 自动创建 Tag、生成 Notes、创建 Release
```

---

## 📊 功能对比

| 功能 | CodeSync | Git 命令 | commitizen | aicommits |
|------|----------|----------|------------|-----------|
| 一键上传 | ✅ | ❌ | ❌ | ❌ |
| 智能体自动上传 | ✅ | ❌ | ❌ | ❌ |
| AI 提交信息 | ✅ | ❌ | 手动 | ✅ |
| 代码注解/解释/审查 | ✅ | ❌ | ❌ | ❌ |
| Pre-commit Hook 模板 | ✅ | 手动 | 部分 | ❌ |
| 提交模板库 | ✅ | ❌ | 手动 | ❌ |
| Web Dashboard | ✅ | ❌ | ❌ | ❌ |
| 插件系统 | ✅ | ❌ | ❌ | ❌ |
| 自动化部署 | ✅ | ❌ | ❌ | ❌ |
| Release 自动化 | ✅ | 手动 | ❌ | ❌ |
| 代码搜索 | ✅ | grep | ❌ | ❌ |
| 许可证检测 | ✅ | ❌ | ❌ | ❌ |
| CI/CD 集成 | ✅ | 手动 | ❌ | ❌ |
| VS Code 扩展 | ✅ | ❌ | ❌ | ❌ |
| 桌面应用 | ✅ | ❌ | ❌ | ❌ |

---

## 📚 文档

- [README.md](README.md) - 主文档
- [FEATURES_COMPLETE.md](FEATURES_COMPLETE.md) - 完整功能文档
- [AGENT_GUIDE.md](AGENT_GUIDE.md) - 智能体使用指南
- [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md) - 实施报告
- [拓展.md](拓展.md) - 功能拓展计划

---

## 🛠️ 开发

```bash
# 安装所有依赖
npm install

# 运行测试
npm test

# 全局链接 CLI
npm run link:cli

# 启动桌面应用
npm run install:desktop
cd desktop && npm run dev
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

<div align="center">

**[⬆ 回到顶部](#-codesync-v20--智能-git--ai-代码助手)**

Made with ❤️ by CodeSync Team

</div>
