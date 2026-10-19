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
program.name('codesync').description('CodeSync - 简化Git操作 + AI代码助手').version('2.0.0');

program.command('upload').description('上传当前项目').option('-p, --path <path>').option('-P, --platform <platform>').option('-n, --name <name>').option('-d, --description <desc>').option('--private').action(uploadCommand);

program.command('download').description('从远程仓库下载项目').argument('<url>').option('-p, --path <path>').option('--install').action(downloadCommand);

program.command('update').description('更新当前项目').option('-p, --path <path>').action(updateCommand);

program.command('ai').description('AI助手功能').argument('<action>').option('-f, --file <file>').option('-l, --language <lang>').action(aiCommand);

program.command('config').description('配置管理').option('-s, --set <key=value>').option('-l, --list').action(configCommand);

program.command('team').description('团队协作配置管理').option('--init').option('--show').option('--enforce').action(teamCommand);

program.command('cache').description('AI 响应缓存管理').option('--stats').option('--clear').option('--expire').action(cacheCommand);

program.command('git').description('Git 扩展操作').argument('<action>').option('-n, --number <count>').option('--commit <hash>').option('--mode <mode>').option('--name <name>').action(gitCommand);

program.command('init').description('交互式配置向导').action(async () => {
  const { default: prompts } = await import('prompts');
  const { writeConfig, readConfig } = await import('../../shared/config.js');
  const pc = (await import('picocolors')).default;
  console.log(pc.cyan(pc.bold('\n🚀 CodeSync 配置向导')));
  const existing = readConfig();
  const response = await prompts([
    { type: 'text', name: 'apiKey', message: 'OpenAI API Key:', initial: existing.apiKey || '' },
    { type: 'text', name: 'apiBase', message: 'API Base URL:', initial: existing.apiBase || 'https://api.openai.com/v1' },
    { type: 'select', name: 'model', message: '选择默认模型:', choices: [
      { title: 'gpt-4o-mini (快速)', value: 'gpt-4o-mini' },
      { title: 'gpt-4o (强大)', value: 'gpt-4o' },
      { title: 'gpt-3.5-turbo (经济)', value: 'gpt-3.5-turbo' }
    ], initial: 0 },
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
  if (response.apiKey === undefined) {
    console.log(pc.yellow('\n操作已取消。'));
    return;
  }
  writeConfig(response);
  console.log(pc.green('\n✅ 配置已保存！'));
});

console.log('DEBUG: Before parse');
program.parse(process.argv);
console.log('DEBUG: After parse');