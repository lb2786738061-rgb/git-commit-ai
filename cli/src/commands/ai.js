import { generateAnnotation, explainCode, reviewCode } from '../../../shared/ai/annotate.js';
import { generateCommitMessage } from '../../../shared/ai/commit.js';
import fs from 'fs';
import path from 'path';
import { GitOperations } from '../../../shared/git/operations.js';
import pc from 'picocolors';
import ora from 'ora';

export async function aiCommand(action, options) {
  const { file, language } = options;

  console.log(pc.cyan(pc.bold('\n🤖 CodeSync - AI 助手')));
  console.log(pc.dim('─'.repeat(50)));

  try {
    switch (action) {
      case 'commit':
        await handleCommit();
        break;
      case 'annotate':
        await handleAnnotate(file, language);
        break;
      case 'explain':
        await handleExplain(file, language);
        break;
      case 'review':
        await handleReview(file, language);
        break;
      default:
        console.error(pc.red('❌ 未知的操作类型'));
        console.log(pc.dim('可用操作: commit, annotate, explain, review'));
        process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`\n❌ 操作失败: ${error.message}`));
    if (error.message.includes('API Key')) {
      console.error(pc.dim('\n💡 提示: 请先配置 API Key: codesync config --set apiKey=YOUR_KEY\n'));
    }
    process.exit(1);
  }
}

async function handleCommit() {
  const git = new GitOperations(process.cwd());

  if (!GitOperations.isGitRepository(process.cwd())) {
    throw new Error('当前目录不是 Git 仓库');
  }

  const diff = await git.getStagedDiff();
  if (!diff || diff.trim() === '') {
    console.log(pc.yellow('⚠️  没有暂存的更改'));
    console.log(pc.dim('请先运行: git add <files>'));
    return;
  }

  const spinner = ora(pc.cyan('正在生成提交信息...')).start();
  const message = await generateCommitMessage(diff, '');
  spinner.succeed(pc.green('提交信息生成成功'));

  console.log(pc.cyan('\n──────────────────────────────────────────────────────────────────────'));
  console.log(pc.bold(pc.white(message)));
  console.log(pc.cyan('──────────────────────────────────────────────────────────────────────\n'));

  const { default: prompts } = await import('prompts');
  const response = await prompts({
    type: 'select',
    name: 'action',
    message: '选择操作:',
    choices: [
      { title: pc.green('确认并提交'), value: 'commit' },
      { title: pc.yellow('编辑提交信息'), value: 'edit' },
      { title: pc.red('取消'), value: 'cancel' }
    ]
  });

  if (response.action === 'commit') {
    const commitSpinner = ora(pc.cyan('正在提交...')).start();
    try {
      await git.commit(message);
      commitSpinner.succeed(pc.green('提交成功！'));
    } catch (err) {
      commitSpinner.fail(pc.red('提交失败'));
      throw err;
    }
  } else if (response.action === 'edit') {
    const editResponse = await prompts({
      type: 'text',
      name: 'message',
      message: '编辑提交信息:',
      initial: message
    });
    if (editResponse.message) {
      const commitSpinner = ora(pc.cyan('正在提交...')).start();
      try {
        await git.commit(editResponse.message);
        commitSpinner.succeed(pc.green('提交成功！'));
      } catch (err) {
        commitSpinner.fail(pc.red('提交失败'));
        throw err;
      }
    }
  } else {
    console.log(pc.yellow('\n操作已取消。'));
  }
}

async function handleAnnotate(filePath, language) {
  if (!filePath) {
    throw new Error('请指定文件路径: -f <file>');
  }

  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`文件不存在: ${resolvedPath}`);
  }

  console.log(`  ${pc.bold('文件:')} ${resolvedPath}`);
  console.log(`  ${pc.bold('语言:')} ${language || '自动检测'}`);

  const code = fs.readFileSync(resolvedPath, 'utf-8');
  const spinner = ora(pc.cyan('正在生成代码注释...')).start();
  const annotatedCode = await generateAnnotation(code, language || 'javascript');
  spinner.succeed(pc.green('注释生成成功'));

  console.log(pc.cyan('\n──────────────────────────────────────────────────────────────────────'));
  console.log(pc.white(annotatedCode));
  console.log(pc.cyan('──────────────────────────────────────────────────────────────────────\n'));
}

async function handleExplain(filePath, language) {
  if (!filePath) {
    throw new Error('请指定文件路径: -f <file>');
  }

  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`文件不存在: ${resolvedPath}`);
  }

  console.log(`  ${pc.bold('文件:')} ${resolvedPath}`);
  console.log(`  ${pc.bold('语言:')} ${language || '自动检测'}`);

  const code = fs.readFileSync(resolvedPath, 'utf-8');
  const spinner = ora(pc.cyan('正在解释代码...')).start();
  const explanation = await explainCode(code, language || 'javascript');
  spinner.succeed(pc.green('代码解释生成成功'));

  console.log(pc.cyan('\n──────────────────────────────────────────────────────────────────────'));
  console.log(pc.white(explanation));
  console.log(pc.cyan('──────────────────────────────────────────────────────────────────────\n'));
}

async function handleReview(filePath, language) {
  if (!filePath) {
    throw new Error('请指定文件路径: -f <file>');
  }

  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`文件不存在: ${resolvedPath}`);
  }

  console.log(`  ${pc.bold('文件:')} ${resolvedPath}`);
  console.log(`  ${pc.bold('语言:')} ${language || '自动检测'}`);

  const code = fs.readFileSync(resolvedPath, 'utf-8');
  const spinner = ora(pc.cyan('正在审查代码...')).start();
  const review = await reviewCode(code, language || 'javascript');
  spinner.succeed(pc.green('代码审查完成'));

  console.log(pc.cyan('\n──────────────────────────────────────────────────────────────────────'));
  console.log(pc.white(review));
  console.log(pc.cyan('──────────────────────────────────────────────────────────────────────\n'));
}