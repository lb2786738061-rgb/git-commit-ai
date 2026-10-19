import { uploadProject } from '../../../shared/git/upload.js';
import path from 'path';
import { GitOperations } from '../../../shared/git/operations.js';
import pc from 'picocolors';
import ora from 'ora';

export async function uploadCommand(options) {
  const { path: projectPath, platform, name, description, private: isPrivate } = options;

  const finalPath = projectPath || process.cwd();
  const finalPlatform = platform || 'github';
  const finalName = name || path.basename(finalPath);
  const finalDescription = description || '';
  const finalIsPrivate = isPrivate || false;

  console.log(pc.cyan(pc.bold('\n📦 CodeSync - 上传项目')));
  console.log(pc.dim('─'.repeat(50)));
  console.log(`  ${pc.bold('项目路径:')} ${finalPath}`);
  console.log(`  ${pc.bold('平台:')}     ${finalPlatform}`);
  console.log(`  ${pc.bold('仓库名称:')} ${finalName}`);
  if (finalIsPrivate) console.log(`  ${pc.bold('可见性:')}   私有`);
  console.log(pc.dim('─'.repeat(50)));

  const { default: prompts } = await import('prompts');
  const confirm = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: '确认上传项目?',
    initial: true
  });

  if (!confirm.proceed) {
    console.log(pc.yellow('\n操作已取消。'));
    return;
  }

  const spinner = ora(pc.cyan('正在上传项目...')).start();

  try {
    const repoUrl = await uploadProject({
      projectPath: finalPath,
      platform: finalPlatform,
      repoName: finalName,
      description: finalDescription,
      isPrivate: finalIsPrivate,
      onProgress: (percent, message) => {
        spinner.text = pc.cyan(`[${percent}%] ${message}`);
      }
    });

    spinner.succeed(pc.green('上传成功！'));
    console.log(pc.dim('─'.repeat(50)));
    console.log(`  ${pc.bold('仓库地址:')} ${pc.blue(repoUrl)}`);
    console.log(pc.dim('─'.repeat(50) + '\n'));
  } catch (error) {
    spinner.fail(pc.red('上传失败'));
    console.error(pc.red(`\n❌ 错误: ${error.message}`));
    console.error(pc.dim('\n💡 提示: 请检查网络连接和平台 Token 配置。\n'));
    process.exit(1);
  }
}