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
  .command('push')
  .description('提交并推送到远程仓库（AI 生成提交信息）')
  .option('-p, --path <path>', '项目路径（默认当前目录）')
  .option('-m, --message <message>', '指定提交信息（默认由 AI 生成）')
  .option('--bypass-hooks', '跳过 Git 钩子校验')
  .action((options) =>
    import('../src/commands/push.js').then(
      ({ pushCommand }) => pushCommand(options),
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
  .command('config [action] [params...]')
  .description('配置管理 (支持 codesync config set key=value 或 codesync config --list)')
  .option('-s, --set <key=value>', '设置配置项')
  .option('-l, --list', '列出所有配置')
  .action((...args) => configCommand(...args));

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
  .command('ci')
  .description('CI/CD 集成管理')
  .argument('<action>', '操作类型 (install/uninstall)')
  .option('-p, --platform <platform>', '平台 (github/gitlab)')
  .action((action, options) =>
    import('../src/commands/ci.js').then(
      ({ ciCommand }) => ciCommand(action, options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('security')
  .description('安全检测')
  .argument('<action>', '操作类型 (scan/pre-commit)')
  .option('-p, --path <path>', '项目路径（默认当前目录）')
  .option('-f, --file <file>', '扫描单个文件')
  .action((action, options) =>
    import('../src/commands/security.js').then(
      ({ securityCommand }) => securityCommand(action, options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('review-bot')
  .description('AI 代码审查 Bot 管理')
  .argument('<action>', '操作类型 (install/uninstall/start/config)')
  .option('--port <port>', '服务器端口')
  .action((action, options) =>
    import('../src/commands/reviewBot.js').then(
      ({ reviewBotCommand }) => reviewBotCommand(action, options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('hook')
  .description('Pre-commit Hook 管理')
  .argument('<action>', '操作类型 (install/uninstall/list)')
  .option('-t, --template <template>', '钩子模板 (eslint/stylelint/typescript/prettier/test/all/custom)', 'all')
  .option('-f, --force', '强制覆盖已存在的钩子')
  .action((action, options) =>
    import('../src/commands/hook.js').then(
      ({ hookCommand }) => hookCommand(action, options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('template')
  .description('提交模板管理')
  .argument('<action>', '操作类型 (add/list/use/remove/show)')
  .option('-n, --name <name>', '模板名称')
  .option('-t, --template <template>', '模板内容')
  .option('-d, --description <description>', '模板描述')
  .option('-v, --variables <variables>', '模板变量 (JSON 格式)')
  .action((action, options) =>
    import('../src/commands/template.js').then(
      ({ templateCommand }) => templateCommand(action, options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('dashboard')
  .description('启动 Web Dashboard')
  .option('-p, --port <port>', '服务器端口', '3001')
  .action((options) =>
    import('../src/commands/dashboard.js').then(
      ({ dashboardCommand }) => dashboardCommand(options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('plugin')
  .description('插件管理')
  .argument('<action>', '操作类型 (install/uninstall/list/load)')
  .option('-n, --name <name>', '插件名称')
  .option('-t, --type <type>', '插件类型 (ai-provider/platform/pre-commit-hook/post-commit-hook)')
  .option('-p, --path <path>', '插件文件路径')
  .option('-c, --config <config>', '插件配置 (JSON 格式)')
  .action((action, options) =>
    import('../src/commands/plugin.js').then(
      ({ pluginCommand }) => pluginCommand(action, options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('deploy')
  .description('自动化部署')
  .argument('<action>', '操作类型 (hook/list)')
  .option('-p, --platform <platform>', '部署平台 (vercel/netlify/docker/npm)')
  .action((action, options) =>
    import('../src/commands/deploy.js').then(
      ({ deployCommand }) => deployCommand(action, options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('release')
  .description('Release 自动化')
  .argument('<version>', '版本号 (例如: 1.0.0)')
  .option('--draft', '创建草稿')
  .option('--prerelease', '预发布版本')
  .action((version, options) =>
    import('../src/commands/release.js').then(
      ({ releaseCommand }) => releaseCommand(version, options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('search')
  .description('代码搜索')
  .argument('<query>', '搜索查询')
  .option('-t, --type <type>', '搜索类型 (text|semantic)', 'text')
  .option('-f, --file <file>', '搜索指定文件')
  .action((query, options) =>
    import('../src/commands/search.js').then(
      ({ searchCommand }) => searchCommand(query, options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('agent')
  .description('智能代码上传助手')
  .argument('<action>', '操作类型 (start/stop/status/config)')
  .option('--strategy <strategy>', '上传策略 (immediate/batch/smart/scheduled)', 'smart')
  .option('--batch-size <size>', '批量上传阈值', '5')
  .option('--interval <seconds>', '定时上传间隔（秒）', '60')
  .option('--no-commit', '禁用自动提交')
  .option('--no-push', '禁用自动推送')
  .option('--no-ai', '禁用 AI 生成提交信息')
  .option('--yes', '跳过确认提示')
  .option('--notify', '启用通知')
  .option('--convention <type>', '提交规范 (angular/gitmoji)', 'angular')
  .option('--language <lang>', '提交语言 (zh/en/ja)', 'zh')
  .option('--path <path>', '项目路径')
  .action((action, options) =>
    import('../src/commands/agent.js').then(
      ({ agentCommand }) => agentCommand(action, options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

program
  .command('agent-init')
  .description('智能体配置向导')
  .option('-f, --force', '强制覆盖现有配置')
  .action((options) =>
    import('../src/commands/agentInit.js').then(
      ({ agentInitCommand }) => agentInitCommand(options),
      (e) => { console.error('Error:', e.message); process.exit(1); }
    )
  );

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

          const defaultModelValues = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
          let initialModelIndex = 0;
          if (existing.model) {
            const foundIdx = defaultModelValues.indexOf(existing.model);
            initialModelIndex = foundIdx !== -1 ? foundIdx : 3;
          }

          return prompts([
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
          ]).then((response) => {
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
        })
      )
    )
  );

program.parse(process.argv);