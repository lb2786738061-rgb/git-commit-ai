import { GitOperations } from '../../../shared/git/operations.js';
import { generateCommitMessage } from '../../../shared/ai/commit.js';
import pc from 'picocolors';
import ora from 'ora';

export async function gitCommand(action, options) {
  const { number, mode, file } = options;

  console.log(pc.cyan(pc.bold('\n🔧 CodeSync - Git 扩展操作')));
  console.log(pc.dim('─'.repeat(50)));

  if (!GitOperations.isGitRepository(process.cwd())) {
    console.error(pc.red('❌ 当前目录不是 Git 仓库'));
    console.error(pc.dim('💡 提示: 请在 Git 项目目录中运行此命令。\n'));
    process.exit(1);
  }

  const git = new GitOperations(process.cwd());

  try {
    switch (action) {
      case 'log':
        await handleLog(git, number);
        break;
      case 'status':
        await handleStatus(git);
        break;
      case 'amend':
        await handleAmend(git);
        break;
      case 'revert':
        await handleRevert(git, options.commit, mode);
        break;
      case 'branch':
        await handleBranch(git, options.name);
        break;
      case 'changelog':
        await handleChangelog(git, options);
        break;
      case 'analyze':
        await handleAnalyze(git, options);
        break;
      case 'batch':
        await handleBatch(git, options);
        break;
      default:
        console.error(pc.red('❌ 未知操作类型'));
        console.log(pc.dim('可用操作: log, status, amend, revert, branch, changelog, analyze, batch'));
        process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`\n❌ 操作失败: ${error.message}`));
    process.exit(1);
  }
}

async function handleLog(git, count = 15) {
  const logs = await git.log(parseInt(count) || 15);

  console.log(pc.cyan(`\n📜 最近 ${count} 条提交记录：`));
  console.log(pc.dim('─'.repeat(50)));
  if (!logs || logs.length === 0 || (logs.length === 1 && !logs[0].trim())) {
    console.log(pc.dim('（暂无提交记录）'));
  } else {
    logs.forEach((line, i) => {
      if (line.trim()) console.log(`  ${pc.dim(`${i + 1}.`)} ${line}`);
    });
  }
  console.log(pc.dim('─'.repeat(50) + '\n'));
}

async function handleStatus(git) {
  const status = await git.status();
  const branch = await git.getCurrentBranch();

  console.log(`  ${pc.bold('🌿 当前分支:')} ${pc.green(branch)}`);
  console.log(pc.dim('─'.repeat(50)));

  if (!status || !status.trim()) {
    console.log(pc.green('✅ 工作区干净，没有待提交的更改'));
  } else {
    const lines = status.trim().split('\n');
    const modified = lines.filter(l => l.startsWith(' M') || l.startsWith('M '));
    const added = lines.filter(l => l.startsWith('A ') || l.startsWith('?? '));
    const deleted = lines.filter(l => l.startsWith(' D') || l.startsWith('D '));
    const staged = lines.filter(l => /^[MADC]/.test(l));

    if (staged.length) {
      console.log(`  ${pc.green('✅ 已暂存')} ${pc.dim(`(${staged.length} 个文件)`)}:`);
      staged.forEach(l => console.log(`     ${l}`));
    }
    if (modified.length) {
      console.log(`  ${pc.yellow('📝 已修改')} ${pc.dim(`(${modified.length} 个文件)`)}:`);
      modified.forEach(l => console.log(`     ${l}`));
    }
    if (deleted.length) {
      console.log(`  ${pc.red('🗑️  已删除')} ${pc.dim(`(${deleted.length} 个文件)`)}:`);
      deleted.forEach(l => console.log(`     ${l}`));
    }
    if (added.length) {
      console.log(`  ${pc.blue('➕ 未跟踪')} ${pc.dim(`(${added.length} 个文件)`)}:`);
      added.forEach(l => console.log(`     ${l}`));
    }
  }
  console.log(pc.dim('─'.repeat(50) + '\n'));
}

async function handleAmend(git) {
  const diff = await git.getStagedDiff();

  let message;
  if (diff && diff.trim()) {
    const spinner = ora(pc.cyan('正在用 AI 生成新提交信息...')).start();
    try {
      message = await generateCommitMessage(diff, '');
      spinner.succeed(pc.green('提交信息生成成功'));
    } catch (e) {
      spinner.warn(pc.yellow('AI 生成失败，将保留原有提交信息'));
    }
  }

  const amendSpinner = ora(pc.cyan('正在修改最后一次提交...')).start();
  await git.amend(message);
  amendSpinner.succeed(pc.green('提交已更新'));
  console.log();
}

async function handleRevert(git, commitHash, mode = 'soft') {
  if (!commitHash) {
    const logs = await git.log(5);
    console.log(pc.cyan('📜 最近提交记录（供参考）：'));
    logs.forEach((line, i) => {
      if (line.trim()) console.log(`  ${pc.dim(`${i + 1}.`)} ${line}`);
    });
    console.log(pc.dim('─'.repeat(50)));
    console.log(pc.dim('💡 使用方法: codesync git revert --commit <hash> [--mode soft|mixed|hard]'));
    return;
  }

  const modeDesc = { soft: '软回退（保留暂存区）', mixed: '混合回退（保留工作区）', hard: '硬回退（丢弃所有更改）' };
  console.log(`  ${pc.bold('⏪ 回退到:')} ${commitHash}`);
  console.log(`  ${pc.bold('模式:')}   ${modeDesc[mode] || mode}`);

  if (mode === 'hard') {
    const { default: prompts } = await import('prompts');
    const confirm = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: '硬回退将丢弃所有未提交的更改，确认继续?',
      initial: false
    });
    if (!confirm.proceed) {
      console.log(pc.yellow('\n操作已取消。'));
      return;
    }
  }

  const spinner = ora(pc.cyan('正在回退...')).start();
  await git.reset(commitHash, mode);
  spinner.succeed(pc.green('回退成功'));
  if (mode === 'hard') {
    console.log(pc.yellow('⚠️  所有未提交的更改已被丢弃'));
  }
  console.log();
}

async function handleBranch(git, branchName) {
  if (!branchName) {
    const current = await git.getCurrentBranch();
    console.log(`  ${pc.bold('🌿 当前分支:')} ${pc.green(current)}`);
    console.log(pc.dim('💡 使用方法: codesync git branch --name <branch-name>'));
    return;
  }

  const spinner = ora(pc.cyan(`正在创建分支 ${branchName}...`)).start();
  await git.createBranch(branchName);
  spinner.succeed(pc.green(`已创建并切换到新分支: ${branchName}`));
  console.log();
}

async function handleChangelog(git, options) {
  const spinner = ora(pc.cyan('正在生成 Changelog...')).start();
  const logs = await git.log(50);
  spinner.succeed(pc.green('Changelog 生成成功'));

  console.log(pc.cyan('\n📋 Changelog'));
  console.log(pc.dim('─'.repeat(50)));

  const typeLabels = {
    feat: pc.green('✨ feat'),
    fix: pc.red('🐛 fix'),
    docs: pc.blue('📝 docs'),
    style: pc.magenta('💄 style'),
    refactor: pc.yellow('♻️ refactor'),
    test: pc.cyan('✅ test'),
    chore: pc.dim('🔧 chore'),
    perf: pc.green('⚡ perf'),
    ci: pc.blue('👷 ci'),
    build: pc.blue('📦 build')
  };

  const grouped = {};
  for (const line of logs) {
    if (!line.trim()) continue;
    const match = line.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)/);
    if (match) {
      const type = match[1];
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(line);
    } else {
      if (!grouped.other) grouped.other = [];
      grouped.other.push(line);
    }
  }

  for (const [type, items] of Object.entries(grouped)) {
    const label = typeLabels[type] || pc.dim(type);
    console.log(`\n  ${label}`);
    items.forEach(item => console.log(`    - ${item}`));
  }
  console.log(pc.dim('\n' + '─'.repeat(50) + '\n'));
}

async function handleAnalyze(git, options) {
  const spinner = ora(pc.cyan('正在分析仓库...')).start();
  const branch = await git.getCurrentBranch();
  const status = await git.status();
  const logs = await git.log(30);
  spinner.succeed(pc.green('分析完成'));

  console.log(pc.cyan('\n📊 仓库分析'));
  console.log(pc.dim('─'.repeat(50)));
  console.log(`  ${pc.bold('当前分支:')} ${pc.green(branch)}`);

  const statusLines = status ? status.trim().split('\n').filter(l => l.trim()) : [];
  console.log(`  ${pc.bold('待处理文件:')} ${statusLines.length} 个`);

  const commitCount = logs ? logs.filter(l => l.trim()).length : 0;
  console.log(`  ${pc.bold('最近提交数:')} ${commitCount} 条`);

  const typeCount = {};
  for (const line of logs || []) {
    const match = line.match(/^(\w+):/);
    if (match) {
      typeCount[match[1]] = (typeCount[match[1]] || 0) + 1;
    }
  }

  if (Object.keys(typeCount).length > 0) {
    console.log(`\n  ${pc.bold('提交类型分布:')}`);
    for (const [type, count] of Object.entries(typeCount).sort((a, b) => b[1] - a[1])) {
      const bar = '█'.repeat(Math.min(count, 20));
      console.log(`    ${pc.dim(type.padEnd(10))} ${pc.green(bar)} ${count}`);
    }
  }
  console.log(pc.dim('\n' + '─'.repeat(50) + '\n'));
}

async function handleBatch(git, options) {
  const status = await git.status();
  const statusLines = status ? status.trim().split('\n').filter(l => l.trim()) : [];

  if (statusLines.length === 0) {
    console.log(pc.green('✅ 工作区干净，没有需要提交的更改'));
    return;
  }

  const unstagedFiles = statusLines.filter(l => l.startsWith(' M') || l.startsWith('?? '));
  if (unstagedFiles.length === 0) {
    console.log(pc.yellow('⚠️  所有更改已暂存，请直接使用 ai commit'));
    return;
  }

  console.log(pc.cyan(`\n📦 批量提交模式`));
  console.log(pc.dim(`发现 ${unstagedFiles.length} 个未暂存的文件`));

  const { default: prompts } = await import('prompts');
  const confirm = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: '将未暂存的文件分组提交?',
    initial: true
  });

  if (!confirm.proceed) {
    console.log(pc.yellow('\n操作已取消。'));
    return;
  }

  const spinner = ora(pc.cyan('正在暂存所有更改...')).start();
  await git.addAll();
  spinner.succeed(pc.green('文件已暂存'));

  console.log(pc.dim('\n💡 提示: 现在可以使用 codesync ai commit 生成提交信息。\n'));
}