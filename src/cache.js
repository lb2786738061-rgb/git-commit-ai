import crypto from 'crypto';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { readConfig } from './config.js';

const CACHE_DIR = path.join(os.tmpdir(), 'git-commit-ai-cache');

/**
 * 确保缓存目录存在
 */
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * 生成缓存键的哈希值
 * @param {string} key 缓存键
 * @returns {string} 哈希值
 */
function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * 获取缓存文件路径
 * @param {string} key 缓存键
 * @returns {string} 缓存文件路径
 */
function getCacheFilePath(key) {
  ensureCacheDir();
  const hash = hashKey(key);
  return path.join(CACHE_DIR, `${hash}.json`);
}

/**
 * 检查缓存是否过期
 * @param {object} cacheEntry 缓存条目
 * @param {number} ttl 缓存过期时间（毫秒）
 * @returns {boolean} 是否过期
 */
function isExpired(cacheEntry, ttl) {
  if (!cacheEntry.timestamp) return true;
  return Date.now() - cacheEntry.timestamp > ttl;
}

/**
 * 清理过期的缓存文件
 */
export function cleanExpiredCache() {
  try {
    ensureCacheDir();
    const config = readConfig();
    const ttl = config.cacheTTL || 3600000;

    const files = fs.readdirSync(CACHE_DIR);
    let cleanedCount = 0;

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(CACHE_DIR, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const cacheEntry = JSON.parse(content);

        if (isExpired(cacheEntry, ttl)) {
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      } catch (_) {
        // 文件损坏，删除
        try {
          fs.unlinkSync(filePath);
          cleanedCount++;
        } catch (_) {}
      }
    }

    return cleanedCount;
  } catch (error) {
    return 0;
  }
}

/**
 * 从缓存获取数据
 * @param {string} key 缓存键
 * @returns {any|null} 缓存的数据，如果不存在或过期则返回 null
 */
export function getFromCache(key) {
  const config = readConfig();
  if (!config.enableCache) return null;

  try {
    const cacheFilePath = getCacheFilePath(key);
    if (!fs.existsSync(cacheFilePath)) return null;

    const content = fs.readFileSync(cacheFilePath, 'utf-8');
    const cacheEntry = JSON.parse(content);

    const ttl = config.cacheTTL || 3600000;
    if (isExpired(cacheEntry, ttl)) {
      fs.unlinkSync(cacheFilePath);
      return null;
    }

    return cacheEntry.data;
  } catch (error) {
    return null;
  }
}

/**
 * 将数据存入缓存
 * @param {string} key 缓存键
 * @param {any} data 要缓存的数据
 */
export function setCache(key, data) {
  const config = readConfig();
  if (!config.enableCache) return;

  try {
    const cacheFilePath = getCacheFilePath(key);
    const cacheEntry = {
      data,
      timestamp: Date.now()
    };

    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheEntry), 'utf-8');
  } catch (error) {
    // 静默失败，不影响主流程
  }
}

/**
 * 清除所有缓存
 */
export function clearAllCache() {
  try {
    ensureCacheDir();
    const files = fs.readdirSync(CACHE_DIR);
    let clearedCount = 0;

    for (const file of files) {
      const filePath = path.join(CACHE_DIR, file);
      try {
        fs.unlinkSync(filePath);
        clearedCount++;
      } catch (_) {}
    }

    return clearedCount;
  } catch (error) {
    return 0;
  }
}

/**
 * 获取缓存统计信息
 * @returns {{count: number, size: string}}
 */
export function getCacheStats() {
  try {
    ensureCacheDir();
    const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.json'));
    let totalSize = 0;

    for (const file of files) {
      const filePath = path.join(CACHE_DIR, file);
      try {
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      } catch (_) {}
    }

    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

    return {
      count: files.length,
      size: `${sizeInMB} MB`
    };
  } catch (error) {
    return { count: 0, size: '0 MB' };
  }
}
