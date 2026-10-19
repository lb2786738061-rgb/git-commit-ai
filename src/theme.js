import pc from 'picocolors';

/**
 * 主题配置
 */
const THEMES = {
  default: {
    // 使用默认的 picocolors 颜色
    cyan: (text) => pc.cyan(text),
    green: (text) => pc.green(text),
    yellow: (text) => pc.yellow(text),
    red: (text) => pc.red(text),
    blue: (text) => pc.blue(text),
    dim: (text) => pc.dim(text),
    bold: (text) => pc.bold(text),
    white: (text) => pc.white(text)
  },
  minimal: {
    // 最小化主题，几乎不使用颜色
    cyan: (text) => text,
    green: (text) => text,
    yellow: (text) => text,
    red: (text) => text,
    blue: (text) => text,
    dim: (text) => text,
    bold: (text) => text,
    white: (text) => text
  },
  colorful: {
    // 彩色主题，使用更鲜艳的颜色
    cyan: (text) => pc.cyan(pc.bold(text)),
    green: (text) => pc.green(pc.bold(text)),
    yellow: (text) => pc.yellow(pc.bold(text)),
    red: (text) => pc.red(pc.bold(text)),
    blue: (text) => pc.blue(pc.bold(text)),
    dim: (text) => pc.gray(text),
    bold: (text) => pc.bold(text),
    white: (text) => pc.white(pc.bold(text))
  }
};

/**
 * 获取指定主题的颜色函数
 * @param {string} themeName 主题名称
 * @returns {object} 颜色函数对象
 */
export function getTheme(themeName = 'default') {
  return THEMES[themeName] || THEMES.default;
}

/**
 * 设置全局主题（通过替换 pc 的方法）
 * 注意：这是一个简单的实现，实际应用中可能需要更复杂的主题系统
 * @param {string} themeName 主题名称
 */
export function setTheme(themeName = 'default') {
  const theme = getTheme(themeName);
  // 在实际应用中，这里可以全局替换颜色函数
  // 目前仅返回主题对象供使用
  return theme;
}
