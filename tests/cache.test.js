import assert from 'assert';
import { clearAllCache, getCacheStats, cleanExpiredCache } from '../src/cache.js';

console.log('🔄 正在运行缓存功能的单元测试...');

try {
  // 测试清除所有缓存
  const clearedCount = clearAllCache();
  assert.ok(typeof clearedCount === 'number', '应返回数字');

  // 测试缓存统计
  const stats = getCacheStats();
  assert.ok(typeof stats.count === 'number', '缓存统计 count 应为数字');
  assert.ok(typeof stats.size === 'string', '缓存统计 size 应为字符串');

  // 测试清理过期缓存
  const expiredCount = cleanExpiredCache();
  assert.ok(typeof expiredCount === 'number', '应返回数字');

  console.log('✅ 所有缓存功能单元测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
