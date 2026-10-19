import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.git-commit-ai.json');

let PROJECT_ROOT = process.cwd();
if (PROJECT_ROOT.endsWith('cli')) {
  PROJECT_ROOT = path.dirname(PROJECT_ROOT);
}

const DEFAULT_CONFIG = {
  apiKey: '',
  apiBase: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  convention: 'angular',
  language: 'en',
  smartModel: true,
  fastModel: 'gpt-4o-mini',
  powerfulModel: 'gpt-4o',
  complexityThreshold: 5000,
  teamConfigPath: '.git-commit-ai-team.json',
  enableCache: true,
  cacheTTL: 3600000,
  theme: 'default',
  jsonOutput: false,
  githubToken: '',
  giteeToken: '',
  gitlabToken: '',
  gitlabBase: 'https://gitlab.com/api/v4'
};

/**
 * Reads global configuration, merging environment variables, configuration file, and defaults.
 * @returns {{apiKey: string, apiBase: string, model: string, convention: string, language: string}}
 */
export function readConfig() {
  let fileConfig = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    } catch (e) {}
  }

  return {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    apiKey: process.env.OPENAI_API_KEY || fileConfig.apiKey || DEFAULT_CONFIG.apiKey,
    apiBase: process.env.OPENAI_API_BASE || fileConfig.apiBase || DEFAULT_CONFIG.apiBase,
    model: process.env.OPENAI_MODEL || fileConfig.model || DEFAULT_CONFIG.model,
    convention: process.env.COMMIT_CONVENTION || fileConfig.convention || DEFAULT_CONFIG.convention,
    language: process.env.COMMIT_LANGUAGE || fileConfig.language || DEFAULT_CONFIG.language,
    githubToken: process.env.GITHUB_TOKEN || fileConfig.githubToken || DEFAULT_CONFIG.githubToken,
    giteeToken: process.env.GITEE_TOKEN || fileConfig.giteeToken || DEFAULT_CONFIG.giteeToken,
    gitlabToken: process.env.GITLAB_TOKEN || fileConfig.gitlabToken || DEFAULT_CONFIG.gitlabToken,
    gitlabBase: process.env.GITLAB_BASE || fileConfig.gitlabBase || DEFAULT_CONFIG.gitlabBase
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

  // 验证写入
  const written = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  return written;
}

export function getConfigFilePath() {
  return CONFIG_FILE;
}

/**
 * 读取团队配置文件（位于项目根目录）
 * @returns {object} 团队配置
 */
export function readTeamConfig() {
  const cwd = process.cwd();
  const teamConfigPath = path.join(cwd, '.git-commit-ai-team.json');

  if (!fs.existsSync(teamConfigPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(teamConfigPath, 'utf-8'));
  } catch (e) {
    return null;
  }
}

/**
 * 写入团队配置文件
 * @param {object} config 团队配置
 */
export function writeTeamConfig(config) {
  const cwd = process.cwd();
  const teamConfigPath = path.join(cwd, '.git-commit-ai-team.json');

  fs.writeFileSync(teamConfigPath, JSON.stringify(config, null, 2), 'utf-8');
  return teamConfigPath;
}