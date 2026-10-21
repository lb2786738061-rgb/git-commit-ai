import { readConfig } from '../config.js';

/**
 * AI 冲突分析智能体：分析 Git 多人协作冲突并提供智能合并建议
 * @param {object} options
 * @param {string[]} options.conflictFiles 冲突文件列表
 * @param {string} [options.conflictDiff] 冲突详细内容或差异
 * @returns {Promise<{summary: string, files: string[], suggestions: string}>}
 */
export async function analyzeConflict(options = {}) {
  const { conflictFiles = [], conflictDiff = '' } = options;

  if (conflictFiles.length === 0 && !conflictDiff) {
    return {
      summary: '未检测到冲突内容',
      files: [],
      suggestions: '当前工作区代码没有合并冲突。'
    };
  }

  const config = readConfig();

  // 若未配置 API Key，优雅降级给出结构化指引
  if (!config.apiKey) {
    return {
      summary: `检测到 ${conflictFiles.length} 个文件存在多人协作冲突`,
      files: conflictFiles,
      suggestions: [
        '💡 智能体提示：请按以下步骤解决多人代码冲突：',
        ...conflictFiles.map(f => `  - 打开文件 [${f}]，搜索查找 <<<<<<< HEAD 冲突标记`),
        '  - 对比本地代码（HEAD）与远程团队代码（incoming），选择保留或合并',
        '  - 删除 <<<<<<<, =======, >>>>>>> 标记行并保存文件',
        '  - 运行 codesync push 或 git add 重新提交即可完成合并。'
      ].join('\n')
    };
  }

  // 截断过长 diff 保证请求安全
  const safeDiff = (conflictDiff || conflictFiles.join('\n')).slice(0, 10000);

  const prompt = `你是一个 Git 协同开发专家与冲突审查智能体。
当前团队成员在协作推送/拉取代码时发生了合并冲突。
冲突文件列表：
${conflictFiles.map(f => `- ${f}`).join('\n')}

冲突详情与代码片段：
\`\`\`diff
${safeDiff}
\`\`\`

请用清晰、专业的简体中文进行审查，给出：
1. 冲突核心原因分析（本地修改与远程修改分别做了什么）。
2. 具体解决策略与建议（如何保留两者的核心逻辑，避免功能丢失）。
3. 解决冲突的标准操作步骤。`;

  try {
    let apiBase = (config.apiBase || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const endpoint = apiBase.endsWith('/chat/completions')
      ? apiBase
      : `${apiBase}/chat/completions`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: '你是一个专业的 Git 协作冲突解决助手，请用纯简体中文回答。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`AI 服务返回 HTTP ${response.status}`);
    }

    const data = await response.json();
    const suggestions = data?.choices?.[0]?.message?.content?.trim() || '';

    return {
      summary: `检测到 ${conflictFiles.length} 个文件存在多人协作冲突，AI 智能体已完成冲突分析`,
      files: conflictFiles,
      suggestions: suggestions || '未能生成具体分析建议，请手动排查冲突标记。'
    };
  } catch (error) {
    return {
      summary: `检测到 ${conflictFiles.length} 个文件存在冲突`,
      files: conflictFiles,
      suggestions: [
        `⚠️ AI 智能体分析暂时不可用 (${error.message})，降级指引如下：`,
        ...conflictFiles.map(f => `  - 请检查文件 [${f}] 中的冲突标记并合并`),
        '  - 消除冲突标记后执行 git add 暂存并重新推送。'
      ].join('\n')
    };
  }
}
