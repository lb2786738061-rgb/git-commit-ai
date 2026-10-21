# CodeSync Release Guide

This document explains how to release each part of CodeSync:

| Component | Directory | Release target |
| --- | --- | --- |
| CLI | `cli/` | npm (package name `codesync-cli`) |
| Desktop app | `desktop/` | GitHub Release installers |
| VS Code extension | `vscode-extension/` | VS Code Marketplace |
| Core library | `shared/` | Not published separately, shipped with the CLI |

---

## 1. Pre-release checklist

```bash
# 1. Make sure the working tree is clean
git status

# 2. Run the full test suite
npm test

# 3. Build the extension and run the type check
cd vscode-extension && npm test && cd ..

# 4. Make sure the CLI works
node cli/bin/codesync.js --version
```

- [ ] All tests pass
- [ ] The "Unreleased" section of `CHANGELOG.md` has been turned into the content of this release
- [ ] The version number is synced across all `package.json` files
- [ ] The commands and screenshots in the README match the actual behavior
- [ ] The working tree is committed and pushed to `main`

---

## 2. Version number sync

The project keeps the version number in 4 places; they must stay consistent before a release:

| File | Current value | Notes |
| --- | --- | --- |
| `package.json` | `2.0.0` | Root package (private, only used for workspaces) |
| `cli/package.json` | `2.0.0` | CLI, published to npm |
| `desktop/package.json` | `2.0.0` | Desktop app |
| `vscode-extension/package.json` | `1.0.0` | VS Code extension, versioned independently |

```bash
# Use npm version to update them one by one (it also creates a git tag; the private
# root package is not suitable for this command)
npm version patch --prefix cli
npm version patch --prefix desktop
npm version patch --prefix vscode-extension
```

> ⚠️ The root `package.json` is `"private": true` — **do not** run `npm version` on it (it creates a meaningless tag).

### Versioning convention

| Change type | Version part | Example |
| --- | --- | --- |
| Bug fix, copy tweaks | patch | `2.0.0` → `2.0.1` |
| New feature, new command | minor | `2.0.0` → `2.1.0` |
| Breaking change, config restructuring | major | `2.0.0` → `3.0.0` |

---

## 3. Creating a GitHub Release

### Option 1: GitHub web UI (easiest)

1. Open <https://github.com/lb2786738061-rgb/git-commit-ai/releases/new>
2. **Choose a tag** → select the existing `v2.1.0`, or choose `Create new tag: v2.1.0 on main`
3. **Release title**: `CodeSync v2.1.0`
4. **Release description**: paste the matching section of `CHANGELOG.md`
5. Check `Set as a pre-release` (for prereleases)
6. Click **Publish release**

### Option 2: GitHub CLI

```bash
gh auth login

# Option A: use the CHANGELOG content directly
gh release create v2.1.0 --title "CodeSync v2.1.0" --notes-file CHANGELOG.md

# Option B: generate it from the commits (recommended: use codesync's own command)
node cli/bin/codesync.js release v2.1.0
```

`codesync release` does the whole thing: creates the tag → pushes the tag → categorizes the commits into release notes → calls `gh` to create the release.

### Option 3: GitHub API

```bash
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/lb2786738061-rgb/git-commit-ai/releases \
  -d '{
    "tag_name": "v2.1.0",
    "target_commitish": "main",
    "name": "CodeSync v2.1.0",
    "body": "The content of the matching CHANGELOG.md section",
    "draft": false,
    "prerelease": false
  }'
```

---

## 4. Publishing the CLI to npm

```bash
cd cli

# Check the package contents first (avoid shipping things that should not be published)
npm pack --dry-run

# Publish
npm publish

# Prerelease
npm publish --tag beta
```

Verify after publishing:

```bash
npm view codesync-cli versions
npm install -g codesync-cli
codesync --version
```

> Check the current login with `npm whoami`; if it reports `ENEEDAUTH`, run `npm login` first.

---

## 5. Publishing the VS Code extension to the Marketplace

See [`vscode-extension/PUBLISHING.md`](./vscode-extension/PUBLISHING.md). The core steps:

```bash
cd vscode-extension
npm install
npm run compile
npx @vscode/vsce package
npx @vscode/vsce login lb2786738061-rgb
npx @vscode/vsce publish --packagePath codesync-vscode-1.0.0.vsix
```

Or use the built-in automation (triggered by a `vscode-v*` tag):

```bash
git tag vscode-v1.0.0
git push origin vscode-v1.0.0
```

---

## 6. Desktop app installers

The desktop app is distributed through GitHub Releases:

```bash
cd desktop
npm install
npm run build          # if a packaging script exists; otherwise use electron-builder / electron-packager
```

Put the artifacts in the `release/` directory using this naming convention:

```
release/
├── codesync-desktop-v2.1.0-win-x64.exe
├── codesync-desktop-v2.1.0-mac-arm64.dmg
└── codesync-desktop-v2.1.0-linux-x64.AppImage
```

Then upload these files as **Release assets** on the GitHub Release page.

---

## 7. Post-release verification

```bash
# 1. GitHub Release
open https://github.com/lb2786738061-rgb/git-commit-ai/releases

# 2. npm package
npm view codesync-cli version

# 3. VS Code Marketplace
open https://marketplace.visualstudio.com/items?itemName=lb2786738061-rgb.codesync-vscode

# 4. Local global install smoke test
npm install -g codesync-cli
codesync --help
codesync config --list
```

---

## 8. FAQ

**The `Full Changelog` link in the release points to `your-org/your-repo`**
→ The repository URL in `shared/ai/commit.js` and `cli/src/commands/release.js` is a placeholder and must be replaced with the real repository URL before publishing.

**`npm publish` fails with `402 Payment Required`**
→ The package name `codesync-cli` may already be taken, or the account has no publishing rights. Check availability with `npm view codesync-cli`.

**The Marketplace complains `Extension name must be all lowercase`**
→ The `name` field in `vscode-extension/package.json` must be lowercase.

**The extension is not searchable on the Marketplace after uploading**
→ Review takes time; make sure the version number is new and that `--pre-release` was not used by accident.

**The tag already exists**
→ `git tag -d v2.1.0 && git push origin :refs/tags/v2.1.0` deletes it, then try again.

---

## Related documents

- [Changelog](./CHANGELOG.md)
- [VS Code extension publishing guide](./vscode-extension/PUBLISHING.md)
- [Extension usage guide](./vscode-extension/README.md)
- [Feature list](./FEATURES_COMPLETE.md)
