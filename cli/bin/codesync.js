#!/usr/bin/env node

import { Command } from 'commander';
import { uploadCommand } from '../src/commands/upload.js';
import { downloadCommand } from '../src/commands/download.js';
import { updateCommand } from '../src/commands/update.js';
import { aiCommand } from '../src/commands/ai.js';
import { configCommand } from '../src/commands/config.js';

const program = new Command();

program
  .name('codesync')
  .description('CodeSync - 简化Git操作 + AI代码助手')
  .version('2.0.0');

// 上传项目
program
  .command('upload')
  .description('上传当前项目到远程仓库')
  .option('-p, --path <path>', '项目路径（默认当前目录）')
  .option('-P, --platform <platform>', '平台 (github/gitee/gitlab)')
  .option('-n, --name <name>', '仓库名称')
  .option('-d, --description <desc>', '仓库描述')
  .option('--private', '创建私有仓库')
  .action(uploadCommand);

// 下载项目
program
  .command('download')
  .description('从远程仓库下载项目')
  .argument('<url>', '仓库URL')
  .option('-p, --path <path>', '下载路径（默认当前目录）')
  .option('--install', '自动安装依赖')
  .action(downloadCommand);

// 更新项目
program
  .command('update')
  .description('更新当前项目')
  .option('-p, --path <path>', '项目路径（默认当前目录）')
  .action(updateCommand);

// AI功能
program
  .command('ai')
  .description('AI助手功能')
  .argument('<action>', '操作类型 (commit/annotate/explain/review)')
  .option('-f, --file <file>', '文件路径')
  .option('-l, --language <lang>', '编程语言')
  .action(aiCommand);

// 配置管理
program
  .command('config')
  .description('配置管理')
  .option('-s, --set <key=value>', '设置配置')
  .option('-l, --list', '列出所有配置')
  .action(configCommand);

program.parse(process.argv);
