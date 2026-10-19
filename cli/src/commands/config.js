import { readConfig, writeConfig, getConfigFilePath } from '../../../shared/config.js';
import fs from 'fs';
import pc from 'picocolors';

export async function configCommand(options) {
  const { set: setValue, list } = options;

  if (list) {
    showConfig();
    return;
  }

  if (setValue) {
    setConfig(setValue);
    return;
  }

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
  console.log(`  ${pc.dim('  → 勾选 repo 权限，用于创建仓库和推送代码')}`);
  console.log(`  ${pc.bold('Gitee Token:')} https://gitee.com/settings/profile`);
  console.log(`  ${pc.dim('  → 设置 → 私人令牌 → 生成令牌，勾选 repo 权限')}`);
  console.log(`  ${pc.bold('GitLab Token:')} https://gitlab.com/-/profile/personal_access_tokens`);
  console.log(`  ${pc.dim('  → Preferences → Personal access tokens → Create new token，Scope 选 api')}`);
  console.log(pc.dim('─'.repeat(50) + '\n'));
}

function setConfig(setValue) {
  const parts = setValue.split('=');
  if (parts.length < 2) {
    console.error(pc.red('❌ 格式错误，请使用: key=value'));
    console.log(pc.dim('示例: codesync config --set apiKey=sk-xxx'));
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

  writeConfig({ [key]: value });
  console.log(pc.green(`✓ 配置已更新: ${pc.bold(key)} = ${value}`));
}