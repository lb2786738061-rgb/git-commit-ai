#!/usr/bin/env node
console.log('DEBUG: Starting');
import { Command } from 'commander';
console.log('DEBUG: Commander imported');

const { uploadCommand } = await import('../src/commands/upload.js');
console.log('DEBUG: uploadCommand imported:', typeof uploadCommand);

const { downloadCommand } = await import('../src/commands/download.js');
console.log('DEBUG: downloadCommand imported:', typeof downloadCommand);

const { updateCommand } = await import('../src/commands/update.js');
console.log('DEBUG: updateCommand imported:', typeof updateCommand);

const { aiCommand } = await import('../src/commands/ai.js');
console.log('DEBUG: aiCommand imported:', typeof aiCommand);

const { configCommand } = await import('../src/commands/config.js');
console.log('DEBUG: configCommand imported:', typeof configCommand);

const { teamCommand } = await import('../src/commands/team.js');
console.log('DEBUG: teamCommand imported:', typeof teamCommand);

const { cacheCommand } = await import('../src/commands/cache.js');
console.log('DEBUG: cacheCommand imported:', typeof cacheCommand);

const { gitCommand } = await import('../src/commands/git.js');
console.log('DEBUG: gitCommand imported:', typeof gitCommand);

console.log('DEBUG: All imports succeeded');