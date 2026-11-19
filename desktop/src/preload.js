const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  readConfig: () => ipcRenderer.invoke('config:read'),
  writeConfig: (config) => ipcRenderer.invoke('config:write', config),
  readTeamConfig: (projectPath) => ipcRenderer.invoke('config:readTeam', projectPath),
  initTeamConfig: (projectPath, config) => ipcRenderer.invoke('config:initTeam', projectPath, config),
  enforceTeamConfig: (projectPath) => ipcRenderer.invoke('config:enforceTeam', projectPath),

  selectDir: () => ipcRenderer.invoke('dialog:selectDir'),
  selectFile: () => ipcRenderer.invoke('dialog:selectFile'),

  run: (args) => ipcRenderer.invoke('codesync:run', args),

  gitStatus: (projectPath) => ipcRenderer.invoke('git:status', projectPath),
  gitLog: (projectPath, count) => ipcRenderer.invoke('git:log', projectPath, count),
  getCommitHistory: (projectPath, count) => ipcRenderer.invoke('git:log', projectPath, count),
  getStagedDiff: (projectPath) => ipcRenderer.invoke('git:diff', projectPath),
  generateCommitMessage: (projectPath) => ipcRenderer.invoke('ai:generateCommit', projectPath),
  commitChanges: (projectPath, message) => ipcRenderer.invoke('git:commit', projectPath, message),

  uploadProject: (options) => ipcRenderer.invoke('project:upload', options),
  downloadProject: (options) => ipcRenderer.invoke('project:download', options),
  pullProject: (options) => ipcRenderer.invoke('project:pull', options),
  syncProject: (options) => ipcRenderer.invoke('project:sync', options),
  onUploadProgress: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('upload:progress', listener);
    return () => ipcRenderer.removeListener('upload:progress', listener);
  },
  onDownloadProgress: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('download:progress', listener);
    return () => ipcRenderer.removeListener('download:progress', listener);
  },
  onPullProgress: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('pull:progress', listener);
    return () => ipcRenderer.removeListener('pull:progress', listener);
  },
  onSyncProgress: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('sync:progress', listener);
    return () => ipcRenderer.removeListener('sync:progress', listener);
  },

  aiAnnotate: (options) => ipcRenderer.invoke('ai:analyze', options),
  aiAnalyze: (options) => ipcRenderer.invoke('ai:analyze', options)
});

contextBridge.exposeInMainWorld('codesync', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  readConfig: () => ipcRenderer.invoke('config:read'),
  writeConfig: (config) => ipcRenderer.invoke('config:write', config),
  selectDir: () => ipcRenderer.invoke('dialog:selectDir'),
  selectFile: () => ipcRenderer.invoke('dialog:selectFile'),
  run: (args) => ipcRenderer.invoke('codesync:run', args),
  gitStatus: (path) => ipcRenderer.invoke('git:status', path),
  gitLog: (path, count) => ipcRenderer.invoke('git:log', path, count),
  aiAnalyze: (options) => ipcRenderer.invoke('ai:analyze', options)
});