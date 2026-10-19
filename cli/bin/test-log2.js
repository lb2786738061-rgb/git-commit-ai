import { execFileSync } from 'child_process';

console.log('Test 1: git log -n 5');
try {
  const out = execFileSync('git', ['log', '-n', '5', '--pretty=format:%h %s'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    encoding: 'utf-8',
    timeout: 5000
  });
  console.log('OK:', out.substring(0, 100));
} catch (e) {
  console.error('FAIL:', e.message);
}

console.log('Test 2: git log -n 50');
try {
  const out = execFileSync('git', ['log', '-n', '50', '--pretty=format:%h %s'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    encoding: 'utf-8',
    timeout: 5000
  });
  console.log('OK:', out.substring(0, 100));
} catch (e) {
  console.error('FAIL:', e.message);
}

console.log('All done');