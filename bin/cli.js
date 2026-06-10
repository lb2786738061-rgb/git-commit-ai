#!/usr/bin/env node

import { Command } from 'commander';
import ora from 'ora';
import pc from 'picocolors';
import prompts from 'prompts';
import { readConfig, writeConfig, getConfigFilePath } from '../src/config.js';
import { isGitRepository, getStagedDiff, getStagedFiles, getUnstagedFiles, commitChanges, pushChanges } from '../src/git.js';
import { generateCommitMessage } from '../src/ai.js';

const program = new Command();

program
  .name('git-commit-ai')
  .description('✨ Generate professional git commit messages using AI based on staged changes.')
  .version('1.0.0');

// Config command to set API details easily
program
  .command('config')
  .description('Manage global configuration (API key, base URL, model)')
  .option('-s, --set <key=value>', 'Set a config value (e.g., apiKey=sk-xxx or apiBase=https://...)')
  .option('-l, --list', 'List all current configurations')
  .action((options) => {
    const configPath = getConfigFilePath();
    
    if (options.list) {
      const config = readConfig();
      console.log(pc.bold(pc.cyan('\n⚙️  Current Configuration:')));
      console.log(pc.dim(`Config file: ${configPath}\n`));
      console.log(`  ${pc.bold('API Key:')}     ${config.apiKey ? pc.green('••••••••' + config.apiKey.slice(-4)) : pc.red('Not Set')}`);
      console.log(`  ${pc.bold('API Base:')}    ${pc.blue(config.apiBase)}`);
      console.log(`  ${pc.bold('Model:')}       ${pc.blue(config.model)}`);
      console.log(`  ${pc.bold('Convention:')}  ${pc.blue(config.convention)}`);
      console.log();
      return;
    }

    if (options.set) {
      const parts = options.set.split('=');
      if (parts.length < 2) {
        console.log(pc.red('❌ Invalid format. Please use key=value'));
        return;
      }
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();

      const validKeys = ['apiKey', 'apiBase', 'model', 'convention'];
      if (!validKeys.includes(key)) {
        console.log(pc.red(`❌ Invalid configuration key: "${key}". Valid keys: ${validKeys.join(', ')}`));
        return;
      }

      // 验证提交规范样式的值是否合法
      if (key === 'convention') {
        const validConventions = ['angular', 'gitmoji'];
        if (!validConventions.includes(value)) {
          console.log(pc.red(`❌ 无效的提交规范样式: "${value}"。可选的规范包括: ${validConventions.join(', ')}`));
          return;
        }
      }

      writeConfig({ [key]: value });
      console.log(pc.green(`✓ Configuration updated: ${pc.bold(key)} is now set to ${value}`));
      return;
    }

    console.log(pc.dim('Use "git-commit-ai config --list" to view configuration, or "git-commit-ai config --set key=value" to update.'));
  });

// 交互式配置初始化命令
program
  .command('init')
  .description('交互式配置初始化向导')
  .action(async () => {
    console.log(pc.cyan(pc.bold('\n⚙️  Git Commit AI - 初始化配置向导')));
    console.log(pc.dim('请按照提示输入或选择您的配置信息：\n'));

    const currentConfig = readConfig();

    try {
      const response = await prompts([
        {
          type: 'password',
          name: 'apiKey',
          message: currentConfig.apiKey 
            ? '输入您的 API 密钥 (直接回车保持现有密钥)：' 
            : '输入您的 API 密钥：',
          initial: currentConfig.apiKey || '',
          validate: val => val.trim().length > 0 ? true : '密钥不能为空。'
        },
        {
          type: 'text',
          name: 'apiBase',
          message: '输入接口基础地址：',
          initial: currentConfig.apiBase || 'https://api.openai.com/v1',
          validate: val => {
            if (val.trim().length === 0) return '接口地址不能为空。';
            try {
              new URL(val.trim());
              return true;
            } catch (_) {
              return '请输入合法的地址格式。';
            }
          }
        },
        {
          type: 'select',
          name: 'modelSelect',
          message: '选择首选模型：',
          choices: [
            { title: 'gpt-4o-mini (默认推荐)', value: 'gpt-4o-mini' },
            { title: 'gpt-4o', value: 'gpt-4o' },
            { title: 'deepseek-chat', value: 'deepseek-chat' },
            { title: '自定义模型...', value: 'custom' }
          ],
          initial: (() => {
            const models = ['gpt-4o-mini', 'gpt-4o', 'deepseek-chat'];
            const idx = models.indexOf(currentConfig.model);
            return idx !== -1 ? idx : 3;
          })()
        },
        {
          type: prev => prev === 'custom' ? 'text' : null,
          name: 'customModel',
          message: '输入您的自定义模型名称：',
          initial: currentConfig.model && !['gpt-4o-mini', 'gpt-4o', 'deepseek-chat'].includes(currentConfig.model) 
            ? currentConfig.model 
            : '',
          validate: val => val.trim().length > 0 ? true : '模型名称不能为空。'
        },
        {
          type: 'select',
          name: 'convention',
          message: '选择提交规范样式：',
          choices: [
            { title: 'angular 规范 (例如: feat: 添加新功能)', value: 'angular' },
            { title: 'gitmoji 规范 (例如: ✨ feat: 添加新功能)', value: 'gitmoji' }
          ],
          initial: currentConfig.convention === 'gitmoji' ? 1 : 0
        }
      ]);

      // 处理用户取消输入的情况
      if (response.apiKey === undefined || response.apiBase === undefined || response.modelSelect === undefined || response.convention === undefined) {
        console.log(pc.yellow('\n配置向导已取消。'));
        return;
      }

      const finalModel = response.modelSelect === 'custom' ? response.customModel : response.modelSelect;

      writeConfig({
        apiKey: response.apiKey.trim(),
        apiBase: response.apiBase.trim(),
        model: finalModel.trim(),
        convention: response.convention
      });

      console.log(pc.green('\n✓ 配置文件初始化成功！'));
      console.log(pc.dim(`配置文件路径: ${getConfigFilePath()}\n`));
      
      const config = readConfig();
      console.log(`  ${pc.bold('API 密钥:')}     ${config.apiKey ? pc.green('••••••••' + config.apiKey.slice(-4)) : pc.red('未设置')}`);
      console.log(`  ${pc.bold('接口地址:')}    ${pc.blue(config.apiBase)}`);
      console.log(`  ${pc.bold('模型名称:')}    ${pc.blue(config.model)}`);
      console.log(`  ${pc.bold('提交规范:')}    ${pc.blue(config.convention)}`);
      console.log();
      console.log(pc.cyan('现在您可以开始提交代码了。运行 gca 体验自动生成提交信息功能！\n'));
    } catch (err) {
      console.error(pc.red(`❌ 配置保存失败: ${err.message}`));
    }
  });

// Main CLI logic
program
  .action(async () => {
    console.log(pc.cyan(pc.bold('\n✨ Git Commit AI v1.0.0')));
    console.log(pc.dim('Analyzing staged changes to write your commit message...\n'));

    if (!isGitRepository()) {
      console.error(pc.red('❌ Error: The current directory is not a Git repository.'));
      console.error(pc.dim('Please run this tool inside a Git project workspace.\n'));
      process.exit(1);
    }

    const stagedFiles = getStagedFiles();
    if (stagedFiles.length === 0) {
      const unstagedFiles = getUnstagedFiles();
      console.log(pc.yellow('⚠️  No staged changes detected.'));
      
      if (unstagedFiles.length > 0) {
        console.log(pc.cyan('\nModified files available to stage (unstaged):'));
        unstagedFiles.slice(0, 10).forEach(file => console.log(`  ${pc.red('M')} ${file}`));
        if (unstagedFiles.length > 10) {
          console.log(`  ...and ${unstagedFiles.length - 10} more files.`);
        }
        console.log(pc.dim('\nRun "git add <file>" to stage changes first, then execute "git-commit-ai" again.\n'));
      } else {
        console.log(pc.dim('Your working tree is clean. Nothing to commit!\n'));
      }
      process.exit(0);
    }

    console.log(pc.green(`✓ Found ${stagedFiles.length} staged file(s):`));
    stagedFiles.slice(0, 5).forEach(file => console.log(`  ${pc.dim('•')} ${file}`));
    if (stagedFiles.length > 5) {
      console.log(`  ...and ${stagedFiles.length - 5} more.`);
    }
    console.log();

    const diff = getStagedDiff();
    
    // Large diff handling safety limit
    const MAX_DIFF_LENGTH = 60000;
    let safeDiff = diff;
    if (diff.length > MAX_DIFF_LENGTH) {
      console.log(pc.yellow(`⚠️  Warning: Staged diff is very large (${diff.length} chars). Truncating diff to fit context window...`));
      safeDiff = diff.slice(0, MAX_DIFF_LENGTH) + '\n\n[Diff truncated here due to length limits...]';
    }

    await requestAndHandleMessage(safeDiff);
  });

/**
 * Initiates the AI generation and interactive response.
 * @param {string} diff 
 */
async function requestAndHandleMessage(diff) {
  const spinner = ora({
    text: pc.cyan('Generating commit message using AI...'),
    color: 'cyan'
  }).start();

  let commitMessage = '';
  try {
    commitMessage = await generateCommitMessage(diff);
    spinner.succeed(pc.green('Commit message generated successfully!'));
  } catch (error) {
    spinner.fail(pc.red('Failed to generate commit message.'));
    console.error(`\n${pc.bold('Error detail:')} ${pc.red(error.message)}\n`);
    process.exit(1);
  }

  await displayInteractiveMenu(commitMessage, diff);
}

/**
 * Handles confirmation and secondary actions with generated message.
 * @param {string} commitMessage 
 * @param {string} diff 
 */
async function displayInteractiveMenu(commitMessage, diff) {
  console.log(pc.cyan('\n──────────────────────────────────────────────────────────────────────'));
  console.log(pc.bold(pc.white(commitMessage)));
  console.log(pc.cyan('──────────────────────────────────────────────────────────────────────\n'));

  const response = await prompts({
    type: 'select',
    name: 'action',
    message: 'Select action for this message:',
    choices: [
      { title: pc.green('Accept, Commit and Push'), value: 'commit_push' },
      { title: pc.green('Accept and Commit'), value: 'commit' },
      { title: pc.yellow('Edit message manually'), value: 'edit' },
      { title: pc.blue('Regenerate message'), value: 'regenerate' },
      { title: pc.red('Cancel'), value: 'cancel' }
    ]
  });

  if (response.action === 'commit_push') {
    executeCommit(commitMessage, true);
  } else if (response.action === 'commit') {
    executeCommit(commitMessage, false);
  } else if (response.action === 'edit') {
    const editResponse = await prompts({
      type: 'text',
      name: 'editedMessage',
      message: 'Edit commit message:',
      initial: commitMessage,
      validate: value => value.trim().length > 0 ? true : 'Commit message cannot be empty.'
    });

    if (editResponse.editedMessage) {
      const pushConfirm = await prompts({
        type: 'confirm',
        name: 'shouldPush',
        message: 'Push changes to remote repository?',
        initial: true
      });
      executeCommit(editResponse.editedMessage, pushConfirm.shouldPush);
    } else {
      console.log(pc.yellow('Edit aborted. Returning to options.'));
      await displayInteractiveMenu(commitMessage, diff);
    }
  } else if (response.action === 'regenerate') {
    console.log(pc.dim('\nRegenerating...'));
    await requestAndHandleMessage(diff);
  } else {
    console.log(pc.yellow('\nCommit cancelled. Your staged changes remain intact.\n'));
    process.exit(0);
  }
}

/**
 * Executes final git commit logic.
 * @param {string} message 
 * @param {boolean} [shouldPush=false]
 */
function executeCommit(message, shouldPush = false) {
  const spinner = ora(pc.cyan('Creating commit...')).start();
  try {
    const output = commitChanges(message);
    spinner.succeed(pc.green('Commit created!'));
    console.log(pc.dim(`\n${output.trim()}\n`));
    
    if (shouldPush) {
      executePush();
    }
  } catch (error) {
    spinner.fail(pc.red('Failed to commit staged changes.'));
    console.error(`\n${pc.bold('Git Output:')} ${pc.red(error.message)}\n`);
    process.exit(1);
  }
}

/**
 * Executes git push logic.
 */
function executePush() {
  const spinner = ora(pc.cyan('Pushing changes to remote...')).start();
  try {
    const output = pushChanges();
    spinner.succeed(pc.green('Changes pushed successfully!'));
    if (output.trim()) {
      console.log(pc.dim(`\n${output.trim()}\n`));
    }
  } catch (error) {
    spinner.fail(pc.red('Failed to push changes to remote repository.'));
    console.error(`\n${pc.bold('Git Output:')} ${pc.red(error.message)}\n`);
    process.exit(1);
  }
}

program.parse(process.argv);
