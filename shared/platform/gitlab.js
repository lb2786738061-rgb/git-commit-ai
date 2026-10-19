import { readConfig } from '../config.js';

/**
 * 创建 GitLab 仓库
 * @param {string} repoName 仓库名称
 * @param {string} description 描述
 * @param {boolean} isPrivate 是否私有
 * @returns {Promise<string>} 仓库 clone URL
 */
export async function createGitLabRepo(repoName, description = '', isPrivate = false) {
  const config = readConfig();
  const token = config.gitlabToken || process.env.GITLAB_TOKEN;

  if (!token) {
    throw new Error('未配置 GitLab Token，请先配置：codesync config set gitlabToken=your_token');
  }

  const gitlabBase = config.gitlabBase || process.env.GITLAB_BASE || 'https://gitlab.com/api/v4';

  try {
    const response = await fetch(`${gitlabBase}/projects`, {
      method: 'POST',
      headers: {
        'PRIVATE-TOKEN': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: repoName,
        description: description,
        visibility: isPrivate ? 'private' : 'public',
        initialize_with_readme: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建 GitLab 仓库失败');
    }

    const data = await response.json();
    return data.http_url_to_repo;
  } catch (error) {
    throw new Error(`GitLab API 调用失败: ${error.message}`);
  }
}

/**
 * 获取 GitLab 用户信息
 * @returns {Promise<object>} 用户信息
 */
export async function getGitLabUser() {
  const config = readConfig();
  const token = config.gitlabToken || process.env.GITLAB_TOKEN;

  if (!token) {
    throw new Error('未配置 GitLab Token');
  }

  const gitlabBase = config.gitlabBase || process.env.GITLAB_BASE || 'https://gitlab.com/api/v4';

  try {
    const response = await fetch(`${gitlabBase}/user`, {
      headers: {
        'PRIVATE-TOKEN': token
      }
    });

    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`GitLab API 调用失败: ${error.message}`);
  }
}