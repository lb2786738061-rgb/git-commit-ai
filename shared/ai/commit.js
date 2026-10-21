import { readConfig } from '../config.js';
import { getSystemPrompt, createUserPrompt, getChangelogPrompt } from './prompts.js';
import { getFromCache, setCache } from './cache.js';

/**
 * Clean LLM response content, stripping accidental markdown code block wrappers.
 * @param {string} text 
 * @returns {string}
 */
function cleanResponse(text) {
  let cleaned = text.trim();
  
  // Strip standard markdown blocks if the model disobeyed prompt instructions
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z0-9-]*\r?\n/, '').replace(/\r?\n```$/, '');
  }
  
  return cleaned.trim();
}

/**
 * 根据代码复杂度智能选择模型
 * @param {string} diff diff 内容
 * @param {object} config 配置对象
 * @returns {string} 选择的模型名称
 */
function selectSmartModel(diff, config) {
  if (!config.smartModel) {
    return config.model;
  }

  const diffLength = diff.length;
  const threshold = config.complexityThreshold || 5000;

  // 如果 diff 长度超过阈值，使用更强大的模型
  if (diffLength > threshold) {
    return config.powerfulModel || config.model;
  }

  // 否则使用快速模型
  return config.fastModel || config.model;
}

/**
 * Sends chat completion request to the configured OpenAI-compatible API endpoint.
 * @param {string} diff
 * @param {string} [detectedScope='']
 * @returns {Promise<string>}
 */
export async function generateCommitMessage(diff, detectedScope = '') {
  const config = readConfig();

  if (!config.apiKey) {
    throw new Error('API Key is missing. Please set your API key by running:\n  git-commit-ai config --set apiKey=YOUR_KEY\n\nAlternatively, you can set the OPENAI_API_KEY environment variable.');
  }

  // 生成缓存键
  const cacheKey = `${config.model}-${config.convention}-${config.language}-${detectedScope}-${diff.substring(0, 500)}`;

  // 尝试从缓存获取
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  // 智能选择模型
  const selectedModel = selectSmartModel(diff, config);

  // 规范化 apiBase 地址，避免用户填写了完整路径后重复拼接 /chat/completions
  let apiBase = (config.apiBase || 'https://api.openai.com/v1').trim().replace(/\/+$/, '');
  const url = apiBase.endsWith('/chat/completions') ? apiBase : `${apiBase}/chat/completions`;

  async function doRequest(modelToUse) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: 'system', content: getSystemPrompt(config.convention, config.language) },
          { role: 'user', content: createUserPrompt(diff.length > 25000 ? diff.slice(0, 25000) + '\n...[diff truncated for length]' : diff, detectedScope, config.convention) }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (_) {}
      throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error('Invalid response structure received from the API.');
    }

    return cleanResponse(data.choices[0].message.content);
  }

  try {
    let result;
    try {
      result = await doRequest(selectedModel);
    } catch (primaryError) {
      // 如果智能选择的模型调用失败，且与默认配置的主模型不一致，尝试降级回退到默认主模型
      if (config.model && selectedModel !== config.model) {
        result = await doRequest(config.model);
      } else {
        throw primaryError;
      }
    }

    // 存入缓存
    setCache(cacheKey, result);

    return result;
  } catch (error) {
    throw new Error(`API communication failed: ${error.message}`);
  }
}

/**
 * 根据提交历史生成 Markdown 格式的更新日志 (Changelog)。
 * @param {string[]} commits
 * @returns {Promise<string>}
 */
export async function generateChangelog(commits) {
  const config = readConfig();

  if (!config.apiKey) {
    throw new Error('API Key is missing. Please set your API key by running:\n  git-commit-ai config --set apiKey=YOUR_KEY\n\nAlternatively, you can set the OPENAI_API_KEY environment variable.');
  }

  // Normalise ending slash of apiBase
  let apiBase = config.apiBase.trim();
  if (apiBase.endsWith('/')) {
    apiBase = apiBase.slice(0, -1);
  }
  const url = `${apiBase}/chat/completions`;

  const commitsText = commits.join('\n');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: getChangelogPrompt(config.language) },
          { role: 'user', content: `Analyze the following commits and generate a release changelog:\n\n${commitsText}` }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (_) {}
      throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error('Invalid response structure received from the API.');
    }

    return cleanResponse(data.choices[0].message.content);
  } catch (error) {
    throw new Error(`API communication failed: ${error.message}`);
  }
}

/**
 * 根据提交历史生成 PR 标题和描述
 * @param {string[]} commits
 * @returns {Promise<{title: string, description: string}>}
 */
export async function generatePRContent(commits) {
  const config = readConfig();

  if (!config.apiKey) {
    throw new Error('API Key is missing. Please set your API key by running:\n  git-commit-ai config --set apiKey=YOUR_KEY\n\nAlternatively, you can set the OPENAI_API_KEY environment variable.');
  }

  // Normalise ending slash of apiBase
  let apiBase = config.apiBase.trim();
  if (apiBase.endsWith('/')) {
    apiBase = apiBase.slice(0, -1);
  }
  const url = `${apiBase}/chat/completions`;

  const commitsText = commits.join('\n');

  const langMap = {
    'en': 'English',
    'english': 'English',
    'zh': 'Chinese',
    'cn': 'Chinese',
    'zh-cn': 'Simplified Chinese',
    'chinese': 'Chinese',
    'ja': 'Japanese',
    'jp': 'Japanese',
    'japanese': 'Japanese'
  };

  const lowerLang = config.language.toLowerCase();
  const langName = langMap[lowerLang] || config.language;

  const systemPrompt = `You are an expert developer assistant specialized in writing high-quality Pull Request titles and descriptions.
Your task is to analyze a list of git commits and generate a professional PR title and description.

Rules:
1. The PR title should:
   - Be concise and descriptive (under 72 characters)
   - Use the imperative mood
   - Follow the format: <type>: <subject> (if applicable)
   - Summarize the main purpose of the PR

2. The PR description should:
   - Provide a clear overview of changes
   - Categorize changes into sections (Features, Bug Fixes, Refactoring, etc.)
   - Include relevant commit references
   - Be written in ${langName}
   - Use proper Markdown formatting

3. Output format:
   TITLE: <your title>
   DESCRIPTION: <your description>

CRITICAL: Output ONLY the title and description in the specified format. Do not include any intro or outro text.`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze the following commits and generate a PR title and description:\n\n${commitsText}` }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (_) {}
      throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error('Invalid response structure received from the API.');
    }

    const content = cleanResponse(data.choices[0].message.content);
    const titleMatch = content.match(/TITLE:\s*(.+?)(?=\nDESCRIPTION:|$)/s);
    const descMatch = content.match(/DESCRIPTION:\s*(.+)/s);

    return {
      title: titleMatch ? titleMatch[1].trim() : 'PR Title',
      description: descMatch ? descMatch[1].trim() : content
    };
  } catch (error) {
    throw new Error(`API communication failed: ${error.message}`);
  }
}
