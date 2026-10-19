import assert from 'assert';
import { readConfig, writeConfig, getConfigFilePath, readTeamConfig, writeTeamConfig } from '../shared/config.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

console.log('🔄 Running tests for shared/config.js...');

try {
  const config = readConfig();

  assert.ok(config, 'Config object should be defined');
  assert.ok(typeof config.apiKey === 'string', 'apiKey should be a string');
  assert.ok(config.apiBase.startsWith('http'), 'apiBase should be a valid URL');
  assert.ok(config.model.length > 0, 'model name should not be empty');
  assert.ok(typeof config.convention === 'string', 'convention should be a string');
  assert.ok(['angular', 'gitmoji'].includes(config.convention), 'convention value invalid');
  assert.ok(typeof config.language === 'string', 'language should be a string');

  assert.ok(typeof config.smartModel === 'boolean', 'smartModel should be boolean');
  assert.ok(typeof config.fastModel === 'string', 'fastModel should be a string');
  assert.ok(typeof config.powerfulModel === 'string', 'powerfulModel should be a string');
  assert.ok(typeof config.complexityThreshold === 'number', 'complexityThreshold should be a number');
  assert.ok(typeof config.enableCache === 'boolean', 'enableCache should be boolean');
  assert.ok(typeof config.cacheTTL === 'number', 'cacheTTL should be a number');
  assert.ok(typeof config.theme === 'string', 'theme should be a string');
  assert.ok(typeof config.jsonOutput === 'boolean', 'jsonOutput should be boolean');
  assert.ok(typeof config.githubToken === 'string', 'githubToken should be a string');
  assert.ok(typeof config.giteeToken === 'string', 'giteeToken should be a string');
  assert.ok(typeof config.gitlabToken === 'string', 'gitlabToken should be a string');
  assert.ok(typeof config.gitlabBase === 'string', 'gitlabBase should be a string');

  const configPath = getConfigFilePath();
  assert.ok(configPath.includes('.git-commit-ai.json'), 'Config file name should be unified');

  console.log('✅ All shared/config tests passed!');
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}