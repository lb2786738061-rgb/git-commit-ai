import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import ora from 'ora';

export async function reviewBotCommand(action, options) {
  console.log(pc.cyan(pc.bold('\n🤖 CodeSync - AI 代码审查 Bot')));
  console.log(pc.dim('─'.repeat(50)));

  try {
    switch (action) {
      case 'install':
        await handleInstall(options);
        break;
      case 'uninstall':
        await handleUninstall();
        break;
      case 'start':
        await handleStart(options);
        break;
      case 'config':
        await handleConfig();
        break;
      default:
        console.error(pc.red('❌ 未知的操作类型'));
        console.log(pc.dim('可用操作: install, uninstall, start, config'));
        process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`\n❌ 操作失败: ${error.message}`));
    process.exit(1);
  }
}

async function handleInstall(options) {
  const spinner = ora(pc.cyan('正在安装 AI 代码审查 Bot...')).start();

  const cwd = process.cwd();
  const botDir = path.join(cwd, 'codesync-review-bot');

  // Check if already installed
  if (fs.existsSync(botDir)) {
    spinner.warn(pc.yellow('AI 代码审查 Bot 已安装'));
    console.log(pc.dim(`  目录: ${botDir}`));
    return;
  }

  // Create bot directory
  fs.mkdirSync(botDir, { recursive: true });

  // Copy bot files from project
  const projectRoot = path.resolve(cwd, '..');
  const sourceBotDir = path.join(projectRoot, 'review-bot');

  if (!fs.existsSync(sourceBotDir)) {
    spinner.fail(pc.red('找不到 review-bot 源代码'));
    console.log(pc.dim('  请确保在项目根目录运行此命令'));
    return;
  }

  // Copy files
  copyDirectory(sourceBotDir, botDir);

  // Create .env file from example
  const envExample = path.join(botDir, '.env.example');
  const envFile = path.join(botDir, '.env');

  if (fs.existsSync(envExample) && !fs.existsSync(envFile)) {
    fs.copyFileSync(envExample, envFile);
  }

  spinner.succeed(pc.green('AI 代码审查 Bot 安装成功'));

  console.log(pc.cyan('\n📁 安装位置:'));
  console.log(pc.dim(`  ${botDir}`));

  console.log(pc.cyan('\n📋 下一步:'));
  console.log(pc.dim('  1. 编辑 .env 文件配置 API Key 和 Token'));
  console.log(pc.dim('  2. 运行: cd codesync-review-bot && npm install'));
  console.log(pc.dim('  3. 启动: npm start'));
  console.log(pc.dim('  4. 配置 Webhook:'));
  console.log(pc.dim('     GitHub: http://your-server:3000/webhook/github'));
  console.log(pc.dim('     GitLab: http://your-server:3000/webhook/gitlab'));
}

async function handleUninstall() {
  const spinner = ora(pc.cyan('正在卸载 AI 代码审查 Bot...')).start();

  const cwd = process.cwd();
  const botDir = path.join(cwd, 'codesync-review-bot');

  if (!fs.existsSync(botDir)) {
    spinner.warn(pc.yellow('AI 代码审查 Bot 未安装'));
    return;
  }

  // Remove directory
  fs.rmSync(botDir, { recursive: true, force: true });

  spinner.succeed(pc.green('AI 代码审查 Bot 卸载成功'));
}

async function handleStart(options) {
  const { port } = options;
  const cwd = process.cwd();
  const botDir = path.join(cwd, 'codesync-review-bot');

  if (!fs.existsSync(botDir)) {
    console.error(pc.red('AI 代码审查 Bot 未安装'));
    console.log(pc.dim('请先运行: codesync review-bot install'));
    process.exit(1);
  }

  const spinner = ora(pc.cyan('正在启动 AI 代码审查 Bot...')).start();

  // Set port if provided
  if (port) {
    process.env.PORT = port;
  }

  try {
    // Start the bot
    const { spawn } = await import('child_process');
    const serverPath = path.join(botDir, 'src', 'server.js');

    const botProcess = spawn('node', [serverPath], {
      cwd: botDir,
      stdio: 'inherit',
      env: { ...process.env }
    });

    botProcess.on('error', (error) => {
      spinner.fail(pc.red('启动失败'));
      console.error(pc.red(error.message));
      process.exit(1);
    });

    spinner.succeed(pc.green('AI 代码审查 Bot 已启动'));

    console.log(pc.cyan('\n📡 Webhook 端点:'));
    console.log(pc.dim(`  GitHub: http://localhost:${port || 3000}/webhook/github`));
    console.log(pc.dim(`  GitLab: http://localhost:${port || 3000}/webhook/gitlab`));
    console.log(pc.dim(`  Health: http://localhost:${port || 3000}/health`));

    console.log(pc.cyan('\n💡 提示:'));
    console.log(pc.dim('  按 Ctrl+C 停止 Bot'));

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(pc.yellow('\n正在停止 Bot...'));
      botProcess.kill();
      process.exit(0);
    });
  } catch (error) {
    spinner.fail(pc.red('启动失败'));
    console.error(pc.red(error.message));
    process.exit(1);
  }
}

async function handleConfig() {
  const cwd = process.cwd();
  const botDir = path.join(cwd, 'codesync-review-bot');
  const envFile = path.join(botDir, '.env');

  if (!fs.existsSync(envFile)) {
    console.error(pc.red('配置文件不存在'));
    console.log(pc.dim('请先运行: codesync review-bot install'));
    process.exit(1);
  }

  console.log(pc.cyan('\n📝 当前配置 (.env):'));
  console.log(pc.dim('─'.repeat(50)));

  const content = fs.readFileSync(envFile, 'utf-8');
  const lines = content.split('\n');

  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');

      // Mask sensitive values
      if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret')) {
        console.log(pc.dim(`  ${key}=********`));
      } else {
        console.log(pc.dim(`  ${key}=${value}`));
      }
    }
  });

  console.log(pc.cyan('\n💡 编辑配置:'));
  console.log(pc.dim(`  ${envFile}`));
}

function copyDirectory(source, destination) {
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
