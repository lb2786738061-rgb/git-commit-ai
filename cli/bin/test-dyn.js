import { execFileSync } from 'child_process';

console.log('Static: running git...');
execFileSync('git', ['--no-pager', 'log', '-n', '3', '--oneline'], { cwd: process.cwd(), stdio: 'pipe', encoding: 'utf-8' });
console.log('Static: OK');

console.log('Dynamic: loading git module...');
const { GitOperations } = await import('../../shared/git/operations.js');
console.log('Dynamic: module loaded');

console.log('Dynamic: running git.log(3)...');
const git = new GitOperations(process.cwd());
const logs = await git.log(3);
console.log('Dynamic: OK,', logs.length, 'entries');

console.log('All done');