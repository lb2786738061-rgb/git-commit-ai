import pc from 'picocolors';
import ora from 'ora';
import { GitOperations } from '../../shared/git/operations.js';

const git = new GitOperations(process.cwd());
console.log('Starting...');

try {
  const spinner = ora(pc.cyan('testing...')).start();
  const logs = await git.log(50);
  spinner.succeed('Got logs');
  console.log('Logs count:', logs ? logs.length : 0);
} catch (e) {
  console.error('Error:', e);
}

console.log('Done');