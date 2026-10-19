#!/usr/bin/env node

import { Command } from 'commander';
import { configCommand } from '../src/commands/config.js';

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
  .action((options) =>
    import('../src/commands/upload.js').then(
      ({ uploadCommand }) => uploadCommand(options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('download')
  .description('从远程仓库下载项目')
  .argument('<url>', '仓库URL')
  .option('-p, --path <path>', '下载路径（默认当前目录）')
  .option('--install', '自动安装依赖')
  .action((url, options) =>
    import('../src/commands/download.js').then(
      ({ downloadCommand }) => downloadCommand(url, options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('update')
  .description('更新当前项目（git pull）')
  .option('-p, --path <path>', '项目路径（默认当前目录）')
  .action((options) =>
    import('../src/commands/update.js').then(
      ({ updateCommand }) => updateCommand(options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('ai')
  .description('AI助手功能')
  .argument('<action>', '操作类型 (commit/annotate/explain/review)')
  .option('-f, --file <file>', '文件路径')
  .option('-l, --language <lang>', '编程语言（默认自动检测）')
  .action((action, options) =>
    import('../src/commands/ai.js').then(
      ({ aiCommand }) => aiCommand(action, options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

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
  .action((options) =>
    import('../src/commands/team.js').then(
      ({ teamCommand }) => teamCommand(options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('cache')
  .description('AI 响应缓存管理')
  .option('--stats', '查看缓存统计信息')
  .option('--clear', '清除所有缓存')
  .option('--expire', '清理过期缓存')
  .action((options) =>
    import('../src/commands/cache.js').then(
      ({ cacheCommand }) => cacheCommand(options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('git')
  .description('Git 扩展操作')
  .argument('<action>', '操作类型 (log/status/amend/revert/branch/changelog/analyze/batch)')
  .option('-n, --number <count>', '日志条数', '15')
  .option('--commit <hash>', '提交哈希')
  .option('--mode <mode>', '回退模式 soft|mixed|hard', 'soft')
  .option('--name <name>', '分支名称')
  .action((action, options) => {
    process.stderr.write('[DEBUG] git action entered: ' + action + '\n');
    return import('../src/commands/git.js').then(
      (mod) => {
        process.stderr.write('[DEBUG] git.js loaded OK\n');
        return mod.gitCommand(action, options);
      },
      (e) => { process.stderr.write('[DEBUG] Load error: ' + e.message + '\n'); console.error('Error:', e.message); process.exit(1); }
    );
  });

program
  .command('init')
  .description('交互式配置向导')
  .action(() =>
    import('prompts').then(({ default: prompts }) =>
      import('../../shared/config.js').then(({ writeConfig, readConfig }) =>
        import('picocolors').then((pc) => {
          pc = pc.default;

          console.log(pc.cyan(pc.bold('\n🚀 CodeSync 配置向导')));
          console.log(pc.dim('─'.repeat(50)));

          const existing = readConfig();

          return prompts([
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
          ]).then((response) => {
            if (response.apiKey === undefined) {
              console.log(pc.yellow('\n操作已取消。'));
              return;
            }
            writeConfig(response);
            console.log(pc.green('\n✅ 配置已保存！'));
          });
        })
      )
    )
  );

program.parse(process.argv);