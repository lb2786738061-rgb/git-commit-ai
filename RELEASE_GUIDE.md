# CodeSync 发布指南

本文档说明如何发布 CodeSync 的各个组成部分：

| 组成部分 | 目录 | 发布目标 |
| --- | --- | --- |
| CLI | `cli/` | npm（包名 `codesync-cli`） |
| 桌面应用 | `desktop/` | GitHub Release 安装包 |
| VS Code 插件 | `vscode-extension/` | VS Code Marketplace |
| 核心库 | `shared/` | 不单独发布，随 CLI 一起分发 |

---

## 一、发布前检查清单

```bash
# 1. 确认工作区干净
git status

# 2. 跑通全部测试
npm test

# 3. 构建插件并做类型检查
cd vscode-extension && npm test && cd ..

# 4. 确认 CLI 可用
node cli/bin/codesync.js --version
```

- [ ] 全部测试通过
- [ ] `CHANGELOG.md` 的「未发布」段落已整理为本次版本内容
- [ ] 版本号已在所有 `package.json` 中同步
- [ ] README 中的命令、截图与实际行为一致
- [ ] 工作区已提交并推送到 `main`

---

## 二、版本号同步

本项目有 4 处需要维护版本号，发布前必须保持一致：

| 文件 | 当前值 | 说明 |
| --- | --- | --- |
| `package.json` | `2.0.0` | 根包（私有，仅用于 workspaces） |
| `cli/package.json` | `2.0.0` | CLI，发布到 npm |
| `desktop/package.json` | `2.0.0` | 桌面应用 |
| `vscode-extension/package.json` | `1.0.0` | VS Code 插件，版本号独立维护 |

```bash
# 用 npm version 逐个更新（会自动打 git tag，注意根目录的 private 包不适合用这条）
npm version patch --prefix cli
npm version patch --prefix desktop
npm version patch --prefix vscode-extension
```

> ⚠️ 根 `package.json` 是 `"private": true`，**不要**对它执行 `npm version`（会创建无意义的 tag）。

### 版本号约定

| 变更类型 | 版本位 | 示例 |
| --- | --- | --- |
| 修复 bug、文案调整 | patch | `2.0.0` → `2.0.1` |
| 新增功能、新增命令 | minor | `2.0.0` → `2.1.0` |
| 不兼容变更、配置结构调整 | major | `2.0.0` → `3.0.0` |

---

## 三、创建 GitHub Release

### 方式 1：GitHub 网页（最简单）

1. 打开 <https://github.com/lb2786738061-rgb/git-commit-ai/releases/new>
2. **Choose a tag** → 选择已有的 `v2.1.0`，或选择 `Create new tag: v2.1.0 on main`
3. **Release title** 填 `CodeSync v2.1.0`
4. **Release description** 粘贴 `CHANGELOG.md` 中对应版本的正文
5. 勾选 `Set as a pre-release`（预发布时）
6. 点击 **Publish release**

### 方式 2：GitHub CLI

```bash
gh auth login

# 方式 A：直接用 CHANGELOG 内容
gh release create v2.1.0 --title "CodeSync v2.1.0" --notes-file CHANGELOG.md

# 方式 B：自动根据 commit 生成（推荐用 codesync 自己的命令）
node cli/bin/codesync.js release v2.1.0
```

`codesync release` 会自动完成：创建 tag → 推送 tag → 分类 commit 生成 Release Notes → 调用 `gh` 创建 Release。

### 方式 3：GitHub API

```bash
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/lb2786738061-rgb/git-commit-ai/releases \
  -d '{
    "tag_name": "v2.1.0",
    "target_commitish": "main",
    "name": "CodeSync v2.1.0",
    "body": "CHANGELOG.md 中的内容",
    "draft": false,
    "prerelease": false
  }'
```

---

## 四、发布到 npm（CLI）

```bash
cd cli

# 确认包内容（避免把不该发布的东西打进去）
npm pack --dry-run

# 发布
npm publish

# 预发布版本
npm publish --tag beta
```

发布后验证：

```bash
npm view codesync-cli versions
npm install -g codesync-cli
codesync --version
```

> 当前登录状态可用 `npm whoami` 检查；若提示 `ENEEDAUTH`，先执行 `npm login`。

---

## 五、发布 VS Code 插件到 Marketplace

详见 [`vscode-extension/PUBLISHING.md`](./vscode-extension/PUBLISHING.md)，核心步骤：

```bash
cd vscode-extension
npm install
npm run compile
npx @vscode/vsce package
npx @vscode/vsce login lb2786738061-rgb
npx @vscode/vsce publish --packagePath codesync-vscode-1.0.0.vsix
```

或使用内置的自动化工作流（打 `vscode-v*` 标签触发）：

```bash
git tag vscode-v1.0.0
git push origin vscode-v1.0.0
```

---

## 六、桌面应用安装包

桌面应用随 GitHub Release 分发：

```bash
cd desktop
npm install
npm run build          # 若存在打包脚本；否则用 electron-builder / electron-packager
```

产物统一放到 `release/` 目录，命名规范：

```
release/
├── codesync-desktop-v2.1.0-win-x64.exe
├── codesync-desktop-v2.1.0-mac-arm64.dmg
└── codesync-desktop-v2.1.0-linux-x64.AppImage
```

然后在 GitHub Release 页面把这些文件作为 **Release assets** 上传。

---

## 七、发布后验证

```bash
# 1. GitHub Release
open https://github.com/lb2786738061-rgb/git-commit-ai/releases

# 2. npm 包
npm view codesync-cli version

# 3. VS Code Marketplace
open https://marketplace.visualstudio.com/items?itemName=lb2786738061-rgb.codesync-vscode

# 4. 本地全局安装冒烟测试
npm install -g codesync-cli
codesync --help
codesync config --list
```

---

## 八、常见问题

**Release 里 `Full Changelog` 链接指向 `your-org/your-repo`**
→ `shared/ai/commit.js` 与 `cli/src/commands/release.js` 中的仓库地址是占位符，发布前需替换为真实仓库地址。

**npm publish 报 `402 Payment Required`**
→ 包名 `codesync-cli` 可能已被占用，或账号未开通发布权限。确认包名可用性：`npm view codesync-cli`。

**Marketplace 提示 `Extension name must be all lowercase`**
→ `vscode-extension/package.json` 的 `name` 需全小写。

**Marketplace 上传后搜不到**
→ 审核需要时间；确认是全新版本号；检查是否误用了 `--pre-release`。

**标签已存在**
→ `git tag -d v2.1.0 && git push origin :refs/tags/v2.1.0` 删除后重试。

---

## 相关文档

- [更新日志](./CHANGELOG.md)
- [VS Code 插件发布指南](./vscode-extension/PUBLISHING.md)
- [插件使用说明](./vscode-extension/README.md)
- [功能清单](./FEATURES_COMPLETE.md)
