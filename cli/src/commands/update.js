import { GitOperations } from '../../../shared/git/operations.js';

export async function updateCommand(options) {
  const { path: projectPath } = options;

  const finalPath = projectPath || process.cwd();

  console.log('🔄 CodeSync - 更新项目');
  console.log('─'.repeat(50));
  console.log(`项目路径: ${finalPath}`);
  console.log('─'.repeat(50));

  try {
    const git = new GitOperations(finalPath);

    // 检查是否是 Git 仓库
    if (!GitOperations.isGitRepository(finalPath)) {
      throw new Error('当前目录不是 Git 仓库');
    }

    // 拉取更新
    console.log('拉取远程更新...');
    await git.pull();

    console.log('─'.repeat(50));
    console.log('✅ 更新成功！');
    console.log('─'.repeat(50));
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    process.exit(1);
  }
}
