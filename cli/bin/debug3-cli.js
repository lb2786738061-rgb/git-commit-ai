#!/usr/bin/env node
console.log('DEBUG 1: Starting');
import { Command } from 'commander';
console.log('DEBUG 2: Commander imported');

try {
  const { configCommand } = await import('../src/commands/config.js');
  console.log('DEBUG 3: configCommand imported:', typeof configCommand);
} catch (e) {
  console.error('DEBUG ERROR:', e.message);
}

console.log('DEBUG 4: Done');