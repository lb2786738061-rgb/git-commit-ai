import { readConfig } from '../config.js';

/**
 * 创建 Gitee 仓库
 * @param {string} repoName 仓库名称
 * @param {string} description 描述
 * @param {boolean} isPrivate 是否私有
 * @returns {Promise<string>} 仓库 clone URL
 */
export async function createGiteeRepo(repoName, description = '', isPrivate = false) {
  const config = readConfig();
  const token = config.giteeToken || process.env.GITEE_TOKEN;

  if (!token) {
    throw new Error('未配置 Gitee Token，请先配置：codesync config set giteeToken=your_token');
  }

  try {
    const response = await fetch('https://gitee.com/api/v5/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: repoName,
        description: description,
        private: isPrivate,
        auto_init: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建 Gitee 仓库失败');
    }

    const data = await response.json();
    return data.clone_url;
  } catch (error) {
    throw new Error(`Gitee API 调用失败: ${error.message}`);
  }
}

/**
 * 获取 Gitee 用户信息
 * @returns {Promise<object>} 用户信息
 */
export async function getGiteeUser() {
  const config = readConfig();
  const token = config.giteeToken || process.env.GITEE_TOKEN;

  if (!token) {
    throw new Error('未配置 Gitee Token');
  }

  try {
    const response = await fetch('https://gitee.com/api/v5/user', {
      headers: {
        'Authorization': `token ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Gitee API 调用失败: ${error.message}`);
  }
}
