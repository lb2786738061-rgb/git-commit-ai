import { readTeamConfig, writeTeamConfig } from '../../../shared/config.js';
import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import pc from 'picocolors';
import ora from 'ora';

export async function teamCommand(options) {
  const { init, show, enforce } = options;

  console.log(pc.cyan(pc.bold('\n👥 CodeSync - 团队协作')));
  console.log(pc.dim('─'.repeat(50)));

  try {
    if (init) {
      await handleInit();
    } else if (show) {
      handleShow();
    } else if (enforce) {
      await handleEnforce();
    } else {
      handleShow();
    }
  } catch (error) {
    console.error(pc.red(`\n❌ 操作失败: ${error.message}`));
    process.exit(1);
  }
}

async function handleInit() {
  const cwd = process.cwd();
  const configPath = path.join(cwd, '.git-commit-ai-team.json');

  if (fs.existsSync(configPath)) {
    console.log(pc.yellow('⚠️  团队配置文件已存在'));
    const { default: prompts } = await import('prompts');
    const confirm = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: '是否覆盖现有配置?',
      initial: false
    });
    if (!confirm.overwrite) {
      console.log(pc.yellow('\n操作已取消。'));
      return;
    }
  }

  const response = await prompts([
    {
      type: 'select',
      name: 'convention',
      message: '选择团队提交规范:',
      choices: [
        { title: 'Angular 规范', value: 'angular' },
        { title: 'Gitmoji 规范', value: 'gitmoji' }
      ],
      initial: 0
    },
    {
      type: 'select',
      name: 'language',
      message: '选择团队提交语言:',
      choices: [
        { title: 'English', value: 'en' },
        { title: '简体中文', value: 'zh' },
        { title: '日本語', value: 'ja' }
      ],
      initial: 0
    },
    {
      type: 'confirm',
      name: 'enforceConventional',
      message: '强制执行 Conventional Commits 规范?',
      initial: true
    },
    {
      type: 'confirm',
      name: 'requireScope',
      message: '要求提交信息必须包含 scope?',
      initial: false
    }
  ]);

  if (response.convention === undefined) {
    console.log(pc.yellow('\n操作已取消。'));
    return;
  }

  const teamConfig = {
    convention: response.convention,
    language: response.language,
    enforceConventional: response.enforceConventional,
    requireScope: response.requireScope,
    maxSubjectLength: 72,
    allowedTypes: ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'build', 'revert'],
    description: '团队提交规范配置文件，请提交到版本控制系统中以便团队共享'
  };

  writeTeamConfig(teamConfig);

  console.log(pc.green(`\n✅ 团队配置文件已创建: ${configPath}`));
  console.log(pc.dim('💡 提示: 将此文件提交到 Git 仓库，让团队成员共享配置。\n'));
}

function handleShow() {
  const config = readTeamConfig();

  if (!config) {
    console.log(pc.yellow('⚠️  未找到团队配置文件'));
    console.log(pc.dim('运行以下命令初始化: codesync team --init'));
    return;
  }

  console.log(`  ${pc.bold('提交规范:')}       ${pc.blue(config.convention || 'angular')}`);
  console.log(`  ${pc.bold('提交语言:')}       ${pc.blue(config.language || 'en')}`);
  console.log(`  ${pc.bold('强制规范:')}       ${config.enforceConventional ? pc.green('是') : pc.red('否')}`);
  console.log(`  ${pc.bold('要求 scope:')}    ${config.requireScope ? pc.green('是') : pc.red('否')}`);
  if (config.maxSubjectLength) {
    console.log(`  ${pc.bold('主题最大长度:')}   ${pc.blue(config.maxSubjectLength)} 字符`);
  }
  if (config.allowedTypes) {
    console.log(`  ${pc.bold('允许的类型:')}     ${pc.blue(config.allowedTypes.join(', '))}`);
  }
  console.log(pc.dim('─'.repeat(50) + '\n'));
}

async function handleEnforce() {
  const teamConfig = readTeamConfig();
  if (!teamConfig) {
    console.log(pc.yellow('⚠️  未找到团队配置文件，请先运行: codesync team --init'));
    return;
  }

  console.log(pc.cyan('\n🔒 安装团队规范强制执行钩子...'));

  const gitDir = path.join(process.cwd(), '.git');
  const hooksDir = path.join(gitDir, 'hooks');
  const commitMsgPath = path.join(hooksDir, 'commit-msg');

  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  const commitMsgContent = `#!/bin/sh
# git-commit-ai team hook start
node -e "const {verifyCommitMessage}=await import('${path.resolve('../../../src/verify.js').replace(/\\/g, '/')}');const msg=require('fs').readFileSync('$1','utf-8');const r=verifyCommitMessage(msg);if(!r.valid){console.error('❌ '+r.reason);process.exit(1);}"
# git-commit-ai team hook end
`;

  let existingCommitMsg = '';
  if (fs.existsSync(commitMsgPath)) {
    existingCommitMsg = fs.readFileSync(commitMsgPath, 'utf-8');
  }

  if (!existingCommitMsg.includes('git-commit-ai team hook start')) {
    const newCommitMsg = existingCommitMsg
      ? `${existingCommitMsg}\n${commitMsgContent}`
      : commitMsgContent;
    fs.writeFileSync(commitMsgPath, newCommitMsg, { mode: 0o755 });
    try { fs.chmodSync(commitMsgPath, '755'); } catch (_) {}
    console.log(pc.green('✓ 团队规范强制执行钩子安装成功！'));
  } else {
    console.log(pc.yellow('⚠️  团队规范钩子已安装。'));
  }

  console.log(pc.dim('💡 提示: 所有提交都将根据团队配置进行验证。\n'));
}