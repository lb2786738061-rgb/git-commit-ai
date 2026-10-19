#!/usr/bin/env node

import { Command } from 'commander';
import ora from 'ora';
import pc from 'picocolors';
import prompts from 'prompts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { readConfig, writeConfig, getConfigFilePath, readTeamConfig, writeTeamConfig } from '../src/config.js';
import { isGitRepository, getStagedDiff, getStagedFiles, getUnstagedFiles, commitChanges, pushChanges, detectScope, getCommitHistory, getLatestTags, editWithEditor, getDetailedCommitHistory, getFileDiff, stageFile, unstageFile, amendCommit, squashCommits, createBranch, getCurrentBranch } from '../src/git.js';
import { generateCommitMessage, generateChangelog, generatePRContent } from '../src/ai.js';
import { cleanExpiredCache, clearAllCache, getCacheStats } from '../src/cache.js';
import { verifyCommitMessage } from '../src/verify.js';

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
      console.log(`  ${pc.bold('Language:')}    ${pc.blue(config.language || 'en')}`);
      console.log(`  ${pc.bold('Smart Model:')} ${config.smartModel ? pc.green('Enabled') : pc.red('Disabled')}`);
      if (config.smartModel) {
        console.log(`  ${pc.bold('Fast Model:')}     ${pc.blue(config.fastModel)}`);
        console.log(`  ${pc.bold('Powerful Model:')} ${pc.blue(config.powerfulModel)}`);
        console.log(`  ${pc.bold('Complexity Threshold:')} ${pc.blue(config.complexityThreshold)} chars`);
      }
      console.log(`  ${pc.bold('Cache:')}       ${config.enableCache ? pc.green('Enabled') : pc.red('Disabled')}`);
      if (config.enableCache) {
        console.log(`  ${pc.bold('Cache TTL:')}    ${pc.blue(config.cacheTTL)} ms`);
      }
      console.log(`  ${pc.bold('Theme:')}       ${pc.blue(config.theme || 'default')}`);
      console.log(`  ${pc.bold('JSON Output:')} ${config.jsonOutput ? pc.green('Enabled') : pc.red('Disabled')}`);
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

      const validKeys = ['apiKey', 'apiBase', 'model', 'convention', 'language', 'smartModel', 'fastModel', 'powerfulModel', 'complexityThreshold', 'enableCache', 'cacheTTL', 'theme', 'jsonOutput'];
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

      // 验证语言配置项的值是否合法
      if (key === 'language') {
        const validLanguages = ['zh', 'en', 'ja', 'chinese', 'english', 'japanese', 'zh-cn'];
        if (!validLanguages.includes(value.toLowerCase())) {
          console.log(pc.red(`❌ 无效的语言配置: "${value}"。推荐的配置包括: zh (中文), en (英文), ja (日文)`));
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
        },
        {
          type: 'select',
          name: 'language',
          message: '选择提交信息语言 (Language for commit message)：',
          choices: [
            { title: 'English (英文)', value: 'en' },
            { title: 'Simplified Chinese (简体中文)', value: 'zh' },
            { title: 'Japanese (日文)', value: 'ja' }
          ],
          initial: (() => {
            const lang = currentConfig.language || 'en';
            if (lang === 'zh' || lang === 'zh-cn' || lang === 'chinese') return 1;
            if (lang === 'ja' || lang === 'japanese') return 2;
            return 0;
          })()
        },
        {
          type: 'confirm',
          name: 'smartModel',
          message: '启用智能模型选择? (根据代码复杂度自动选择模型)',
          initial: currentConfig.smartModel !== false
        },
        {
          type: prev => prev ? 'text' : null,
          name: 'fastModel',
          message: '快速模型名称 (用于简单修改):',
          initial: currentConfig.fastModel || 'gpt-4o-mini',
          validate: val => val.trim().length > 0 ? true : '模型名称不能为空。'
        },
        {
          type: prev => prev ? 'text' : null,
          name: 'powerfulModel',
          message: '强大模型名称 (用于复杂修改):',
          initial: currentConfig.powerfulModel || 'gpt-4o',
          validate: val => val.trim().length > 0 ? true : '模型名称不能为空。'
        },
        {
          type: prev => prev ? 'number' : null,
          name: 'complexityThreshold',
          message: '复杂度阈值 (diff 字符数):',
          initial: currentConfig.complexityThreshold || 5000,
          validate: val => val > 0 ? true : '阈值必须大于 0。'
        }
      ]);

      // 处理用户取消输入的情况
      if (response.apiKey === undefined || response.apiBase === undefined || response.modelSelect === undefined || response.convention === undefined || response.language === undefined) {
        console.log(pc.yellow('\n配置向导已取消。'));
        return;
      }

      const finalModel = response.modelSelect === 'custom' ? response.customModel : response.modelSelect;

      const newConfig = {
        apiKey: response.apiKey.trim(),
        apiBase: response.apiBase.trim(),
        model: finalModel.trim(),
        convention: response.convention,
        language: response.language
      };

      // 添加智能模型配置
      if (response.smartModel !== undefined) {
        newConfig.smartModel = response.smartModel;
        if (response.fastModel) newConfig.fastModel = response.fastModel.trim();
        if (response.powerfulModel) newConfig.powerfulModel = response.powerfulModel.trim();
        if (response.complexityThreshold) newConfig.complexityThreshold = response.complexityThreshold;
      }

      writeConfig(newConfig);

      console.log(pc.green('\n✓ 配置文件初始化成功！'));
      console.log(pc.dim(`配置文件路径: ${getConfigFilePath()}\n`));
      
      const config = readConfig();
      console.log(`  ${pc.bold('API 密钥:')}     ${config.apiKey ? pc.green('••••••••' + config.apiKey.slice(-4)) : pc.red('未设置')}`);
      console.log(`  ${pc.bold('接口地址:')}    ${pc.blue(config.apiBase)}`);
      console.log(`  ${pc.bold('模型名称:')}    ${pc.blue(config.model)}`);
      console.log(`  ${pc.bold('提交规范:')}    ${pc.blue(config.convention)}`);
      console.log(`  ${pc.bold('提交语言:')}    ${pc.blue(config.language || 'en')}`);
      console.log(`  ${pc.bold('智能模型:')}    ${config.smartModel ? pc.green('启用') : pc.red('禁用')}`);
      if (config.smartModel) {
        console.log(`  ${pc.bold('快速模型:')}     ${pc.blue(config.fastModel)}`);
        console.log(`  ${pc.bold('强大模型:')}     ${pc.blue(config.powerfulModel)}`);
        console.log(`  ${pc.bold('复杂度阈值:')}   ${pc.blue(config.complexityThreshold)} 字符`);
      }
      console.log();
      console.log(pc.cyan('现在您可以开始提交代码了。运行 gca 体验自动生成提交信息功能！\n'));
    } catch (err) {
      console.error(pc.red(`❌ 配置保存失败: ${err.message}`));
    }
  });

// 获取当前脚本所在路径，以便写入 hook 脚本中以调用本 CLI
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_PATH = path.resolve(__dirname, 'cli.js');

// Git 钩子管理命令
program
  .command('hook')
  .description('管理 Git 本地钩子（包含交互式提交流程及提交规范校验）')
  .option('-i, --install', '安装 Git 钩子 (包括 pre-commit 交互钩子与 commit-msg 校验钩子)')
  .option('-u, --uninstall', '卸载 Git 钩子')
  .action((options) => {
    if (!isGitRepository()) {
      console.error(pc.red('❌ 错误: 当前目录不是一个 Git 仓库。'));
      process.exit(1);
    }

    const gitDir = path.join(process.cwd(), '.git');
    const hooksDir = path.join(gitDir, 'hooks');
    const preCommitPath = path.join(hooksDir, 'pre-commit');
    const commitMsgPath = path.join(hooksDir, 'commit-msg');

    if (options.install) {
      if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
      }

      // 将 Windows 路径中的反斜杠转换为正斜杠，保证在 Git Bash 环境中可正常执行
      const normalizedCliPath = CLI_PATH.replace(/\\/g, '/');

      // 1. 安装 pre-commit 钩子
      const preCommitContent = `#!/bin/sh
# git-commit-ai pre-commit hook start
if [ "$GCA_BYPASS_HOOK" = "1" ]; then
  exit 0
fi

# 重定向标准输入到 TTY，使得在 Git 钩子内部能进行交互式选择
exec < /dev/tty

node "${normalizedCliPath}" --hook

# 钩子拦截外层提交以防止重复提交。无论成功还是取消，都返回 1 以中止外层 commit。
exit 1
# git-commit-ai pre-commit hook end
`;

      let existingPreCommit = '';
      if (fs.existsSync(preCommitPath)) {
        existingPreCommit = fs.readFileSync(preCommitPath, 'utf-8');
      }

      if (!existingPreCommit.includes('git-commit-ai pre-commit hook start')) {
        const newPreCommit = existingPreCommit
          ? `${existingPreCommit}\n${preCommitContent}`
          : preCommitContent;
        fs.writeFileSync(preCommitPath, newPreCommit, { mode: 0o755 });
        try {
          fs.chmodSync(preCommitPath, '755');
        } catch (_) {}
        console.log(pc.green('✓ Git pre-commit 交互钩子安装成功！'));
      } else {
        console.log(pc.yellow('⚠️  Pre-commit 交互钩子已安装。'));
      }

      // 2. 安装 commit-msg 校验钩子
      const commitMsgContent = `#!/bin/sh
# git-commit-ai commit-msg hook start
if [ "$GCA_BYPASS_HOOK" = "1" ]; then
  exit 0
fi

node "${normalizedCliPath}" verify-commit "$1"
# git-commit-ai commit-msg hook end
`;

      let existingCommitMsg = '';
      if (fs.existsSync(commitMsgPath)) {
        existingCommitMsg = fs.readFileSync(commitMsgPath, 'utf-8');
      }

      if (!existingCommitMsg.includes('git-commit-ai commit-msg hook start')) {
        const newCommitMsg = existingCommitMsg
          ? `${existingCommitMsg}\n${commitMsgContent}`
          : commitMsgContent;
        fs.writeFileSync(commitMsgPath, newCommitMsg, { mode: 0o755 });
        try {
          fs.chmodSync(commitMsgPath, '755');
        } catch (_) {}
        console.log(pc.green('✓ Git commit-msg 规范校验钩子安装成功！'));
      } else {
        console.log(pc.yellow('⚠️  Commit-msg 规范校验钩子已安装。'));
      }

      console.log(pc.dim('\n提示: 直接运行标准的 "git commit" 即可触发交互式提交流程。手动提交时将自动触发规范校验。'));
      return;
    }

    if (options.uninstall) {
      let uninstalled = false;

      // 1. 卸载 pre-commit 钩子
      if (fs.existsSync(preCommitPath)) {
        const content = fs.readFileSync(preCommitPath, 'utf-8');
        if (content.includes('git-commit-ai pre-commit hook start')) {
          const cleaned = content.replace(
            /\n?# git-commit-ai pre-commit hook start[\s\S]*?# git-commit-ai pre-commit hook end\n?/,
            ''
          );
          if (cleaned.trim() === '' || cleaned.trim() === '#!/bin/sh') {
            fs.unlinkSync(preCommitPath);
          } else {
            fs.writeFileSync(preCommitPath, cleaned, { mode: 0o755 });
          }
          console.log(pc.green('✓ Git pre-commit 交互钩子卸载成功。'));
          uninstalled = true;
        }
      }

      // 2. 卸载 commit-msg 钩子
      if (fs.existsSync(commitMsgPath)) {
        const content = fs.readFileSync(commitMsgPath, 'utf-8');
        if (content.includes('git-commit-ai commit-msg hook start')) {
          const cleaned = content.replace(
            /\n?# git-commit-ai commit-msg hook start[\s\S]*?# git-commit-ai commit-msg hook end\n?/,
            ''
          );
          if (cleaned.trim() === '' || cleaned.trim() === '#!/bin/sh') {
            fs.unlinkSync(commitMsgPath);
          } else {
            fs.writeFileSync(commitMsgPath, cleaned, { mode: 0o755 });
          }
          console.log(pc.green('✓ Git commit-msg 规范校验钩子卸载成功。'));
          uninstalled = true;
        }
      }

      if (!uninstalled) {
        console.log(pc.yellow('⚠️  未检测到任何由 git-commit-ai 安装的本地钩子。'));
      }
      return;
    }

    console.log(pc.dim('请使用 "git-commit-ai hook --install" 安装本地钩子，或 "git-commit-ai hook --uninstall" 卸载。'));
  });

// 团队配置管理命令
program
  .command('team')
  .description('管理团队共享配置')
  .option('-i, --init', '初始化团队配置文件')
  .option('-s, --show', '显示当前团队配置')
  .option('-e, --enforce', '强制执行团队规范（安装验证钩子）')
  .action(async (options) => {
    if (!isGitRepository()) {
      console.error(pc.red('❌ 错误: 当前目录不是一个 Git 仓库。'));
      process.exit(1);
    }

    if (options.init) {
      const teamConfig = readTeamConfig();
      if (teamConfig) {
        console.log(pc.yellow('⚠️  团队配置文件已存在。'));
        const confirm = await prompts({
          type: 'confirm',
          name: 'overwrite',
          message: '是否覆盖现有配置?',
          initial: false
        });
        if (!confirm.overwrite) {
          console.log('操作已取消。');
          return;
        }
      }

      console.log(pc.cyan(pc.bold('\n👥 团队配置初始化向导')));

      const response = await prompts([
        {
          type: 'select',
          name: 'convention',
          message: '选择团队提交规范:',
          choices: [
            { title: 'angular 规范', value: 'angular' },
            { title: 'gitmoji 规范', value: 'gitmoji' }
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
        },
        {
          type: 'confirm',
          name: 'maxSubjectLength',
          message: '限制提交主题最大长度?',
          initial: true
        },
        {
          type: prev => prev ? 'number' : null,
          name: 'subjectLength',
          message: '最大主题长度 (字符):',
          initial: 100,
          validate: val => val > 0 ? true : '长度必须大于 0'
        }
      ]);

      const config = {
        convention: response.convention,
        language: response.language,
        enforceConventional: response.enforceConventional,
        requireScope: response.requireScope,
        maxSubjectLength: response.maxSubjectLength ? response.subjectLength : null
      };

      const configPath = writeTeamConfig(config);
      console.log(pc.green(`✓ 团队配置文件已创建: ${configPath}`));
      console.log(pc.dim('提示: 将此文件提交到仓库，团队成员可以使用 gca team --show 查看配置。'));
      return;
    }

    if (options.show) {
      const teamConfig = readTeamConfig();
      if (!teamConfig) {
        console.log(pc.yellow('⚠️  未找到团队配置文件 (.git-commit-ai-team.json)'));
        return;
      }

      console.log(pc.cyan(pc.bold('\n👥 团队配置:')));
      console.log(pc.cyan('─'.repeat(40)));
      console.log(`  ${pc.bold('规范:')}      ${pc.blue(teamConfig.convention)}`);
      console.log(`  ${pc.bold('语言:')}      ${pc.blue(teamConfig.language)}`);
      console.log(`  ${pc.bold('强制规范:')}  ${teamConfig.enforceConventional ? pc.green('是') : pc.red('否')}`);
      console.log(`  ${pc.bold('要求 scope:')} ${teamConfig.requireScope ? pc.green('是') : pc.red('否')}`);
      if (teamConfig.maxSubjectLength) {
        console.log(`  ${pc.bold('主题长度:')}   ${pc.blue(teamConfig.maxSubjectLength)} 字符`);
      }
      console.log(pc.cyan('─'.repeat(40) + '\n'));
      return;
    }

    if (options.enforce) {
      const teamConfig = readTeamConfig();
      if (!teamConfig) {
        console.log(pc.yellow('⚠️  未找到团队配置文件，请先运行 gca team --init'));
        return;
      }

      console.log(pc.cyan('\n🔒 安装团队规范强制执行钩子...'));

      const gitDir = path.join(process.cwd(), '.git');
      const hooksDir = path.join(gitDir, 'hooks');
      const commitMsgPath = path.join(hooksDir, 'commit-msg');

      if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
      }

      const normalizedCliPath = CLI_PATH.replace(/\\/g, '/');

      const commitMsgContent = `#!/bin/sh
# git-commit-ai team hook start
if [ "$GCA_BYPASS_HOOK" = "1" ]; then
  exit 0
fi

node "${normalizedCliPath}" verify-commit "$1" --team
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
        try {
          fs.chmodSync(commitMsgPath, '755');
        } catch (_) {}
        console.log(pc.green('✓ 团队规范强制执行钩子安装成功！'));
      } else {
        console.log(pc.yellow('⚠️  团队规范钩子已安装。'));
      }

      console.log(pc.dim('提示: 所有提交都将根据团队配置进行验证。'));
      return;
    }

    console.log(pc.dim('使用 "gca team --init" 初始化团队配置，"gca team --show" 查看配置，"gca team --enforce" 强制执行规范。'));
  });

// Amend 命令 - 修改最后一次提交
program
  .command('amend')
  .description('修改最后一次提交的提交信息')
  .action(async () => {
    if (!isGitRepository()) {
      console.error(pc.red('❌ 错误: 当前目录不是一个 Git 仓库。'));
      process.exit(1);
    }

    try {
      const currentBranch = getCurrentBranch();
      console.log(pc.cyan(pc.bold('\n📝 修改最后一次提交')));
      console.log(pc.dim(`当前分支: ${currentBranch}\n`));

      // 获取最后一次提交的 diff
      const diff = getStagedDiff();
      if (!diff) {
        console.log(pc.yellow('⚠️  没有检测到任何更改。'));
        return;
      }

      const detectedScope = detectScope(getStagedFiles());

      const spinner = ora({
        text: pc.cyan('生成新的提交信息...'),
        color: 'cyan'
      }).start();

      const commitMessage = await generateCommitMessage(diff, detectedScope);
      spinner.succeed(pc.green('提交信息生成成功'));

      console.log(pc.cyan('\n──────────────────────────────────────────────────────────────────────'));
      console.log(pc.bold(pc.white(commitMessage)));
      console.log(pc.cyan('──────────────────────────────────────────────────────────────────────\n'));

      const confirm = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: '确认修改最后一次提交?',
        initial: false
      });

      if (!confirm.proceed) {
        console.log(pc.yellow('操作已取消。'));
        return;
      }

      const amendSpinner = ora(pc.cyan('正在修改提交...')).start();
      amendCommit(commitMessage);
      amendSpinner.succeed(pc.green('✓ 提交修改成功'));

      console.log(pc.dim('\n💡 提示: 如果已经推送到远程，需要使用 git push --force 强制推送。\n'));
    } catch (error) {
      console.error(pc.red(`\n❌ 错误: ${error.message}\n`));
      process.exit(1);
    }
  });

// Squash 命令 - 合并提交
program
  .command('squash')
  .description('合并最近的多个提交')
  .option('-n, --number <count>', '要合并的提交数量', '2')
  .action(async (options) => {
    if (!isGitRepository()) {
      console.error(pc.red('❌ 错误: 当前目录不是一个 Git 仓库。'));
      process.exit(1);
    }

    const count = parseInt(options.number, 10);
    if (count < 2) {
      console.log(pc.yellow('⚠️  至少需要合并 2 个提交。'));
      return;
    }

    try {
      const currentBranch = getCurrentBranch();
      console.log(pc.cyan(pc.bold('\n🔄 合并最近的提交')));
      console.log(pc.dim(`当前分支: ${currentBranch}`));
      console.log(pc.dim(`合并数量: ${count} 个提交\n`));

      const confirm = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: `确认合并最近 ${count} 个提交?`,
        initial: false
      });

      if (!confirm.proceed) {
        console.log(pc.yellow('操作已取消。'));
        return;
      }

      // 获取要合并的提交的 diff
      const diff = execFileSync('git', ['diff', `HEAD~${count}`, 'HEAD'], { stdio: 'pipe' }).toString();
      const detectedScope = detectScope(getStagedFiles());

      const spinner = ora({
        text: pc.cyan('生成合并后的提交信息...'),
        color: 'cyan'
      }).start();

      const commitMessage = await generateCommitMessage(diff, detectedScope);
      spinner.succeed(pc.green('提交信息生成成功'));

      console.log(pc.cyan('\n──────────────────────────────────────────────────────────────────────'));
      console.log(pc.bold(pc.white(commitMessage)));
      console.log(pc.cyan('──────────────────────────────────────────────────────────────────────\n'));

      const finalConfirm = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: '确认执行合并操作?',
        initial: false
      });

      if (!finalConfirm.proceed) {
        console.log(pc.yellow('操作已取消。'));
        return;
      }

      const squashSpinner = ora(pc.cyan('正在合并提交...')).start();
      squashCommits(count, commitMessage);
      squashSpinner.succeed(pc.green(`✓ 成功合并 ${count} 个提交`));

      console.log(pc.dim('\n💡 提示: 如果已经推送到远程，需要使用 git push --force 强制推送。\n'));
    } catch (error) {
      console.error(pc.red(`\n❌ 错误: ${error.message}\n`));
      process.exit(1);
    }
  });

// Branch 命令 - 基于主题创建分支
program
  .command('branch')
  .description('基于提交主题创建新分支')
  .action(async () => {
    if (!isGitRepository()) {
      console.error(pc.red('❌ 错误: 当前目录不是一个 Git 仓库。'));
      process.exit(1);
    }

    try {
      const currentBranch = getCurrentBranch();
      console.log(pc.cyan(pc.bold('\n🌿 基于提交主题创建新分支')));
      console.log(pc.dim(`当前分支: ${currentBranch}\n`));

      // 获取最近的提交信息
      const recentCommits = getCommitHistory(null, null, 5);
      if (recentCommits.length === 0) {
        console.log(pc.yellow('⚠️  没有找到提交记录。'));
        return;
      }

      console.log(pc.cyan('最近的提交:'));
      recentCommits.forEach((commit, idx) => {
        console.log(`  ${pc.dim(`${idx + 1}.`)} ${commit}`);
      });
      console.log();

      const spinner = ora({
        text: pc.cyan('生成分支名称建议...'),
        color: 'cyan'
      }).start();

      // 使用第一个提交生成分支名称
      const firstCommit = recentCommits[0];
      const branchName = firstCommit
        .split(' ')[1] // 获取提交主题
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // 替换非字母数字为连字符
        .replace(/^-+|-+$/g, '') // 去除首尾连字符
        .substring(0, 50); // 限制长度

      spinner.succeed(pc.green('分支名称建议生成成功'));

      const response = await prompts([
        {
          type: 'text',
          name: 'branchName',
          message: '输入分支名称:',
          initial: branchName,
          validate: val => val.trim().length > 0 ? true : '分支名称不能为空。'
        },
        {
          type: 'confirm',
          name: 'create',
          message: '确认创建分支?',
          initial: true
        }
      ]);

      if (!response.create) {
        console.log(pc.yellow('操作已取消。'));
        return;
      }

      const branchSpinner = ora(pc.cyan(`正在创建分支 ${response.branchName}...`)).start();
      createBranch(response.branchName);
      branchSpinner.succeed(pc.green(`✓ 分支 ${response.branchName} 创建成功`));

      console.log(pc.dim(`\n已切换到新分支: ${response.branchName}\n`));
    } catch (error) {
      console.error(pc.red(`\n❌ 错误: ${error.message}\n`));
      process.exit(1);
    }
  });

// 缓存管理命令
program
  .command('cache')
  .description('管理缓存（性能优化）')
  .option('-s, --stats', '显示缓存统计信息')
  .option('-c, --clear', '清除所有缓存')
  .option('-e, --expire', '清理过期缓存')
  .action((options) => {
    if (options.stats) {
      const stats = getCacheStats();
      console.log(pc.cyan(pc.bold('\n📦 缓存统计信息:')));
      console.log(pc.cyan('─'.repeat(40)));
      console.log(`  ${pc.bold('缓存文件数:')} ${pc.blue(stats.count)}`);
      console.log(`  ${pc.bold('占用空间:')}   ${pc.blue(stats.size)}`);
      console.log(pc.cyan('─'.repeat(40) + '\n'));
      return;
    }

    if (options.clear) {
      const count = clearAllCache();
      console.log(pc.green(`✓ 已清除 ${count} 个缓存文件。`));
      return;
    }

    if (options.expire) {
      const count = cleanExpiredCache();
      console.log(pc.green(`✓ 已清理 ${count} 个过期缓存文件。`));
      return;
    }

    console.log(pc.dim('使用 "gca cache --stats" 查看统计，"gca cache --clear" 清除所有缓存，"gca cache --expire" 清理过期缓存。'));
  });

// 提交消息合规性校验命令
program
  .command('verify-commit <msgPath>')
  .description('校验提交消息是否符合规范（供 commit-msg 钩子使用）')
  .option('--team', '使用团队配置进行验证')
  .action((msgPath, options) => {
    if (!fs.existsSync(msgPath)) {
      console.error(pc.red(`❌ 错误: 找不到提交消息临时文件 "${msgPath}"。`));
      process.exit(1);
    }

    const message = fs.readFileSync(msgPath, 'utf-8');
    let config = readConfig();

    // 如果使用团队配置，合并团队配置
    if (options.team) {
      const teamConfig = readTeamConfig();
      if (teamConfig) {
        config = { ...config, ...teamConfig };
      }
    }

    const result = verifyCommitMessage(message, config.convention);

    if (!result.valid) {
      console.error(pc.red('\n❌ Git 提交信息格式不合规，已被拒绝入库。'));
      console.error(pc.yellow(`原因: ${result.reason}\n`));

      console.error(pc.dim('Conventional Commits 规范格式说明:'));
      console.error(pc.dim('  feat(scope): 描述新功能'));
      console.error(pc.dim('  fix(scope): 修复问题'));
      console.error(pc.dim('  docs: 更新文档'));
      console.error(pc.dim('  style: 格式化/样式调整（不影响代码运行逻辑）'));
      console.error(pc.dim('  refactor: 代码重构'));
      console.error(pc.dim('  perf: 性能优化'));
      console.log(pc.cyan('\n💡 推荐使用 "gca" 命令，由 AI 自动生成完美合规的提交信息。\n'));
      process.exit(1);
    }

    // 校验成功
    process.exit(0);
  });

// 批量提交命令
program
  .command('batch')
  .description('批量处理未提交的文件，为每个文件生成独立的提交信息')
  .action(async () => {
    if (!isGitRepository()) {
      console.error(pc.red('❌ 错误: 当前目录不是一个 Git 仓库。'));
      process.exit(1);
    }

    const unstagedFiles = getUnstagedFiles();
    if (unstagedFiles.length === 0) {
      console.log(pc.yellow('⚠️  没有未暂存的文件。'));
      return;
    }

    console.log(pc.cyan(pc.bold('\n📦 批量提交模式')));
    console.log(pc.dim(`发现 ${unstagedFiles.length} 个未暂存的文件:\n`));
    unstagedFiles.forEach((file, idx) => {
      console.log(`  ${pc.dim(`${idx + 1}.`)} ${file}`);
    });

    const confirm = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: '是否为每个文件生成独立的提交?',
      initial: true
    });

    if (!confirm.proceed) {
      console.log(pc.yellow('批量提交已取消。'));
      return;
    }

    console.log();
    let successCount = 0;
    let skipCount = 0;

    for (const file of unstagedFiles) {
      console.log(pc.cyan(`\n处理文件: ${pc.bold(file)}`));

      try {
        // 暂存文件
        stageFile(file);

        // 获取 diff
        const diff = getFileDiff(file);
        if (!diff || diff.trim() === '') {
          console.log(pc.yellow('  跳过: 文件无实际变化'));
          unstageFile(file);
          skipCount++;
          continue;
        }

        // 检测范围
        const detectedScope = detectScope([file]);
        if (detectedScope) {
          console.log(pc.dim(`  推荐范围: ${detectedScope}`));
        }

        // 生成提交信息
        const spinner = ora({
          text: pc.cyan('  生成提交信息...'),
          color: 'cyan'
        }).start();

        const commitMessage = await generateCommitMessage(diff, detectedScope);
        spinner.succeed(pc.green('  提交信息生成成功'));

        console.log(pc.dim(`  ${commitMessage}`));

        // 提交
        const commitSpinner = ora(pc.cyan('  创建提交...')).start();
        commitChanges(commitMessage);
        commitSpinner.succeed(pc.green('  提交成功'));

        successCount++;
      } catch (error) {
        console.log(pc.red(`  ❌ 处理失败: ${error.message}`));
        // 失败时取消暂存
        try {
          unstageFile(file);
        } catch (_) {}
      }
    }

    console.log(pc.cyan('\n' + '─'.repeat(60)));
    console.log(pc.green(`✅ 成功提交: ${successCount} 个文件`));
    if (skipCount > 0) {
      console.log(pc.yellow(`⏭️  跳过: ${skipCount} 个文件`));
    }
    console.log(pc.cyan('─'.repeat(60) + '\n'));
  });

// 提交历史分析命令
program
  .command('analyze')
  .description('分析提交历史质量，统计各类型提交占比')
  .option('-f, --from <tag/commit>', '起始的 tag 或 commit hash')
  .option('-t, --to <tag/commit>', '结束的 tag 或 commit hash (默认为 HEAD)')
  .option('-l, --limit <number>', '分析的提交数量限制 (默认: 50)', '50')
  .action(async (options) => {
    if (!isGitRepository()) {
      console.error(pc.red('❌ 错误: 当前目录不是一个 Git 仓库。'));
      process.exit(1);
    }

    const limit = parseInt(options.limit, 10) || 50;
    const spinner = ora({
      text: pc.cyan('正在分析提交历史...'),
      color: 'cyan'
    }).start();

    try {
      const commits = getDetailedCommitHistory(options.from, options.to, limit);
      spinner.succeed(pc.green('分析完成！'));

      if (commits.length === 0) {
        console.log(pc.yellow('未找到任何提交记录。'));
        return;
      }

      // 统计数据
      const typeStats = {};
      const scopeStats = {};
      let validCount = 0;
      let invalidCount = 0;
      const invalidExamples = [];

      for (const commit of commits) {
        // 类型统计
        typeStats[commit.type] = (typeStats[commit.type] || 0) + 1;

        // 范围统计
        if (commit.scope) {
          scopeStats[commit.scope] = (scopeStats[commit.scope] || 0) + 1;
        }

        // 规范校验
        if (commit.type === 'other') {
          invalidCount++;
          if (invalidExamples.length < 5) {
            invalidExamples.push(`${commit.hash} ${commit.subject}`);
          }
        } else {
          validCount++;
        }
      }

      // 显示结果
      console.log(pc.cyan('\n📊 提交历史分析报告'));
      console.log(pc.cyan('─'.repeat(60)));
      console.log(pc.bold(`\n总提交数: ${commits.length}`));
      console.log(pc.green(`✅ 符合规范: ${validCount} (${((validCount / commits.length) * 100).toFixed(1)}%)`));
      console.log(pc.red(`❌ 不符合规范: ${invalidCount} (${((invalidCount / commits.length) * 100).toFixed(1)}%)`));

      // 类型分布
      console.log(pc.cyan('\n📋 提交类型分布:'));
      const sortedTypes = Object.entries(typeStats).sort((a, b) => b[1] - a[1]);
      for (const [type, count] of sortedTypes) {
        const percentage = ((count / commits.length) * 100).toFixed(1);
        const bar = '█'.repeat(Math.floor(percentage / 2));
        const color = type === 'other' ? 'red' : 'green';
        console.log(`  ${pc[color](type.padEnd(10))} ${bar} ${count} (${percentage}%)`);
      }

      // 范围分布
      if (Object.keys(scopeStats).length > 0) {
        console.log(pc.cyan('\n🎯 修改范围分布 (Top 10):'));
        const sortedScopes = Object.entries(scopeStats).sort((a, b) => b[1] - a[1]).slice(0, 10);
        for (const [scope, count] of sortedScopes) {
          const percentage = ((count / commits.length) * 100).toFixed(1);
          console.log(`  ${pc.bold(scope.padEnd(15))} ${count} (${percentage}%)`);
        }
      }

      // 不规范示例
      if (invalidExamples.length > 0) {
        console.log(pc.red('\n⚠️  不符合规范的提交示例:'));
        for (const example of invalidExamples) {
          console.log(`  ${pc.dim(example)}`);
        }
      }

      console.log(pc.cyan('\n' + '─'.repeat(60)));
      console.log(pc.dim('💡 提示: 使用 "gca" 命令可以生成符合规范的提交信息。\n'));
    } catch (error) {
      spinner.fail(pc.red('分析失败。'));
      console.error(`\n${pc.bold('错误详情:')} ${pc.red(error.message)}\n`);
      process.exit(1);
    }
  });

// PR 内容生成命令
program
  .command('pr')
  .description('基于提交历史生成 Pull Request 标题和描述')
  .option('-f, --from <tag/commit>', '起始的 tag 或 commit hash')
  .option('-t, --to <tag/commit>', '结束的 tag 或 commit hash (默认为 HEAD)')
  .option('-o, --output <file>', '输出的文件路径 (例如 PR.md)')
  .action(async (options) => {
    if (!isGitRepository()) {
      console.error(pc.red('❌ 错误: 当前目录不是一个 Git 仓库。'));
      process.exit(1);
    }

    let from = options.from;
    let to = options.to;

    // 智能推断范围
    if (!from) {
      const tags = getLatestTags();
      if (tags.length >= 2) {
        from = tags[1];
        to = to || tags[0];
        console.log(pc.cyan(`💡 未指定范围，自动选取最近两个 Tag 之间的提交进行分析: ${pc.bold(from)}..${pc.bold(to)}`));
      } else if (tags.length === 1) {
        from = tags[0];
        console.log(pc.cyan(`💡 未指定范围，自动选取 Tag ${pc.bold(from)} 到 HEAD 之间的提交进行分析`));
      } else {
        console.log(pc.cyan('💡 仓库未检测到任何 Tag，将分析最近 20 条提交记录...'));
      }
    }

    const spinner = ora({
      text: pc.cyan('正在分析提交历史并由 AI 生成 PR 内容...'),
      color: 'cyan'
    }).start();

    try {
      const commits = getCommitHistory(from, to);
      if (commits.length === 0) {
        spinner.fail(pc.red('未找到任何提交记录。'));
        process.exit(1);
      }

      spinner.text = pc.cyan(`已获取到 ${commits.length} 条提交记录，正在向 AI 请求生成 PR 内容...`);
      const prContent = await generatePRContent(commits);
      spinner.succeed(pc.green('PR 内容生成成功！'));

      if (options.output) {
        const outputPath = path.resolve(process.cwd(), options.output);
        const fileContent = `# ${prContent.title}\n\n${prContent.description}`;
        fs.writeFileSync(outputPath, fileContent, 'utf-8');
        console.log(pc.green(`✓ PR 内容已成功保存至: ${pc.bold(outputPath)}`));
      } else {
        console.log(pc.cyan('\n──────────────────────────────────────────────────────────────────────'));
        console.log(pc.bold(pc.white(`# ${prContent.title}`)));
        console.log(pc.cyan('──────────────────────────────────────────────────────────────────────'));
        console.log(pc.white(prContent.description));
        console.log(pc.cyan('──────────────────────────────────────────────────────────────────────\n'));
      }
    } catch (error) {
      spinner.fail(pc.red('生成 PR 内容失败。'));
      console.error(`\n${pc.bold('错误详情:')} ${pc.red(error.message)}\n`);
      process.exit(1);
    }
  });

// Changelog 自动生成命令
program
  .command('changelog')
  .description('基于 Git 提交历史自动生成 AI 更新日志')
  .option('-f, --from <tag/commit>', '起始的 tag 或 commit hash')
  .option('-t, --to <tag/commit>', '结束的 tag 或 commit hash (默认为 HEAD)')
  .option('-o, --output <file>', '输出的文件路径 (例如 CHANGELOG.md)')
  .action(async (options) => {
    if (!isGitRepository()) {
      console.error(pc.red('❌ 错误: 当前目录不是一个 Git 仓库。'));
      process.exit(1);
    }

    let from = options.from;
    let to = options.to;

    // 智能推断范围
    if (!from) {
      const tags = getLatestTags();
      if (tags.length >= 2) {
        // 如果有两个或以上的 tag，默认生成最新两个 tag 之间的更新日志
        from = tags[1];
        to = to || tags[0];
        console.log(pc.cyan(`💡 未指定范围，自动选取最近两个 Tag 之间的提交进行分析: ${pc.bold(from)}..${pc.bold(to)}`));
      } else if (tags.length === 1) {
        // 如果只有一个 tag，默认生成 tag 到 HEAD 的更新日志
        from = tags[0];
        console.log(pc.cyan(`💡 未指定范围，自动选取 Tag ${pc.bold(from)} 到 HEAD 之间的提交进行分析`));
      } else {
        console.log(pc.cyan('💡 仓库未检测到任何 Tag，将分析最近 20 条提交记录...'));
      }
    }

    const spinner = ora({
      text: pc.cyan('正在分析提交历史并由 AI 生成更新日志...'),
      color: 'cyan'
    }).start();

    try {
      const commits = getCommitHistory(from, to);
      if (commits.length === 0) {
        spinner.fail(pc.red('未找到任何提交记录。'));
        process.exit(1);
      }

      spinner.text = pc.cyan(`已获取到 ${commits.length} 条提交记录，正在向 AI 请求生成更新日志...`);
      const changelog = await generateChangelog(commits);
      spinner.succeed(pc.green('更新日志生成成功！'));

      if (options.output) {
        const outputPath = path.resolve(process.cwd(), options.output);
        
        let fileContent = changelog;
        // 如果文件已存在，则将新日志追加在最前面
        if (fs.existsSync(outputPath)) {
          const originalContent = fs.readFileSync(outputPath, 'utf-8');
          fileContent = `${changelog}\n\n---\n\n${originalContent}`;
        }
        
        fs.writeFileSync(outputPath, fileContent, 'utf-8');
        console.log(pc.green(`✓ 更新日志已成功保存/追加至: ${pc.bold(outputPath)}`));
      } else {
        console.log(pc.cyan('\n──────────────────────────────────────────────────────────────────────'));
        console.log(pc.white(changelog));
        console.log(pc.cyan('──────────────────────────────────────────────────────────────────────\n'));
      }
    } catch (error) {
      spinner.fail(pc.red('生成更新日志失败。'));
      console.error(`\n${pc.bold('错误详情:')} ${pc.red(error.message)}\n`);
      process.exit(1);
    }
  });

// 主 CLI 逻辑
program
  .option('--hook', '在 Git pre-commit 钩子环境中运行')
  .option('--json', '以 JSON 格式输出结果（用于 CI 集成）')
  .action(async (options) => {
    const isHook = !!options.hook;
    const isJson = !!options.json;

    if (!isJson) {
      console.log(pc.cyan(pc.bold('\n✨ Git Commit AI v1.0.0')));
      console.log(pc.dim('Analyzing staged changes to write your commit message...\n'));
    }

    if (!isGitRepository()) {
      if (isJson) {
        console.log(JSON.stringify({ success: false, error: 'Not a Git repository' }));
      } else {
        console.error(pc.red('❌ Error: The current directory is not a Git repository.'));
        console.error(pc.dim('Please run this tool inside a Git project workspace.\n'));
      }
      process.exit(1);
    }

    const stagedFiles = getStagedFiles();
    if (stagedFiles.length === 0) {
      const unstagedFiles = getUnstagedFiles();
      if (isJson) {
        console.log(JSON.stringify({ success: false, error: 'No staged changes', unstagedFiles }));
      } else {
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
      }
      process.exit(0);
    }

    if (!isJson) {
      console.log(pc.green(`✓ Found ${stagedFiles.length} staged file(s):`));
      stagedFiles.slice(0, 5).forEach(file => console.log(`  ${pc.dim('•')} ${file}`));
      if (stagedFiles.length > 5) {
        console.log(`  ...and ${stagedFiles.length - 5} more.`);
      }

      // 智能检测提交范围
      const detectedScope = detectScope(stagedFiles);
      if (detectedScope) {
        console.log(pc.green(`✓ Recommended scope: ${pc.bold(detectedScope)}`));
      }
      console.log();
    }

    const diff = getStagedDiff();

    // 大差异安全限额处理
    const MAX_DIFF_LENGTH = 60000;
    let safeDiff = diff;
    if (diff.length > MAX_DIFF_LENGTH) {
      if (!isJson) {
        console.log(pc.yellow(`⚠️  Warning: Staged diff is very large (${diff.length} chars). Truncating diff to fit context window...`));
      }
      safeDiff = diff.slice(0, MAX_DIFF_LENGTH) + '\n\n[Diff truncated here due to length limits...]';
    }

    await requestAndHandleMessage(safeDiff, detectScope(stagedFiles), isHook, isJson);
  });

/**
 * 发起 AI 生成并处理后续交互菜单
 * @param {string} diff
 * @param {string} detectedScope
 * @param {boolean} isHook
 * @param {boolean} isJson
 */
async function requestAndHandleMessage(diff, detectedScope, isHook, isJson) {
  const spinner = ora({
    text: pc.cyan('Generating commit message using AI...'),
    color: 'cyan',
    isEnabled: !isJson
  }).start();

  let commitMessage = '';
  try {
    commitMessage = await generateCommitMessage(diff, detectedScope);
    if (!isJson) {
      spinner.succeed(pc.green('Commit message generated successfully!'));
    }
  } catch (error) {
    if (!isJson) {
      spinner.fail(pc.red('Failed to generate commit message.'));
      console.error(`\n${pc.bold('Error detail:')} ${pc.red(error.message)}\n`);
    } else {
      console.log(JSON.stringify({ success: false, error: error.message }));
    }
    process.exit(1);
  }

  if (isJson) {
    console.log(JSON.stringify({ success: true, message: commitMessage, scope: detectedScope }));
    process.exit(0);
  }

  await displayInteractiveMenu(commitMessage, diff, detectedScope, isHook);
}

/**
 * 确认界面与二次操作选择
 * @param {string} commitMessage 
 * @param {string} diff 
 * @param {string} detectedScope
 * @param {boolean} isHook
 */
async function displayInteractiveMenu(commitMessage, diff, detectedScope, isHook) {
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
      { title: pc.yellow('Edit message in editor'), value: 'edit_editor' },
      { title: pc.yellow('Edit message manually'), value: 'edit' },
      { title: pc.blue('Regenerate message'), value: 'regenerate' },
      { title: pc.red('Cancel'), value: 'cancel' }
    ]
  });

  if (response.action === 'commit_push') {
    executeCommit(commitMessage, true, isHook);
  } else if (response.action === 'commit') {
    executeCommit(commitMessage, false, isHook);
  } else if (response.action === 'edit_editor') {
    console.log(pc.dim(`\nOpening editor (${process.env.EDITOR || process.env.VISUAL || 'vim'})...`));
    try {
      const editedMessage = await editWithEditor(commitMessage);
      if (editedMessage.trim()) {
        const pushConfirm = await prompts({
          type: 'confirm',
          name: 'shouldPush',
          message: 'Push changes to remote repository?',
          initial: true
        });
        executeCommit(editedMessage.trim(), pushConfirm.shouldPush, isHook);
      } else {
        console.log(pc.yellow('Empty message. Returning to options.'));
        await displayInteractiveMenu(commitMessage, diff, detectedScope, isHook);
      }
    } catch (err) {
      console.log(pc.red(`Editor error: ${err.message}`));
      console.log(pc.yellow('Returning to options.'));
      await displayInteractiveMenu(commitMessage, diff, detectedScope, isHook);
    }
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
      executeCommit(editResponse.editedMessage, pushConfirm.shouldPush, isHook);
    } else {
      console.log(pc.yellow('Edit aborted. Returning to options.'));
      await displayInteractiveMenu(commitMessage, diff, detectedScope, isHook);
    }
  } else if (response.action === 'regenerate') {
    console.log(pc.dim('\nRegenerating...'));
    await requestAndHandleMessage(diff, detectedScope, isHook);
  } else {
    console.log(pc.yellow('\nCommit cancelled. Your staged changes remain intact.\n'));
    process.exit(isHook ? 1 : 0);
  }
}

/**
 * 执行 Git 提交操作
 * @param {string} message 
 * @param {boolean} [shouldPush=false]
 * @param {boolean} [isHook=false]
 */
function executeCommit(message, shouldPush = false, isHook = false) {
  const spinner = ora(pc.cyan('Creating commit...')).start();
  try {
    const output = commitChanges(message);
    spinner.succeed(pc.green('Commit created!'));
    console.log(pc.dim(`\n${output.trim()}\n`));
    
    if (shouldPush) {
      executePush();
    }

    if (isHook) {
      console.log(pc.green('✓ [git-commit-ai] Commit created successfully! (Hook process exited)'));
      process.exit(1); // 退出 1 以拦截外层重复提交
    }
  } catch (error) {
    spinner.fail(pc.red('Failed to commit staged changes.'));
    console.error(`\n${pc.bold('Git Output:')} ${pc.red(error.message)}\n`);
    process.exit(1);
  }
}

/**
 * 执行 Git 推送操作
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

