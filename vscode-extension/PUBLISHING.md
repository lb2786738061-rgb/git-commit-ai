# Publishing to the VS Code Marketplace

This document explains how to publish the CodeSync extension to the [VS Code Marketplace](https://marketplace.visualstudio.com/).

---

## 1. Prerequisites

| Requirement | Notes |
| --- | --- |
| Microsoft / GitHub / Google account | Used to sign in to [Azure DevOps](https://dev.azure.com/) |
| Publisher account | The publisher ID cannot be changed once created — choose it carefully |
| Azure DevOps PAT | A Personal Access Token with the `Marketplace` scope |
| Node.js >= 16 | Build and packaging |

### 1.1 Create the publisher

1. Open <https://marketplace.visualstudio.com/> → sign in → avatar in the top right → **Publishers**
2. Fill in the organization details (Azure DevOps organization name, display name)
3. The system generates a **Publisher ID** (e.g. `lb2786738061-rgb`)

> The Publisher ID must match the `publisher` field in `vscode-extension/package.json`.

### 1.2 Create the Azure DevOps PAT

1. Open <https://dev.azure.com/> → User settings → **Personal Access Tokens**
2. Select `All accessible organizations` → scope **Manage** → check all
3. **Copy the token immediately** (it is only shown once)

> A PAT usually expires after 90 days; when it does, create a new one and run `vsce login` again.

---

## 2. Packaging

```bash
cd vscode-extension
npm install
npm run compile          # esbuild bundle, shared/ is bundled into dist/extension.js
npm test                 # build + type check
npx @vscode/vsce package # produces codesync-vscode-1.0.0.vsix
```

`@vscode/vsce` is already listed in `devDependencies`; you can also install it globally:

```bash
npm install -g @vscode/vsce
vsce package
```

> Note: the package name is `@vscode/vsce` (not the deprecated `vsce`). If `npx vsce` tries to download `vsce@2.x`,
> use `npx @vscode/vsce` instead.

### What ends up in the package

| File | Purpose |
| --- | --- |
| `dist/extension.js` | The extension entry point (contains all of the `shared/` logic) |
| `icons/codesync.png` | The Marketplace listing icon (128×128) |
| `icons/codesync.svg` | The activity bar icon |
| `README.md` | The Marketplace detail page (`vscode-extension/README.md`) |
| `CHANGELOG.md` | The Marketplace changelog tab |
| `LICENSE` | The MIT license (required by `vsce`) |
| `package.json` | The extension manifest (commands, settings, menus) |

---

## 3. Sign in and publish

### Sign in

```bash
npx @vscode/vsce login <publisher-id>
# Paste the Azure DevOps PAT when prompted
```

Verify the login:

```bash
npx @vscode/vsce ls-publishers
```

### Publish

```bash
# Option 1: publish the current directory
npx @vscode/vsce publish

# Option 2: package first, then publish the specific file
npx @vscode/vsce package
npx @vscode/vsce publish --packagePath codesync-vscode-1.0.0.vsix

# Prerelease (only visible to users on the prerelease channel)
npx @vscode/vsce publish --pre-release

# Publish with a specific target version
npx @vscode/vsce publish --target 1.1.0
```

After a successful publish, the Marketplace page usually goes through review and goes live **within a few minutes**.

---

## 4. Version numbers and changelog

The version number must be bumped before publishing (the Marketplace does not allow republishing the same version):

```bash
# Change the version field in vscode-extension/package.json
npm version patch        # 1.0.0 -> 1.0.1
npm version minor        # 1.0.0 -> 1.1.0
npm version major        # 1.0.0 -> 2.0.0
```

Also record the change in the "Unreleased" section of the root [`CHANGELOG.md`](../CHANGELOG.md).

### Versioning convention

| Change type | Version part | Example |
| --- | --- | --- |
| Bug fix, copy tweaks | patch | `1.0.0` → `1.0.1` |
| New feature, new command | minor | `1.0.0` → `1.1.0` |
| Breaking change, config restructuring | major | `1.0.0` → `2.0.0` |

---

## 5. Automated publishing (GitHub Actions)

The repository ships the workflow [`.github/workflows/publish-vscode.yml`](../.github/workflows/publish-vscode.yml),
which packages and publishes the extension automatically when a `vscode-v*` tag is pushed:

```bash
git tag vscode-v1.0.0
git push origin vscode-v1.0.0
```

Configure these secrets in the GitHub repository beforehand:

| Secret | Description |
| --- | --- |
| `VSCE_PAT` | The Azure DevOps PAT (Manage scope) |
| `VSCE_PUBLISHER` | The Publisher ID (can be set as a repository variable) |

---

## 6. Optimizing the Marketplace page

### Required metadata (already configured in `package.json`)

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

### README requirements

- It must be **plain Markdown** — the Marketplace only supports a subset of Markdown syntax
- Images must use **relative paths** (e.g. `./icons/demo.gif`) and live inside the extension folder to be packaged
- It should include: the feature list, installation steps, configuration, screenshots/animations and usage examples
- The first screen needs a **one-line pitch + a screenshot** — this is what drives the install count

### Categories and keywords

| Field | Recommended value |
| --- | --- |
| `categories` | `SCM Providers`, `Other`, `Programming Languages` |
| `keywords` | At most 5 are indexed, the rest are supplementary |

---

## 7. FAQ

**`You must specify a publisher`**
→ The `package.json` is missing the `publisher` field, or it does not match the actual Publisher ID.

**`LICENSE not found`**
→ The `package.json` is missing the `license` field (this project uses `MIT`, and the root already has a `LICENSE` file).

**`A 'repository' field is required`**
→ The `package.json` is missing the `repository` field.

**`README.md contains relative links that will break`**
→ Images/links in the README must be relative paths inside the extension folder; use absolute URLs for external links.

**`Invalid publisher name` / `Cannot find publisher`**
→ The PAT used by `vsce login` is invalid or expired — generate a new PAT and sign in again.

**`Extension name must be all lowercase`**
→ The `name` field must be lowercase (currently `codesync-vscode`, which is fine).

**The extension is not searchable in VS Code after publishing**
→ The review takes time (usually minutes to hours); make sure the version number is new; check that `--pre-release`
  was not used by accident (prerelease versions are only visible when users enable the prerelease channel).

**`Extension is already published with version X`**
→ The version number is a duplicate — run `npm version patch` first.

---

## 8. Post-release verification

```bash
# 1. Confirm the Marketplace page is live
open https://marketplace.visualstudio.com/items?itemName=lb2786738061-rgb.codesync-vscode

# 2. Install locally
code --install-extension lb2786738061-rgb.codesync-vscode

# 3. Reload VS Code (Ctrl+Shift+P -> Developer: Reload Window)

# 4. Check that the CodeSync icon appears in the activity bar
# 5. Run CodeSync: Upload Project to Remote Repository to verify the upload flow
```

---

## Related documents

- [Extension usage guide](./README.md)
- [Project overview README](../README.md)
- [Changelog](../CHANGELOG.md)
- [Official VS Code publishing documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
