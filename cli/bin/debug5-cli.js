#!/usr/bin/env node
console.log('DEBUG 1: Starting');
import { Command } from 'commander';
console.log('DEBUG 2: Commander imported');

const { uploadCommand } = await import('../src/commands/upload.js');
const { downloadCommand } = await import('../src/commands/download.js');
const { updateCommand } = await import('../src/commands/update.js');
const { aiCommand } = await import('../src/commands/ai.js');
const { configCommand } = await import('../src/commands/config.js');
const { teamCommand } = await import('../src/commands/team.js');
const { cacheCommand } = await import('../src/commands/cache.js');
const { gitCommand } = await import('../src/commands/git.js');
console.log('DEBUG 3: All commands imported');

const program = new Command();
console.log('DEBUG 4: Program created');

program.name('codesync').version('2.0.0').description('CodeSync - 简化Git操作 + AI代码助手');
console.log('DEBUG 5: Basic info set');

program.command('upload').description('上传当前项目').action(uploadCommand);
program.command('download').description('下载项目').argument('<url>').action(downloadCommand);
program.command('update').description('更新项目').action(updateCommand);
program.command('ai').description('AI助手').argument('<action>').action(aiCommand);
program.command('config').description('配置').action(configCommand);
program.command('team').description('团队').action(teamCommand);
program.command('cache').description('缓存').action(cacheCommand);
program.command('git').description('Git扩展').argument('<action>').action(gitCommand);

console.log('DEBUG 6: All commands registered');
console.log('DEBUG 7: Before parse');

program.parse(process.argv);

console.log('DEBUG 8: After parse');