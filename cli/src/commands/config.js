import { readConfig, writeConfig, getConfigFilePath } from '../../../shared/config.js';

export async function configCommand(options) {
  const { set: setValue, list } = options;

  if (list) {
    showConfig();
    return;
  }

  if (setValue) {
    setConfig(setValue);
    showConfig();
    return;
  }

  showConfig();
}

function showConfig() {
  const config = readConfig();
  const configPath = getConfigFilePath();

  console.log('⚙️  CodeSync 配置');
  console.log('─'.repeat(50));
  console.log(`配置文件: ${configPath}`);
  console.log('─'.repeat(50));
  console.log(`API Key:        ${config.apiKey ? '••••••••' + config.apiKey.slice(-4) : '未设置'}`);
  console.log(`API Base:       ${config.apiBase}`);
  console.log(`Model:          ${config.model}`);
  console.log(`Convention:     ${config.convention}`);
  console.log(`Language:       ${config.language}`);
  console.log(`GitHub Token:   ${config.githubToken ? '••••••••' + config.githubToken.slice(-4) : '未设置'}`);
  console.log(`Gitee Token:    ${config.giteeToken ? '••••••••' + config.giteeToken.slice(-4) : '未设置'}`);
  console.log('─'.repeat(50));
}

function setConfig(setValue) {
  const parts = setValue.split('=');
  if (parts.length < 2) {
    console.error('❌ 格式错误，请使用: key=value');
    console.log('示例: codesync config set apiKey=sk-xxx');
    process.exit(1);
  }

  const key = parts[0].trim();
  const value = parts.slice(1).join('=').trim();

  const validKeys = [
    'apiKey',
    'apiBase',
    'model',
    'convention',
    'language',
    'githubToken',
    'giteeToken',
    'gitlabToken'
  ];

  if (!validKeys.includes(key)) {
    console.error(`❌ 无效的配置项: ${key}`);
    console.log(`有效配置项: ${validKeys.join(', ')}`);
    process.exit(1);
  }

  const result = writeConfig({ [key]: value });
  console.log(`✅ 配置已更新: ${key} = ${value}`);
  console.log(`当前值: ${result[key]}`);
}
