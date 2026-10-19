import { GitOperations } from '../../../shared/git/operations.js';
import pc from 'picocolors';
import ora from 'ora';

export async function updateCommand(options) {
  const { path: projectPath } = options;
  const finalPath = projectPath || process.cwd();

  console.log(pc.cyan(pc.bold('\n🔄 CodeSync - 更新项目')));
  console.log(pc.dim('─'.repeat(50)));
  console.log(`  ${pc.bold('项目路径:')} ${finalPath}`);
  console.log(pc.dim('─'.repeat(50)));

  try {
    const git = new GitOperations(finalPath);

    if (!GitOperations.isGitRepository(finalPath)) {
      console.error(pc.red('\n❌ 错误: 当前目录不是 Git 仓库'));
      console.error(pc.dim('💡 提示: 请在 Git 项目目录中运行此命令，或使用 --path 指定项目路径。\n'));
      process.exit(1);
    }

    const spinner = ora(pc.cyan('正在拉取远程更新...')).start();
    await git.pull();
    spinner.succeed(pc.green('更新成功！'));
    console.log();
  } catch (error) {
    console.error(pc.red(`\n❌ 更新失败: ${error.message}`));
    console.error(pc.dim('\n💡 提示: 请检查网络连接和远程仓库配置。\n'));
    process.exit(1);
  }
}