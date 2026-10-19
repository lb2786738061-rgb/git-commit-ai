#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('codesync')
  .description('CodeSync - 简化Git操作 + AI代码助手')
  .version('2.0.0');

program
  .command('upload')
  .description('上传当前项目到远程仓库')
  .action(() => console.log('upload command'));

program
  .command('config')
  .description('配置管理')
  .option('-l, --list', '列出所有配置')
  .action(() => console.log('config command'));

console.log('Before parse');
program.parse(['node', 'test', '--help']);
console.log('After parse');