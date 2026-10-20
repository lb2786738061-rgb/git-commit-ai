import pc from 'picocolors';
import ora from 'ora';
import path from 'path';
import fs from 'fs';
import { pluginManager, PLUGIN_TYPES, PLUGINS_DIR } from '../../../shared/plugin/pluginManager.js';

export async function pluginCommand(action, options) {
  console.log(pc.cyan(pc.bold('\n🔌 CodeSync - 插件管理')));
  console.log(pc.dim('─'.repeat(50)));

  try {
    switch (action) {
      case 'install':
        await handleInstall(options);
        break;
      case 'uninstall':
        await handleUninstall(options);
        break;
      case 'list':
        await handleList();
        break;
      case 'load':
        await handleLoad(options);
        break;
      default:
        console.error(pc.red('❌ 未知的操作类型'));
        console.log(pc.dim('可用操作: install, uninstall, list, load'));
        process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`\n❌ 操作失败: ${error.message}`));
    process.exit(1);
  }
}

async function handleInstall(options) {
  const { name, type, path: pluginPath, config } = options;

  if (!name || !type || !pluginPath) {
    console.error(pc.red('❌ 缺少必要参数'));
    console.log(pc.dim('  使用: codesync plugin install --name <name> --type <type> --path <path> [--config <config>]'));
    console.log(pc.dim('  插件类型: ai-provider, platform, pre-commit-hook, post-commit-hook'));
    return;
  }

  const spinner = ora(pc.cyan('正在安装插件...')).start();

  try {
    await pluginManager.install({
      name,
      type,
      path: pluginPath,
      config: config ? JSON.parse(config) : {}
    });

    spinner.succeed(pc.green('插件安装成功'));

    console.log(pc.cyan('\n📋 插件信息:'));
    console.log(pc.dim(`  名称: ${name}`));
    console.log(pc.dim(`  类型: ${type}`));
    console.log(pc.dim(`  路径: ${pluginPath}`));
  } catch (error) {
    spinner.fail(pc.red('安装失败'));
    throw error;
  }
}

async function handleUninstall(options) {
  const { name } = options;

  if (!name) {
    console.error(pc.red('❌ 缺少插件名称'));
    console.log(pc.dim('  使用: codesync plugin uninstall --name <name>'));
    return;
  }

  const spinner = ora(pc.cyan('正在卸载插件...')).start();

  try {
    pluginManager.uninstall(name);
    spinner.succeed(pc.green('插件卸载成功'));
  } catch (error) {
    spinner.fail(pc.red('卸载失败'));
    throw error;
  }
}

async function handleList() {
  console.log(pc.cyan('\n📋 已安装的插件:'));
  console.log(pc.dim('─'.repeat(50)));

  const plugins = pluginManager.list();

  if (plugins.length === 0) {
    console.log(pc.dim('  暂无已安装的插件'));
    return;
  }

  plugins.forEach(plugin => {
    console.log(pc.cyan(`\n  ${plugin.name}`));
    console.log(pc.dim(`    类型: ${plugin.type}`));
    console.log(pc.dim(`    描述: ${plugin.description || '无'}`));
    console.log(pc.dim(`    版本: ${plugin.version || '未知'}`));
  });

  console.log(pc.cyan('\n💡 插件类型:'));
  console.log(pc.dim('  ai-provider - AI 服务提供商'));
  console.log(pc.dim('  platform - Git 平台适配器'));
  console.log(pc.dim('  pre-commit-hook - 提交前钩子'));
  console.log(pc.dim('  post-commit-hook - 提交后钩子'));
}

async function handleLoad(options) {
  const { path: pluginPath } = options;

  if (!pluginPath) {
    console.error(pc.red('❌ 缺少插件路径'));
    console.log(pc.dim('  使用: codesync plugin load --path <path>'));
    return;
  }

  const spinner = ora(pc.cyan('正在加载插件...')).start();

  try {
    const plugin = await pluginManager.loadFromFile(pluginPath);
    spinner.succeed(pc.green('插件加载成功'));

    console.log(pc.cyan('\n📋 插件信息:'));
    console.log(pc.dim(`  名称: ${plugin.name}`));
    console.log(pc.dim(`  类型: ${plugin.type}`));
  } catch (error) {
    spinner.fail(pc.red('加载失败'));
    throw error;
  }
}
