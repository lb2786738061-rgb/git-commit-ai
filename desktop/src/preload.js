const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  readConfig: () => ipcRenderer.invoke('config:read'),
  writeConfig: (config) => ipcRenderer.invoke('config:write', config),
  readTeamConfig: () => ipcRenderer.invoke('config:readTeam'),
  initTeamConfig: (config) => ipcRenderer.invoke('config:initTeam', config),
  enforceTeamConfig: () => ipcRenderer.invoke('config:enforceTeam'),

  selectDir: () => ipcRenderer.invoke('dialog:selectDir'),
  selectFile: () => ipcRenderer.invoke('dialog:selectFile'),

  run: (args) => ipcRenderer.invoke('codesync:run', args),

  gitStatus: (projectPath) => ipcRenderer.invoke('git:status', projectPath),
  gitLog: (projectPath, count) => ipcRenderer.invoke('git:log', projectPath, count),
  getCommitHistory: (count) => ipcRenderer.invoke('git:log', process.cwd(), count),
  getStagedDiff: () => ipcRenderer.invoke('git:diff'),
  generateCommitMessage: () => ipcRenderer.invoke('ai:generateCommit'),
  commitChanges: (message) => ipcRenderer.invoke('git:commit', message),

  uploadProject: (options) => ipcRenderer.invoke('project:upload', options),
  downloadProject: (options) => ipcRenderer.invoke('project:download', options),

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