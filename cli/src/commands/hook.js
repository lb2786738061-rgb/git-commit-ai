import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import ora from 'ora';

// Pre-commit hook 模板
const HOOK_TEMPLATES = {
  eslint: {
    name: 'ESLint',
    description: '运行 ESLint 检查 JavaScript/TypeScript 代码',
    script: `#!/bin/sh
# ESLint Pre-commit Hook
# 自动检测并修复可修复的问题，检查代码质量

FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(js|jsx|ts|tsx)$')
if [ -z "$FILES" ]; then
  exit 0
fi

echo "🔍 Running ESLint on staged files..."
npx eslint --fix $FILES
ESLINT_EXIT=$?

if [ $ESLINT_EXIT -ne 0 ]; then
  echo "❌ ESLint found issues. Please fix them before committing."
  exit 1
fi

echo "✅ ESLint passed!"
exit 0
`
  },
  stylelint: {
    name: 'Stylelint',
    description: '运行 Stylelint 检查 CSS/SCSS/Less 样式',
    script: `#!/bin/sh
# Stylelint Pre-commit Hook
# 检查样式文件规范

FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(css|scss|sass|less)$')
if [ -z "$FILES" ]; then
  exit 0
fi

echo "🎨 Running Stylelint on staged files..."
npx stylelint --fix $FILES
STYLELINT_EXIT=$?

if [ $STYLELINT_EXIT -ne 0 ]; then
  echo "❌ Stylelint found issues. Please fix them before committing."
  exit 1
fi

echo "✅ Stylelint passed!"
exit 0
`
  },
  typescript: {
    name: 'TypeScript',
    description: '运行 TypeScript 类型检查',
    script: `#!/bin/sh
# TypeScript Pre-commit Hook
# 类型检查

echo "🔷 Running TypeScript type check..."
npx tsc --noEmit
TSC_EXIT=$?

if [ $TSC_EXIT -ne 0 ]; then
  echo "❌ TypeScript found type errors. Please fix them before committing."
  exit 1
fi

echo "✅ TypeScript type check passed!"
exit 0
`
  },
  prettier: {
    name: 'Prettier',
    description: '运行 Prettier 格式化代码',
    script: `#!/bin/sh
# Prettier Pre-commit Hook
# 自动格式化代码

FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(js|jsx|ts|tsx|css|scss|json|md)$')
if [ -z "$FILES" ]; then
  exit 0
fi

echo "✨ Running Prettier on staged files..."
npx prettier --write $FILES
PRETTIER_EXIT=$?

if [ $PRETTIER_EXIT -ne 0 ]; then
  echo "❌ Prettier found issues. Please fix them before committing."
  exit 1
fi

# Add formatted files back to staging
git add $FILES

echo "✅ Prettier formatted files!"
exit 0
`
  },
  test: {
    name: 'Test',
    description: '运行测试套件',
    script: `#!/bin/sh
# Test Pre-commit Hook
# 运行测试

echo "🧪 Running tests..."
npm test
TEST_EXIT=$?

if [ $TEST_EXIT -ne 0 ]; then
  echo "❌ Tests failed. Please fix them before committing."
  exit 1
fi

echo "✅ Tests passed!"
exit 0
`
  },
  all: {
    name: 'All Checks',
    description: '运行所有检查（ESLint + Prettier + TypeScript）',
    script: `#!/bin/sh
# Complete Pre-commit Hook
# 运行所有检查

echo "🔍 Running all pre-commit checks..."

# ESLint
JS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(js|jsx|ts|tsx)$')
if [ -n "$JS_FILES" ]; then
  echo "  - ESLint..."
  npx eslint --fix $JS_FILES
  if [ $? -ne 0 ]; then
    echo "❌ ESLint failed."
    exit 1
  fi
fi

# Prettier
PRETTIER_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(js|jsx|ts|tsx|css|scss|json|md)$')
if [ -n "$PRETTIER_FILES" ]; then
  echo "  - Prettier..."
  npx prettier --write $PRETTIER_FILES
  if [ $? -ne 0 ]; then
    echo "❌ Prettier failed."
    exit 1
  fi
  git add $PRETTIER_FILES
fi

# TypeScript
if [ -f "tsconfig.json" ]; then
  echo "  - TypeScript..."
  npx tsc --noEmit
  if [ $? -ne 0 ]; then
    echo "❌ TypeScript failed."
    exit 1
  fi
fi

echo "✅ All checks passed!"
exit 0
`
  },
  custom: {
    name: 'Custom',
    description: '自定义钩子脚本',
    script: `#!/bin/sh
# Custom Pre-commit Hook
# 在这里添加你的自定义检查逻辑

echo "Running custom pre-commit checks..."

# 在这里添加你的代码

exit 0
`
  }
};

export async function hookCommand(action, options) {
  console.log(pc.cyan(pc.bold('\n🎣 CodeSync - Pre-commit Hook 管理')));
  console.log(pc.dim('─'.repeat(50)));

  try {
    switch (action) {
      case 'install':
        await handleInstall(options);
        break;
      case 'uninstall':
        await handleUninstall();
        break;
      case 'list':
        await handleList();
        break;
      default:
        console.error(pc.red('❌ 未知的操作类型'));
        console.log(pc.dim('可用操作: install, uninstall, list'));
        process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`\n❌ 操作失败: ${error.message}`));
    process.exit(1);
  }
}

async function handleInstall(options) {
  const { template = 'all', force = false } = options;
  const spinner = ora(pc.cyan('正在安装 Pre-commit Hook...')).start();

  const cwd = process.cwd();
  const hooksDir = path.join(cwd, '.git', 'hooks');

  // 检查是否在 Git 仓库中
  if (!fs.existsSync(hooksDir)) {
    spinner.fail(pc.red('当前目录不是 Git 仓库'));
    console.log(pc.dim('  请在 Git 仓库根目录运行此命令'));
    return;
  }

  // 检查模板是否存在
  if (!HOOK_TEMPLATES[template]) {
    spinner.fail(pc.red('未知的模板'));
    console.log(pc.dim('  可用模板: ' + Object.keys(HOOK_TEMPLATES).join(', ')));
    return;
  }

  const hookFile = path.join(hooksDir, 'pre-commit');

  // 检查是否已存在
  if (fs.existsSync(hookFile) && !force) {
    spinner.warn(pc.yellow('Pre-commit Hook 已存在'));
    console.log(pc.dim(`  文件: ${hookFile}`));
    console.log(pc.dim('  使用 --force 强制覆盖'));
    return;
  }

  // 获取模板
  const hookTemplate = HOOK_TEMPLATES[template];

  // 写入 hook 文件
  fs.writeFileSync(hookFile, hookTemplate.script, 'utf-8');

  // 设置可执行权限（Unix-like 系统）
  try {
    fs.chmodSync(hookFile, 0o755);
  } catch (error) {
    // Windows 可能不支持 chmod，忽略错误
  }

  spinner.succeed(pc.green('Pre-commit Hook 安装成功'));

  console.log(pc.cyan('\n📋 模板信息:'));
  console.log(pc.dim(`  名称: ${hookTemplate.name}`));
  console.log(pc.dim(`  描述: ${hookTemplate.description}`));

  console.log(pc.cyan('\n📁 安装位置:'));
  console.log(pc.dim(`  ${hookFile}`));

  console.log(pc.cyan('\n💡 提示:'));
  console.log(pc.dim('  钩子将在每次提交前自动运行'));
  console.log(pc.dim('  使用 `codesync hook uninstall` 卸载'));
}

async function handleUninstall() {
  const spinner = ora(pc.cyan('正在卸载 Pre-commit Hook...')).start();

  const cwd = process.cwd();
  const hookFile = path.join(cwd, '.git', 'hooks', 'pre-commit');

  if (!fs.existsSync(hookFile)) {
    spinner.warn(pc.yellow('Pre-commit Hook 未安装'));
    return;
  }

  // 删除 hook 文件
  fs.unlinkSync(hookFile);

  spinner.succeed(pc.green('Pre-commit Hook 卸载成功'));
}

async function handleList() {
  console.log(pc.cyan('\n📋 可用的 Pre-commit Hook 模板:'));
  console.log(pc.dim('─'.repeat(50)));

  Object.entries(HOOK_TEMPLATES).forEach(([key, template]) => {
    console.log(pc.cyan(`\n  ${key}`));
    console.log(pc.dim(`    ${template.name}`));
    console.log(pc.dim(`    ${template.description}`));
  });

  console.log(pc.cyan('\n💡 使用方法:'));
  console.log(pc.dim('  codesync hook install --template <template-name>'));
  console.log(pc.dim('  codesync hook install --template eslint'));
  console.log(pc.dim('  codesync hook install --template all --force'));
}
