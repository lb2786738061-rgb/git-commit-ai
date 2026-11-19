const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const { execFileSync, execFile } = require('child_process');
const fs = require('fs');
const os = require('os');

// 是否开发模式
const isDev = process.argv.includes('--dev');

/**
 * 统一加载 shared 目录下的 ESM 模块，避免 Windows 路径解析异常
 */
function importShared(relativePath) {
  const fullPath = path.resolve(__dirname, '../../shared', relativePath);
  return import(pathToFileURL(fullPath).href);
}

/**
 * 解析目标项目目录，避免默认误操作 desktop 子目录
 */
function resolveProjectDir(projectPath) {
  if (projectPath && typeof projectPath === 'string' && projectPath.trim()) {
    return path.resolve(projectPath.trim());
  }
  const cwd = process.cwd();
  if (path.basename(cwd).toLowerCase() === 'desktop') {
    return path.dirname(cwd);
  }
  return cwd;
}

/**
 * 提取子进程真实错误详情
 */
function extractExecError(error) {
  const stderr = error && error.stderr ? error.stderr.toString().trim() : '';
  const stdout = error && error.stdout ? error.stdout.toString().trim() : '';
  return stderr || stdout || (error && error.message) || '未知错误';
}

let mainWindow;

function createWindow() {
  const iconPath = path.join(__dirname, '../assets/icon.png');
  const iconExists = fs.existsSync(iconPath);

  const windowOptions = {
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 580,
    frame: false,           // 使用自定义标题栏
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0d1117'
  };

  if (iconExists) {
    windowOptions.icon = iconPath;
  }

  mainWindow = new BrowserWindow(windowOptions);

  mainWindow.loadFile(path.join(__dirname, '../pages/index.html'));

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 外部链接在浏览器中打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ── IPC 处理器 ─────────────────────────────────────────────────

// 窗口控制
ipcMain.on('window-minimize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize();
});
ipcMain.on('window-maximize', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});
ipcMain.on('window-close', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close();
});

// 读取配置
ipcMain.handle('config:read', async () => {
  const configFile = path.join(os.homedir(), '.git-commit-ai.json');
  try {
    if (fs.existsSync(configFile)) {
      return JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    }
    return {};
  } catch (e) {
    return {};
  }
});

// 写入配置
ipcMain.handle('config:write', async (event, newConfig) => {
  const configFile = path.join(os.homedir(), '.git-commit-ai.json');
  try {
    let existing = {};
    if (fs.existsSync(configFile)) {
      existing = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    }
    const merged = { ...existing, ...newConfig };
    fs.writeFileSync(configFile, JSON.stringify(merged, null, 2), 'utf-8');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// 选择目录
ipcMain.handle('dialog:selectDir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

// 选择文件
ipcMain.handle('dialog:selectFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile']
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

// 执行 codesync 命令（统一入口）
ipcMain.handle('codesync:run', async (event, args) => {
  return new Promise((resolve) => {
    const cliPath = path.join(__dirname, '../../cli/bin/codesync.js');
    execFile('node', [cliPath, ...args], { timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, output: stderr || error.message });
      } else {
        resolve({ success: true, output: stdout });
      }
    });
  });
});

// 检查 Git 状态
ipcMain.handle('git:status', async (event, projectPath) => {
  try {
    const cwd = resolveProjectDir(projectPath);
    const output = execFileSync('git', ['status', '--porcelain'], {
      cwd,
      stdio: 'pipe',
      timeout: 10000
    });
    const branch = execFileSync('git', ['branch', '--show-current'], {
      cwd,
      stdio: 'pipe'
    }).toString().trim();

    return { success: true, status: output.toString(), branch };
  } catch (e) {
    return { success: false, error: extractExecError(e) };
  }
});

// 获取提交历史
ipcMain.handle('git:log', async (event, projectPath, count = 10) => {
  try {
    const cwd = resolveProjectDir(projectPath);
    const output = execFileSync('git', ['log', '-n', String(count), '--pretty=format:%h|%s|%an|%ad', '--date=short'], {
      cwd,
      stdio: 'pipe',
      timeout: 10000
    });
    const lines = output.toString().trim().split('\n').filter(l => l.trim());
    const commits = lines.map(line => {
      const [hash, subject, author, date] = line.split('|');
      return { hash, subject, author, date };
    });
    return { success: true, commits };
  } catch (e) {
    return { success: false, error: extractExecError(e), commits: [] };
  }
});

// AI 代码分析（直接调用 API）
ipcMain.handle('ai:analyze', async (event, { code, file, action, language, apiKey, apiBase, model }) => {
  let sourceCode = code || '';
  if (!sourceCode && file) {
    try {
      sourceCode = fs.readFileSync(file, 'utf-8');
    } catch (e) {
      return { success: false, error: `无法读取文件: ${e.message}` };
    }
  }

  if (!sourceCode) {
    return { success: false, error: '未提供代码或文件路径' };
  }

  const configForApi = apiKey ? {} : (await (async () => {
    const configFile = path.join(os.homedir(), '.git-commit-ai.json');
    try {
      if (fs.existsSync(configFile)) return JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    } catch (_) {}
    return {};
  })());

  const finalApiKey = apiKey || configForApi.apiKey || process.env.OPENAI_API_KEY;
  const finalApiBase = apiBase || configForApi.apiBase || 'https://api.openai.com/v1';
  const finalModel = model || configForApi.model || 'gpt-4o-mini';

  if (!finalApiKey) {
    return { success: false, error: '未配置 API Key，请先在左侧「设置」页面配置大模型 API Key' };
  }

  const prompts = {
    annotate: `请为以下${language || 'javascript'}代码生成详细的中文注释，保持代码逻辑不变，只添加注释：\n\n${sourceCode}`,
    explain: `请详细解释以下${language || 'javascript'}代码的功能，包括整体用途、关键函数作用、执行流程和优化建议：\n\n${sourceCode}`,
    review: `请对以下${language || 'javascript'}代码进行全面审查，从代码质量、潜在bug、性能、安全性和最佳实践角度给出建议：\n\n${sourceCode}`
  };

  const base = finalApiBase.replace(/\/$/, '');

  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${finalApiKey}`
      },
      body: JSON.stringify({
        model: finalModel,
        messages: [
          { role: 'system', content: '你是一个专业的代码助手，请用中文回答。' },
          { role: 'user', content: prompts[action] || prompts.explain }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: `API 错误 ${response.status}: ${err}` };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return { success: false, error: '模型未返回有效内容，请检查模型配置' };
    }
    return { success: true, result: content };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// 获取暂存区 diff
ipcMain.handle('git:diff', async (event, projectPath) => {
  try {
    const cwd = resolveProjectDir(projectPath);
    const output = execFileSync('git', ['diff', '--cached'], {
      cwd,
      stdio: 'pipe',
      timeout: 10000,
      maxBuffer: 50 * 1024 * 1024
    });
    return { success: true, diff: output.toString() };
  } catch (e) {
    return { success: false, diff: '', error: extractExecError(e) };
  }
});

// 执行 git commit
ipcMain.handle('git:commit', async (event, projectPath, message) => {
  try {
    const cwd = resolveProjectDir(projectPath);
    const output = execFileSync('git', ['commit', '-m', message], {
      cwd,
      stdio: 'pipe',
      timeout: 30000
    });
    return { success: true, output: output.toString() };
  } catch (e) {
    return { success: false, error: extractExecError(e) };
  }
});

// AI 生成提交信息
ipcMain.handle('ai:generateCommit', async (event, projectPath) => {
  try {
    const cwd = resolveProjectDir(projectPath);
    const diffOutput = execFileSync('git', ['diff', '--cached'], {
      cwd,
      stdio: 'pipe',
      timeout: 10000,
      maxBuffer: 50 * 1024 * 1024
    });
    const diff = diffOutput.toString();

    if (!diff || !diff.trim()) {
      return { success: false, error: '没有暂存的更改，请先执行 git add 暂存文件' };
    }

    const configFile = path.join(os.homedir(), '.git-commit-ai.json');
    let config = {};
    if (fs.existsSync(configFile)) {
      config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    }

    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    const apiBase = (config.apiBase || 'https://api.openai.com/v1').replace(/\/$/, '');
    const model = config.model || 'gpt-4o-mini';

    if (!apiKey) {
      return { success: false, error: '未配置 API Key，请先在「设置」中配置' };
    }

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: '你是一个 Git 提交信息生成助手。请根据 diff 生成符合 Conventional Commits 规范的提交信息，只输出提交信息本身，不要其他内容。' },
          { role: 'user', content: `请为以下代码变更生成提交信息:\n\n${diff.slice(0, 8000)}` }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return { success: false, error: `API 错误 ${response.status}: ${errText || response.statusText}` };
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message?.content?.trim();
    if (!message) {
      return { success: false, error: '模型未返回提交信息，请检查模型配置' };
    }
    return { success: true, message };
  } catch (e) {
    return { success: false, error: extractExecError(e) };
  }
});

// 项目上传
ipcMain.handle('project:upload', async (event, options = {}) => {
  try {
    const { uploadProject } = await importShared('git/upload.js');
    const projectPath = resolveProjectDir(options.path);
    const repoUrl = await uploadProject({
      projectPath,
      platform: options.platform || 'github',
      repoName: options.name || path.basename(projectPath),
      description: options.description || '',
      isPrivate: Boolean(options.isPrivate),
      onProgress: (percent, message) => {
        try {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('upload:progress', { percent, message });
          }
        } catch (_) {}
      }
    });

    return { success: true, repoUrl };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 项目下载
ipcMain.handle('project:download', async (event, options = {}) => {
  try {
    const { downloadProject } = await importShared('git/download.js');
    const targetPath = resolveProjectDir(options.path);
    const projectPath = await downloadProject({
      repoUrl: options.url,
      targetPath,
      installDeps: Boolean(options.install),
      onProgress: (percent, message) => {
        try {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('download:progress', { percent, message });
          }
        } catch (_) {}
      }
    });

    return { success: true, projectPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 项目协同拉取更新
ipcMain.handle('project:pull', async (event, options = {}) => {
  try {
    const { pullProject } = await importShared('git/upload.js');
    const projectPath = resolveProjectDir(options.path);
    const result = await pullProject({
      projectPath,
      remote: options.remote || 'origin',
      onProgress: (percent, message) => {
        try {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('pull:progress', { percent, message });
          }
        } catch (_) {}
      }
    });

    return { success: true, ...result };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      isConflict: Boolean(error.isConflict),
      conflictFiles: error.conflictFiles || [],
      aiAnalysis: error.aiAnalysis || null
    };
  }
});

// 项目协同同步（提交 + 拉取融合 + 推送）
ipcMain.handle('project:sync', async (event, options = {}) => {
  try {
    const { syncProject } = await importShared('git/upload.js');
    const projectPath = resolveProjectDir(options.path);
    const result = await syncProject({
      projectPath,
      message: options.message || undefined,
      remote: options.remote || 'origin',
      bypassHooks: options.bypassHooks === true,
      onProgress: (percent, message) => {
        try {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('sync:progress', { percent, message });
          }
        } catch (_) {}
      }
    });

    return { success: true, ...result };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      isConflict: Boolean(error.isConflict),
      conflictFiles: error.conflictFiles || [],
      aiAnalysis: error.aiAnalysis || null
    };
  }
});

// 团队配置读取
ipcMain.handle('config:readTeam', async (event, projectPath) => {
  const teamConfigPath = path.join(resolveProjectDir(projectPath), '.git-commit-ai-team.json');
  try {
    if (fs.existsSync(teamConfigPath)) {
      return JSON.parse(fs.readFileSync(teamConfigPath, 'utf-8'));
    }
    return null;
  } catch (e) {
    return null;
  }
});

// 团队配置初始化
ipcMain.handle('config:initTeam', async (event, projectPath, config) => {
  const teamConfigPath = path.join(resolveProjectDir(projectPath), '.git-commit-ai-team.json');
  try {
    fs.writeFileSync(teamConfigPath, JSON.stringify(config, null, 2), 'utf-8');
    return { success: true, path: teamConfigPath };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// 团队规范钩子安装
ipcMain.handle('config:enforceTeam', async (event, projectPath) => {
  try {
    const targetDir = resolveProjectDir(projectPath);
    const gitDir = path.join(targetDir, '.git');
    if (!fs.existsSync(gitDir)) {
      return { success: false, error: '所选目录不是 Git 仓库，请先选择已初始化的项目根目录' };
    }
    const hooksDir = path.join(gitDir, 'hooks');
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }
    const commitMsgPath = path.join(hooksDir, 'commit-msg');
    const hookContent = `#!/bin/sh\n# git-commit-ai team hook\nnode -e "const msg=require('fs').readFileSync('$1','utf-8');if(!/^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)/.test(msg)){console.error('Commit message must follow Conventional Commits');process.exit(1);}"\n`;
    fs.writeFileSync(commitMsgPath, hookContent, { mode: 0o755 });
    try { fs.chmodSync(commitMsgPath, '755'); } catch (_) {}
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});