import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import pc from 'picocolors';
import ora from 'ora';

export async function dashboardCommand(options) {
  console.log(pc.cyan(pc.bold('\n📊 CodeSync - Web Dashboard')));
  console.log(pc.dim('─'.repeat(50)));

  const { port = 3001 } = options;
  const cwd = process.cwd();
  const dashboardDir = path.join(cwd, 'codesync-dashboard');

  const spinner = ora(pc.cyan('正在启动 Dashboard...')).start();

  // 检查 dashboard 是否已安装
  if (!fs.existsSync(dashboardDir)) {
    spinner.warn(pc.yellow('Dashboard 未安装'));
    console.log(pc.dim('  正在自动安装...'));

    // 安装 dashboard
    await installDashboard(cwd, dashboardDir);
  }

  // 启动 dashboard
  const serverPath = path.join(dashboardDir, 'src', 'server.js');

  if (!fs.existsSync(serverPath)) {
    spinner.fail(pc.red('Dashboard 文件损坏'));
    console.log(pc.dim('  请重新安装: codesync dashboard --install'));
    return;
  }

  const dashboardProcess = spawn('node', [serverPath], {
    cwd: dashboardDir,
    stdio: 'inherit',
    env: { ...process.env, PORT: port }
  });

  dashboardProcess.on('error', (error) => {
    spinner.fail(pc.red('启动失败'));
    console.error(pc.red(error.message));
    process.exit(1);
  });

  spinner.succeed(pc.green('Dashboard 已启动'));

  console.log(pc.cyan('\n🌐 访问地址:'));
  console.log(pc.dim(`  http://localhost:${port}`));

  console.log(pc.cyan('\n💡 提示:'));
  console.log(pc.dim('  按 Ctrl+C 停止 Dashboard'));

  // 处理优雅关闭
  process.on('SIGINT', () => {
    console.log(pc.yellow('\n正在停止 Dashboard...'));
    dashboardProcess.kill();
    process.exit(0);
  });
}

async function installDashboard(cwd, dashboardDir) {
  const spinner = ora(pc.cyan('正在安装 Dashboard...')).start();

  try {
    // 创建目录
    fs.mkdirSync(dashboardDir, { recursive: true });

    // 复制 dashboard 文件
    const projectRoot = path.resolve(cwd, '..');
    const sourceDashboardDir = path.join(projectRoot, 'dashboard');

    if (!fs.existsSync(sourceDashboardDir)) {
      spinner.fail(pc.red('找不到 Dashboard 源代码'));
      console.log(pc.dim('  请确保在项目根目录运行此命令'));
      return;
    }

    copyDirectory(sourceDashboardDir, dashboardDir);

    // 安装依赖
    const { execSync } = await import('child_process');
    execSync('npm install', { cwd: dashboardDir, stdio: 'inherit' });

    spinner.succeed(pc.green('Dashboard 安装成功'));
  } catch (error) {
    spinner.fail(pc.red('安装失败'));
    console.error(pc.red(error.message));
    process.exit(1);
  }
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
