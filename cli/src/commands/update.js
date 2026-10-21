import { pullProject } from '../../../shared/git/upload.js';
import pc from 'picocolors';
import ora from 'ora';

export async function updateCommand(options = {}) {
  const { path: projectPath, remote = 'origin' } = options;
  const finalPath = projectPath || process.cwd();

  console.log(pc.cyan(pc.bold('\n🔄 CodeSync - 多人协同更新项目')));
  console.log(pc.dim('─'.repeat(50)));
  console.log(`  ${pc.bold('项目路径:')} ${finalPath}`);
  console.log(`  ${pc.bold('远程目标:')} ${remote}`);
  console.log(pc.dim('─'.repeat(50)));

  const spinner = ora(pc.cyan('正在准备拉取更新...')).start();

  try {
    const result = await pullProject({
      projectPath: finalPath,
      remote,
      onProgress: (percent, msg) => {
        spinner.text = pc.cyan(`[${percent}%] ${msg}`);
      }
    });

    spinner.succeed(pc.green('更新成功！'));
    console.log(pc.dim('─'.repeat(50)));
    console.log(`  ${pc.bold('分支:')}     ${result.branch}`);
    console.log(`  ${pc.bold('状态:')}     ${pc.green(result.message)}`);
    console.log(pc.dim('─'.repeat(50) + '\n'));
  } catch (error) {
    spinner.fail(pc.red('更新失败'));
    console.error(pc.red(`\n❌ ${error.message}`));
    if (error.isConflict) {
      console.error(pc.yellow('\n💡 智能体建议：请按照上方提供的建议手动消除冲突标记后，再运行 codesync push 完成同步。\n'));
    } else {
      console.error(pc.dim('\n💡 提示: 请检查网络连接和远程仓库配置。\n'));
    }
    process.exit(1);
  }
}