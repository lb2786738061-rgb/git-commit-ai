import { readConfig } from '../../../shared/config.js';
import pc from 'picocolors';
import ora from 'ora';
import os from 'os';
import path from 'path';
import fs from 'fs';

export async function cacheCommand(options) {
  const { clear, stats } = options;

  console.log(pc.cyan(pc.bold('\n💾 CodeSync - 缓存管理')));
  console.log(pc.dim('─'.repeat(50)));

  try {
    if (clear) {
      await handleClear();
    } else if (stats) {
      handleStats();
    } else {
      handleStats();
    }
  } catch (error) {
    console.error(pc.red(`\n❌ 操作失败: ${error.message}`));
    process.exit(1);
  }
}

function handleStats() {
  const config = readConfig();
  const cacheDir = path.join(os.tmpdir(), 'git-commit-ai-cache');

  if (!fs.existsSync(cacheDir)) {
    console.log(pc.yellow('⚠️  缓存目录不存在'));
    console.log(pc.dim('缓存将在首次使用时自动创建。'));
    return;
  }

  const files = fs.readdirSync(cacheDir);
  let totalSize = 0;
  let validCount = 0;
  let expiredCount = 0;
  const now = Date.now();
  const ttl = config.cacheTTL || 3600000;

  for (const file of files) {
    try {
      const filePath = path.join(cacheDir, file);
      const stat = fs.statSync(filePath);
      totalSize += stat.size;

      if (now - stat.mtimeMs < ttl) {
        validCount++;
      } else {
        expiredCount++;
      }
    } catch (_) {}
  }

  console.log(`  ${pc.bold('缓存目录:')}   ${cacheDir}`);
  console.log(`  ${pc.bold('缓存条目:')}   ${pc.blue(files.length)} 个`);
  console.log(`  ${pc.bold('有效条目:')}   ${pc.green(validCount)} 个`);
  console.log(`  ${pc.bold('过期条目:')}   ${pc.yellow(expiredCount)} 个`);
  console.log(`  ${pc.bold('总大小:')}     ${formatSize(totalSize)}`);
  console.log(`  ${pc.bold('TTL:')}        ${pc.blue(formatDuration(ttl))}`);
  console.log(pc.dim('─'.repeat(50) + '\n'));
}

async function handleClear() {
  const cacheDir = path.join(os.tmpdir(), 'git-commit-ai-cache');

  if (!fs.existsSync(cacheDir)) {
    console.log(pc.yellow('⚠️  缓存目录不存在，无需清除。'));
    return;
  }

  const spinner = ora(pc.cyan('正在清除缓存...')).start();

  const files = fs.readdirSync(cacheDir);
  let cleared = 0;

  for (const file of files) {
    try {
      fs.unlinkSync(path.join(cacheDir, file));
      cleared++;
    } catch (_) {}
  }

  spinner.succeed(pc.green(`缓存已清除: ${cleared} 个条目`));
  console.log();
}

function formatSize(bytes) {
  if (bytes < 1024) return pc.blue(`${bytes} B`);
  if (bytes < 1024 * 1024) return pc.blue(`${(bytes / 1024).toFixed(1)} KB`);
  return pc.blue(`${(bytes / (1024 * 1024)).toFixed(1)} MB`);
}

function formatDuration(ms) {
  if (ms < 60000) return `${ms / 1000} 秒`;
  if (ms < 3600000) return `${ms / 60000} 分钟`;
  return `${ms / 3600000} 小时`;
}