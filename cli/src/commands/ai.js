import { generateAnnotation, explainCode, reviewCode } from '../../../shared/ai/annotate.js';
import { generateCommitMessage } from '../../../shared/ai/commit.js';
import fs from 'fs';
import path from 'path';
import { GitOperations } from '../../../shared/git/operations.js';

export async function aiCommand(action, options) {
  const { file, language } = options;

  console.log('🤖 CodeSync - AI助手');
  console.log('─'.repeat(50));

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
        console.error('❌ 未知的操作类型');
        console.log('可用操作: commit, annotate, explain, review');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    process.exit(1);
  }
}

async function handleCommit() {
  console.log('生成提交信息...');
  console.log('─'.repeat(50));

  const git = new GitOperations(process.cwd());

  if (!GitOperations.isGitRepository(process.cwd())) {
    throw new Error('当前目录不是 Git 仓库');
  }

  const diff = await git.getStagedDiff();
  if (!diff || diff.trim() === '') {
    console.log('⚠️  没有暂存的更改');
    console.log('请先运行: git add <files>');
    return;
  }

  const message = await generateCommitMessage(diff, '');

  console.log('─'.repeat(50));
  console.log('✅ 生成的提交信息:');
  console.log('─'.repeat(50));
  console.log(message);
  console.log('─'.repeat(50));
}

async function handleAnnotate(filePath, language) {
  if (!filePath) {
    throw new Error('请指定文件路径: -f <file>');
  }

  console.log(`为文件生成注释: ${filePath}`);
  console.log('─'.repeat(50));

  if (!fs.existsSync(filePath)) {
    throw new Error('文件不存在');
  }

  const code = fs.readFileSync(filePath, 'utf-8');
  const annotatedCode = await generateAnnotation(code, language || 'javascript');

  console.log('─'.repeat(50));
  console.log('✅ 带注释的代码:');
  console.log('─'.repeat(50));
  console.log(annotatedCode);
  console.log('─'.repeat(50));
}

async function handleExplain(filePath, language) {
  if (!filePath) {
    throw new Error('请指定文件路径: -f <file>');
  }

  console.log(`解释代码: ${filePath}`);
  console.log('─'.repeat(50));

  if (!fs.existsSync(filePath)) {
    throw new Error('文件不存在');
  }

  const code = fs.readFileSync(filePath, 'utf-8');
  const explanation = await explainCode(code, language || 'javascript');

  console.log('─'.repeat(50));
  console.log('✅ 代码解释:');
  console.log('─'.repeat(50));
  console.log(explanation);
  console.log('─'.repeat(50));
}

async function handleReview(filePath, language) {
  if (!filePath) {
    throw new Error('请指定文件路径: -f <file>');
  }

  console.log(`审查代码: ${filePath}`);
  console.log('─'.repeat(50));

  if (!fs.existsSync(filePath)) {
    throw new Error('文件不存在');
  }

  const code = fs.readFileSync(filePath, 'utf-8');
  const review = await reviewCode(code, language || 'javascript');

  console.log('─'.repeat(50));
  console.log('✅ 代码审查报告:');
  console.log('─'.repeat(50));
  console.log(review);
  console.log('─'.repeat(50));
}
