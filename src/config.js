import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.git-commit-ai.json');

const DEFAULT_CONFIG = {
  apiKey: '',
  apiBase: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  convention: 'angular'
};

/**
 * Reads global configuration, merging environment variables, configuration file, and defaults.
 * @returns {{apiKey: string, apiBase: string, model: string, convention: string}}
 */
export function readConfig() {
  let fileConfig = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    } catch (e) {
      // Ignore corrupted configuration and fallback
    }
  }

  return {
    apiKey: process.env.OPENAI_API_KEY || fileConfig.apiKey || DEFAULT_CONFIG.apiKey,
    apiBase: process.env.OPENAI_API_BASE || fileConfig.apiBase || DEFAULT_CONFIG.apiBase,
    model: process.env.OPENAI_MODEL || fileConfig.model || DEFAULT_CONFIG.model,
    convention: process.env.COMMIT_CONVENTION || fileConfig.convention || DEFAULT_CONFIG.convention
  };
}

/**
 * Updates global configuration in home directory.
 * @param {Partial<typeof DEFAULT_CONFIG>} newConfig 
 * @returns {typeof DEFAULT_CONFIG} The updated config
 */
export function writeConfig(newConfig) {
  let fileConfig = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    } catch (e) {}
  }

  const merged = { ...DEFAULT_CONFIG, ...fileConfig, ...newConfig };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

export function getConfigFilePath() {
  return CONFIG_FILE;
}
