import { CodeSyncAgent } from '../../../shared/agent/agent.js';
import pc from 'picocolors';
import ora from 'ora';
import fs from 'fs';
import path from 'path';

export async function agentCommand(action, options) {
  console.log(pc.cyan(pc.bold('\n🤖 CodeSync Agent - 智能代码上传助手')));
  console.log(pc.dim('─'.repeat(50)));

  try {
    switch (action) {
      case 'start':
        await handleStart(options);
        break;
      case 'stop':
        await handleStop();
        break;
      case 'status':
        await handleStatus();
        break;
      case 'config':
        await handleConfig(options);
        break;
      default:
        console.error(pc.red('❌ 未知的操作类型'));
        console.log(pc.dim('可用操作: start, stop, status, config'));
        process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`\n❌ 操作失败: ${error.message}`));
    process.exit(1);
  }
}

async function handleStart(options) {
  const spinner = ora(pc.cyan('正在启动智能体...')).start();

  try {
    // 尝试加载配置文件
    let config = {};
    const configPath = path.join(process.cwd(), '.codesync-agent.json');
    
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(configContent);
      console.log(pc.dim('  已加载配置文件: .codesync-agent.json'));
    }

    // 命令行选项优先级高于配置文件
    const agentConfig = {
      projectPath: options.path,
      strategy: options.strategy || config.strategy || 'smart',
      batchSize: options.batchSize || config.batchSize || 5,
      interval: (options.interval || (config.interval / 1000) || 60) * 1000,
      autoCommit: options.noCommit ? false : (config.autoCommit !== false),
      autoPush: options.noPush ? false : (config.autoPush !== false),
      commitConvention: options.convention || config.commitConvention || 'angular',
      commitLanguage: options.language || config.commitLanguage || 'zh',
      useAI: options.noAi ? false : (config.useAI !== false),
      requireConfirmation: options.yes ? false : (config.requireConfirmation !== false),
      notify: options.notify || config.notify || false,
      ignored: config.ignored || []
    };

    const agent = new CodeSyncAgent(agentConfig);

    spinner.succeed(pc.green('智能体配置完成'));

    // 启动智能体
    await agent.start();

    // 保存智能体实例到全局（用于 stop 命令）
    global.codeSyncAgent = agent;

    // 处理优雅关闭
    process.on('SIGINT', async () => {
      console.log(pc.yellow('\n\n收到停止信号...'));
      await agent.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log(pc.yellow('\n\n收到终止信号...'));
      await agent.stop();
      process.exit(0);
    });

  } catch (error) {
    spinner.fail(pc.red('启动失败'));
    throw error;
  }
}

async function handleStop() {
  const spinner = ora(pc.cyan('正在停止智能体...')).start();

  try {
    const agent = global.codeSyncAgent;
    
    if (!agent) {
      spinner.warn(pc.yellow('智能体未运行'));
      return;
    }

    await agent.stop();
    delete global.codeSyncAgent;

    spinner.succeed(pc.green('智能体已停止'));
  } catch (error) {
    spinner.fail(pc.red('停止失败'));
    throw error;
  }
}

async function handleStatus() {
  const agent = global.codeSyncAgent;

  if (!agent) {
    console.log(pc.yellow('⚠️  智能体未运行'));
    return;
  }

  const status = agent.getStatus();

  console.log(pc.cyan('\n📊 智能体状态:'));
  console.log(pc.dim('─'.repeat(50)));
  console.log(pc.dim(`  运行状态: ${status.isRunning ? '运行中' : '已停止'}`));
  console.log(pc.dim(`  待处理文件: ${status.pendingFiles.length}`));
  console.log(pc.dim(`  总提交数: ${status.stats.totalCommits}`));
  console.log(pc.dim(`  总文件数: ${status.stats.totalFiles}`));
  
  if (status.stats.lastCommitTime) {
    console.log(pc.dim(`  最后提交: ${status.stats.lastCommitTime.toLocaleString()}`));
  }

  if (status.pendingFiles.length > 0) {
    console.log(pc.cyan('\n  待处理文件列表:'));
    status.pendingFiles.forEach(file => {
      console.log(pc.dim(`    - ${file}`));
    });
  }

  console.log(pc.cyan('\n⚙️  配置:'));
  console.log(pc.dim(`  策略: ${status.config.strategy}`));
  console.log(pc.dim(`  AI 生成: ${status.config.useAI ? '启用' : '禁用'}`));
  console.log(pc.dim(`  自动提交: ${status.config.autoCommit ? '启用' : '禁用'}`));
  console.log(pc.dim(`  自动推送: ${status.config.autoPush ? '启用' : '禁用'}`));
}

async function handleConfig(options) {
  console.log(pc.cyan('\n⚙️  智能体配置说明:'));
  console.log(pc.dim('─'.repeat(50)));

  console.log(pc.cyan('\n📋 上传策略:'));
  console.log(pc.dim('  immediate  - 文件变化后立即上传'));
  console.log(pc.dim('  batch      - 积累到指定数量后批量上传'));
  console.log(pc.dim('  smart      - 智能判断（推荐）'));
  console.log(pc.dim('  scheduled  - 定时上传'));

  console.log(pc.cyan('\n📋 使用示例:'));
  console.log(pc.dim('  codesync agent start'));
  console.log(pc.dim('  codesync agent start --strategy immediate'));
  console.log(pc.dim('  codesync agent start --strategy batch --batch-size 10'));
  console.log(pc.dim('  codesync agent start --strategy scheduled --interval 120'));
  console.log(pc.dim('  codesync agent start --no-ai --yes'));
  console.log(pc.dim('  codesync agent start --no-push'));

  console.log(pc.cyan('\n📋 选项说明:'));
  console.log(pc.dim('  --strategy <type>       上传策略 (default: smart)'));
  console.log(pc.dim('  --batch-size <number>    批量上传阈值 (default: 5)'));
  console.log(pc.dim('  --interval <seconds>     定时上传间隔 (default: 60)'));
  console.log(pc.dim('  --no-commit              禁用自动提交'));
  console.log(pc.dim('  --no-push                禁用自动推送'));
  console.log(pc.dim('  --no-ai                  禁用 AI 生成提交信息'));
  console.log(pc.dim('  --yes                    跳过确认提示'));
  console.log(pc.dim('  --notify                 启用通知'));
  console.log(pc.dim('  --convention <type>      提交规范 (angular/gitmoji)'));
  console.log(pc.dim('  --language <lang>        提交语言 (zh/en/ja)'));
  console.log(pc.dim('  --path <path>            项目路径'));
}
