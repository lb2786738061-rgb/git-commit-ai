import { downloadProject } from '../../../shared/git/download.js';

export async function downloadCommand(url, options) {
  const { path: targetPath, install } = options;

  // 默认值
  const finalPath = targetPath || process.cwd();
  const installDeps = install || false;

  console.log('📥 CodeSync - 下载项目');
  console.log('─'.repeat(50));
  console.log(`仓库地址: ${url}`);
  console.log(`下载路径: ${finalPath}`);
  console.log(`自动安装依赖: ${installDeps ? '是' : '否'}`);
  console.log('─'.repeat(50));

  try {
    const projectPath = await downloadProject({
      repoUrl: url,
      targetPath: finalPath,
      installDeps: installDeps,
      onProgress: (percent, message) => {
        console.log(`[${percent}%] ${message}`);
      }
    });

    console.log('─'.repeat(50));
    console.log(`✅ 下载成功！`);
    console.log(`📁 项目路径: ${projectPath}`);
    console.log('─'.repeat(50));
  } catch (error) {
    console.error('❌ 下载失败:', error.message);
    process.exit(1);
  }
}
