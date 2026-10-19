import fs from 'fs';
import path from 'path';

/**
 * 根据项目类型自动生成 .gitignore 内容
 * 支持自动检测：.NET, Node.js, Python, Java, Go, Ruby, PHP, 通用
 */

// 各项目类型的 .gitignore 模板
const GITIGNORE_TEMPLATES = {
  dotnet: `# .NET 编译产物
bin/
obj/
*.user
*.suo
*.vspscc
*.vssdb
*.bak
*.log
*.dll
*.exe

# 数据库文件
*.db
*.db-wal
*.db-shm
*.mdf
*.ldf
*.sqlite
*.sqlite3

# 本地配置
appsettings.Development.json
appsettings.local.json
launchSettings.json

# IDE
.vs/
.idea/
*.swp
`,

  node: `# 依赖
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-store/

# 环境变量
.env
.env.local
.env.development
.env.production
.env.test

# 编译产物
dist/
build/
*.tsbuildinfo
.next/
.nuxt/
.coverage
htmlcov/

# 数据库
*.db
*.sqlite
*.sqlite3

# 日志
logs/
*.log
`,

  python: `# 虚拟环境
venv/
env/
.venv/
__pycache__/
*.pyc
*.pyo
*.pyd
.pytest_cache/
.mypy_cache/

# 环境
.env
.env.local

# 编译
*.egg-info/
dist/
build/
*.so

# IDE
.vscode/
.idea/
`,

  java: `# 编译产物
target/
*.class
*.jar
*.war
*.ear

# Maven
target/
!.mvn/wrapper/maven-wrapper.jar

# Gradle
build/
.gradle/

# 环境
.env

# IDE
.idea/
.vscode/
*.swp
`,

  go: `# 编译产物
*.exe
*.test
*.out
vendor/

# 环境
.env

# IDE
.vscode/
.idea/
`,

  ruby: `# 编译产物
*.gem
.ruby-lsp/
vendor/bundle/

# 环境
.env

# IDE
.idea/
.vscode/
`,

  php: `# 编译产物
/vendor/
/vendor/bin/
/vendor/composer/

# 环境
.env
.env.local

# IDE
.idea/
.vscode/
`,

  // 通用兜底模板
  general: `# 编译产物
bin/
obj/
build/
dist/
target/
node_modules/
__pycache__/
vendor/

# 环境变量
.env
.env.local

# 数据库
*.db
*.sqlite
*.sqlite3

# 日志
*.log
logs/

# IDE
.vs/
.idea/
.vscode/
*.swp

# 临时文件
*.tmp
*.temp
.DS_Store
`
};

// 检测文件类型 → 项目类型映射
const DETECTORS = [
  { files: ['*.csproj', '*.sln'], type: 'dotnet' },
  { files: ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'], type: 'node' },
  { files: ['requirements.txt', 'setup.py', 'pyproject.toml', 'Pipfile'], type: 'python' },
  { files: ['pom.xml', 'build.gradle', 'build.gradle.kts'], type: 'java' },
  { files: ['go.mod', 'go.sum'], type: 'go' },
  { files: ['Gemfile', 'Gemfile.lock'], type: 'ruby' },
  { files: ['composer.json', 'composer.lock'], type: 'php' }
];

/**
 * 扫描项目目录（含子目录），检测项目类型
 * @param {string} projectPath 项目路径
 * @returns {string} 项目类型键名
 */
export function detectProjectType(projectPath) {
  try {
    // 先扫描根目录
    const rootEntries = fs.readdirSync(projectPath, { withFileTypes: true });
    const rootFiles = rootEntries.filter(e => e.isFile()).map(e => e.name);
    const rootDirs = rootEntries.filter(e => e.isDirectory()).map(e => e.name);

    // 检查根目录文件
    for (const detector of DETECTORS) {
      for (const pattern of detector.files) {
        if (pattern.includes('*')) {
          const ext = pattern.replace('*.', '');
          if (rootFiles.some(f => f.endsWith('.' + ext))) {
            return detector.type;
          }
        } else if (rootFiles.includes(pattern)) {
          return detector.type;
        }
      }
    }

    // 根目录没匹配到，递归扫描子目录（常见项目结构：backend/ frontend/ src/）
    const checkDirs = ['backend', 'frontend', 'src', 'app', 'server', 'client', 'lib'];
    for (const dirName of checkDirs) {
      if (rootDirs.includes(dirName)) {
        const subPath = path.join(projectPath, dirName);
        try {
          const subEntries = fs.readdirSync(subPath, { withFileTypes: true });
          const subFiles = subEntries.filter(e => e.isFile()).map(e => e.name);

          for (const detector of DETECTORS) {
            for (const pattern of detector.files) {
              if (pattern.includes('*')) {
                const ext = pattern.replace('*.', '');
                if (subFiles.some(f => f.endsWith('.' + ext))) {
                  return detector.type;
                }
              } else if (subFiles.includes(pattern)) {
                return detector.type;
              }
            }
          }
        } catch (e) {
          // 子目录读取失败，继续下一个
        }
      }
    }
  } catch (e) {
    // 读取失败，使用通用模板
  }

  return 'general';
}

/**
 * 生成 .gitignore 内容
 * @param {string} projectType 项目类型
 * @returns {string} .gitignore 内容
 */
export function generateGitignore(projectType) {
  return GITIGNORE_TEMPLATES[projectType] || GITIGNORE_TEMPLATES.general;
}

/**
 * 确保项目根目录存在 .gitignore
 * 如果不存在则根据检测到的项目类型自动创建
 * @param {string} projectPath 项目路径
 * @returns {{created: boolean, type: string, path: string}}
 */
export function ensureGitignore(projectPath) {
  const gitignorePath = path.join(projectPath, '.gitignore');

  if (fs.existsSync(gitignorePath)) {
    return { created: false, type: 'existing', path: gitignorePath };
  }

  const projectType = detectProjectType(projectPath);
  const content = generateGitignore(projectType);

  fs.writeFileSync(gitignorePath, content, 'utf-8');

  return { created: true, type: projectType, path: gitignorePath };
}