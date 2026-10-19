import pc from 'picocolors';
import { execFileSync } from 'child_process';

console.log('Testing execFileSync with git log...');

try {
  const output = execFileSync('git', ['log', '-n', '50', '--pretty=format:%h %s'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  console.log('Output:', output.substring(0, 200));
} catch (e) {
  console.error('Error:', e.message);
}

console.log('Done');