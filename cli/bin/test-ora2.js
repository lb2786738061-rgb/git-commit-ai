import { execFileSync } from 'child_process';

console.log('Step 1: test BEFORE ora import');

const r1 = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
  cwd: process.cwd(), stdio: 'pipe'
});
console.log('  OK:', r1.toString().trim());

console.log('Step 2: import ora dynamically...');
const oraModule = await import('ora');
const ora = oraModule.default;
console.log('  ora loaded:', typeof ora);

console.log('Step 3: test AFTER ora import');
const r2 = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
  cwd: process.cwd(), stdio: 'pipe'
});
console.log('  OK:', r2.toString().trim());

console.log('All passed!');