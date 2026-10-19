import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.git-commit-ai.json');

const DEFAULT_CONFIG = {
  apiKey: '',
  apiBase: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  convention: 'angular',
  language: 'en',
  // 智能模型选择配置
  smartModel: true,
  fastModel: 'gpt-4o-mini',
  powerfulModel: 'gpt-4o',
  complexityThreshold: 5000, // diff 字符数阈值
  // 团队协作配置
  teamConfigPath: '.git-commit-ai-team.json', // 团队配置文件路径
  // 性能优化配置
  enableCache: true,
  cacheTTL: 3600000, // 缓存过期时间（毫秒，默认 1 小时）
  // UI 配置
  theme: 'default', // 主题: default, minimal, colorful
  jsonOutput: false // JSON 输出模式（用于 CI 集成）
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
    } catch (e) {
      // Ignore corrupted configuration and fallback
    }
  }

  return {
    apiKey: process.env.OPENAI_API_KEY || fileConfig.apiKey || DEFAULT_CONFIG.apiKey,
    apiBase: process.env.OPENAI_API_BASE || fileConfig.apiBase || DEFAULT_CONFIG.apiBase,
    model: process.env.OPENAI_MODEL || fileConfig.model || DEFAULT_CONFIG.model,
    convention: process.env.COMMIT_CONVENTION || fileConfig.convention || DEFAULT_CONFIG.convention,
    language: process.env.COMMIT_LANGUAGE || fileConfig.language || DEFAULT_CONFIG.language
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
