# 🎉 CodeSync v2.0 功能全览

## 📦 什么是 CodeSync？

CodeSync 是一个强大的 Git 操作 + AI 代码助手工具，让不会 Git 的人也能轻松管理代码，AI 辅助提升开发效率。

**核心价值**：
- ✅ 一键上传/下载，无需记忆 Git 命令
- ✅ AI 自动生成规范的提交信息
- ✅ 智能代码助手（注解、解释、审查）
- ✅ 智能体自动上传，完全自动化
- ✅ 团队协作和 CI/CD 集成

---

## 🚀 核心功能

### 1. Git 操作极简化

#### 一键上传
```bash
# 上传当前项目到 GitHub
codesync upload --platform github --name my-project

# 上传到私有仓库
codesync upload --platform github --name my-project --private

# 上传到 Gitee/GitLab
codesync upload --platform gitee --name my-project
codesync upload --platform gitlab --name my-project
```

#### 一键下载
```bash
# 下载并自动安装依赖
codesync download https://github.com/user/repo.git --install

# 下载到指定目录
codesync download https://github.com/user/repo.git --dir ./my-folder
```

#### 智能更新
```bash
# 自动检测变更、生成提交信息、推送
codesync update
```

#### 版本回退
```bash
# 交互式选择提交记录，安全回退
codesync git revert
```

---

### 2. AI 代码助手

#### 智能提交信息生成
```bash
# 标准模式（交互式确认）
codesync ai commit

# 快速模式（直接提交）
codesync ai commit --yes

# 指定规范
codesync ai commit --convention gitmoji

# 指定语言
codesync ai commit --language en
```

#### 代码注解
```bash
# 为代码文件生成详细中文注释
codesync ai annotate -f src/app.js
```

#### 代码解释
```bash
# 详细解释代码功能、参数、执行流程
codesync ai explain -f src/app.js
```

#### 代码审查
```bash
# 从质量、潜在 bug、性能、安全性角度全面审查
codesync ai review -f src/app.js
```

#### 自动生成 Changelog
```bash
# 分析两个版本标签之间的所有提交，自动生成更新日志
codesync git changelog --from=v1.0.0 --to=v1.1.0
```

---

### 3. 🤖 智能代码上传助手（Agent）⭐ 新功能

**完全自动化的代码上传体验！**

#### 配置向导（首次使用）
```bash
codesync agent-init
```

配置向导会询问：
- 上传策略（智能/立即/批量/定时）
- 批量上传阈值
- 定时上传间隔
- 是否使用 AI 生成提交信息
- 提交规范和语言
- 自动提交/推送
- 是否需要确认

#### 启动智能体
```bash
codesync agent start
```

智能体会：
- 自动监听文件变化
- 智能生成提交信息
- 自动提交和推送
- 完全无需手动操作

#### 查看状态
```bash
codesync agent status
```

#### 停止智能体
```bash
codesync agent stop
```

#### 高级选项
```bash
# 指定上传策略
codesync agent start --strategy smart
codesync agent start --strategy immediate
codesync agent start --strategy batch --batch-size 10
codesync agent start --strategy scheduled --interval 120

# 禁用 AI 生成
codesync agent start --no-ai

# 跳过确认提示
codesync agent start --yes

# 禁用自动推送
codesync agent start --no-push
```

**详细文档**: [AGENT_GUIDE.md](AGENT_GUIDE.md)

---

### 4. AI 代码审查 Bot

#### 安装 Bot
```bash
codesync review-bot install
```

#### 启动 Bot
```bash
codesync review-bot start
```

Bot 会：
- 监听 GitHub/GitLab Webhook
- 自动分析 PR/MR diff
- 生成 AI 审查评论
- 支持自定义审查规则

---

### 5. VS Code 扩展

#### 安装
```bash
cd vscode-extension
npm install
npm run compile
```

#### 在 VS Code 中使用
1. 打开 CodeSync 侧边栏
2. 查看暂存区更改
3. 点击 "Generate Commit Message" 生成提交信息
4. 右键选中文本，选择 AI 功能

---

### 6. 团队协作

#### 初始化团队配置
```bash
codesync team init
```

#### 安装强制规范钩子
```bash
codesync team enforce
```

团队成员提交时会自动校验提交信息格式。

---

### 7. Pre-commit Hook 模板 ⭐ 新功能

#### 列出可用模板
```bash
codesync hook list
```

可用模板：
- `eslint` - ESLint 代码检查
- `stylelint` - 样式检查
- `typescript` - TypeScript 类型检查
- `prettier` - 代码格式化
- `test` - 运行测试
- `all` - 综合检查
- `custom` - 自定义钩子

#### 安装 Hook
```bash
# 安装 ESLint Hook
codesync hook install --template eslint

# 安装综合检查 Hook
codesync hook install --template all --force
```

#### 卸载 Hook
```bash
codesync hook uninstall
```

---

### 8. 提交模板库 ⭐ 新功能

#### 列出所有模板
```bash
codesync template list
```

内置模板：
- `bug-fix` - Bug 修复
- `feature` - 新功能
- `refactor` - 代码重构
- `documentation` - 文档更新
- `breaking-change` - 破坏性变更
- `performance` - 性能优化
- `test` - 测试相关
- `chore` - 杂项任务

#### 使用模板
```bash
codesync template use --name feature
```

#### 查看模板详情
```bash
codesync template show --name bug-fix
```

#### 添加自定义模板
```bash
codesync template add --name my-template --template "..." --description "..."
```

#### 删除自定义模板
```bash
codesync template remove --name my-template
```

---

### 9. Web Dashboard ⭐ 新功能

#### 启动 Dashboard
```bash
codesync dashboard
```

#### 指定端口
```bash
codesync dashboard --port 3001
```

Dashboard 提供：
- 项目统计仪表板
- 提交历史可视化
- 贡献者统计
- 分支列表
- 文件变更统计

访问: http://localhost:3001

---

### 10. 插件系统 ⭐ 新功能

#### 列出已安装插件
```bash
codesync plugin list
```

#### 安装插件
```bash
codesync plugin install --name my-plugin --type ai-provider --path ./plugins/my-plugin.js
```

插件类型：
- `ai-provider` - AI 服务提供商
- `platform` - Git 平台适配器
- `pre-commit-hook` - 提交前钩子
- `post-commit-hook` - 提交后钩子

#### 卸载插件
```bash
codesync plugin uninstall --name my-plugin
```

#### 加载插件
```bash
codesync plugin load --path ./plugins/custom-plugin.js
```

---

### 11. 自动化部署 ⭐ 新功能

#### 列出支持的部署平台
```bash
codesync deploy list
```

支持平台：
- `vercel` - Vercel 部署
- `netlify` - Netlify 部署
- `docker` - Docker 镜像构建
- `npm` - NPM 包发布

#### 配置部署钩子
```bash
# Docker 部署
codesync deploy hook --platform docker

# Vercel 部署
codesync deploy hook --platform vercel
```

---

### 12. Release 自动化 ⭐ 新功能

#### 创建 Release
```bash
codesync release 1.0.0
```

#### 创建预发布版本
```bash
codesync release 1.0.0-beta.1 --prerelease
```

#### 创建草稿 Release
```bash
codesync release 1.0.0 --draft
```

自动完成：
- 创建 Git Tag
- 推送 Tag 到远程
- 生成 Release Notes
- 创建 GitHub Release

---

### 13. 代码搜索 ⭐ 新功能

#### 搜索代码
```bash
codesync search "function login"
```

#### 语义搜索
```bash
codesync search "api authentication" --type semantic
```

#### 搜索指定文件
```bash
codesync search "TODO" --file src/index.js
```

---

### 14. 安全检测

#### 扫描敏感信息
```bash
# 扫描暂存区
codesync security scan

# 扫描指定文件
codesync security scan --file src/config.js
```

#### Pre-commit 钩子检测
```bash
codesync security pre-commit
```

#### 许可证合规检测 ⭐ 新功能
```bash
codesync security license
```

会检查：
- 依赖许可证
- 合规性（MIT, Apache-2.0, BSD, ISC 等）
- 生成许可证报告

---

### 15. CI/CD 集成

#### 安装 GitHub Actions
```bash
codesync ci install --platform github
```

#### 安装 GitLab CI
```bash
codesync ci install --platform gitlab
```

#### 卸载 CI/CD 配置
```bash
codesync ci uninstall --platform github
```

---

### 16. Git 高级操作

#### 查看提交历史
```bash
codesync git log
```

#### 查看待提交变更
```bash
codesync git diff
```

#### 项目分析
```bash
codesync git analyze
```

#### 批量处理
```bash
codesync git batch
```

#### Amend 提交
```bash
codesync git amend
```

#### Squash 提交
```bash
codesync git squash --number 5
```

#### 创建分支
```bash
codesync git branch --name feature/new-feature
```

---

### 17. 缓存管理

#### 查看缓存统计
```bash
codesync cache --stats
```

#### 清除所有缓存
```bash
codesync cache --clear
```

#### 清理过期缓存
```bash
codesync cache --expire
```

---

### 18. 配置管理

#### 交互式配置向导
```bash
codesync init
```

#### 查看当前配置
```bash
codesync config --list
```

#### 设置配置项
```bash
codesync config set apiKey=sk-xxx
codesync config set githubToken=ghp_xxx
codesync config set model=gpt-4o
```

---

## 📊 功能对比

| 功能 | CodeSync | Git 命令 | commitizen | aicommits |
|------|----------|----------|------------|-----------|
| 一键上传 | ✅ | ❌ | ❌ | ❌ |
| 一键下载 | ✅ | ❌ | ❌ | ❌ |
| AI 提交信息 | ✅ | ❌ | 手动 | ✅ |
| 智能体自动上传 | ✅ | ❌ | ❌ | ❌ |
| 代码注解/解释/审查 | ✅ | ❌ | ❌ | ❌ |
| AI 审查 Bot | ✅ | ❌ | ❌ | ❌ |
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

## 🎯 使用场景

### 场景 1：Git 新手第一次上传项目

```bash
# 你刚写完一个项目，想上传到 GitHub
# 不需要懂 git init / add / commit / push

codesync init                                    # 配置 API Key
codesync upload --platform github --name my-first-project
# 完成！自动创建仓库、自动提交、自动推送
```

### 场景 2：完全自动化的开发流程

```bash
# 配置智能体
codesync agent-init

# 启动智能体
codesync agent start

# 现在正常开发代码，智能体自动：
# - 监听文件变化
# - 生成提交信息
# - 自动提交和推送
# 完全无需手动操作！
```

### 场景 3：快速下载并运行开源项目

```bash
codesync download https://github.com/vercel/next.js --install
# 自动克隆 + 自动安装依赖
```

### 场景 4：团队协作，强制提交规范

```bash
# 队长初始化团队配置
codesync team init

# 队员安装规范钩子
codesync team enforce

# 之后每次提交都会自动校验
```

### 场景 5：AI 辅助理解代码

```bash
# 给看不懂的代码加注释
codesync ai annotate -f src/utils/calc.js

# 解释代码功能
codesync ai explain -f src/utils/calc.js

# 审查代码质量
codesync ai review -f src/utils/calc.js
```

### 场景 6：自动化 Release 流程

```bash
# 开发完成后，一键创建 Release
codesync release 2.0.0

# 自动完成：
# - 创建 Tag
# - 推送 Tag
# - 生成 Release Notes
# - 创建 GitHub Release
```

---

## 📚 详细文档

- [README.md](README.md) - 主文档
- [AGENT_GUIDE.md](AGENT_GUIDE.md) - 智能体使用指南
- [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md) - 实施报告
- [拓展.md](拓展.md) - 功能拓展计划

---

## 🚀 快速开始

### 1. 安装

```bash
git clone <repo-url>
cd git-commit-ai
npm install
npm run link:cli
```

### 2. 配置

```bash
codesync init
```

### 3. 开始使用

```bash
# 上传项目
codesync upload --platform github --name my-project

# 或启动智能体
codesync agent-init
codesync agent start
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License
