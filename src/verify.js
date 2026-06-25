/**
 * 校验提交消息是否符合 Conventional Commits 规范。
 * @param {string} message 完整提交消息
 * @param {string} [convention='angular'] 规范类型 ('angular' | 'gitmoji')
 * @returns {{ valid: boolean, reason?: string }}
 */
export function verifyCommitMessage(message, convention = 'angular') {
  if (!message || message.trim() === '') {
    return { valid: false, reason: '提交消息不能为空。' };
  }

  // 获取第一行（subject line）
  const firstLine = message.split(/\r?\n/)[0].trim();

  // 豁免条件 1：合并提交
  if (/^(Merge\s+branch|Merge\s+pull\s+request|Merge\s+remote-tracking\s+branch|Merge\s+tag|Merge\s+commit)/i.test(firstLine)) {
    return { valid: true };
  }

  // 豁免条件 2：撤销提交
  if (/^(Revert\s+|revert:)/i.test(firstLine)) {
    return { valid: true };
  }

  // 豁免条件 3：初始化提交
  if (/^(Initial\s+commit|init)/i.test(firstLine)) {
    return { valid: true };
  }

  const types = 'feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert';

  if (convention === 'gitmoji') {
    // 匹配 emoji（包括 Unicode Emoji 或者 :emoji: 格式的短码）
    // emoji 短码格式为 :sparkles: :bug: 等
    // Unicode emoji 范围宽泛，我们这里采用通用 emoji 正则匹配
    const emojiRegex = /^(?::[a-z0-9_+-]+:|[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/;
    
    if (!emojiRegex.test(firstLine)) {
      return {
        valid: false,
        reason: 'Gitmoji 规范要求消息开头必须包含一个 Emoji 表情符号或其短码（例如 :sparkles: 或 ✨）。'
      };
    }

    // 去除开头的 emoji 及其后的空格，再校验常规格式
    const withoutEmoji = firstLine.replace(emojiRegex, '').trim();
    const ccRegex = new RegExp(`^(${types})(\\([a-z0-9_-]+\\))?!?: .+$`);
    if (!ccRegex.test(withoutEmoji)) {
      return {
        valid: false,
        reason: `Emoji 后的部分不符合 Conventional Commits 规范。\n正确格式: <emoji> <type>(<scope>): <subject>\n有效类型: ${types.split('|').join(', ')}`
      };
    }
  } else {
    // Angular 规范
    const ccRegex = new RegExp(`^(${types})(\\([a-z0-9_-]+\\))?!?: .+$`);
    if (!ccRegex.test(firstLine)) {
      return {
        valid: false,
        reason: `提交消息不符合 Conventional Commits 规范。\n正确格式: <type>(<scope>): <subject>\n有效类型: ${types.split('|').join(', ')}`
      };
    }
  }

  // 校验长度限制，第一行推荐不超过 100 个字符
  if (firstLine.length > 100) {
    return {
      valid: false,
      reason: `提交消息第一行长度 (${firstLine.length} 字符) 超过了最大限制 (100 字符)。请保持简短。`
    };
  }

  return { valid: true };
}
