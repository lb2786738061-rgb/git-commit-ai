# 📦 CodeSync v2.0

**简化 Git 操作 + AI 代码助手**

> 告别繁琐的 Git 命令，让不会 Git 的人也能轻松管理代码，AI 辅助提升开发效率。

[![npm version](https://img.shields.io/npm/v/codesync.svg)](https://www.npmjs.com/package/codesync)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

---

## 🎯 解决什么问题

| 痛点                                                  | CodeSync 如何解决                                         |
| ----------------------------------------------------- | --------------------------------------------------------- |
| 不记得 `git add . && git commit -m "..." && git push` | 一句 `codesync upload` 完成全部                           |
| 提交信息写得随意，Code Review 难以理解                | AI 分析 diff，自动生成规范的 Angular/Gitmoji 风格提交信息 |
| 小改动也要花时间想提交信息                            | 智能模型选择，大diff用强模型，小diff用快模型，省时省钱    |
| 想给代码加注释/解释代码/审查代码                      | `codesync ai annotate/explain/review` 一键完成            |
| 团队成员提交信息格式不统一                            | Git 钩子强制校验 + 团队配置同步                           |
| 下载项目后还要手动装依赖                              | `codesync download url --install` 自动搞定                |
| 在多个平台（GitHub/Gitee/GitLab）切换                 | 统一接口，支持三平台自动创建仓库                          |

---

## ✨ 核心功能

### 📤 Git 操作极简化

- **一键上传** — 自动初始化仓库、AI 生成提交信息、创建远程仓库、推送
- **一键下载** — 自动克隆、自动安装依赖（npm/pnpm/yarn）
- **智能更新** — 自动检测变更、生成提交信息、推送到远程
- **版本回退** — 交互式选择提交记录，安全回退

### 🤖 AI 代码助手

- **智能提交** — 分析 diff 复杂度，自动选择合适模型，生成规范的提交信息
- **代码注解** — 为任意代码文件生成详细中文注释
- **代码解释** — 详细解释代码功能、关键函数、执行流程
- **代码审查** — 从质量、潜在 bug、性能、安全性角度全面审查
- **自动生成 Changelog** — 分析两个版本标签之间的所有提交，自动生成更新日志

### 👥 团队协作

- **团队配置同步** — 统一团队的提交规范、API 配置、模型选择
- **Git 钩子强制校验** — 团队成员提交时自动校验提交信息格式
- **多平台支持** — GitHub / Gitee / GitLab 一套命令搞定

### 🎨 提交规范

- **Angular 规范** — `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- **Gitmoji 规范** — `✨`, `🐛`, `📝`, `🎨`, `♻️`, `✅`, `🔧`
- **多语言提交** — 支持中文、英文、日文等多种语言

---

## 📦 安装

### 前置要求

- Node.js >= 16.0
- Git 已安装

### CLI 安装

```bash
# 克隆项目
git clone <repo-url>
cd git-commit-ai

# 安装依赖（根目录一次性安装所有 workspace）
npm install

# 全局链接 CLI
npm run link:cli

# 验证安装
codesync --version
```

### 桌面应用

```bash
# 安装桌面应用依赖
npm run install:desktop

# 启动开发模式
cd desktop && npm run dev
```

### 初始化配置（首次使用）

```bash
# 交互式配置向导，引导你配置 API Key 等
codesync init

# 或手动配置
codesync config set apiKey=sk-xxx
codesync config set githubToken=ghp_xxx
```

---

## 🚀 快速开始

### 1. 配置 API

```bash
# 交互式配置（推荐首次使用）
codesync init

# 手动配置
codesync config set apiKey=sk-xxx                    # OpenAI API Key
codesync config set githubToken=ghp_xxx             # GitHub Token（上传需要）
codesync config set gitlabToken=glpat-xxx           # GitLab Token（可选）
codesync config set apiBase=https://api.openai.com/v1  # API 地址（可配置代理）
```

#### 🔑 Token 获取指南

| 平台 | Token 类型 | 获取地址 | 权限要求 |
|------|-----------|---------|---------|
| **GitHub** | Personal Access Token (classic) | https://github.com/settings/tokens | 勾选 `repo` 权限 |
| **Gitee** | 私人令牌 | https://gitee.com/settings/profile | 勾选 `repo` 权限 |
| **GitLab** | Personal Access Token | https://gitlab.com/-/profile/personal_access_tokens | Scope 选 `api` |
| **OpenAI** | API Key | https://platform.openai.com/api-keys | - |

> 查看当前配置及 Token 状态：`codesync config --list`

### 2. 上传项目

```bash
# 上传当前项目到 GitHub
codesync upload --platform github --name my-project

# 上传到私有仓库
codesync upload --platform github --name my-project --private

# 上传到 Gitee
codesync upload --platform gitee --name my-project

# 上传到 GitLab
codesync upload --platform gitlab --name my-project
```

### 3. 下载项目

```bash
# 下载并自动安装依赖
codesync download https://github.com/user/repo.git --install

# 下载到指定目录
codesync download https://github.com/user/repo.git --dir ./my-folder
```

### 4. AI 生成提交信息

```bash
# 标准模式（交互式确认）
codesync ai commit

# 快速模式（直接提交，不等待确认）
codesync ai commit --yes

# 指定规范
codesync ai commit --convention gitmoji

# 指定语言
codesync ai commit --language en
```

### 5. AI 代码助手

```bash
# 代码注解（生成注释）
codesync ai annotate -f src/app.js

# 代码解释
codesync ai explain -f src/app.js

# 代码审查
codesync ai review -f src/app.js
```

### 6. Git 高级命令

```bash
# 查看待提交变更
codesync git diff

# 查看提交历史
codesync git log

# 生成更新日志
codesync git changelog --from=v1.0.0 --to=v1.1.0

# 项目分析
codesync git analyze

# 批量处理
codesync git batch

# 安全回退
codesync git revert
```

### 7. 团队协作

```bash
# 初始化团队配置
codesync team init

# 强制团队规范（安装 Git 钩子）
codesync team enforce

# 读取团队配置
codesync team config
```

### 8. 缓存管理

```bash
# 查看缓存状态
codesync cache --stats

# 清除缓存
codesync cache --clear
```

---

## 📋 完整命令列表

### 项目管理

| 命令                      | 说明                                |
| ------------------------- | ----------------------------------- |
| `codesync upload`         | 上传当前项目到远程仓库              |
| `codesync download <url>` | 克隆远程项目到本地                  |
| `codesync update`         | 更新当前项目（add → commit → push） |

### AI 功能

| 命令                             | 说明                       |
| -------------------------------- | -------------------------- |
| `codesync ai commit`             | 分析 diff，AI 生成提交信息 |
| `codesync ai annotate -f <file>` | 为代码文件生成注释         |
| `codesync ai explain -f <file>`  | 解释代码功能               |
| `codesync ai review -f <file>`   | 审查代码质量               |

### Git 工具

| 命令                     | 说明           |
| ------------------------ | -------------- |
| `codesync git diff`      | 查看待提交变更 |
| `codesync git log`       | 查看提交历史   |
| `codesync git changelog` | 生成 CHANGELOG |
| `codesync git analyze`   | 分析项目结构   |
| `codesync git batch`     | 批量 Git 操作  |
| `codesync git revert`    | 安全回退版本   |

### 配置管理

| 命令                                | 说明           |
| ----------------------------------- | -------------- |
| `codesync init`                     | 交互式配置向导 |
| `codesync config`                   | 查看当前配置   |
| `codesync config set <key>=<value>` | 设置配置项     |

### 团队协作

| 命令                    | 说明             |
| ----------------------- | ---------------- |
| `codesync team init`    | 初始化团队配置   |
| `codesync team enforce` | 安装团队规范钩子 |
| `codesync team config`  | 查看团队配置     |

### 工具

| 命令                     | 说明         |
| ------------------------ | ------------ |
| `codesync cache --stats` | 查看缓存统计 |
| `codesync cache --clear` | 清除所有缓存 |

---

## ⚙️ 配置项

| 配置项          | 说明                | 默认值                      |
| --------------- | ------------------- | --------------------------- |
| `apiKey`        | AI API 密钥（必填） | -                           |
| `apiBase`       | API 基础地址        | `https://api.openai.com/v1` |
| `model`         | 默认模型            | `gpt-4o-mini`               |
| `smartModel`    | 复杂任务用模型      | `gpt-4o`                    |
| `fastModel`     | 简单任务用模型      | `gpt-4o-mini`               |
| `powerfulModel` | 强力任务用模型      | `gpt-4o`                    |
| `githubToken`   | GitHub 个人访问令牌 | -                           |
| `giteeToken`    | Gitee 私人令牌      | -                           |
| `gitlabToken`   | GitLab 私人令牌     | -                           |
| `gitlabBase`    | GitLab 实例地址     | `https://gitlab.com`        |
| `convention`    | 提交规范            | `angular`                   |
| `language`      | 提交信息语言        | `zh`                        |
| `cacheTTL`      | 缓存 TTL（毫秒）    | `3600000`                   |
| `platform`      | 默认平台            | `github`                    |

---

## 🌟 使用场景

### 场景 1：Git 新手第一次上传项目

```bash
# 你刚写完一个项目，想上传到 GitHub
# 不需要懂 git init / add / commit / push

codesync init                                    # 先配置 API Key
codesync upload --platform github --name my-first-project
# 完成！自动创建仓库、自动提交、自动推送
```

### 场景 2：快速下载并运行开源项目

```bash
# 想学习一个 GitHub 上的项目
codesync download https://github.com/vercel/next.js --install
# 自动克隆 + 自动识别并安装依赖（npm/pnpm/yarn）
# 直接进入学习
```

### 场景 3：提交前 AI 生成规范的提交信息

```bash
git add .
codesync ai commit
# 输出：
#   🤔 正在分析变更...
#   ✨ 建议的提交信息：
#   feat(auth): 添加用户登录验证功能
#
#   确认提交？ [Y/n]
```

### 场景 4：给看不懂的代码加注释

```bash
codesync ai explain -f src/utils/calc.js
# AI 详细解释：函数用途、参数、返回值、执行流程
```

### 场景 5：团队强制提交规范

```bash
# 队长初始化团队配置
codesync team init
# 选择 Angular 规范 + 强制校验

# 队员克隆后一键安装钩子
codesync team enforce
# 之后每次提交都会自动校验，不合格无法提交
```

---

## 🆚 相比同类工具

| 特性                              | CodeSync | commitizen | aicommits |
| --------------------------------- | -------- | ---------- | --------- |
| 一键上传到远程仓库                | ✅       | ❌         | ❌        |
| 三平台支持（GitHub/Gitee/GitLab） | ✅       | ❌         | ❌        |
| 自动生成规范提交信息              | ✅       | 手动选择   | ✅        |
| 智能模型选择（按 diff 复杂度）    | ✅       | ❌         | ❌        |
| 代码注解/解释/审查                | ✅       | ❌         | ❌        |
| 自动生成 Changelog                | ✅       | ❌         | ❌        |
| 团队配置同步 + 钩子强制           | ✅       | 部分       | ❌        |
| 交互式配置向导                    | ✅       | ❌         | ❌        |
| 桌面应用                          | ✅       | ❌         | ❌        |

---

## 📁 项目结构

```
git-commit-ai/
├── shared/                    # 共享核心模块（npm workspace）
│   ├── git/
│   │   ├── operations.js     # Git 操作封装
│   │   ├── upload.js         # 上传流程
│   │   └── download.js       # 下载流程
│   ├── ai/
│   │   ├── commit.js         # AI 提交信息生成
│   │   ├── prompts.js        # 提示词管理
│   │   └── annotate.js       # 代码注解/解释/审查
│   ├── platform/
│   │   ├── github.js         # GitHub 平台适配
│   │   ├── gitee.js          # Gitee 平台适配
│   │   └── gitlab.js         # GitLab 平台适配
│   └── config.js             # 配置管理（统一读写 ~/.git-commit-ai.json）
├── cli/                      # CLI 工具（npm workspace）
│   ├── bin/
│   │   └── codesync.js       # CLI 入口
│   └── src/
│       └── commands/         # 各命令实现
│           ├── upload.js
│           ├── download.js
│           ├── update.js
│           ├── ai.js
│           ├── config.js
│           ├── team.js
│           ├── cache.js
│           └── git.js
├── desktop/                  # 桌面应用（npm workspace）
│   ├── src/
│   │   ├── main.js          # Electron 主进程
│   │   └── preload.js       # 预加载脚本（IPC 桥接）
│   └── components/
│       └── app.js           # 前端 UI（7 个页面）
├── tests/                    # 测试文件
└── package.json             # 根配置（workspaces）
```

---

## 🔧 开发

```bash
# 安装所有依赖（根目录一次搞定）
npm install

# 运行测试
npm test

# 全局链接 CLI（开发时使用）
npm run link:cli

# 启动桌面应用（开发模式）
npm run install:desktop
cd desktop && npm run dev
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License
