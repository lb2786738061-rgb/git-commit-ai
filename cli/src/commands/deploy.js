import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import ora from 'ora';

// 部署平台配置
const DEPLOY_PLATFORMS = {
  vercel: {
    name: 'Vercel',
    description: '自动部署到 Vercel',
    webhook: 'https://api.vercel.com/v1/integrations/deploy',
    config: {
      projectId: '',
      teamId: '',
      token: ''
    }
  },
  netlify: {
    name: 'Netlify',
    description: '自动部署到 Netlify',
    webhook: 'https://api.netlify.com/build_hooks',
    config: {
      siteId: '',
      token: ''
    }
  },
  docker: {
    name: 'Docker',
    description: '自动构建 Docker 镜像',
    script: `#!/bin/sh
# Docker Build Hook
# 推送后自动构建 Docker 镜像

IMAGE_NAME="your-image-name"
TAG=\$(git rev-parse --short HEAD)

echo "🐳 Building Docker image: \$IMAGE_NAME:\$TAG"
docker build -t \$IMAGE_NAME:\$TAG .

echo "🐳 Pushing to registry..."
docker push \$IMAGE_NAME:\$TAG

echo "✅ Docker build complete"
`
  },
  npm: {
    name: 'NPM',
    description: '自动发布到 NPM',
    script: `#!/bin/sh
# NPM Publish Hook
# 推送 tag 后自动发布到 NPM

if [ -n "\$(git tag --points-at HEAD)" ]; then
  echo "📦 Publishing to NPM..."
  npm publish
  echo "✅ Published to NPM"
else
  echo "ℹ️  No tag, skipping publish"
fi
`
  }
};

export async function deployCommand(action, options) {
  console.log(pc.cyan(pc.bold('\n🚀 CodeSync - 自动化部署')));
  console.log(pc.dim('─'.repeat(50)));

  try {
    switch (action) {
      case 'hook':
        await handleHook(options);
        break;
      case 'list':
        await handleList();
        break;
      default:
        console.error(pc.red('❌ 未知的操作类型'));
        console.log(pc.dim('可用操作: hook, list'));
        process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`\n❌ 操作失败: ${error.message}`));
    process.exit(1);
  }
}

async function handleHook(options) {
  const { platform } = options;

  if (!platform) {
    console.error(pc.red('❌ 缺少平台参数'));
    console.log(pc.dim('  使用: codesync deploy hook --platform <platform>'));
    console.log(pc.dim('  可用平台: vercel, netlify, docker, npm'));
    return;
  }

  const spinner = ora(pc.cyan(`正在配置 ${platform} 部署钩子...`)).start();

  const deployConfig = DEPLOY_PLATFORMS[platform];

  if (!deployConfig) {
    spinner.fail(pc.red('未知的部署平台'));
    console.log(pc.dim('  可用平台: ' + Object.keys(DEPLOY_PLATFORMS).join(', ')));
    return;
  }

  const cwd = process.cwd();
  const hooksDir = path.join(cwd, '.git', 'hooks');

  // 检查是否在 Git 仓库中
  if (!fs.existsSync(hooksDir)) {
    spinner.fail(pc.red('当前目录不是 Git 仓库'));
    return;
  }

  // 创建 post-commit 钩子
  const hookFile = path.join(hooksDir, 'post-commit');

  if (deployConfig.script) {
    fs.writeFileSync(hookFile, deployConfig.script, 'utf-8');
    
    // 设置可执行权限
    try {
      fs.chmodSync(hookFile, 0o755);
    } catch (error) {
      // Windows 可能不支持 chmod
    }

    spinner.succeed(pc.green(`${deployConfig.name} 部署钩子配置成功`));

    console.log(pc.cyan('\n📋 配置信息:'));
    console.log(pc.dim(`  平台: ${deployConfig.name}`));
    console.log(pc.dim(`  描述: ${deployConfig.description}`));
    console.log(pc.dim(`  钩子文件: ${hookFile}`));

    console.log(pc.cyan('\n💡 提示:'));
    console.log(pc.dim('  钩子将在每次提交后自动运行'));
    console.log(pc.dim('  请根据需要修改钩子脚本中的配置'));
  } else {
    spinner.fail(pc.red('该平台暂不支持自动钩子配置'));
    console.log(pc.dim('  请手动配置 Webhook'));
  }
}

async function handleList() {
  console.log(pc.cyan('\n📋 支持的部署平台:'));
  console.log(pc.dim('─'.repeat(50)));

  Object.entries(DEPLOY_PLATFORMS).forEach(([key, config]) => {
    console.log(pc.cyan(`\n  ${key}`));
    console.log(pc.dim(`    ${config.name}`));
    console.log(pc.dim(`    ${config.description}`));
  });

  console.log(pc.cyan('\n💡 使用方法:'));
  console.log(pc.dim('  codesync deploy hook --platform vercel'));
  console.log(pc.dim('  codesync deploy hook --platform docker'));
}
