#!/usr/bin/env node
console.log('DEBUG 1: Starting');
try {
  const prompts = await import('prompts');
  console.log('DEBUG 2: prompts imported:', typeof prompts, Object.keys(prompts));
} catch (e) {
  console.error('DEBUG ERROR prompts:', e.message, e.stack);
}
console.log('DEBUG 3: Done');