import { readConfig } from './config.js';
import { getSystemPrompt, createUserPrompt } from './prompts.js';

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

  // Normalise ending slash of apiBase
  let apiBase = config.apiBase.trim();
  if (apiBase.endsWith('/')) {
    apiBase = apiBase.slice(0, -1);
  }
  const url = `${apiBase}/chat/completions`;

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
          { role: 'system', content: getSystemPrompt(config.convention) },
          { role: 'user', content: createUserPrompt(diff, detectedScope, config.convention) }
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
  } catch (error) {
    throw new Error(`API communication failed: ${error.message}`);
  }
}
