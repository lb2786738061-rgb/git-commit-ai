import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import ora from 'ora';

// 内置提交模板
const BUILTIN_TEMPLATES = {
  'bug-fix': {
    name: 'Bug Fix',
    description: '修复 Bug 的提交模板',
    template: 'fix: {{description}}\n\nFixes #{{ticket}}\n\n{{details}}',
    variables: ['description', 'ticket', 'details']
  },
  'feature': {
    name: 'Feature',
    description: '新功能提交模板',
    template: 'feat({{scope}}): {{description}}\n\n{{details}}\n\nCloses #{{ticket}}',
    variables: ['scope', 'description', 'details', 'ticket']
  },
  'refactor': {
    name: 'Refactor',
    description: '代码重构提交模板',
    template: 'refactor({{scope}}): {{description}}\n\n{{details}}',
    variables: ['scope', 'description', 'details']
  },
  'documentation': {
    name: 'Documentation',
    description: '文档更新提交模板',
    template: 'docs: {{description}}\n\n{{details}}',
    variables: ['description', 'details']
  },
  'breaking-change': {
    name: 'Breaking Change',
    description: '破坏性变更提交模板',
    template: 'feat({{scope}}): {{description}}\n\nBREAKING CHANGE: {{breaking}}\n\n{{details}}',
    variables: ['scope', 'description', 'breaking', 'details']
  },
  'performance': {
    name: 'Performance',
    description: '性能优化提交模板',
    template: 'perf({{scope}}): {{description}}\n\n{{details}}',
    variables: ['scope', 'description', 'details']
  },
  'test': {
    name: 'Test',
    description: '测试相关提交模板',
    template: 'test({{scope}}): {{description}}\n\n{{details}}',
    variables: ['scope', 'description', 'details']
  },
  'chore': {
    name: 'Chore',
    description: '杂项任务提交模板',
    template: 'chore({{scope}}): {{description}}\n\n{{details}}',
    variables: ['scope', 'description', 'details']
  }
};

// 模板存储路径
const TEMPLATES_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.codesync-templates');
const TEMPLATES_FILE = path.join(TEMPLATES_DIR, 'templates.json');

// 确保模板目录存在
function ensureTemplatesDir() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
  }
}

// 读取自定义模板
function readCustomTemplates() {
  if (!fs.existsSync(TEMPLATES_FILE)) {
    return {};
  }
  try {
    const content = fs.readFileSync(TEMPLATES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return {};
  }
}

// 写入自定义模板
function writeCustomTemplates(templates) {
  ensureTemplatesDir();
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf-8');
}

// 替换模板变量
function replaceVariables(template, variables) {
  let result = template;
  
  // 替换自定义变量
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  });

  // 替换内置变量
  const now = new Date();
  result = result.replace(/{{date}}/g, now.toISOString().split('T')[0]);
  result = result.replace(/{{datetime}}/g, now.toISOString());
  result = result.replace(/{{author}}/g, process.env.USER || process.env.USERNAME || 'unknown');
  result = result.replace(/{{timestamp}}/g, Math.floor(Date.now() / 1000));

  return result;
}

export async function templateCommand(action, options) {
  console.log(pc.cyan(pc.bold('\n📝 CodeSync - 提交模板管理')));
  console.log(pc.dim('─'.repeat(50)));

  try {
    switch (action) {
      case 'add':
        await handleAdd(options);
        break;
      case 'list':
        await handleList();
        break;
      case 'use':
        await handleUse(options);
        break;
      case 'remove':
        await handleRemove(options);
        break;
      case 'show':
        await handleShow(options);
        break;
      default:
        console.error(pc.red('❌ 未知的操作类型'));
        console.log(pc.dim('可用操作: add, list, use, remove, show'));
        process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`\n❌ 操作失败: ${error.message}`));
    process.exit(1);
  }
}

async function handleAdd(options) {
  const { name, template, description } = options;

  if (!name || !template) {
    console.error(pc.red('❌ 缺少必要参数'));
    console.log(pc.dim('  使用: codesync template add --name <name> --template <template> [--description <desc>]'));
    return;
  }

  const spinner = ora(pc.cyan('正在添加模板...')).start();

  const customTemplates = readCustomTemplates();

  // 检查是否已存在
  if (customTemplates[name]) {
    spinner.warn(pc.yellow('模板已存在'));
    console.log(pc.dim(`  使用 --force 覆盖现有模板`));
    return;
  }

  // 添加模板
  customTemplates[name] = {
    name,
    description: description || '自定义模板',
    template,
    variables: extractVariables(template),
    custom: true
  };

  writeCustomTemplates(customTemplates);

  spinner.succeed(pc.green('模板添加成功'));

  console.log(pc.cyan('\n📋 模板信息:'));
  console.log(pc.dim(`  名称: ${name}`));
  console.log(pc.dim(`  描述: ${description || '自定义模板'}`));
  console.log(pc.dim(`  变量: ${extractVariables(template).join(', ') || '无'}`));
}

async function handleList() {
  console.log(pc.cyan('\n📋 可用的提交模板:'));
  console.log(pc.dim('─'.repeat(50)));

  const customTemplates = readCustomTemplates();

  // 内置模板
  console.log(pc.cyan('\n  内置模板:'));
  Object.entries(BUILTIN_TEMPLATES).forEach(([key, tmpl]) => {
    console.log(pc.dim(`    ${key}`));
    console.log(pc.dim(`      ${tmpl.name} - ${tmpl.description}`));
  });

  // 自定义模板
  if (Object.keys(customTemplates).length > 0) {
    console.log(pc.cyan('\n  自定义模板:'));
    Object.entries(customTemplates).forEach(([key, tmpl]) => {
      console.log(pc.dim(`    ${key}`));
      console.log(pc.dim(`      ${tmpl.name} - ${tmpl.description}`));
    });
  }

  console.log(pc.cyan('\n💡 使用方法:'));
  console.log(pc.dim('  codesync template use --name <template-name>'));
  console.log(pc.dim('  codesync template show --name <template-name>'));
}

async function handleUse(options) {
  const { name, variables } = options;

  if (!name) {
    console.error(pc.red('❌ 缺少模板名称'));
    console.log(pc.dim('  使用: codesync template use --name <template-name>'));
    return;
  }

  const spinner = ora(pc.cyan('正在应用模板...')).start();

  // 查找模板
  let template = BUILTIN_TEMPLATES[name];
  if (!template) {
    const customTemplates = readCustomTemplates();
    template = customTemplates[name];
  }

  if (!template) {
    spinner.fail(pc.red('模板不存在'));
    console.log(pc.dim('  使用 `codesync template list` 查看可用模板'));
    return;
  }

  // 解析变量
  let vars = {};
  if (variables) {
    vars = JSON.parse(variables);
  } else {
    // 交互式输入变量
    const { default: prompts } = await import('prompts');
    const questions = [];

    template.variables.forEach(variable => {
      questions.push({
        type: 'text',
        name: variable,
        message: `请输入 ${variable}:`
      });
    });

    if (questions.length > 0) {
      const response = await prompts(questions);
      vars = response;
    }
  }

  // 替换变量
  const result = replaceVariables(template.template, vars);

  spinner.succeed(pc.green('模板应用成功'));

  console.log(pc.cyan('\n📝 生成的提交信息:'));
  console.log(pc.dim('─'.repeat(50)));
  console.log(result);
  console.log(pc.dim('─'.repeat(50)));
}

async function handleRemove(options) {
  const { name } = options;

  if (!name) {
    console.error(pc.red('❌ 缺少模板名称'));
    console.log(pc.dim('  使用: codesync template remove --name <template-name>'));
    return;
  }

  const spinner = ora(pc.cyan('正在删除模板...')).start();

  // 检查是否是内置模板
  if (BUILTIN_TEMPLATES[name]) {
    spinner.fail(pc.red('无法删除内置模板'));
    console.log(pc.dim('  只能删除自定义模板'));
    return;
  }

  const customTemplates = readCustomTemplates();

  if (!customTemplates[name]) {
    spinner.warn(pc.yellow('模板不存在'));
    return;
  }

  // 删除模板
  delete customTemplates[name];
  writeCustomTemplates(customTemplates);

  spinner.succeed(pc.green('模板删除成功'));
}

async function handleShow(options) {
  const { name } = options;

  if (!name) {
    console.error(pc.red('❌ 缺少模板名称'));
    console.log(pc.dim('  使用: codesync template show --name <template-name>'));
    return;
  }

  // 查找模板
  let template = BUILTIN_TEMPLATES[name];
  if (!template) {
    const customTemplates = readCustomTemplates();
    template = customTemplates[name];
  }

  if (!template) {
    console.error(pc.red('模板不存在'));
    console.log(pc.dim('  使用 `codesync template list` 查看可用模板'));
    return;
  }

  console.log(pc.cyan('\n📋 模板详情:'));
  console.log(pc.dim('─'.repeat(50)));
  console.log(pc.cyan(`  名称: ${template.name}`));
  console.log(pc.dim(`  描述: ${template.description}`));
  console.log(pc.cyan(`  变量: ${template.variables.join(', ') || '无'}`));
  console.log(pc.cyan('\n  模板内容:'));
  console.log(pc.dim('─'.repeat(50)));
  console.log(template.template);
  console.log(pc.dim('─'.repeat(50)));
}

// 提取模板中的变量
function extractVariables(template) {
  const matches = template.match(/{{(\w+)}}/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.replace(/{{|}}/g, '')))];
}
