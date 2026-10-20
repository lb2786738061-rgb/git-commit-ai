import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import ora from 'ora';

export async function ciCommand(action, options) {
  const { platform } = options;

  console.log(pc.cyan(pc.bold('\n🚀 CodeSync - CI/CD 集成')));
  console.log(pc.dim('─'.repeat(50)));

  try {
    switch (action) {
      case 'install':
        await handleInstall(platform);
        break;
      case 'uninstall':
        await handleUninstall(platform);
        break;
      default:
        console.error(pc.red('❌ 未知的操作类型'));
        console.log(pc.dim('可用操作: install, uninstall'));
        process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`\n❌ 操作失败: ${error.message}`));
    process.exit(1);
  }
}

async function handleInstall(platform) {
  if (!platform) {
    console.error(pc.red('❌ 请指定平台: --platform github 或 --platform gitlab'));
    process.exit(1);
  }

  const cwd = process.cwd();

  if (platform === 'github') {
    await installGitHubActions(cwd);
  } else if (platform === 'gitlab') {
    await installGitLabCI(cwd);
  } else {
    console.error(pc.red(`❌ 不支持的平台: ${platform}`));
    console.log(pc.dim('支持的平台: github, gitlab'));
    process.exit(1);
  }
}

async function handleUninstall(platform) {
  if (!platform) {
    console.error(pc.red('❌ 请指定平台: --platform github 或 --platform gitlab'));
    process.exit(1);
  }

  const cwd = process.cwd();

  if (platform === 'github') {
    await uninstallGitHubActions(cwd);
  } else if (platform === 'gitlab') {
    await uninstallGitLabCI(cwd);
  } else {
    console.error(pc.red(`❌ 不支持的平台: ${platform}`));
    console.log(pc.dim('支持的平台: github, gitlab'));
    process.exit(1);
  }
}

async function installGitHubActions(cwd) {
  const spinner = ora(pc.cyan('正在安装 GitHub Actions 工作流...')).start();

  const workflowsDir = path.join(cwd, '.github', 'workflows');

  // 创建 .github/workflows 目录
  if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true });
  }

  const workflowFile = path.join(workflowsDir, 'codesync.yml');

  // GitHub Actions 工作流内容
  const workflowContent = `name: CodeSync CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  commit-message-validation:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Validate commit messages
        run: |
          # 安装 CodeSync
          npm install -g codesync

          # 验证提交信息
          codesync git log --validate

  changelog-generation:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && startsWith(github.ref, 'refs/tags/')
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate Changelog
        run: |
          # 安装 CodeSync
          npm install -g codesync

          # 生成 Changelog
          codesync git changelog --from=\${{ github.ref_name }}~1 --to=\${{ github.ref_name }} > CHANGELOG.md

      - name: Commit Changelog
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add CHANGELOG.md
          git commit -m "docs: update changelog"
          git push

  release-automation:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && startsWith(github.ref, 'refs/tags/')
    needs: changelog-generation
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: \${{ github.ref_name }}
          release_name: Release \${{ github.ref_name }}
          body_path: CHANGELOG.md
          draft: false
          prerelease: false
`;

  fs.writeFileSync(workflowFile, workflowContent, 'utf-8');

  spinner.succeed(pc.green('GitHub Actions 工作流安装成功'));

  console.log(pc.cyan('\n📁 已创建文件:'));
  console.log(pc.dim(`  ${workflowFile}`));

  console.log(pc.cyan('\n📋 工作流功能:'));
  console.log(pc.dim('  ✓ 提交信息验证'));
  console.log(pc.dim('  ✓ 自动生成 Changelog（仅标签推送）'));
  console.log(pc.dim('  ✓ 自动创建 Release（仅标签推送）'));

  console.log(pc.cyan('\n💡 使用说明:'));
  console.log(pc.dim('  1. 推送代码时会自动验证提交信息'));
  console.log(pc.dim('  2. 推送标签时会自动生成 Changelog 并创建 Release'));
  console.log(pc.dim('  3. 示例: git tag v1.0.0 && git push origin v1.0.0'));
}

async function uninstallGitHubActions(cwd) {
  const spinner = ora(pc.cyan('正在卸载 GitHub Actions 工作流...')).start();

  const workflowFile = path.join(cwd, '.github', 'workflows', 'codesync.yml');

  if (fs.existsSync(workflowFile)) {
    fs.unlinkSync(workflowFile);
    spinner.succeed(pc.green('GitHub Actions 工作流卸载成功'));
  } else {
    spinner.warn(pc.yellow('未找到 GitHub Actions 工作流文件'));
  }
}

async function installGitLabCI(cwd) {
  const spinner = ora(pc.cyan('正在安装 GitLab CI 配置...')).start();

  const gitlabCiFile = path.join(cwd, '.gitlab-ci.yml');

  // GitLab CI 配置内容
  const gitlabCiContent = `stages:
  - validate
  - changelog
  - release

commit-message-validation:
  stage: validate
  script:
    - npm install -g codesync
    - codesync git log --validate
  only:
    - main
    - develop
    - merge_requests

changelog-generation:
  stage: changelog
  script:
    - npm install -g codesync
    - codesync git changelog --from=$CI_COMMIT_BEFORE_SHA --to=$CI_COMMIT_SHA > CHANGELOG.md
  only:
    - tags
  artifacts:
    paths:
      - CHANGELOG.md

release-automation:
  stage: release
  script:
    - echo "Creating release for $CI_COMMIT_TAG"
  only:
    - tags
  when: manual
`;

  fs.writeFileSync(gitlabCiFile, gitlabCiContent, 'utf-8');

  spinner.succeed(pc.green('GitLab CI 配置安装成功'));

  console.log(pc.cyan('\n📁 已创建文件:'));
  console.log(pc.dim(`  ${gitlabCiFile}`));

  console.log(pc.cyan('\n📋 工作流功能:'));
  console.log(pc.dim('  ✓ 提交信息验证'));
  console.log(pc.dim('  ✓ 自动生成 Changelog（仅标签推送）'));
  console.log(pc.dim('  ✓ 手动触发 Release（仅标签推送）'));

  console.log(pc.cyan('\n💡 使用说明:'));
  console.log(pc.dim('  1. 推送代码时会自动验证提交信息'));
  console.log(pc.dim('  2. 推送标签时会自动生成 Changelog'));
  console.log(pc.dim('  3. 需要手动触发 Release'));
}

async function uninstallGitLabCI(cwd) {
  const spinner = ora(pc.cyan('正在卸载 GitLab CI 配置...')).start();

  const gitlabCiFile = path.join(cwd, '.gitlab-ci.yml');

  if (fs.existsSync(gitlabCiFile)) {
    fs.unlinkSync(gitlabCiFile);
    spinner.succeed(pc.green('GitLab CI 配置卸载成功'));
  } else {
    spinner.warn(pc.yellow('未找到 GitLab CI 配置文件'));
  }
}
