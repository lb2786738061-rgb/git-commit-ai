#!/usr/bin/env node
console.log('DEBUG: Testing prompts in non-TTY mode');

// Test without prompts
import { configCommand } from '../src/commands/config.js';
console.log('configCommand imported successfully');
console.log('configCommand type:', typeof configCommand);

// config command should work because it doesn't need prompts when just showing config
// Let's try to run it
const program = new (await import('commander')).Command();
program.name('test').version('1.0.0');
program.command('config').description('Config').action(configCommand);
program.parse(['node', 'test', 'config', '--list']);
console.log('Done');