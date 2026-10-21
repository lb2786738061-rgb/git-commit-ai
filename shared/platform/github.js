import { readConfig } from '../config.js';

/**
 * 创建 GitHub 仓库
 * @param {string} repoName 仓库名称
 * @param {string} description 描述
 * @param {boolean} isPrivate 是否私有
 * @returns {Promise<string>} 仓库 clone URL
 */
export async function createGitHubRepo(repoName, description = '', isPrivate = false) {
  const config = readConfig();
  const token = config.githubToken || process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error('未配置 GitHub Token，请先配置：codesync config set githubToken=your_token');
  }

  try {
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CodeSync-App'
      },
      body: JSON.stringify({
        name: repoName,
        description: description,
        private: isPrivate,
        auto_init: false
      })
    });

    if (!response.ok) {
      let errorMsg = '创建 GitHub 仓库失败';
      try {
        const error = await response.json();
        errorMsg = error.message || errorMsg;
      } catch (_) {}

      if (errorMsg.includes('Resource not accessible by personal access token')) {
        throw new Error(
          'GitHub 拒绝了此令牌的操作权限。原因是您配置的是细粒度令牌 (以 github_pat_ 开头)，而 GitHub 官方策略明确规定【不支持使用细粒度令牌创建个人仓库】。\n' +
          '👉 解决方法：请使用 GitHub 经典令牌【Personal access token (classic)】：\n' +
          '   1. 浏览器访问：https://github.com/settings/tokens\n' +
          '   2. 点击右上角 "Generate new token" 下拉菜单，选择 "Generate new token (classic)"\n' +
          '   3. Note 填 codesync，勾选 [x] repo 权限（必须勾选完整 repo）\n' +
          '   4. 生成以 ghp_ 开头的经典令牌\n' +
          '   5. 在终端执行配置: codesync config set githubToken=ghp_你的新令牌'
        );
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.clone_url;
  } catch (error) {
    throw new Error(`GitHub API 调用失败: ${error.message}`);
  }
}

/**
 * 获取 GitHub 用户信息
 * @returns {Promise<object>} 用户信息
 */
export async function getGitHubUser() {
  const config = readConfig();
  const token = config.githubToken || process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error('未配置 GitHub Token');
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CodeSync-App'
      }
    });

    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`GitHub API 调用失败: ${error.message}`);
  }
}
