import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('🔄 Running tests for desktop app files...');

try {
  const desktopDir = path.join(process.cwd(), 'desktop');

  const appJsPath = path.join(desktopDir, 'components', 'app.js');
  const appCssPath = path.join(desktopDir, 'components', 'app.css');
  const mainJsPath = path.join(desktopDir, 'src', 'main.js');
  const preloadJsPath = path.join(desktopDir, 'src', 'preload.js');
  const indexHtmlPath = path.join(desktopDir, 'pages', 'index.html');

  assert.ok(fs.existsSync(appJsPath), 'app.js should exist');
  assert.ok(fs.existsSync(appCssPath), 'app.css should exist');
  assert.ok(fs.existsSync(mainJsPath), 'main.js should exist');
  assert.ok(fs.existsSync(preloadJsPath), 'preload.js should exist');
  assert.ok(fs.existsSync(indexHtmlPath), 'index.html should exist');

  const appJs = fs.readFileSync(appJsPath, 'utf-8');
  assert.ok(appJs.includes('renderUploadPage'), 'app.js should have upload page renderer');
  assert.ok(appJs.includes('renderDownloadPage'), 'app.js should have download page renderer');
  assert.ok(appJs.includes('renderHistoryPage'), 'app.js should have history page renderer');
  assert.ok(appJs.includes('renderAICommitPage'), 'app.js should have AI commit page renderer');
  assert.ok(appJs.includes('renderAICodePage'), 'app.js should have AI code page renderer');
  assert.ok(appJs.includes('renderTeamPage'), 'app.js should have team page renderer');
  assert.ok(appJs.includes('renderSettingsPage'), 'app.js should have settings page renderer');
  assert.ok(appJs.includes('navigateTo'), 'app.js should have navigation function');
  assert.ok(appJs.includes('showToast'), 'app.js should have toast notification function');

  const preloadJs = fs.readFileSync(preloadJsPath, 'utf-8');
  assert.ok(preloadJs.includes('electronAPI'), 'preload.js should expose electronAPI');
  assert.ok(preloadJs.includes('readConfig'), 'preload should expose readConfig');
  assert.ok(preloadJs.includes('writeConfig'), 'preload should expose writeConfig');
  assert.ok(preloadJs.includes('readTeamConfig'), 'preload should expose readTeamConfig');
  assert.ok(preloadJs.includes('uploadProject'), 'preload should expose uploadProject');
  assert.ok(preloadJs.includes('downloadProject'), 'preload should expose downloadProject');
  assert.ok(preloadJs.includes('generateCommitMessage'), 'preload should expose generateCommitMessage');
  assert.ok(preloadJs.includes('commitChanges'), 'preload should expose commitChanges');

  const mainJs = fs.readFileSync(mainJsPath, 'utf-8');
  assert.ok(mainJs.includes('git:diff'), 'main.js should handle git:diff');
  assert.ok(mainJs.includes('git:commit'), 'main.js should handle git:commit');
  assert.ok(mainJs.includes('ai:generateCommit'), 'main.js should handle ai:generateCommit');
  assert.ok(mainJs.includes('project:upload'), 'main.js should handle project:upload');
  assert.ok(mainJs.includes('project:download'), 'main.js should handle project:download');
  assert.ok(mainJs.includes('config:readTeam'), 'main.js should handle config:readTeam');
  assert.ok(mainJs.includes('config:initTeam'), 'main.js should handle config:initTeam');
  assert.ok(mainJs.includes('config:enforceTeam'), 'main.js should handle config:enforceTeam');
  assert.ok(mainJs.includes('.git-commit-ai.json'), 'main.js should use unified config file name');

  console.log('✅ All desktop app tests passed!');
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}