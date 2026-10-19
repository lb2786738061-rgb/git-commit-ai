import pc from 'picocolors';
console.log('picocolors loaded:', typeof pc.red);

import { execFileSync } from 'child_process';
console.log('1. isGitRepository');

const result = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
  cwd: process.cwd(), stdio: 'pipe'
});
console.log('   OK:', result.toString().trim());

console.log('2. git log');

const log = execFileSync('git', ['--no-pager', 'log', '-n', '3', '--pretty=format:%h %s'], {
  cwd: process.cwd(), stdio: 'pipe'
});
console.log('   OK:', log.toString().trim().split('\n').length, 'entries');

console.log('All done');