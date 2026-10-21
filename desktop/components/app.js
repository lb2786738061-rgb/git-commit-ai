/**
 * CodeSync Desktop - 前端应用逻辑
 * 负责页面路由、渲染、与 Electron 主进程通信
 */

const API = window.electronAPI;

// ── 页面路由 ────────────────────────────────────────────────

const pages = {
  upload: renderUploadPage,
  download: renderDownloadPage,
  history: renderHistoryPage,
  'ai-commit': renderAICommitPage,
  'ai-code': renderAICodePage,
  team: renderTeamPage,
  pr: renderPRPage,
  issues: renderIssuesPage,
  performance: renderPerformancePage,
  settings: renderSettingsPage
};

let currentPage = 'upload';

document.addEventListener('DOMContentLoaded', () => {
  initTitlebar();
  initNavigation();
  navigateTo('upload');
});

function initTitlebar() {
  document.getElementById('btn-minimize').addEventListener('click', () => API.minimize());
  document.getElementById('btn-maximize').addEventListener('click', () => API.maximize());
  document.getElementById('btn-close').addEventListener('click', () => API.close());
}

function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateTo(page);
    });
  });
}

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  const content = document.getElementById('main-content');
  content.innerHTML = '';
  if (pages[page]) {
    pages[page](content);
  }
}

// ── 工具函数 ────────────────────────────────────────────────

function el(tag, attrs = {}, ...children) {
  const elem = document.createElement(tag);
  if (typeof attrs === 'string') {
    attrs = { class: attrs };
  } else if (!attrs || typeof attrs !== 'object' || (attrs instanceof Node)) {
    if (attrs instanceof Node) children.unshift(attrs);
    attrs = {};
  }
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'class') elem.className = val;
    else if (key === 'style' && typeof val === 'object') Object.assign(elem.style, val);
    else if (key.startsWith('on') && typeof val === 'function') elem.addEventListener(key.slice(2).toLowerCase(), val);
    else if (val !== undefined && val !== null) elem.setAttribute(key, val);
  }
  for (const child of children) {
    if (typeof child === 'string' || typeof child === 'number') {
      elem.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      elem.appendChild(child);
    }
  }
  return elem;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  const toast = el('div', { class: `toast toast-${type}` },
    el('span', { class: 'toast-icon' }, icons[type] || 'ℹ'),
    el('span', { class: 'toast-msg' }, message)
  );
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function createPageHeader(title, subtitle) {
  return el('div', { class: 'page-header' },
    el('h1', { class: 'page-title' }, title),
    el('p', { class: 'page-subtitle' }, subtitle)
  );
}

function createCard(title, ...children) {
  return el('div', { class: 'card' },
    el('div', { class: 'card-title' }, title),
    ...children
  );
}

function createFormGroup(label, inputElem) {
  return el('div', { class: 'form-group' },
    el('label', { class: 'form-label' }, label),
    inputElem
  );
}

function createButton(text, onClick, variant = 'primary') {
  const btn = el('button', { class: `btn btn-${variant}`, onClick }, text);
  return btn;
}

function createSpinner() {
  return el('span', { class: 'spinner' });
}

// ── 上传项目页面 ────────────────────────────────────────────

function renderUploadPage(container) {
  container.appendChild(createPageHeader('上传项目', '将当前项目上传到 GitHub / Gitee / GitLab 远程仓库'));

  const pathInput = el('input', { class: 'form-input', placeholder: '留空默认当前目录，或点击右侧选择', value: '' });
  const selectDirBtn = el('button', {
    class: 'btn btn-secondary',
    style: { whiteSpace: 'nowrap', padding: '0 14px', height: '36px' },
    onClick: async () => {
      try {
        const selected = await API.selectDir();
        if (selected) {
          pathInput.value = selected;
        }
      } catch (e) {
        showToast('选择目录失败: ' + e.message, 'error');
      }
    }
  }, '📁 浏览目录');

  const pathRow = el('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
    pathInput,
    selectDirBtn
  );

  const nameInput = el('input', { class: 'form-input', placeholder: '自动检测项目名称（可选）' });
  const descInput = el('input', { class: 'form-input', placeholder: '仓库描述（可选）' });
  const platformSelect = el('select', { class: 'form-select' },
    el('option', { value: 'github' }, 'GitHub'),
    el('option', { value: 'gitee' }, 'Gitee'),
    el('option', { value: 'gitlab' }, 'GitLab')
  );
  const privateToggle = el('input', { type: 'checkbox', id: 'private-toggle' });

  const logOutput = el('div', { class: 'output-log' }, '等待操作...');

  container.appendChild(createCard('📦 上传配置',
    createFormGroup('项目路径', pathRow),
    el('div', { class: 'form-row' },
      el('div', { class: 'form-group' },
        el('label', { class: 'form-label' }, '仓库名称'),
        nameInput
      ),
      el('div', { class: 'form-group' },
        el('label', { class: 'form-label' }, '目标平台'),
        platformSelect
      )
    ),
    createFormGroup('仓库描述', descInput),
    el('div', { class: 'toggle-group' },
      el('div', { class: 'toggle-info' },
        el('div', { class: 'toggle-title' }, '私有仓库'),
        el('div', { class: 'toggle-desc' }, '创建私有仓库而非公开仓库')
      ),
      el('label', { class: 'toggle' },
        privateToggle,
        el('span', { class: 'toggle-slider' })
      )
    ),
    el('div', { style: { marginTop: '16px' } },
      createButton('开始上传', () => handleUpload())
    )
  ));

  container.appendChild(createCard('📋 操作日志', logOutput));

  async function handleUpload() {
    logOutput.textContent = '';
    logOutput.appendChild(createSpinner());
    logOutput.appendChild(document.createTextNode(' 正在上传项目...'));

    try {
      const result = await API.uploadProject({
        path: pathInput.value || undefined,
        platform: platformSelect.value,
        name: nameInput.value || undefined,
        description: descInput.value || undefined,
        isPrivate: privateToggle.checked
      });

      logOutput.innerHTML = `<span class="log-success">✓ 上传成功</span>\n<span class="log-info">仓库地址: ${result.repoUrl}</span>`;
      showToast('项目上传成功！', 'success');
    } catch (err) {
      logOutput.innerHTML = `<span class="log-error">✗ 上传失败: ${err.message}</span>`;
      showToast('上传失败: ' + err.message, 'error');
    }
  }
}

// ── 下载项目页面 ────────────────────────────────────────────

function renderDownloadPage(container) {
  container.appendChild(createPageHeader('下载项目', '从远程仓库克隆项目到本地'));

  const urlInput = el('input', { class: 'form-input', placeholder: 'https://github.com/user/repo.git' });
  const pathInput = el('input', { class: 'form-input', placeholder: '留空默认当前目录，或点击右侧选择' });
  const selectDirBtn = el('button', {
    class: 'btn btn-secondary',
    style: { whiteSpace: 'nowrap', padding: '0 14px', height: '36px' },
    onClick: async () => {
      try {
        const selected = await API.selectDir();
        if (selected) {
          pathInput.value = selected;
        }
      } catch (e) {
        showToast('选择目录失败: ' + e.message, 'error');
      }
    }
  }, '📁 浏览目录');

  const pathRow = el('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
    pathInput,
    selectDirBtn
  );

  const installToggle = el('input', { type: 'checkbox', id: 'install-toggle' });
  const logOutput = el('div', { class: 'output-log' }, '等待操作...');

  container.appendChild(createCard('📥 下载配置',
    createFormGroup('仓库 URL', urlInput),
    createFormGroup('下载路径', pathRow),
    el('div', { class: 'toggle-group' },
      el('div', { class: 'toggle-info' },
        el('div', { class: 'toggle-title' }, '自动安装依赖'),
        el('div', { class: 'toggle-desc' }, '克隆完成后自动运行 npm install')
      ),
      el('label', { class: 'toggle' },
        installToggle,
        el('span', { class: 'toggle-slider' })
      )
    ),
    el('div', { style: { marginTop: '16px' } },
      createButton('开始下载', () => handleDownload())
    )
  ));
  container.appendChild(createCard('📋 操作日志', logOutput));

  async function handleDownload() {
    if (!urlInput.value.trim()) {
      showToast('请输入仓库 URL', 'error');
      return;
    }

    logOutput.textContent = '';
    logOutput.appendChild(createSpinner());
    logOutput.appendChild(document.createTextNode(' 正在下载项目...'));

    try {
      const result = await API.downloadProject({
        url: urlInput.value,
        path: pathInput.value || undefined,
        install: installToggle.checked
      });

      logOutput.innerHTML = `<span class="log-success">✓ 下载成功</span>\n<span class="log-info">项目路径: ${result.projectPath}</span>`;
      showToast('项目下载成功！', 'success');
    } catch (err) {
      logOutput.innerHTML = `<span class="log-error">✗ 下载失败: ${err.message}</span>`;
      showToast('下载失败: ' + err.message, 'error');
    }
  }
}

// ── 提交历史页面 ────────────────────────────────────────────

function renderHistoryPage(container) {
  container.appendChild(createPageHeader('提交历史', '查看当前仓库的提交记录'));

  const commitList = el('div', { class: 'commit-list' });
  commitList.appendChild(el('div', { class: 'empty-state' }, el('p', {}, '加载中...')));

  container.appendChild(createCard('📜 最近提交', commitList));

  (async () => {
    try {
      const commits = await API.getCommitHistory(20);
      commitList.innerHTML = '';

      if (!commits || commits.length === 0) {
        commitList.appendChild(el('div', { class: 'empty-state' }, el('p', {}, '暂无提交记录')));
        return;
      }

      for (const commit of commits) {
        const item = el('div', { class: 'commit-item' },
          el('span', { class: 'commit-hash' }, commit.hash ? commit.hash.slice(0, 7) : '------'),
          el('span', { class: 'commit-subject' }, commit.subject || commit.message || commit),
          el('span', { class: 'commit-meta' },
            commit.author ? el('span', {}, commit.author) : '',
            commit.date ? el('span', {}, commit.date) : ''
          )
        );
        commitList.appendChild(item);
      }
    } catch (err) {
      commitList.innerHTML = '';
      commitList.appendChild(el('div', { class: 'empty-state' }, el('p', {}, `加载失败: ${err.message}`)));
    }
  })();
}

// ── AI 智能提交页面 ────────────────────────────────────────

function renderAICommitPage(container) {
  container.appendChild(createPageHeader('智能提交', '使用 AI 自动生成符合规范的提交信息'));

  const diffOutput = el('div', { class: 'output-log' }, '等待获取暂存区更改...');
  const commitMsgInput = el('textarea', { class: 'form-textarea', placeholder: 'AI 将自动生成提交信息...' });
  const resultOutput = el('div', { class: 'output-log' }, '等待提交...');

  container.appendChild(createCard('📝 暂存区更改',
    diffOutput,
    el('div', { style: { marginTop: '12px' } },
      createButton('刷新暂存区', () => refreshDiff(), 'secondary')
    )
  ));

  container.appendChild(createCard('🤖 AI 提交信息',
    createFormGroup('提交信息', commitMsgInput),
    el('div', { class: 'form-row' },
      createButton('生成提交信息', () => generateMessage(), 'primary'),
      createButton('确认提交', () => doCommit(), 'success')
    )
  ));

  container.appendChild(createCard('📋 结果', resultOutput));

  async function refreshDiff() {
    diffOutput.textContent = '';
    diffOutput.appendChild(createSpinner());
    diffOutput.appendChild(document.createTextNode(' 正在获取暂存区更改...'));

    try {
      const diff = await API.getStagedDiff();
      if (!diff || !diff.trim()) {
        diffOutput.innerHTML = '<span class="log-warn">⚠ 没有暂存的更改，请先运行 git add</span>';
      } else {
        diffOutput.textContent = diff.slice(0, 2000) + (diff.length > 2000 ? '\n... (已截断)' : '');
      }
    } catch (err) {
      diffOutput.innerHTML = `<span class="log-error">✗ 获取失败: ${err.message}</span>`;
    }
  }

  async function generateMessage() {
    commitMsgInput.value = '';
    commitMsgInput.placeholder = '正在生成...';

    try {
      const result = await API.generateCommitMessage();
      commitMsgInput.value = result.message || result;
      showToast('提交信息生成成功', 'success');
    } catch (err) {
      commitMsgInput.value = '';
      commitMsgInput.placeholder = '生成失败';
      showToast('生成失败: ' + err.message, 'error');
    }
  }

  async function doCommit() {
    const message = commitMsgInput.value.trim();
    if (!message) {
      showToast('请先生成或输入提交信息', 'error');
      return;
    }

    resultOutput.textContent = '';
    resultOutput.appendChild(createSpinner());
    resultOutput.appendChild(document.createTextNode(' 正在提交...'));

    try {
      await API.commitChanges(message);
      resultOutput.innerHTML = '<span class="log-success">✓ 提交成功</span>';
      showToast('提交成功！', 'success');
      commitMsgInput.value = '';
    } catch (err) {
      resultOutput.innerHTML = `<span class="log-error">✗ 提交失败: ${err.message}</span>`;
      showToast('提交失败: ' + err.message, 'error');
    }
  }

  refreshDiff();
}

// ── AI 代码助手页面 ────────────────────────────────────────

function renderAICodePage(container) {
  container.appendChild(createPageHeader('代码助手', 'AI 代码注解、解释和审查'));

  const fileInput = el('input', { class: 'form-input', placeholder: '输入文件路径，如 src/index.js' });
  const actionSelect = el('select', { class: 'form-select' },
    el('option', { value: 'annotate' }, '代码注解'),
    el('option', { value: 'explain' }, '代码解释'),
    el('option', { value: 'review' }, '代码审查')
  );
  const resultOutput = el('div', { class: 'code-result' }, '选择操作并输入文件路径后开始...');

  container.appendChild(createCard('🤖 AI 代码助手',
    el('div', { class: 'form-row' },
      el('div', { class: 'form-group' },
        el('label', { class: 'form-label' }, '文件路径'),
        fileInput
      ),
      el('div', { class: 'form-group' },
        el('label', { class: 'form-label' }, '操作类型'),
        actionSelect
      )
    ),
    el('div', { style: { marginTop: '8px' } },
      createButton('开始分析', () => handleAnalyze())
    )
  ));

  container.appendChild(createCard('📋 分析结果', resultOutput));

  async function handleAnalyze() {
    if (!fileInput.value.trim()) {
      showToast('请输入文件路径', 'error');
      return;
    }

    resultOutput.textContent = '';
    resultOutput.appendChild(createSpinner());
    resultOutput.appendChild(document.createTextNode(' 正在分析代码...'));

    try {
      const result = await AIAnalyze({
        file: fileInput.value,
        action: actionSelect.value
      });
      resultOutput.textContent = result.content || result;
      showToast('分析完成', 'success');
    } catch (err) {
      resultOutput.textContent = `分析失败: ${err.message}`;
      showToast('分析失败: ' + err.message, 'error');
    }
  }

  async function AIAnalyze(params) {
    return await API.aiAnnotate({
      file: params.file,
      action: params.action,
      language: 'javascript'
    });
  }
}

// ── 团队协作页面 ────────────────────────────────────────────

function renderTeamPage(container) {
  container.appendChild(createPageHeader('团队协作', '管理团队提交规范和协作配置'));

  const configOutput = el('div', { class: 'output-log' }, '加载中...');

  container.appendChild(createCard('👥 团队配置',
    configOutput,
    el('div', { style: { marginTop: '12px', display: 'flex', gap: '8px' } },
      createButton('初始化团队配置', () => initTeamConfig(), 'primary'),
      createButton('安装规范钩子', () => enforceTeamConfig(), 'secondary')
    )
  ));

  async function loadTeamConfig() {
    try {
      const config = await API.readTeamConfig();
      if (!config) {
        configOutput.innerHTML = '<span class="log-warn">⚠ 未找到团队配置文件</span>\n<span class="log-muted">点击"初始化团队配置"创建配置文件</span>';
        return;
      }
      configOutput.innerHTML = [
        `<span class="log-info">提交规范:</span> ${config.convention || 'angular'}`,
        `<span class="log-info">提交语言:</span> ${config.language || 'en'}`,
        `<span class="log-info">强制规范:</span> ${config.enforceConventional ? '是' : '否'}`,
        `<span class="log-info">要求 scope:</span> ${config.requireScope ? '是' : '否'}`,
        config.allowedTypes ? `<span class="log-info">允许的类型:</span> ${config.allowedTypes.join(', ')}` : ''
      ].filter(Boolean).join('\n');
    } catch (err) {
      configOutput.innerHTML = `<span class="log-error">✗ 加载失败: ${err.message}</span>`;
    }
  }

  async function initTeamConfig() {
    try {
      await API.initTeamConfig({
        convention: 'angular',
        language: 'en',
        enforceConventional: true,
        requireScope: false
      });
      showToast('团队配置初始化成功', 'success');
      loadTeamConfig();
    } catch (err) {
      showToast('初始化失败: ' + err.message, 'error');
    }
  }

  async function enforceTeamConfig() {
    try {
      await API.enforceTeamConfig();
      showToast('规范钩子安装成功', 'success');
    } catch (err) {
      showToast('安装失败: ' + err.message, 'error');
    }
  }

  loadTeamConfig();
}

// ── 设置页面 ────────────────────────────────────────────────

function renderSettingsPage(container) {
  container.appendChild(createPageHeader('设置', '配置 CodeSync 和 AI 相关参数'));

  const configOutput = el('div', { class: 'output-log' }, '加载中...');

  const apiKeyInput = el('input', { class: 'form-input', type: 'password', placeholder: 'sk-...' });
  const apiBaseInput = el('input', { class: 'form-input', placeholder: 'https://api.openai.com/v1' });
  const modelSelect = el('select', { class: 'form-select' },
    el('option', { value: 'gpt-4o-mini' }, 'gpt-4o-mini (快速)'),
    el('option', { value: 'gpt-4o' }, 'gpt-4o (强大)'),
    el('option', { value: 'gpt-3.5-turbo' }, 'gpt-3.5-turbo (经济)')
  );
  const githubTokenInput = el('input', { class: 'form-input', type: 'password', placeholder: 'ghp_...' });
  const giteeTokenInput = el('input', { class: 'form-input', type: 'password', placeholder: 'gitee_token...' });
  const gitlabTokenInput = el('input', { class: 'form-input', type: 'password', placeholder: 'glpat-...' });
  const conventionSelect = el('select', { class: 'form-select' },
    el('option', { value: 'angular' }, 'Angular 规范'),
    el('option', { value: 'gitmoji' }, 'Gitmoji 规范')
  );
  const languageSelect = el('select', { class: 'form-select' },
    el('option', { value: 'en' }, 'English'),
    el('option', { value: 'zh' }, '简体中文'),
    el('option', { value: 'ja' }, '日本語')
  );
  const smartToggle = el('input', { type: 'checkbox', id: 'smart-toggle', checked: true });
  const cacheToggle = el('input', { type: 'checkbox', id: 'cache-toggle', checked: true });

  container.appendChild(createCard('🔑 API 配置',
    createFormGroup('API Key', apiKeyInput),
    createFormGroup('API Base URL', apiBaseInput),
    createFormGroup('默认模型', modelSelect)
  ));

  container.appendChild(createCard('📦 平台 Token 配置',
    createFormGroup('GitHub Token', githubTokenInput),
    createFormGroup('Gitee Token', giteeTokenInput),
    createFormGroup('GitLab Token', gitlabTokenInput)
  ));

  container.appendChild(createCard('📝 提交规范',
    el('div', { class: 'form-row' },
      el('div', { class: 'form-group' },
        el('label', { class: 'form-label' }, '提交规范'),
        conventionSelect
      ),
      el('div', { class: 'form-group' },
        el('label', { class: 'form-label' }, '提交语言'),
        languageSelect
      )
    )
  ));

  container.appendChild(createCard('⚙️ 高级设置',
    el('div', { class: 'toggle-group' },
      el('div', { class: 'toggle-info' },
        el('div', { class: 'toggle-title' }, '智能模型选择'),
        el('div', { class: 'toggle-desc' }, '根据代码复杂度自动切换快速/强大模型')
      ),
      el('label', { class: 'toggle' },
        smartToggle,
        el('span', { class: 'toggle-slider' })
      )
    ),
    el('div', { class: 'toggle-group' },
      el('div', { class: 'toggle-info' },
        el('div', { class: 'toggle-title' }, '启用缓存'),
        el('div', { class: 'toggle-desc' }, '缓存 AI 响应结果以减少 API 调用')
      ),
      el('label', { class: 'toggle' },
        cacheToggle,
        el('span', { class: 'toggle-slider' })
      )
    )
  ));

  container.appendChild(el('div', { style: { marginTop: '16px', display: 'flex', gap: '8px' } },
    createButton('保存配置', () => saveSettings(), 'primary'),
    createButton('重置为默认', () => resetSettings(), 'danger')
  ));

  container.appendChild(createCard('📋 当前配置', configOutput));

  // Token 获取指南
  const tokenGuide = el('div', { class: 'card' },
    el('div', { class: 'card-title' }, '💡 Token 获取指南'),
    el('div', { class: 'token-guide' },
      el('div', { class: 'token-guide-item' },
        el('span', { class: 'token-guide-label' }, 'GitHub Token:'),
        el('a', { class: 'token-guide-link', href: 'https://github.com/settings/tokens', target: '_blank' }, 'https://github.com/settings/tokens')
      ),
      el('div', { class: 'token-guide-desc' }, 'Settings → Developer settings → Personal access tokens → Generate new token (classic)，务必选择 classic 经典令牌并勾选 repo 权限'),
      el('div', { class: 'token-guide-item' },
        el('span', { class: 'token-guide-label' }, 'Gitee Token:'),
        el('a', { class: 'token-guide-link', href: 'https://gitee.com/profile/personal_access_tokens', target: '_blank' }, 'https://gitee.com/profile/personal_access_tokens')
      ),
      el('div', { class: 'token-guide-desc' }, '设置 → 私人令牌 → 生成新令牌，勾选 projects 权限'),
      el('div', { class: 'token-guide-item' },
        el('span', { class: 'token-guide-label' }, 'GitLab Token:'),
        el('a', { class: 'token-guide-link', href: 'https://gitlab.com/-/user_settings/personal_access_tokens', target: '_blank' }, 'https://gitlab.com/-/user_settings/personal_access_tokens')
      ),
      el('div', { class: 'token-guide-desc' }, 'User Settings → Access Tokens → Add new token，Scope 选 api')
    )
  );
  container.appendChild(tokenGuide);

  async function loadSettings() {
    try {
      const config = await API.readConfig();
      apiKeyInput.value = config.apiKey || '';
      apiBaseInput.value = config.apiBase || 'https://api.openai.com/v1';
      modelSelect.value = config.model || 'gpt-4o-mini';
      githubTokenInput.value = config.githubToken || '';
      giteeTokenInput.value = config.giteeToken || '';
      gitlabTokenInput.value = config.gitlabToken || '';
      conventionSelect.value = config.convention || 'angular';
      languageSelect.value = config.language || 'en';
      smartToggle.checked = config.smartModel !== false;
      cacheToggle.checked = config.enableCache !== false;

      configOutput.innerHTML = [
        `<span class="log-info">API Base:</span> ${config.apiBase || '默认'}`,
        `<span class="log-info">Model:</span> ${config.model || 'gpt-4o-mini'}`,
        `<span class="log-info">Convention:</span> ${config.convention || 'angular'}`,
        `<span class="log-info">Language:</span> ${config.language || 'en'}`,
        `<span class="log-info">GitHub Token:</span> ${config.githubToken ? '已设置' : '未设置'}`,
        `<span class="log-info">Gitee Token:</span> ${config.giteeToken ? '已设置' : '未设置'}`,
        `<span class="log-info">GitLab Token:</span> ${config.gitlabToken ? '已设置' : '未设置'}`,
        `<span class="log-info">Smart Model:</span> ${config.smartModel !== false ? '启用' : '禁用'}`,
        `<span class="log-info">Cache:</span> ${config.enableCache !== false ? '启用' : '禁用'}`,
        `<span class="log-info">Theme:</span> ${config.theme || 'default'}`
      ].join('\n');
    } catch (err) {
      configOutput.innerHTML = `<span class="log-error">✗ 加载失败: ${err.message}</span>`;
    }
  }

  async function saveSettings() {
    try {
      await API.writeConfig({
        apiKey: apiKeyInput.value,
        apiBase: apiBaseInput.value,
        model: modelSelect.value,
        githubToken: githubTokenInput.value,
        giteeToken: giteeTokenInput.value,
        gitlabToken: gitlabTokenInput.value,
        convention: conventionSelect.value,
        language: languageSelect.value,
        smartModel: smartToggle.checked,
        enableCache: cacheToggle.checked
      });
      showToast('配置保存成功', 'success');
      loadSettings();
    } catch (err) {
      showToast('保存失败: ' + err.message, 'error');
    }
  }

  async function resetSettings() {
    try {
      await API.writeConfig({
        apiKey: '',
        apiBase: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
        githubToken: '',
        giteeToken: '',
        gitlabToken: '',
        convention: 'angular',
        language: 'en',
        smartModel: true,
        enableCache: true
      });
      showToast('已重置为默认配置', 'success');
      loadSettings();
    } catch (err) {
      showToast('重置失败: ' + err.message, 'error');
    }
  }

  loadSettings();
}

// ── PR 管理页面 ────────────────────────────────────────────────

function renderPRPage(container) {
  container.appendChild(createPageHeader('PR 管理', '查看和管理 Pull Request'));

  const prList = el('div', { class: 'pr-list' });
  prList.appendChild(el('div', { class: 'empty-state' }, el('p', {}, '加载中...')));

  container.appendChild(createCard('🔀 Pull Requests', prList));

  (async () => {
    try {
      // 模拟 PR 数据（实际应该从 GitHub/GitLab API 获取）
      const prs = [
        { id: 1, title: 'feat: 添加用户认证功能', author: 'user1', status: 'open', created: '2026-10-18' },
        { id: 2, title: 'fix: 修复登录 Bug', author: 'user2', status: 'merged', created: '2026-10-17' },
        { id: 3, title: 'docs: 更新 README', author: 'user3', status: 'closed', created: '2026-10-16' }
      ];

      prList.innerHTML = '';

      if (prs.length === 0) {
        prList.appendChild(el('div', { class: 'empty-state' }, el('p', {}, '暂无 Pull Request')));
        return;
      }

      prs.forEach(pr => {
        const statusColors = {
          open: 'pr-open',
          merged: 'pr-merged',
          closed: 'pr-closed'
        };

        const item = el('div', { class: 'pr-item' },
          el('div', { class: `pr-status ${statusColors[pr.status]}` }, pr.status.toUpperCase()),
          el('div', { class: 'pr-info' },
            el('div', { class: 'pr-title' }, pr.title),
            el('div', { class: 'pr-meta' },
              el('span', {}, `#${pr.id}`),
              el('span', {}, `by ${pr.author}`),
              el('span', {}, pr.created)
            )
          ),
          el('div', { class: 'pr-actions' },
            createButton('查看', () => showToast('查看 PR 功能开发中', 'info'), 'secondary')
          )
        );
        prList.appendChild(item);
      });
    } catch (err) {
      prList.innerHTML = '';
      prList.appendChild(el('div', { class: 'empty-state' }, el('p', {}, `加载失败: ${err.message}`)));
    }
  })();
}

// ── Issue 跟踪页面 ──────────────────────────────────────────────

function renderIssuesPage(container) {
  container.appendChild(createPageHeader('Issue 跟踪', '查看和管理项目 Issue'));

  const issueList = el('div', { class: 'issue-list' });
  issueList.appendChild(el('div', { class: 'empty-state' }, el('p', {}, '加载中...')));

  const newIssueBtn = createButton('新建 Issue', () => showToast('新建 Issue 功能开发中', 'info'), 'primary');

  container.appendChild(el('div', { style: { marginBottom: '16px' } }, newIssueBtn));
  container.appendChild(createCard('📋 Issues', issueList));

  (async () => {
    try {
      // 模拟 Issue 数据
      const issues = [
        { id: 1, title: 'Bug: 页面加载缓慢', author: 'user1', status: 'open', priority: 'high', created: '2026-10-18' },
        { id: 2, title: 'Feature: 添加暗色模式', author: 'user2', status: 'open', priority: 'medium', created: '2026-10-17' },
        { id: 3, title: 'Docs: 补充 API 文档', author: 'user3', status: 'closed', priority: 'low', created: '2026-10-16' }
      ];

      issueList.innerHTML = '';

      if (issues.length === 0) {
        issueList.appendChild(el('div', { class: 'empty-state' }, el('p', {}, '暂无 Issue')));
        return;
      }

      issues.forEach(issue => {
        const priorityColors = {
          high: 'priority-high',
          medium: 'priority-medium',
          low: 'priority-low'
        };

        const item = el('div', { class: 'issue-item' },
          el('div', { class: `priority-badge ${priorityColors[issue.priority]}` }, issue.priority.toUpperCase()),
          el('div', { class: 'issue-info' },
            el('div', { class: 'issue-title' }, issue.title),
            el('div', { class: 'issue-meta' },
              el('span', {}, `#${issue.id}`),
              el('span', {}, `by ${issue.author}`),
              el('span', {}, issue.created)
            )
          ),
          el('div', { class: 'issue-status' }, issue.status.toUpperCase())
        );
        issueList.appendChild(item);
      });
    } catch (err) {
      issueList.innerHTML = '';
      issueList.appendChild(el('div', { class: 'empty-state' }, el('p', {}, `加载失败: ${err.message}`)));
    }
  })();
}

// ── 性能监控页面 ───────────────────────────────────────────────

function renderPerformancePage(container) {
  container.appendChild(createPageHeader('性能监控', '查看项目性能指标和健康度'));

  const statsGrid = el('div', { class: 'stats-grid' });
  
  statsGrid.appendChild(el('div', { class: 'stat-card' },
    el('div', { class: 'stat-label' }, '代码行数'),
    el('div', { class: 'stat-value' }, '12,345')
  ));
  
  statsGrid.appendChild(el('div', { class: 'stat-card' },
    el('div', { class: 'stat-label' }, '文件数量'),
    el('div', { class: 'stat-value' }, '234')
  ));
  
  statsGrid.appendChild(el('div', { class: 'stat-card' },
    el('div', { class: 'stat-label' }, '依赖数量'),
    el('div', { class: 'stat-value' }, '56')
  ));
  
  statsGrid.appendChild(el('div', { class: 'stat-card' },
    el('div', { class: 'stat-label' }, '健康度评分'),
    el('div', { class: 'stat-value' }, '85/100')
  ));

  container.appendChild(statsGrid);

  const healthReport = el('div', { class: 'health-report' });
  healthReport.innerHTML = `
    <div class="health-item">
      <span class="health-label">代码质量</span>
      <span class="health-bar health-good" style="width: 85%"></span>
      <span class="health-value">85%</span>
    </div>
    <div class="health-item">
      <span class="health-label">测试覆盖率</span>
      <span class="health-bar health-medium" style="width: 72%"></span>
      <span class="health-value">72%</span>
    </div>
    <div class="health-item">
      <span class="health-label">文档完整性</span>
      <span class="health-bar health-good" style="width: 90%"></span>
      <span class="health-value">90%</span>
    </div>
    <div class="health-item">
      <span class="health-label">依赖安全性</span>
      <span class="health-bar health-warning" style="width: 65%"></span>
      <span class="health-value">65%</span>
    </div>
  `;

  container.appendChild(createCard('📊 健康度报告', healthReport));

  const suggestions = el('div', { class: 'suggestions' });
  suggestions.innerHTML = `
    <div class="suggestion-item">
      <span class="suggestion-icon">⚠️</span>
      <span class="suggestion-text">建议增加测试覆盖率到 80% 以上</span>
    </div>
    <div class="suggestion-item">
      <span class="suggestion-icon">🔒</span>
      <span class="suggestion-text">发现 3 个依赖存在安全漏洞，建议更新</span>
    </div>
    <div class="suggestion-item">
      <span class="suggestion-icon">✅</span>
      <span class="suggestion-text">代码结构良好，继续保持</span>
    </div>
  `;

  container.appendChild(createCard('💡 优化建议', suggestions));
}