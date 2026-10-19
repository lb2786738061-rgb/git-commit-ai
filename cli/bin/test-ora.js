import { execFileSync } from 'child_process';

console.log('1. isGitRepository BEFORE ora');
const r1 = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
  cwd: process.cwd(), stdio: 'pipe'
});
console.log('   OK:', r1.toString().trim());

import ora from 'ora';
console.log('2. isGitRepository AFTER ora');
const r2 = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
  cwd: process.cwd(), stdio: 'pipe'
});
console.log('   OK:', r2.toString().trim());

console.log('All done');