# CodeSync Agent 使用指南

## 🤖 什么是 CodeSync Agent？

CodeSync Agent 是一个智能代码上传助手，可以自动监听你的项目文件变化，智能生成提交信息，并自动上传到远程仓库。无需手动执行 git 命令，让代码上传变得完全自动化。

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd cli
npm install
```

### 2. 配置智能体

首次使用推荐运行配置向导：

```bash
codesync agent-init
```

配置向导会询问以下问题：

- **上传策略**: 选择如何上传文件变化
  - `smart` - 智能策略（推荐）：根据文件类型和数量智能判断
  - `immediate` - 立即上传：文件变化后立即上传
  - `batch` - 批量上传：积累到指定数量后批量上传
  - `scheduled` - 定时上传：按固定间隔定时上传

- **批量上传阈值**: 批量策略下积累多少文件后上传（默认 5）

- **定时上传间隔**: 定时策略下的上传间隔秒数（默认 60）

- **AI 生成提交信息**: 是否使用 AI 自动生成提交信息（推荐）

- **提交规范**: Angular 或 Gitmoji

- **提交语言**: 中文、英文或日文

- **自动提交**: 是否自动执行 git commit

- **自动推送**: 是否自动推送到远程仓库

- **上传前确认**: 是否在每次上传前需要你确认

- **启用通知**: 是否启用通知

配置会保存到项目根目录的 `.codesync-agent.json` 文件中。

### 3. 启动智能体

```bash
codesync agent start
```

启动后你会看到：

```
🤖 CodeSync Agent 启动中...
──────────────────────────────────────────────────
✅ 智能体已启动

📋 配置信息:
  监听路径: .
  上传策略: smart
  AI 生成: 启用
  自动提交: 启用
  自动推送: 启用
  需要确认: 是

💡 提示:
  智能体将自动监听文件变化并上传
  按 Ctrl+C 停止智能体
```

### 4. 开始工作

现在你可以正常开发代码，智能体会自动：

1. 监听文件变化
2. 累积变化（根据策略）
3. 生成提交信息（如果启用 AI）
4. 自动提交
5. 自动推送到远程仓库

当有文件变化时，你会看到：

```
📝 ADD: src/newfile.js
📝 CHANGE: src/index.js
📤 准备上传 2 个文件...
  暂存文件...
  AI 生成提交信息...
  提交信息: feat(api): 添加新的 API 接口
  提交变更...
  推送到远程...
✅ 上传成功
```

### 5. 停止智能体

按 `Ctrl+C` 停止智能体，它会：

- 停止文件监听
- 处理待上传文件（可选）
- 显示统计信息

```
收到停止信号...
正在停止智能体...
检测到 3 个待上传文件
是否在停止前上传这些文件？ [Y/n] y
📤 准备上传 3 个文件...
...
✅ 上传成功

📊 统计信息:
──────────────────────────────────────────────────
  总提交数: 12
  总文件数: 34
  运行时长: 1800秒
  最后提交: 2026-10-20 15:30:45

✅ 智能体已停止
```

---

## 📋 上传策略详解

### Smart（智能策略）- 推荐

智能策略会根据以下因素决定何时上传：

1. **文件数量**: 当待上传文件达到批量阈值（默认 5）时立即上传
2. **重要文件**: 检测到重要文件（package.json, .env, README.md 等）时立即上传
3. **定时上传**: 如果文件未达到阈值，会在定时间隔后上传

适合大多数开发场景。

### Immediate（立即上传）

每次文件变化后立即上传。

**优点**: 实时性好，几乎零延迟
**缺点**: 频繁提交，可能产生大量提交记录

适合：需要实时备份的场景。

### Batch（批量上传）

积累到指定数量的文件变化后批量上传。

**优点**: 减少提交次数，提交记录更清晰
**缺点**: 有延迟，批量失败需要重试

适合：批量修改文件时。

### Scheduled（定时上传）

按固定间隔定时上传，无论文件数量多少。

**优点**: 可预测的提交节奏
**缺点**: 延迟可能较长

适合：定时备份、持续集成场景。

---

## 🔧 高级用法

### 命令行选项

```bash
# 指定上传策略
codesync agent start --strategy immediate

# 批量上传，阈值为 10
codesync agent start --strategy batch --batch-size 10

# 定时上传，间隔 120 秒
codesync agent start --strategy scheduled --interval 120

# 禁用 AI 生成
codesync agent start --no-ai

# 跳过确认提示
codesync agent start --yes

# 禁用自动推送
codesync agent start --no-push

# 使用 Gitmoji 规范
codesync agent start --convention gitmoji

# 英文提交信息
codesync agent start --language en
```

### 查看状态

```bash
codesync agent status
```

输出：

```
📊 智能体状态:
──────────────────────────────────────────────────
  运行状态: 运行中
  待处理文件: 3
  总提交数: 12
  总文件数: 34
  最后提交: 2026-10-20 15:30:45

  待处理文件列表:
    - src/newfile.js
    - src/utils.js
    - README.md

⚙️  配置:
  策略: smart
  AI 生成: 启用
  自动提交: 启用
  自动推送: 启用
```

### 配置文件

编辑 `.codesync-agent.json` 自定义配置：

```json
{
  "strategy": "smart",
  "batchSize": 5,
  "interval": 60000,
  "useAI": true,
  "commitConvention": "angular",
  "commitLanguage": "zh",
  "autoCommit": true,
  "autoPush": true,
  "requireConfirmation": true,
  "notify": false,
  "ignored": [
    "**/node_modules/**",
    "**/.git/**",
    "**/dist/**",
    "**/build/**",
    "**/.DS_Store",
    "**/*.log"
  ]
}
```

**配置说明**:

- `strategy`: 上传策略
- `batchSize`: 批量上传阈值
- `interval`: 定时上传间隔（毫秒）
- `useAI`: 是否使用 AI 生成提交信息
- `commitConvention`: 提交规范（angular/gitmoji）
- `commitLanguage`: 提交语言（zh/en/ja）
- `autoCommit`: 是否自动提交
- `autoPush`: 是否自动推送
- `requireConfirmation`: 是否需要确认
- `notify`: 是否启用通知
- `ignored`: 忽略的文件/目录模式

---

## 💡 使用技巧

### 1. 结合 CI/CD

智能体自动推送后，可以触发 CI/CD 流程：

```bash
# 配置 Webhook
codesync ci install --platform github
```

### 2. 团队协作

团队成员可以共享 `.codesync-agent.json` 配置文件，确保一致的提交行为。

### 3. 开发 vs 生产

不同环境可以使用不同配置：

```bash
# 开发环境：立即上传，需要确认
codesync agent start --strategy immediate --yes

# 生产环境：批量上传，无需确认
codesync agent start --strategy batch --yes
```

### 4. 多项目

每个项目可以有独立的配置文件，使用 `--path` 指定项目路径：

```bash
codesync agent start --path /path/to/project
```

---

## ⚠️ 注意事项

1. **首次使用**: 建议先启用 `requireConfirmation`，确认智能体行为符合预期后再关闭
2. **敏感文件**: 确保 `.env` 等敏感文件在 `.gitignore` 中
3. **大文件**: 大文件变化可能导致上传延迟，建议在 `ignored` 中排除
4. **网络**: 确保网络稳定，避免推送失败
5. **冲突**: 多人协作时注意处理合并冲突

---

## 🐛 故障排查

### 智能体无法启动

**问题**: 提示 "当前目录不是 Git 仓库"

**解决**: 确保在 Git 仓库根目录运行

### 推送失败

**问题**: 提示 "推送失败（可能没有远程仓库）"

**解决**: 
1. 配置远程仓库：`git remote add origin <url>`
2. 或禁用自动推送：`codesync agent start --no-push`

### AI 生成失败

**问题**: 提示 "AI 生成提交信息失败"

**解决**:
1. 检查 API Key 配置：`codesync config --list`
2. 禁用 AI：`codesync agent start --no-ai`

### 文件未被监听

**问题**: 修改文件后没有触发上传

**解决**:
1. 检查文件是否在 `ignored` 列表中
2. 检查文件路径是否正确
3. 查看智能体状态：`codesync agent status`

---

## 📚 相关命令

```bash
# 配置管理
codesync config --list
codesync config set apiKey=sk-xxx

# 手动上传
codesync upload --platform github --name my-project

# Git 操作
codesync git status
codesync git log

# 查看智能体配置说明
codesync agent config
```

---

## 🎯 最佳实践

1. **首次使用**: 先运行 `codesync agent-init` 配置
2. **测试阶段**: 启用 `requireConfirmation` 观察行为
3. **生产环境**: 禁用确认，选择合适的策略
4. **团队协作**: 共享配置文件，保持一致
5. **定期检查**: 使用 `codesync agent status` 查看状态
6. **优雅停止**: 使用 Ctrl+C 停止，处理待上传文件

---

## 📞 支持

如有问题，请查看：

- 主文档: `README.md`
- 实施报告: `IMPLEMENTATION_REPORT.md`
- 拓展计划: `拓展.md`
