import { uploadProject } from '../../../shared/git/upload.js';
import path from 'path';
import { GitOperations } from '../../../shared/git/operations.js';

export async function uploadCommand(options) {
  const { path: projectPath, platform, name, description, private: isPrivate } = options;

  // 默认值
  const finalPath = projectPath || process.cwd();
  const finalPlatform = platform || 'github';
  const finalName = name || path.basename(finalPath);
  const finalDescription = description || '';
  const finalIsPrivate = isPrivate || false;

  console.log('📦 CodeSync - 上传项目');
  console.log('─'.repeat(50));
  console.log(`项目路径: ${finalPath}`);
  console.log(`平台: ${finalPlatform}`);
  console.log(`仓库名称: ${finalName}`);
  console.log('─'.repeat(50));

  try {
    const repoUrl = await uploadProject({
      projectPath: finalPath,
      platform: finalPlatform,
      repoName: finalName,
      description: finalDescription,
      isPrivate: finalIsPrivate,
      onProgress: (percent, message) => {
        console.log(`[${percent}%] ${message}`);
      }
    });

    console.log('─'.repeat(50));
    console.log(`✅ 上传成功！`);
    console.log(`📦 仓库地址: ${repoUrl}`);
    console.log('─'.repeat(50));
  } catch (error) {
    console.error('❌ 上传失败:', error.message);
    process.exit(1);
  }
}
