import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import ora from 'ora';

export async function agentInitCommand(options) {
  console.log(pc.cyan(pc.bold('\n🤖 CodeSync Agent - 配置向导')));
  console.log(pc.dim('─'.repeat(50)));

  const { default: prompts } = await import('prompts');

  try {
    // 检查是否已存在配置
    const configPath = path.join(process.cwd(), '.codesync-agent.json');
    if (fs.existsSync(configPath) && !options.force) {
      const response = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: '检测到现有配置，是否覆盖？',
        initial: false
      });

      if (!response.overwrite) {
        console.log(pc.yellow('操作已取消'));
        return;
      }
    }

    // 交互式配置
    const questions = [
      {
        type: 'select',
        name: 'strategy',
        message: '选择上传策略:',
        choices: [
          { title: '智能策略（推荐）- 根据文件类型和数量智能判断', value: 'smart' },
          { title: '立即上传 - 文件变化后立即上传', value: 'immediate' },
          { title: '批量上传 - 积累到指定数量后批量上传', value: 'batch' },
          { title: '定时上传 - 按固定间隔定时上传', value: 'scheduled' }
        ],
        initial: 0
      },
      {
        type: (prev) => prev === 'batch' || prev === 'scheduled' ? 'number' : null,
        name: 'batchSize',
        message: '批量上传阈值（文件数量）:',
        initial: 5,
        validate: (value) => value > 0 || '必须大于 0'
      },
      {
        type: (prev) => prev === 'scheduled' ? 'number' : null,
        name: 'interval',
        message: '定时上传间隔（秒）:',
        initial: 60,
        validate: (value) => value > 0 || '必须大于 0'
      },
      {
        type: 'confirm',
        name: 'useAI',
        message: '启用 AI 生成提交信息?',
        initial: true
      },
      {
        type: (prev) => prev ? 'select' : null,
        name: 'convention',
        message: '选择提交规范:',
        choices: [
          { title: 'Angular 规范', value: 'angular' },
          { title: 'Gitmoji 规范', value: 'gitmoji' }
        ],
        initial: 0
      },
      {
        type: (prev) => prev ? 'select' : null,
        name: 'language',
        message: '选择提交语言:',
        choices: [
          { title: '简体中文', value: 'zh' },
          { title: 'English', value: 'en' },
          { title: '日本語', value: 'ja' }
        ],
        initial: 0
      },
      {
        type: 'confirm',
        name: 'autoCommit',
        message: '自动提交变更?',
        initial: true
      },
      {
        type: 'confirm',
        name: 'autoPush',
        message: '自动推送到远程仓库?',
        initial: true
      },
      {
        type: 'confirm',
        name: 'requireConfirmation',
        message: '上传前需要确认?',
        initial: true
      },
      {
        type: 'confirm',
        name: 'notify',
        message: '启用通知?',
        initial: false
      },
      {
        type: 'list',
        name: 'ignored',
        message: '忽略的文件/目录（每行一个，空行结束）:',
        initial: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/.DS_Store',
          '**/*.log'
        ]
      }
    ];

    const response = await prompts(questions);

    if (response.useAI === undefined) {
      console.log(pc.yellow('操作已取消'));
      return;
    }

    // 构建配置
    const config = {
      strategy: response.strategy,
      batchSize: response.batchSize || 5,
      interval: (response.interval || 60) * 1000,
      useAI: response.useAI,
      commitConvention: response.convention || 'angular',
      commitLanguage: response.language || 'zh',
      autoCommit: response.autoCommit,
      autoPush: response.autoPush,
      requireConfirmation: response.requireConfirmation,
      notify: response.notify,
      ignored: response.ignored || [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.DS_Store',
        '**/*.log'
      ]
    };

    // 保存配置
    const spinner = ora(pc.cyan('正在保存配置...')).start();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    spinner.succeed(pc.green('配置已保存'));

    console.log(pc.cyan('\n📁 配置文件:'));
    console.log(pc.dim(`  ${configPath}`));

    console.log(pc.cyan('\n📋 配置内容:'));
    console.log(pc.dim(JSON.stringify(config, null, 2)));

    console.log(pc.cyan('\n🚀 下一步:'));
    console.log(pc.dim('  1. 运行: codesync agent start'));
    console.log(pc.dim('  2. 智能体将自动监听文件变化并上传'));
    console.log(pc.dim('  3. 按 Ctrl+C 停止智能体'));

  } catch (error) {
    console.error(pc.red(`\n❌ 配置失败: ${error.message}`));
    process.exit(1);
  }
}
