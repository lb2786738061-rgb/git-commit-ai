import { readConfig } from '../config.js';

/**
 * 为代码生成详细注释
 * @param {string} code 代码内容
 * @param {string} language 编程语言
 * @returns {Promise<string>} 带注释的代码
 */
export async function generateAnnotation(code, language = 'javascript') {
  const config = readConfig();

  if (!config.apiKey) {
    throw new Error('API Key 未配置');
  }

  const prompt = `请为以下${language}代码生成详细的中文注释：

${code}

要求：
1. 为每个函数添加注释说明功能
2. 为复杂逻辑添加行内注释
3. 保持代码结构和逻辑不变，只添加注释
4. 注释要清晰易懂，帮助理解代码
5. 输出完整的带注释代码`;

  try {
    const response = await fetch(`${config.apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的代码注释助手，擅长为代码添加清晰、有用的注释。'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`API 调用失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    throw new Error(`生成注释失败: ${error.message}`);
  }
}

/**
 * 解释代码功能
 * @param {string} code 代码内容
 * @param {string} language 编程语言
 * @returns {Promise<string>} 代码解释
 */
export async function explainCode(code, language = 'javascript') {
  const config = readConfig();

  if (!config.apiKey) {
    throw new Error('API Key 未配置');
  }

  const prompt = `请详细解释以下${language}代码的功能和逻辑：

${code}

请从以下方面解释：
1. 代码的整体功能是什么
2. 关键函数和变量分别起什么作用
3. 代码的执行流程
4. 可能存在的优化建议
5. 适用场景说明

请用通俗易懂的语言解释，适合初学者理解。`;

  try {
    const response = await fetch(`${config.apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的代码解释助手，擅长用通俗易懂的语言解释代码。'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`API 调用失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    throw new Error(`解释代码失败: ${error.message}`);
  }
}

/**
 * 代码审查
 * @param {string} code 代码内容
 * @param {string} language 编程语言
 * @returns {Promise<string>} 审查报告
 */
export async function reviewCode(code, language = 'javascript') {
  const config = readConfig();

  if (!config.apiKey) {
    throw new Error('API Key 未配置');
  }

  const prompt = `请对以下${language}代码进行审查：

${code}

请从以下方面进行审查：
1. 代码质量（可读性、可维护性）
2. 潜在的 bug 或错误
3. 性能优化建议
4. 安全性问题
5. 最佳实践建议
6. 命名规范检查

请给出具体的改进建议，包括代码示例。`;

  try {
    const response = await fetch(`${config.apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的代码审查专家，擅长发现代码问题和提供改进建议。'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`API 调用失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    throw new Error(`代码审查失败: ${error.message}`);
  }
}
