import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import ora from 'ora';

export async function releaseCommand(version, options) {
  console.log(pc.cyan(pc.bold('\n📦 CodeSync - Release 自动化')));
  console.log(pc.dim('─'.repeat(50)));

  try {
    const { draft = false, prerelease = false } = options;

    if (!version) {
      console.error(pc.red('❌ 缺少版本号'));
      console.log(pc.dim('  使用: codesync release <version> [--draft] [--prerelease]'));
      console.log(pc.dim('  示例: codesync release 1.0.0'));
      console.log(pc.dim('       codesync release 1.0.0-beta.1 --prerelease'));
      return;
    }

    const spinner = ora(pc.cyan('正在创建 Release...')).start();

    // 1. 创建 tag
    console.log(pc.cyan('\n1️⃣ 创建 Git Tag...'));
    try {
      execSync(`git tag -a ${version} -m "Release ${version}"`, { stdio: 'inherit' });
      console.log(pc.green(`✅ Tag ${version} 创建成功`));
    } catch (error) {
      spinner.fail(pc.red('Tag 创建失败'));
      throw error;
    }

    // 2. 推送 tag
    console.log(pc.cyan('\n2️⃣ 推送 Tag 到远程...'));
    try {
      execSync(`git push origin ${version}`, { stdio: 'inherit' });
      console.log(pc.green(`✅ Tag ${version} 推送成功`));
    } catch (error) {
      spinner.fail(pc.red('Tag 推送失败'));
      throw error;
    }

    // 3. 生成 Release Notes
    console.log(pc.cyan('\n3️⃣ 生成 Release Notes...'));
    const releaseNotes = await generateReleaseNotes(version);
    console.log(pc.green('✅ Release Notes 生成成功'));

    // 4. 创建 GitHub Release
    console.log(pc.cyan('\n4️⃣ 创建 GitHub Release...'));
    try {
      await createGitHubRelease(version, releaseNotes, draft, prerelease);
      console.log(pc.green('✅ GitHub Release 创建成功'));
    } catch (error) {
      console.log(pc.yellow('⚠️  GitHub Release 创建失败（可能需要配置 GitHub Token）'));
      console.log(pc.dim('  Release Notes:'));
      console.log(pc.dim(releaseNotes));
    }

    spinner.succeed(pc.green(`Release ${version} 创建成功`));

    console.log(pc.cyan('\n📋 Release 信息:'));
    console.log(pc.dim(`  版本: ${version}`));
    console.log(pc.dim(`  状态: ${draft ? '草稿' : '已发布'}`));
    console.log(pc.dim(`  类型: ${prerelease ? '预发布' : '正式发布'}`));

  } catch (error) {
    console.error(pc.red(`\n❌ 操作失败: ${error.message}`));
    process.exit(1);
  }
}

async function generateReleaseNotes(version) {
  try {
    // 获取上一个 tag
    const lastTag = execSync('git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo ""', { encoding: 'utf-8' }).trim();

    // 获取提交历史
    const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
    const commits = execSync(`git log ${range} --pretty=format:"%h|%s|%an"`, { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(line => line);

    // 分类提交
    const categorized = {
      feat: [],
      fix: [],
      docs: [],
      style: [],
      refactor: [],
      test: [],
      chore: [],
      other: []
    };

    commits.forEach(commit => {
      const [hash, subject, author] = commit.split('|');
      const type = subject.split(':')[0].toLowerCase().trim();

      if (categorized[type]) {
        categorized[type].push({ hash, subject, author });
      } else {
        categorized.other.push({ hash, subject, author });
      }
    });

    // 生成 Markdown
    let notes = `# Release ${version}\n\n`;
    notes += `## 📝 What's Changed\n\n`;

    const sections = [
      { key: 'feat', title: '✨ New Features' },
      { key: 'fix', title: '🐛 Bug Fixes' },
      { key: 'docs', title: '📝 Documentation' },
      { key: 'style', title: '🎨 Styles' },
      { key: 'refactor', title: '♻️  Code Refactoring' },
      { key: 'test', title: '✅ Tests' },
      { key: 'chore', title: '🔧 Chores' },
      { key: 'other', title: '📦 Other Changes' }
    ];

    sections.forEach(section => {
      if (categorized[section.key].length > 0) {
        notes += `### ${section.title}\n\n`;
        categorized[section.key].forEach(({ hash, subject, author }) => {
          notes += `- ${subject} (${hash}) by @${author}\n`;
        });
        notes += '\n';
      }
    });

    notes += `---\n\n`;
    notes += `Full Changelog: https://github.com/your-org/your-repo/compare/${lastTag || 'v0.0.0'}...${version}\n`;

    return notes;
  } catch (error) {
    return `# Release ${version}\n\nRelease notes generation failed: ${error.message}`;
  }
}

async function createGitHubRelease(version, notes, draft, prerelease) {
  const { execSync } = await import('child_process');
  
  try {
    // 获取 GitHub token
    const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    
    if (!githubToken) {
      throw new Error('GitHub Token not found');
    }

    // 获取仓库信息
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
    const repoMatch = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/]+?)(\.git)?$/);
    
    if (!repoMatch) {
      throw new Error('Could not extract repository information');
    }

    const owner = repoMatch[1];
    const repo = repoMatch[2].replace('.git', '');

    // 使用 GitHub CLI 创建 release
    const ghCommand = [
      'gh', 'release', 'create', version,
      '--notes', notes,
      draft ? '--draft' : '',
      prerelease ? '--prerelease' : ''
    ].filter(Boolean).join(' ');

    execSync(ghCommand, { stdio: 'inherit' });
  } catch (error) {
    throw new Error(`Failed to create GitHub release: ${error.message}`);
  }
}
