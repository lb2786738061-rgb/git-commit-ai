import { execFileSync } from 'child_process';

console.log('Test 1: isGitRepository');
try {
  const result = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });
  console.log('  OK:', result.toString().trim());
} catch (e) {
  console.error('  FAIL:', e.message);
}

console.log('Test 2: git log');
try {
  const result = execFileSync('git', ['--no-pager', 'log', '-n', '3', '--pretty=format:%h %s'], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });
  console.log('  OK:', result.toString().trim().split('\n').length, 'entries');
} catch (e) {
  console.error('  FAIL:', e.message);
}

console.log('Test 3: git status');
try {
  const result = execFileSync('git', ['status', '--porcelain'], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });
  console.log('  OK:', result.toString().trim().split('\n').filter(l => l.trim()).length, 'files');
} catch (e) {
  console.error('  FAIL:', e.message);
}

console.log('All tests done');