import fs from 'fs';
import path from 'path';
import pc from 'picocolors';

// 插件目录
const PLUGINS_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.codesync-plugins');
const PLUGINS_CONFIG = path.join(PLUGINS_DIR, 'plugins.json');

// 插件类型
const PLUGIN_TYPES = {
  AI_PROVIDER: 'ai-provider',
  PLATFORM: 'platform',
  PRE_COMMIT_HOOK: 'pre-commit-hook',
  POST_COMMIT_HOOK: 'post-commit-hook'
};

// 确保插件目录存在
function ensurePluginsDir() {
  if (!fs.existsSync(PLUGINS_DIR)) {
    fs.mkdirSync(PLUGINS_DIR, { recursive: true });
  }
}

// 读取插件配置
function readPluginsConfig() {
  if (!fs.existsSync(PLUGINS_CONFIG)) {
    return { installed: {} };
  }
  try {
    const content = fs.readFileSync(PLUGINS_CONFIG, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return { installed: {} };
  }
}

// 写入插件配置
function writePluginsConfig(config) {
  ensurePluginsDir();
  fs.writeFileSync(PLUGINS_CONFIG, JSON.stringify(config, null, 2), 'utf-8');
}

// 插件管理器
export class PluginManager {
  constructor() {
    this.plugins = {};
    this.hooks = {
      'ai-provider': [],
      'platform': [],
      'pre-commit': [],
      'post-commit': []
    };
  }

  // 注册插件
  register(plugin) {
    if (!plugin.name || !plugin.type) {
      throw new Error('Plugin must have name and type');
    }

    if (!Object.values(PLUGIN_TYPES).includes(plugin.type)) {
      throw new Error(`Invalid plugin type: ${plugin.type}`);
    }

    this.plugins[plugin.name] = plugin;

    // 注册到对应的钩子
    if (this.hooks[plugin.type]) {
      this.hooks[plugin.type].push(plugin);
    }

    console.log(pc.green(`✅ Plugin registered: ${plugin.name}`));
  }

  // 注销插件
  unregister(pluginName) {
    const plugin = this.plugins[pluginName];
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }

    // 从钩子中移除
    if (this.hooks[plugin.type]) {
      this.hooks[plugin.type] = this.hooks[plugin.type].filter(p => p.name !== pluginName);
    }

    delete this.plugins[pluginName];
    console.log(pc.yellow(`⚠️  Plugin unregistered: ${pluginName}`));
  }

  // 获取插件
  get(pluginName) {
    return this.plugins[pluginName];
  }

  // 列出所有插件
  list() {
    return Object.values(this.plugins);
  }

  // 执行钩子
  async executeHook(hookType, context) {
    const hooks = this.hooks[hookType] || [];
    const results = [];

    for (const hook of hooks) {
      if (hook.execute) {
        try {
          const result = await hook.execute(context);
          results.push({ plugin: hook.name, result });
        } catch (error) {
          console.error(pc.red(`Plugin ${hook.name} failed:`), error.message);
          results.push({ plugin: hook.name, error: error.message });
        }
      }
    }

    return results;
  }

  // 从文件加载插件
  async loadFromFile(pluginPath) {
    try {
      const module = await import(path.resolve(pluginPath));
      const plugin = module.default || module;

      this.register(plugin);
      return plugin;
    } catch (error) {
      throw new Error(`Failed to load plugin from ${pluginPath}: ${error.message}`);
    }
  }

  // 安装插件
  async install(pluginConfig) {
    const { name, type, path: pluginPath, config } = pluginConfig;

    const pluginsConfig = readPluginsConfig();

    if (pluginsConfig.installed[name]) {
      throw new Error(`Plugin already installed: ${name}`);
    }

    // 加载插件
    await this.loadFromFile(pluginPath);

    // 保存配置
    pluginsConfig.installed[name] = {
      name,
      type,
      path: pluginPath,
      config: config || {},
      installedAt: new Date().toISOString()
    };

    writePluginsConfig(pluginsConfig);

    console.log(pc.green(`✅ Plugin installed: ${name}`));
  }

  // 卸载插件
  uninstall(pluginName) {
    const pluginsConfig = readPluginsConfig();

    if (!pluginsConfig.installed[pluginName]) {
      throw new Error(`Plugin not installed: ${pluginName}`);
    }

    // 注销插件
    this.unregister(pluginName);

    // 从配置中移除
    delete pluginsConfig.installed[pluginName];
    writePluginsConfig(pluginsConfig);

    console.log(pc.green(`✅ Plugin uninstalled: ${pluginName}`));
  }

  // 加载已安装的插件
  async loadInstalled() {
    const pluginsConfig = readPluginsConfig();

    for (const [name, config] of Object.entries(pluginsConfig.installed || {})) {
      try {
        await this.loadFromFile(config.path);
      } catch (error) {
        console.error(pc.red(`Failed to load plugin ${name}:`), error.message);
      }
    }
  }
}

// 单例实例
export const pluginManager = new PluginManager();

// 导出常量
export { PLUGIN_TYPES, PLUGINS_DIR };
