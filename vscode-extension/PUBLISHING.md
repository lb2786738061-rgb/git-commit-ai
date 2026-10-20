# 发布到 VS Code Marketplace

本文档说明如何把 CodeSync 插件发布到 [VS Code Marketplace](https://marketplace.visualstudio.com/)。

---

## 一、前置条件

| 条件 | 说明 |
| --- | --- |
| Microsoft / GitHub / Google 账号 | 用于登录 [Azure DevOps](https://dev.azure.com/) |
| Publisher 账号 | 发布者 ID，一旦创建不可更改，请谨慎选择 |
| Azure DevOps PAT | 勾选 `Marketplace` 权限的 Personal Access Token |
| Node.js >= 16 | 构建与打包 |

### 1. 创建 Publisher

1. 打开 <https://marketplace.visualstudio.com/> → 登录 → 右上角头像 → **发布者**
2. 填写组织信息（Azure DevOps 组织名、显示名称）
3. 系统会生成一个 **Publisher ID**（如 `lb2786738061-rgb`）

> Publisher ID 必须与 `vscode-extension/package.json` 中的 `publisher` 字段一致。

### 2. 创建 Azure DevOps PAT

1. 打开 <https://dev.azure.com/> → 用户设置 → **Personal Access Tokens**
2. 选择 `All accessible organizations` → 权限勾选 **Manage** → 全部勾选
3. 生成后**立即复制**（只会显示一次）

> PAT 通常有效期 90 天，过期后需要重新创建并重新执行 `vsce login`。

---

## 二、打包

```bash
cd vscode-extension
npm install
npm run compile          # esbuild 打包，shared/ 会一并打进 dist/extension.js
npm test                 # 构建 + 类型检查
npx @vscode/vsce package # 生成 codesync-vscode-1.0.0.vsix
```

`@vscode/vsce` 已列入 `devDependencies`，也可以全局安装：

```bash
npm install -g @vscode/vsce
vsce package
```

> 注意：包名是 `@vscode/vsce`（不是已被弃用的 `vsce`）。若 `npx vsce` 提示下载 `vsce@2.x`，
> 请改用 `npx @vscode/vsce`。

### 打包产物说明

| 文件 | 作用 |
| --- | --- |
| `dist/extension.js` | 插件主入口（含 `shared/` 全部逻辑） |
| `icons/codesync.png` | Marketplace 列表图标（128×128） |
| `icons/codesync.svg` | 活动栏图标 |
| `README.md` | Marketplace 详情页（`vscode-extension/README.md`） |
| `CHANGELOG.md` | Marketplace 更新日志标签页 |
| `LICENSE` | MIT 许可证（`vsce` 打包时必需） |
| `package.json` | 插件清单（命令、设置、菜单） |

---

## 三、登录与发布

### 登录

```bash
npx @vscode/vsce login <publisher-id>
# 按提示粘贴 Azure DevOps PAT
```

验证登录状态：

```bash
npx @vscode/vsce ls-publishers
```

### 发布

```bash
# 方式一：直接发布当前目录
npx @vscode/vsce publish

# 方式二：先打包再发布指定文件
npx @vscode/vsce package
npx @vscode/vsce publish --packagePath codesync-vscode-1.0.0.vsix

# 预发布（仅对「预发布渠道」的用户可见）
npx @vscode/vsce publish --pre-release

# 指定目标版本号
npx @vscode/vsce publish --target 1.1.0
```

发布成功后，Marketplace 页面通常在 **几分钟内** 完成审核与上架。

---

## 四、版本号与更新日志

发布前必须更新版本号（Marketplace 不允许重复发布同一版本）：

```bash
# 修改 vscode-extension/package.json 的 version 字段
npm version patch        # 1.0.0 -> 1.0.1
npm version minor        # 1.0.0 -> 1.1.0
npm version major        # 1.0.0 -> 2.0.0
```

同时在根目录 [`CHANGELOG.md`](../CHANGELOG.md) 的「未发布」段落中记录本次变更。

### 版本号约定

| 变更类型 | 版本位 | 示例 |
| --- | --- | --- |
| 修复 bug、文案调整 | patch | `1.0.0` → `1.0.1` |
| 新增功能、新增命令 | minor | `1.0.0` → `1.1.0` |
| 不兼容变更、配置结构调整 | major | `1.0.0` → `2.0.0` |

---

## 五、自动化发布（GitHub Actions）

仓库已内置工作流 [`.github/workflows/publish-vscode.yml`](../.github/workflows/publish-vscode.yml)，
在打上 `vscode-v*` 标签时自动打包并发布：

```bash
git tag vscode-v1.0.0
git push origin vscode-v1.0.0
```

需要提前在 GitHub 仓库中配置 Secret：

| Secret | 说明 |
| --- | --- |
| `VSCE_PAT` | Azure DevOps PAT（Manage 权限） |
| `VSCE_PUBLISHER` | Publisher ID（可设为 Repository variable） |

---

## 六、优化 Marketplace 页面

### 必备信息（已在 `package.json` 中配置）

```json
{
  "publisher": "lb2786738061-rgb",
  "license": "MIT",
  "icon": "icons/codesync.png",
  "galleryBanner": { "color": "#0d1117", "theme": "dark" },
  "repository": { "type": "git", "url": "https://github.com/lb2786738061-rgb/git-commit-ai.git" },
  "bugs": { "url": "https://github.com/lb2786738061-rgb/git-commit-ai/issues" },
  "keywords": ["git", "ai", "commit", "github", "gitee", "gitlab", "upload", "code-review"]
}
```

### README 要求

- 必须是 **纯 Markdown**，Marketplace 只支持 Markdown 的一部分语法
- 图片必须使用**相对路径**（如 `./icons/demo.gif`），且放在扩展目录内才会被打包
- 建议包含：功能列表、安装步骤、配置说明、截图/动图、使用示例
- 首屏要有**一句话说明 + 截图**，这是影响安装量的关键

### 分类与关键词

| 字段 | 建议值 |
| --- | --- |
| `categories` | `SCM Providers`、`Other`、`Programming Languages` |
| `keywords` | 最多 5 个会被索引，其余作为补充 |

---

## 七、常见问题

**`You must specify a publisher`**
→ `package.json` 缺少 `publisher` 字段，或与实际 Publisher ID 不一致。

**`LICENSE not found`**
→ `package.json` 缺少 `license` 字段（本项目为 `MIT`，根目录已有 `LICENSE` 文件）。

**`A 'repository' field is required`**
→ `package.json` 缺少 `repository` 字段。

**`README.md contains relative links that will break`**
→ README 中的图片/链接必须是扩展目录内的相对路径，外部链接请用绝对 URL。

**`Invalid publisher name` / `Cannot find publisher`**
→ `vsce login` 的 PAT 无效或已过期，重新生成 PAT 并再次登录。

**`Extension name must be all lowercase`**
→ `name` 字段必须全小写（当前为 `codesync-vscode`，符合要求）。

**发布后 VS Code 里搜不到**
→ 审核需要时间（通常几分钟到几小时）；确认版本号是全新的；检查是否误用了 `--pre-release`
（预发布版本需要用户在扩展面板开启「预发布渠道」才能看到）。

**`Extension is already published with version X`**
→ 版本号重复，务必先 `npm version patch` 递增版本。

---

## 八、发布后验证

```bash
# 1. 确认 Marketplace 页面已上架
open https://marketplace.visualstudio.com/items?itemName=lb2786738061-rgb.codesync-vscode

# 2. 本地安装测试
code --install-extension lb2786738061-rgb.codesync-vscode

# 3. 重新加载 VS Code（Ctrl+Shift+P -> Developer: Reload Window）

# 4. 检查活动栏出现 CodeSync 图标
# 5. 执行 CodeSync: Upload Project to Remote Repository 验证上传流程
```

---

## 相关文档

- [插件使用说明](./README.md)
- [项目总览 README](../README.md)
- [更新日志](../CHANGELOG.md)
- [VS Code 官方发布文档](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
