#!/usr/bin/env node

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const testsDir = path.join(process.cwd(), 'tests');
const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.js'));

console.log('🧪 Running all tests...\n');

let passed = 0;
let failed = 0;

for (const testFile of testFiles) {
  const testPath = path.join(testsDir, testFile);
  try {
    execFileSync('node', [testPath], { stdio: 'inherit' });
    passed++;
  } catch (error) {
    failed++;
    console.error(`❌ ${testFile} failed`);
  }
}

console.log('\n' + '─'.repeat(60));
console.log(`Total: ${testFiles.length} | ${passed} passed | ${failed} failed`);
console.log('─'.repeat(60));

if (failed > 0) {
  process.exit(1);
}
