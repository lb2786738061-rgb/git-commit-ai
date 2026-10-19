import pc from 'picocolors';

console.log('1. Testing GitOperations directly...');
try {
  const { GitOperations } = await import('../../shared/git/operations.js');
  const cwd = process.cwd();
  console.log('  cwd:', cwd);
  console.log('  isGit:', GitOperations.isGitRepository(cwd));
  
  const git = new GitOperations(cwd);
  const logs = await git.log(3);
  console.log('  log(3):', logs.length, 'entries');
  logs.forEach((l, i) => console.log(`    ${i + 1}. ${l}`));
  
  const branch = await git.getCurrentBranch();
  console.log('  branch:', branch);
  
  const status = await git.status();
  console.log('  status lines:', status ? status.trim().split('\n').filter(l => l.trim()).length : 0);
} catch (e) {
  console.error('  FAIL:', e.message, e.stack);
}

console.log('\n2. Testing git command directly...');
try {
  const { gitCommand } = await import('../../src/commands/git.js');
  console.log('  gitCommand imported OK');
  await gitCommand('analyze', {});
  console.log('  analyze OK');
} catch (e) {
  console.error('  FAIL:', e.message, e.stack);
}

console.log('\nAll done!');