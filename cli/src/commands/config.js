import { readConfig, writeConfig, getConfigFilePath } from '../../../shared/config.js';
import fs from 'fs';
import pc from 'picocolors';

export async function configCommand(...args) {
  let action = undefined;
  let params = [];
  let options = {};

  for (const arg of args) {
    if (typeof arg === 'string') {
      if (!action) {
        action = arg;
      } else {
        params.push(arg);
      }
    } else if (Array.isArray(arg)) {
      params.push(...arg.filter((item) => typeof item === 'string'));
    } else if (arg && typeof arg === 'object' && !arg._events && !arg.commands) {
      options = { ...options, ...arg };
    }
  }

  // 1. 如果使用了 --list 选项或者子命令为 list
  if (options.list || action === 'list') {
    showConfig();
    return;
  }

  // 2. 如果使用了 --set 选项
  if (options.set) {
    setConfig(options.set);
    return;
  }

  // 3. 如果动作是 set: codesync config set key=val 或 codesync config set key val
  if (action === 'set') {
    if (params.length === 0) {
      console.error(pc.red('❌ 请提供要设置的配置项'));
      console.log(pc.dim('示例: codesync config set githubToken=ghp_xxx'));
      console.log(pc.dim('示例: codesync config set apiKey=sk-xxx'));
      process.exit(1);
    }
    let setValue = '';
    if (params.length === 1) {
      setValue = params[0];
    } else {
      setValue = `${params[0]}=${params.slice(1).join(' ')}`;
    }
    setConfig(setValue);
    return;
  }

  // 4. 如果动作是 get: codesync config get <key>
  if (action === 'get') {
    const key = params[0];
    if (!key) {
      console.error(pc.red('❌ 请提供要查看的配置项名称'));
      process.exit(1);
    }
    const config = readConfig();
    if (key in config) {
      console.log(config[key]);
    } else {
      console.error(pc.red(`❌ 未找到配置项: ${key}`));
      process.exit(1);
    }
    return;
  }

  // 5. 如果首个参数直接就是 key=val 格式
  if (action && action.includes('=')) {
    setConfig(action);
    return;
  }

  // 默认展示全部配置
  showConfig();
}

function showConfig() {
  const config = readConfig();
  const configPath = getConfigFilePath();

  console.log(pc.cyan(pc.bold('\n⚙️  CodeSync 配置')));
  console.log(pc.dim('─'.repeat(50)));
  console.log(`  ${pc.dim('配置文件:')} ${configPath}`);
  console.log(pc.dim('─'.repeat(50)));

  console.log(`  ${pc.bold('API Key:')}        ${config.apiKey ? pc.green('••••••••' + config.apiKey.slice(-4)) : pc.red('未设置')}`);
  console.log(`  ${pc.bold('API Base:')}       ${pc.blue(config.apiBase)}`);
  console.log(`  ${pc.bold('Model:')}          ${pc.blue(config.model)}`);
  console.log(`  ${pc.bold('Convention:')}     ${pc.blue(config.convention)}`);
  console.log(`  ${pc.bold('Language:')}       ${pc.blue(config.language)}`);
  console.log(`  ${pc.bold('Smart Model:')}    ${config.smartModel ? pc.green('启用') : pc.red('禁用')}`);
  if (config.smartModel) {
    console.log(`  ${pc.bold('Fast Model:')}     ${pc.blue(config.fastModel)}`);
    console.log(`  ${pc.bold('Powerful Model:')} ${pc.blue(config.powerfulModel)}`);
    console.log(`  ${pc.bold('Threshold:')}      ${pc.blue(config.complexityThreshold)} chars`);
  }
  console.log(`  ${pc.bold('Cache:')}          ${config.enableCache ? pc.green('启用') : pc.red('禁用')}`);
  console.log(`  ${pc.bold('Theme:')}          ${pc.blue(config.theme)}`);
  console.log(`  ${pc.bold('GitHub Token:')}   ${config.githubToken ? pc.green('••••••••' + config.githubToken.slice(-4)) : pc.red('未设置')}`);
  console.log(`  ${pc.bold('Gitee Token:')}    ${config.giteeToken ? pc.green('••••••••' + config.giteeToken.slice(-4)) : pc.red('未设置')}`);
  console.log(`  ${pc.bold('GitLab Token:')}   ${config.gitlabToken ? pc.green('••••••••' + config.gitlabToken.slice(-4)) : pc.red('未设置')}`);
  console.log(pc.dim('─'.repeat(50) + '\n'));

  // Token 获取指南
  console.log(pc.cyan(pc.bold('\n💡 Token 获取指南')));
  console.log(pc.dim('─'.repeat(50)));
  console.log(`  ${pc.bold('GitHub Token:')} https://github.com/settings/tokens`);
  console.log(`  ${pc.dim('  → Settings → Developer settings → Personal access tokens → Generate new token (classic)')}`);
  console.log(`  ${pc.dim('  → 必须选择 classic 经典令牌并勾选 repo 权限')}`);
  console.log(`  ${pc.bold('Gitee Token:')}  https://gitee.com/profile/personal_access_tokens`);
  console.log(`  ${pc.dim('  → 设置 → 私人令牌 → 生成新令牌，勾选 projects 权限')}`);
  console.log(`  ${pc.bold('GitLab Token:')} https://gitlab.com/-/user_settings/personal_access_tokens`);
  console.log(`  ${pc.dim('  → User Settings → Access Tokens → Add new token，Scope 选 api')}`);
  console.log(pc.dim('─'.repeat(50) + '\n'));
}

function setConfig(setValue) {
  const parts = setValue.split('=');
  if (parts.length < 2) {
    console.error(pc.red('❌ 格式错误，请使用: key=value'));
    console.log(pc.dim('示例: codesync config set apiKey=sk-xxx'));
    console.log(pc.dim('示例: codesync config set githubToken=ghp_xxx'));
    process.exit(1);
  }

  const key = parts[0].trim();
  const value = parts.slice(1).join('=').trim();

  const validKeys = [
    'apiKey', 'apiBase', 'model', 'convention', 'language',
    'smartModel', 'fastModel', 'powerfulModel', 'complexityThreshold',
    'enableCache', 'cacheTTL', 'theme', 'jsonOutput',
    'githubToken', 'giteeToken', 'gitlabToken', 'gitlabBase'
  ];

  if (!validKeys.includes(key)) {
    console.error(pc.red(`❌ 无效的配置项: ${key}`));
    console.log(pc.dim(`有效配置项: ${validKeys.join(', ')}`));
    process.exit(1);
  }

  // 智能提示：如果用户把 GitHub Token 误配给了 apiKey
  if (key === 'apiKey' && (value.startsWith('ghp_') || value.startsWith('github_pat_'))) {
    console.log(pc.yellow('\n⚠️  检测到您输入的可能是 GitHub 访问令牌（以 ghp_ 或 github_pat_ 开头）。'));
    console.log(pc.yellow(`   您当前设置的是 AI 接口密钥 (apiKey)。`));
    console.log(pc.yellow(`   若要配置代码托管平台的 GitHub Token，请运行:`));
    console.log(pc.cyan(`   codesync config set githubToken=${value}\n`));
  }

  writeConfig({ [key]: value });
  const maskedValue = value.length > 8 ? value.slice(0, 4) + '••••' + value.slice(-4) : value;
  console.log(pc.green(`✓ 配置已更新: ${pc.bold(key)} = ${maskedValue}`));

  // 立即重新读取并显示当前值（避免模块缓存导致的显示问题）
  const updatedConfig = readConfig();
  const actualValue = updatedConfig[key];
  if (actualValue !== value) {
    console.log(pc.dim(`  当前值: ${actualValue}`));
  }
}