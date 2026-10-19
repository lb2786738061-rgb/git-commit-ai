import { downloadProject } from '../../../shared/git/download.js';
import pc from 'picocolors';
import ora from 'ora';

export async function downloadCommand(url, options) {
  const { path: targetPath, install } = options;

  const finalPath = targetPath || process.cwd();
  const installDeps = install || false;

  console.log(pc.cyan(pc.bold('\n📥 CodeSync - 下载项目')));
  console.log(pc.dim('─'.repeat(50)));
  console.log(`  ${pc.bold('仓库地址:')}     ${url}`);
  console.log(`  ${pc.bold('下载路径:')}     ${finalPath}`);
  console.log(`  ${pc.bold('自动安装依赖:')} ${installDeps ? pc.green('是') : pc.red('否')}`);
  console.log(pc.dim('─'.repeat(50)));

  const spinner = ora(pc.cyan('正在下载项目...')).start();

  try {
    const projectPath = await downloadProject({
      repoUrl: url,
      targetPath: finalPath,
      installDeps: installDeps,
      onProgress: (percent, message) => {
        spinner.text = pc.cyan(`[${percent}%] ${message}`);
      }
    });

    spinner.succeed(pc.green('下载成功！'));
    console.log(pc.dim('─'.repeat(50)));
    console.log(`  ${pc.bold('项目路径:')} ${projectPath}`);
    console.log(pc.dim('─'.repeat(50) + '\n'));
  } catch (error) {
    spinner.fail(pc.red('下载失败'));
    console.error(pc.red(`\n❌ 错误: ${error.message}`));
    console.error(pc.dim('\n💡 提示: 请检查仓库 URL 是否正确以及网络连接。\n'));
    process.exit(1);
  }
}