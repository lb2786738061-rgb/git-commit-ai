import assert from 'assert';
import { detectScope } from '../src/git.js';

console.log('🔄 正在运行 git.js 的单元测试...');

try {
  // 测试情况 1: 空文件列表
  assert.strictEqual(detectScope([]), '', '空列表应返回空字符串');
  assert.strictEqual(detectScope(null), '', 'null 应返回空字符串');

  // 测试情况 2: 提取忽略列表目录之后的第一个关键目录
  assert.strictEqual(
    detectScope(['src/auth/login.js', 'src/auth/utils.js']),
    'auth',
    '应正确提取 auth 目录'
  );

  // 测试情况 3: 跨越 src 与 tests 并提炼相同主要范围
  assert.strictEqual(
    detectScope(['src/auth/login.js', 'tests/auth/login.test.js']),
    'auth',
    '即使在 tests 中也应识别出 auth 为主导范围'
  );

  // 测试情况 4: 根目录下 package.json 文件的提取
  assert.strictEqual(
    detectScope(['package.json', 'README.md']),
    'npm',
    '修改了 package.json 应推荐 npm 范围'
  );

  // 测试情况 5: 没有更深子目录且在忽略列表中时，回退到第一层目录名称
  assert.strictEqual(
    detectScope(['src/index.js']),
    'src',
    'src/index.js 找不到其他子目录应退回 src'
  );

  // 测试情况 6: 多目录时的最高频次选取
  assert.strictEqual(
    detectScope(['src/auth/login.js', 'src/auth/logout.js', 'src/db/connection.js']),
    'auth',
    '频次最高者应优先选为推荐范围'
  );

  console.log('✅ 所有 git.js 单元测试全部通过！');
} catch (error) {
  console.error('❌ 测试失败:', error);
  process.exit(1);
}
