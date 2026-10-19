#!/usr/bin/env node
console.log('DEBUG: Starting');
try {
  const ora = await import('ora');
  console.log('DEBUG: ora imported:', typeof ora);
} catch (e) {
  console.error('DEBUG ERROR ora:', e.message);
}

try {
  const prompts = await import('prompts');
  console.log('DEBUG: prompts imported:', typeof prompts);
} catch (e) {
  console.error('DEBUG ERROR prompts:', e.message);
}

try {
  const pc = await import('picocolors');
  console.log('DEBUG: picocolors imported:', typeof pc);
} catch (e) {
  console.error('DEBUG ERROR picocolors:', e.message);
}

try {
  const upload = await import('../src/commands/upload.js');
  console.log('DEBUG: upload imported:', typeof upload);
} catch (e) {
  console.error('DEBUG ERROR upload:', e.message, e.stack);
}

console.log('DEBUG: Done');