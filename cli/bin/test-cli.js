#!/usr/bin/env node
import { Command } from 'commander';
import { uploadCommand } from '../src/commands/upload.js';
import { downloadCommand } from '../src/commands/download.js';
import { updateCommand } from '../src/commands/update.js';
import { aiCommand } from '../src/commands/ai.js';
import { configCommand } from '../src/commands/config.js';
import { teamCommand } from '../src/commands/team.js';
import { cacheCommand } from '../src/commands/cache.js';
import { gitCommand } from '../src/commands/git.js';

console.log('DEBUG: All imports succeeded');

const program = new Command();

program
  .name('codesync')
  .description('CodeSync - 简化Git操作 + AI代码助手')
  .version('2.0.0');

program
  .command('upload')
  .description('上传当前项目到远程仓库')
  .option('-p, --path <path>', '项目路径（默认当前目录）')
  .option('-P, --platform <platform>', '平台 (github/gitee/gitlab)，默认 github')
  .option('-n, --name <name>', '仓库名称')
  .option('-d, --description <desc>', '仓库描述')
  .option('--private', '创建私有仓库')
  .action(uploadCommand);

program
  .command('download')
  .description('从远程仓库下载项目')
  .argument('<url>', '仓库URL')
  .option('-p, --path <path>', '下载路径（默认当前目录）')
  .option('--install', '自动安装依赖')
  .action(downloadCommand);

program
  .command('update')
  .description('更新当前项目（git pull）')
  .option('-p, --path <path>', '项目路径（默认当前目录）')
  .action(updateCommand);

program
  .command('ai')
  .description('AI助手功能')
  .argument('<action>', '操作类型 (commit/annotate/explain/review)')
  .option('-f, --file <file>', '文件路径')
  .option('-l, --language <lang>', '编程语言（默认自动检测）')
  .action(aiCommand);

program
  .command('config')
  .description('配置管理')
  .option('-s, --set <key=value>', '设置配置项')
  .option('-l, --list', '列出所有配置')
  .action(configCommand);

program
  .command('team')
  .description('团队协作配置管理')
  .option('--init', '初始化团队配置文件')
  .option('--show', '查看当前团队配置')
  .option('--enforce', '安装提交规范强制执行钩子（Git Hook）')
  .action(teamCommand);

program
  .command('cache')
  .description('AI 响应缓存管理')
  .option('--stats', '查看缓存统计信息')
  .option('--clear', '清除所有缓存')
  .option('--expire', '清理过期缓存')
  .action(cacheCommand);

program
  .command('git')
  .description('Git 扩展操作')
  .argument('<action>', '操作类型 (log/status/amend/revert/branch/changelog/analyze/batch)')
  .option('-n, --number <count>', '日志条数', '15')
  .option('--commit <hash>', '提交哈希')
  .option('--mode <mode>', '回退模式 soft|mixed|hard', 'soft')
  .option('--name <name>', '分支名称')
  .action(gitCommand);

program
  .command('init')
  .description('交互式配置向导')
  .action(async () => {
    const { default: prompts } = await import('prompts');
    const { writeConfig, readConfig } = await import('../../shared/config.js');
    const pc = (await import('picocolors')).default;

    console.log(pc.cyan(pc.bold('\n🚀 CodeSync 配置向导')));
    console.log(pc.dim('─'.repeat(50)));

    const existing = readConfig();

    const defaultModelValues = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
    let initialModelIndex = 0;
    if (existing.model) {
      const foundIdx = defaultModelValues.indexOf(existing.model);
      initialModelIndex = foundIdx !== -1 ? foundIdx : 3;
    }

    const response = await prompts([
      { type: 'text', name: 'apiKey', message: 'OpenAI API Key:', initial: existing.apiKey || '' },
      { type: 'text', name: 'apiBase', message: 'API Base URL:', initial: existing.apiBase || 'https://api.openai.com/v1' },
      { type: 'select', name: 'model', message: '选择默认模型:', choices: [
        { title: 'gpt-4o-mini (快速)', value: 'gpt-4o-mini' },
        { title: 'gpt-4o (强大)', value: 'gpt-4o' },
        { title: 'gpt-3.5-turbo (经济)', value: 'gpt-3.5-turbo' },
        { title: '自定义模型...', value: 'custom' }
      ], initial: initialModelIndex },
      {
        type: (prev) => prev === 'custom' ? 'text' : null,
        name: 'customModel',
        message: '输入自定义模型名称:',
        initial: existing.model && !defaultModelValues.includes(existing.model) ? existing.model : '',
        validate: (val) => val && val.trim().length > 0 ? true : '模型名称不能为空'
      },
      { type: 'select', name: 'convention', message: '选择提交规范:', choices: [
        { title: 'Angular 规范', value: 'angular' },
        { title: 'Gitmoji 规范', value: 'gitmoji' }
      ], initial: existing.convention === 'gitmoji' ? 1 : 0 },
      { type: 'select', name: 'language', message: '选择提交信息语言:', choices: [
        { title: 'English', value: 'en' },
        { title: '简体中文', value: 'zh' },
        { title: '日本語', value: 'ja' }
      ], initial: existing.language === 'zh' ? 1 : existing.language === 'ja' ? 2 : 0 },
      { type: 'confirm', name: 'smartModel', message: '启用智能模型选择?', initial: existing.smartModel !== false }
    ]);

    if (response.apiKey === undefined || (response.model === 'custom' && !response.customModel)) {
      console.log(pc.yellow('\n操作已取消。'));
      return;
    }

    if (response.model === 'custom') {
      response.model = response.customModel.trim();
    }
    delete response.customModel;

    writeConfig(response);
    console.log(pc.green('\n✅ 配置已保存！'));
  });

program.parse(process.argv);