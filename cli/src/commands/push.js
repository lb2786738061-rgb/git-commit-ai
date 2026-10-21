import { syncProject } from '../../../shared/git/upload.js';
import pc from 'picocolors';
import ora from 'ora';

export async function pushCommand(options) {
  const { path: projectPath, message, bypassHooks } = options;
  const finalPath = projectPath || process.cwd();

  console.log(pc.cyan(pc.bold('\n🚀 CodeSync - 提交并推送')));
  console.log(pc.dim('─'.repeat(50)));
  console.log(`  ${pc.bold('项目路径:')} ${finalPath}`);
  console.log(pc.dim('─'.repeat(50)));

  const spinner = ora(pc.cyan('正在同步...')).start();

  try {
    const result = await syncProject({
      projectPath: finalPath,
      message,
      bypassHooks: bypassHooks === true,
      onProgress: (percent, msg) => {
        spinner.text = pc.cyan(`[${percent}%] ${msg}`);
      }
    });

    if (!result.committed && !result.pulled) {
      spinner.info(pc.yellow('没有需要提交或拉取的更改'));
      return;
    }

    spinner.succeed(pc.green('协同同步成功！'));
    console.log(pc.dim('─'.repeat(50)));
    if (result.commitMessage) {
      console.log(`  ${pc.bold('提交信息:')} ${result.commitMessage}`);
    }
    console.log(`  ${pc.bold('当前分支:')} ${result.branch}`);
    console.log(`  ${pc.bold('同步状态:')} ${pc.green(result.committed ? '已融合远程并推送到远端' : '已拉取最新代码，工作区已是最新')}`);
    console.log(pc.dim('─'.repeat(50) + '\n'));
  } catch (error) {
    spinner.fail(pc.red('同步失败'));
    console.error(pc.red(`\n❌ ${error.message}`));
    if (error.isConflict) {
      console.error(pc.yellow('\n💡 智能体建议：请按照上方提示解决冲突后，再次运行 codesync push 完成同步。\n'));
    } else {
      console.error(pc.dim('\n💡 提示: 请检查网络连接、远程仓库配置和 Git 钩子校验。\n'));
    }
    process.exit(1);
  }
}
