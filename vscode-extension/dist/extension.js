"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../shared/config.js
function readBoolEnv(name, fallback) {
  const value = process.env[name];
  if (value === void 0 || value === "")
    return fallback;
  return value === "true" || value === "1";
}
function readNumberEnv(name, fallback) {
  const value = process.env[name];
  if (value === void 0 || value === "")
    return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function readConfig() {
  let fileConfig = {};
  if (import_fs.default.existsSync(CONFIG_FILE)) {
    try {
      fileConfig = JSON.parse(import_fs.default.readFileSync(CONFIG_FILE, "utf-8"));
    } catch (e) {
    }
  }
  return {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    apiKey: process.env.OPENAI_API_KEY || fileConfig.apiKey || DEFAULT_CONFIG.apiKey,
    apiBase: process.env.OPENAI_API_BASE || fileConfig.apiBase || DEFAULT_CONFIG.apiBase,
    model: process.env.OPENAI_MODEL || fileConfig.model || DEFAULT_CONFIG.model,
    convention: process.env.COMMIT_CONVENTION || fileConfig.convention || DEFAULT_CONFIG.convention,
    language: process.env.COMMIT_LANGUAGE || fileConfig.language || DEFAULT_CONFIG.language,
    smartModel: readBoolEnv("COMMIT_SMART_MODEL", fileConfig.smartModel ?? DEFAULT_CONFIG.smartModel),
    fastModel: process.env.COMMIT_FAST_MODEL || fileConfig.fastModel || DEFAULT_CONFIG.fastModel,
    powerfulModel: process.env.COMMIT_POWERFUL_MODEL || fileConfig.powerfulModel || DEFAULT_CONFIG.powerfulModel,
    enableCache: readBoolEnv("COMMIT_ENABLE_CACHE", fileConfig.enableCache ?? DEFAULT_CONFIG.enableCache),
    cacheTTL: readNumberEnv("COMMIT_CACHE_TTL", fileConfig.cacheTTL ?? DEFAULT_CONFIG.cacheTTL),
    githubToken: process.env.GITHUB_TOKEN || fileConfig.githubToken || DEFAULT_CONFIG.githubToken,
    giteeToken: process.env.GITEE_TOKEN || fileConfig.giteeToken || DEFAULT_CONFIG.giteeToken,
    gitlabToken: process.env.GITLAB_TOKEN || fileConfig.gitlabToken || DEFAULT_CONFIG.gitlabToken,
    gitlabBase: process.env.GITLAB_BASE || fileConfig.gitlabBase || DEFAULT_CONFIG.gitlabBase
  };
}
function writeConfig(newConfig) {
  let fileConfig = {};
  if (import_fs.default.existsSync(CONFIG_FILE)) {
    try {
      fileConfig = JSON.parse(import_fs.default.readFileSync(CONFIG_FILE, "utf-8"));
    } catch (e) {
    }
  }
  const merged = { ...DEFAULT_CONFIG, ...fileConfig, ...newConfig };
  import_fs.default.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), "utf-8");
  const written = JSON.parse(import_fs.default.readFileSync(CONFIG_FILE, "utf-8"));
  return written;
}
function getConfigFilePath() {
  return CONFIG_FILE;
}
var import_fs, import_path, import_os, CONFIG_FILE, PROJECT_ROOT, DEFAULT_CONFIG;
var init_config = __esm({
  "../shared/config.js"() {
    import_fs = __toESM(require("fs"), 1);
    import_path = __toESM(require("path"), 1);
    import_os = __toESM(require("os"), 1);
    CONFIG_FILE = import_path.default.join(import_os.default.homedir(), ".git-commit-ai.json");
    PROJECT_ROOT = process.cwd();
    if (PROJECT_ROOT.endsWith("cli")) {
      PROJECT_ROOT = import_path.default.dirname(PROJECT_ROOT);
    }
    DEFAULT_CONFIG = {
      apiKey: "",
      apiBase: "https://api.openai.com/v1",
      model: "gpt-4o-mini",
      convention: "angular",
      language: "en",
      smartModel: true,
      fastModel: "gpt-4o-mini",
      powerfulModel: "gpt-4o",
      complexityThreshold: 5e3,
      teamConfigPath: ".git-commit-ai-team.json",
      enableCache: true,
      cacheTTL: 36e5,
      theme: "default",
      jsonOutput: false,
      githubToken: "",
      giteeToken: "",
      gitlabToken: "",
      gitlabBase: "https://gitlab.com/api/v4"
    };
  }
});

// ../shared/ai/prompts.js
function getSystemPrompt(convention = "angular", language = "en") {
  let prompt = convention === "gitmoji" ? SYSTEM_PROMPT_GITMOJI : SYSTEM_PROMPT;
  const langMap = {
    "en": "English",
    "english": "English",
    "zh": "Chinese",
    "cn": "Chinese",
    "zh-cn": "Simplified Chinese",
    "chinese": "Chinese",
    "ja": "Japanese",
    "jp": "Japanese",
    "japanese": "Japanese"
  };
  const lowerLang = language.toLowerCase();
  const langName = langMap[lowerLang] || language;
  if (lowerLang !== "en" && lowerLang !== "english") {
    prompt += `

7. CRITICAL: The commit message <subject> and [body] MUST be written in ${langName}. Do NOT translate the commit <type> (e.g., feat, fix, refactor, docs must remain in English). Ignore English grammar rules like lowercase or imperative present tense for the <subject>, and write using natural phrasing in ${langName}.`;
  }
  return prompt;
}
function createUserPrompt(diff, detectedScope = "", convention = "angular") {
  let prompt = `Generate a git commit message for the following git diff output:

\`\`\`diff
${diff}
\`\`\`
`;
  if (detectedScope) {
    prompt += `
Recommended commit scope to use: "${detectedScope}" (please prioritize using this scope inside parentheses, e.g. feat(${detectedScope}): your message)
`;
  }
  return prompt;
}
var SYSTEM_PROMPT, SYSTEM_PROMPT_GITMOJI;
var init_prompts = __esm({
  "../shared/ai/prompts.js"() {
    SYSTEM_PROMPT = `You are an expert developer assistant specialized in writing clean, concise, and standard-compliant git commit messages.
Your task is to analyze a provided \`git diff\` output and generate a commit message following the "Conventional Commits" specification.

Rules:
1. The message format MUST follow this structure:
   <type>(<scope>): <subject>

   [Optional body explaining details if the change is complex]

2. Use one of these types:
   - feat: A new feature
   - fix: A bug fix
   - docs: Documentation changes
   - style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
   - refactor: A code change that neither fixes a bug nor adds a feature
   - perf: A code change that improves performance
   - test: Adding missing tests or correcting existing tests
   - build: Changes that affect the build system or external dependencies (example scopes: npm, devDeps)
   - ci: Changes to our CI configuration files and scripts (example scopes: github-actions)
   - chore: Other changes that don't modify src or test files
   - revert: Reverts a previous commit

3. The <scope> is optional and represents the module or component affected. Keep it lowercase, short, and enclosed in parentheses (e.g., "(auth)", "(cli)", "(api)"). If the change is project-wide or global, omit the scope.
4. The <subject> must:
   - Be in lowercase.
   - Use the imperative present tense: "change", not "changed" or "changes".
   - Not end with a period.
   - Be short, descriptive, and under 50 characters.
5. If the changes are complex, you may add a blank line after the subject line, followed by a detailed body explaining the "what" and "why" of the changes, not the "how" (keep it under 72 characters per line).
6. CRITICAL: Output ONLY the raw commit message. Do NOT wrap it in markdown code blocks (e.g. \`\`\`git or \`\`\`), do NOT write any intro or outro texts (like "Here is your commit message:"). Your entire response will be directly committed to git.`;
    SYSTEM_PROMPT_GITMOJI = `You are an expert developer assistant specialized in writing clean, concise, and standard-compliant git commit messages.
Your task is to analyze a provided \`git diff\` output and generate a commit message following the "Gitmoji" specification.

Rules:
1. The message format MUST follow this structure:
   <emoji> <type>(<scope>): <subject>

   [Optional body explaining details if the change is complex]

2. You MUST prefix the commit message with a single appropriate Gitmoji from the list below, followed by a single space, then the commit type, optional scope, and subject:
   - \u2728 feat: A new feature
   - \u{1F41B} fix: A bug fix
   - \u{1F4DD} docs: Documentation changes
   - \u{1F484} style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
   - \u267B\uFE0F refactor: A code change that neither fixes a bug nor adds a feature
   - \u26A1 perf: A code change that improves performance
   - \u2705 test: Adding missing tests or correcting existing tests
   - \u{1F527} build: Changes that affect the build system or external dependencies (example scopes: npm, devDeps)
   - \u{1F49A} ci: Changes to our CI configuration files and scripts (example scopes: github-actions)
   - \u{1F9F9} chore: Other changes that don't modify src or test files
   - \u23EA revert: Reverts a previous commit

   For example: "\u2728 feat(auth): add google oauth login" or "\u{1F41B} fix: resolve null pointer exception"

3. The <scope> is optional and represents the module or component affected. Keep it lowercase, short, and enclosed in parentheses (e.g., "(auth)", "(cli)", "(api)"). If the change is project-wide or global, omit the scope.
4. The <subject> must:
   - Be in lowercase.
   - Use the imperative present tense: "change", not "changed" or "changes".
   - Not end with a period.
   - Be short, descriptive, and under 50 characters.
5. If the changes are complex, you may add a blank line after the subject line, followed by a detailed body explaining the "what" and "why" of the changes, not the "how" (keep it under 72 characters per line).
6. CRITICAL: Output ONLY the raw commit message. Do NOT wrap it in markdown code blocks (e.g. \`\`\`git or \`\`\`), do NOT write any intro or outro texts. Your entire response will be directly committed to git.`;
  }
});

// ../shared/ai/cache.js
function ensureCacheDir() {
  if (!import_fs2.default.existsSync(CACHE_DIR)) {
    import_fs2.default.mkdirSync(CACHE_DIR, { recursive: true });
  }
}
function hashKey(key) {
  return import_crypto.default.createHash("sha256").update(key).digest("hex");
}
function getCacheFilePath(key) {
  ensureCacheDir();
  const hash = hashKey(key);
  return import_path2.default.join(CACHE_DIR, `${hash}.json`);
}
function isExpired(cacheEntry, ttl) {
  if (!cacheEntry.timestamp)
    return true;
  return Date.now() - cacheEntry.timestamp > ttl;
}
function getFromCache(key) {
  const config = readConfig();
  if (!config.enableCache)
    return null;
  try {
    const cacheFilePath = getCacheFilePath(key);
    if (!import_fs2.default.existsSync(cacheFilePath))
      return null;
    const content = import_fs2.default.readFileSync(cacheFilePath, "utf-8");
    const cacheEntry = JSON.parse(content);
    const ttl = config.cacheTTL || 36e5;
    if (isExpired(cacheEntry, ttl)) {
      import_fs2.default.unlinkSync(cacheFilePath);
      return null;
    }
    return cacheEntry.data;
  } catch (error) {
    return null;
  }
}
function setCache(key, data) {
  const config = readConfig();
  if (!config.enableCache)
    return;
  try {
    const cacheFilePath = getCacheFilePath(key);
    const cacheEntry = {
      data,
      timestamp: Date.now()
    };
    import_fs2.default.writeFileSync(cacheFilePath, JSON.stringify(cacheEntry), "utf-8");
  } catch (error) {
  }
}
var import_crypto, import_os2, import_path2, import_fs2, CACHE_DIR;
var init_cache = __esm({
  "../shared/ai/cache.js"() {
    import_crypto = __toESM(require("crypto"), 1);
    import_os2 = __toESM(require("os"), 1);
    import_path2 = __toESM(require("path"), 1);
    import_fs2 = __toESM(require("fs"), 1);
    init_config();
    CACHE_DIR = import_path2.default.join(import_os2.default.tmpdir(), "git-commit-ai-cache");
  }
});

// ../shared/ai/commit.js
function cleanResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z0-9-]*\r?\n/, "").replace(/\r?\n```$/, "");
  }
  return cleaned.trim();
}
function selectSmartModel(diff, config) {
  if (!config.smartModel) {
    return config.model;
  }
  const diffLength = diff.length;
  const threshold = config.complexityThreshold || 5e3;
  if (diffLength > threshold) {
    return config.powerfulModel || config.model;
  }
  return config.fastModel || config.model;
}
async function generateCommitMessage(diff, detectedScope = "") {
  const config = readConfig();
  if (!config.apiKey) {
    throw new Error("API Key is missing. Please set your API key by running:\n  git-commit-ai config --set apiKey=YOUR_KEY\n\nAlternatively, you can set the OPENAI_API_KEY environment variable.");
  }
  const cacheKey = `${config.model}-${config.convention}-${config.language}-${detectedScope}-${diff.substring(0, 500)}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }
  const selectedModel = selectSmartModel(diff, config);
  let apiBase = (config.apiBase || "https://api.openai.com/v1").trim().replace(/\/+$/, "");
  const url = apiBase.endsWith("/chat/completions") ? apiBase : `${apiBase}/chat/completions`;
  async function doRequest(modelToUse) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: "system", content: getSystemPrompt(config.convention, config.language) },
          { role: "user", content: createUserPrompt(diff.length > 25e3 ? diff.slice(0, 25e3) + "\n...[diff truncated for length]" : diff, detectedScope, config.convention) }
        ],
        temperature: 0.2
      })
    });
    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch (_) {
      }
      throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
    }
    const data = await response.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error("Invalid response structure received from the API.");
    }
    return cleanResponse(data.choices[0].message.content);
  }
  try {
    let result;
    try {
      result = await doRequest(selectedModel);
    } catch (primaryError) {
      if (config.model && selectedModel !== config.model) {
        result = await doRequest(config.model);
      } else {
        throw primaryError;
      }
    }
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    throw new Error(`API communication failed: ${error.message}`);
  }
}
var init_commit = __esm({
  "../shared/ai/commit.js"() {
    init_config();
    init_prompts();
    init_cache();
  }
});

// src/configManager.ts
var vscode4, ENV_MAP, PLATFORMS, ConfigManager;
var init_configManager = __esm({
  "src/configManager.ts"() {
    "use strict";
    vscode4 = __toESM(require("vscode"));
    init_config();
    ENV_MAP = [
      { key: "apiKey", env: "OPENAI_API_KEY", type: "string" },
      { key: "apiBase", env: "OPENAI_API_BASE", type: "string" },
      { key: "model", env: "OPENAI_MODEL", type: "string" },
      { key: "convention", env: "COMMIT_CONVENTION", type: "string" },
      { key: "language", env: "COMMIT_LANGUAGE", type: "string" },
      { key: "smartModel", env: "COMMIT_SMART_MODEL", type: "boolean" },
      { key: "fastModel", env: "COMMIT_FAST_MODEL", type: "string" },
      { key: "powerfulModel", env: "COMMIT_POWERFUL_MODEL", type: "string" },
      { key: "githubToken", env: "GITHUB_TOKEN", type: "string" },
      { key: "giteeToken", env: "GITEE_TOKEN", type: "string" },
      { key: "gitlabToken", env: "GITLAB_TOKEN", type: "string" },
      { key: "gitlabBase", env: "GITLAB_BASE", type: "string" }
    ];
    PLATFORMS = [
      { id: "github", label: "GitHub" },
      { id: "gitee", label: "Gitee" },
      { id: "gitlab", label: "GitLab" }
    ];
    ConfigManager = class {
      constructor() {
        this.config = vscode4.workspace.getConfiguration("codesync");
        this.applyOverrides();
      }
      /**
       * 读取用户在 VS Code 中显式设置过的值（忽略默认值）
       */
      explicitValue(key) {
        const inspected = this.config.inspect(key);
        if (!inspected)
          return void 0;
        return inspected.workspaceFolderValue ?? inspected.workspaceValue ?? inspected.globalValue;
      }
      /**
       * 将 VS Code 中显式设置的值注入环境变量，供 shared/ 模块读取
       */
      applyOverrides() {
        for (const item of ENV_MAP) {
          const value = this.explicitValue(item.key);
          if (value === void 0 || value === null || value === "")
            continue;
          process.env[item.env] = item.type === "boolean" ? value ? "true" : "false" : String(value);
        }
      }
      /**
       * 获取当前生效的完整配置（配置文件 + 环境变量覆盖）
       */
      getConfig() {
        this.applyOverrides();
        return readConfig();
      }
      get apiKey() {
        return this.getConfig().apiKey;
      }
      get apiBase() {
        return this.getConfig().apiBase;
      }
      get model() {
        return this.getConfig().model;
      }
      get convention() {
        return this.getConfig().convention;
      }
      get language() {
        return this.getConfig().language;
      }
      get smartModel() {
        return this.getConfig().smartModel;
      }
      get githubToken() {
        return this.getConfig().githubToken;
      }
      get giteeToken() {
        return this.getConfig().giteeToken;
      }
      get gitlabToken() {
        return this.getConfig().gitlabToken;
      }
      /**
       * 获取指定平台的 Token
       */
      getToken(platform) {
        const config = this.getConfig();
        if (platform === "github")
          return config.githubToken;
        if (platform === "gitee")
          return config.giteeToken;
        return config.gitlabToken;
      }
      /**
       * 默认使用的平台
       */
      get defaultPlatform() {
        const value = this.config.get("platform", "github");
        return PLATFORMS.some((p) => p.id === value) ? value : "github";
      }
      /**
       * 是否跳过 Git 钩子校验
       */
      get bypassHooks() {
        return this.config.get("bypassHooks", false);
      }
      /**
       * 配置文件路径
       */
      get configFilePath() {
        return getConfigFilePath();
      }
      /**
       * 写入共享配置（与 CLI / 桌面版同一份文件）
       */
      async saveConfig(partial) {
        this.applyOverrides();
        writeConfig(partial);
        this.config = vscode4.workspace.getConfiguration("codesync");
      }
      /**
       * 在设置界面中打开 CodeSync 配置
       */
      async openSettings(query) {
        await vscode4.commands.executeCommand("workbench.action.openSettings", query ? `codesync.${query}` : "codesync");
      }
      /**
       * API Key 未配置时提示用户
       */
      async showNoConfigWarning() {
        const result = await vscode4.window.showWarningMessage(
          "CodeSync API Key \u672A\u914D\u7F6E",
          "\u6253\u5F00\u8BBE\u7F6E",
          "\u914D\u7F6E API Key"
        );
        if (result === "\u6253\u5F00\u8BBE\u7F6E") {
          await this.openSettings("apiKey");
        } else if (result === "\u914D\u7F6E API Key") {
          const key = await vscode4.window.showInputBox({
            prompt: "\u8F93\u5165 OpenAI API Key\uFF08\u4FDD\u5B58\u5230 ~/.git-commit-ai.json\uFF0C\u4E0E CLI \u5171\u7528\uFF09",
            password: true,
            ignoreFocusOut: true
          });
          if (key) {
            await this.saveConfig({ apiKey: key });
            vscode4.window.showInformationMessage("\u2705 API Key \u5DF2\u4FDD\u5B58");
          }
        }
      }
    };
  }
});

// ../shared/git/operations.js
var import_child_process, import_path3, import_fs3, DEFAULT_MAX_BUFFER, GitOperations;
var init_operations = __esm({
  "../shared/git/operations.js"() {
    import_child_process = require("child_process");
    import_path3 = __toESM(require("path"), 1);
    import_fs3 = __toESM(require("fs"), 1);
    DEFAULT_MAX_BUFFER = 50 * 1024 * 1024;
    GitOperations = class {
      constructor(projectPath) {
        this.projectPath = projectPath;
      }
      /**
       * 初始化 Git 仓库
       */
      async init() {
        try {
          (0, import_child_process.execFileSync)("git", ["init"], { cwd: this.projectPath, stdio: "pipe" });
          return true;
        } catch (error) {
          throw new Error(`Git \u521D\u59CB\u5316\u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 添加所有文件到暂存区
       */
      async addAll() {
        try {
          (0, import_child_process.execFileSync)("git", ["add", "-A"], {
            cwd: this.projectPath,
            stdio: "pipe",
            maxBuffer: DEFAULT_MAX_BUFFER
          });
          return true;
        } catch (error) {
          const detail = error.stderr ? error.stderr.toString().trim() : error.message;
          throw new Error(`\u6DFB\u52A0\u6587\u4EF6\u5931\u8D25: ${detail}`);
        }
      }
      /**
       * 添加指定文件到暂存区
       */
      async addFile(filePath) {
        try {
          (0, import_child_process.execFileSync)("git", ["add", filePath], { cwd: this.projectPath, stdio: "pipe" });
          return true;
        } catch (error) {
          throw new Error(`\u6DFB\u52A0\u6587\u4EF6\u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 确保存在 Git 用户名和邮箱配置
       */
      ensureGitUser() {
        try {
          (0, import_child_process.execFileSync)("git", ["config", "user.name"], { cwd: this.projectPath, stdio: "pipe" });
        } catch (_) {
          try {
            (0, import_child_process.execFileSync)("git", ["config", "user.name", "CodeSync User"], { cwd: this.projectPath, stdio: "pipe" });
          } catch (_2) {
          }
        }
        try {
          (0, import_child_process.execFileSync)("git", ["config", "user.email"], { cwd: this.projectPath, stdio: "pipe" });
        } catch (_) {
          try {
            (0, import_child_process.execFileSync)("git", ["config", "user.email", "codesync@example.com"], { cwd: this.projectPath, stdio: "pipe" });
          } catch (_2) {
          }
        }
      }
      /**
       * 提交更改
       * @param {string} message 提交信息
       * @param {object} [options] 选项
       * @param {boolean} [options.bypassHooks=false] 是否跳过 Git 钩子校验
       */
      async commit(message, options = {}) {
        this.ensureGitUser();
        const { bypassHooks = false } = options;
        try {
          const args = ["commit"];
          if (bypassHooks) {
            args.push("--no-verify");
          }
          args.push("-m", message);
          (0, import_child_process.execFileSync)("git", args, {
            cwd: this.projectPath,
            stdio: "pipe",
            maxBuffer: DEFAULT_MAX_BUFFER,
            env: { ...process.env, GCA_BYPASS_HOOK: bypassHooks ? "1" : "0" }
          });
          return true;
        } catch (error) {
          const stderr = error.stderr ? error.stderr.toString().trim() : "";
          const stdout = error.stdout ? error.stdout.toString().trim() : "";
          const detail = stderr || stdout || error.message;
          if (!bypassHooks) {
            try {
              (0, import_child_process.execFileSync)("git", ["commit", "--no-verify", "-m", message], {
                cwd: this.projectPath,
                stdio: "pipe",
                maxBuffer: DEFAULT_MAX_BUFFER,
                env: { ...process.env, GCA_BYPASS_HOOK: "1" }
              });
              return true;
            } catch (_) {
            }
          }
          if (detail.includes("nothing to commit") || detail.includes("working tree clean") || detail.includes("no changes added to commit")) {
            return true;
          }
          throw new Error(`\u63D0\u4EA4\u5931\u8D25: ${detail}`);
        }
      }
      /**
       * 推送到远程仓库
       */
      async push(remote = "origin", branch = "main") {
        try {
          (0, import_child_process.execFileSync)("git", ["push", "-u", remote, branch], {
            cwd: this.projectPath,
            stdio: "pipe"
          });
          return true;
        } catch (error) {
          throw new Error(`\u63A8\u9001\u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * Clone 仓库
       */
      async clone(url, targetPath, timeout = 6e5) {
        try {
          (0, import_child_process.execFileSync)("git", ["clone", url, targetPath], {
            stdio: "pipe",
            timeout
          });
          return targetPath;
        } catch (error) {
          throw new Error(`\u514B\u9686\u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 拉取远程更新
       * @param {string} [remote] 远程仓库名称
       * @param {string} [branch] 分支名称
       */
      async pull(remote, branch) {
        try {
          const args = ["pull"];
          if (remote)
            args.push(remote);
          if (branch)
            args.push(branch);
          const output = (0, import_child_process.execFileSync)("git", args, {
            cwd: this.projectPath,
            stdio: "pipe",
            maxBuffer: DEFAULT_MAX_BUFFER
          });
          return output.toString();
        } catch (error) {
          const stderr = error.stderr ? error.stderr.toString() : "";
          const stdout = error.stdout ? error.stdout.toString() : "";
          const combined = (error.message || "") + "\n" + stderr + "\n" + stdout;
          if (combined.includes("CONFLICT") || combined.includes("Automatic merge failed")) {
            const conflictErr = new Error(`\u62C9\u53D6\u51B2\u7A81: \u8FDC\u7A0B\u4E0E\u672C\u5730\u5B58\u5728\u4EE3\u7801\u51B2\u7A81\uFF0C\u8BF7\u5408\u5E76\u540E\u518D\u63A8\u9001\u3002
${stderr || stdout}`);
            conflictErr.isConflict = true;
            throw conflictErr;
          }
          throw new Error(`\u62C9\u53D6\u5931\u8D25: ${stderr || error.message}`);
        }
      }
      /**
       * 获取当前处于冲突状态的文件列表
       * @returns {string[]} 冲突文件相对路径列表
       */
      async getConflictFiles() {
        try {
          const output = (0, import_child_process.execFileSync)("git", ["diff", "--name-only", "--diff-filter=U"], {
            cwd: this.projectPath,
            stdio: "pipe"
          });
          return output.toString().trim().split("\n").map((s) => s.trim()).filter(Boolean);
        } catch (_) {
          return [];
        }
      }
      /**
       * 获取冲突差异内容供 AI 智能体分析
       * @param {string[]} [files]
       * @returns {string}
       */
      async getConflictDiff(files = []) {
        try {
          const args = ["diff"];
          if (files.length > 0) {
            args.push("--", ...files);
          }
          const output = (0, import_child_process.execFileSync)("git", args, {
            cwd: this.projectPath,
            stdio: "pipe",
            maxBuffer: DEFAULT_MAX_BUFFER
          });
          return output.toString();
        } catch (_) {
          return "";
        }
      }
      /**
       * 获取状态
       */
      async status() {
        try {
          const output = (0, import_child_process.execFileSync)("git", ["status", "--porcelain"], {
            cwd: this.projectPath,
            stdio: "pipe",
            maxBuffer: DEFAULT_MAX_BUFFER
          });
          return output.toString();
        } catch (error) {
          throw new Error(`\u83B7\u53D6\u72B6\u6001\u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 获取提交历史
       */
      async log(count = 10) {
        try {
          const output = (0, import_child_process.execFileSync)("git", ["--no-pager", "log", "-n", String(count), "--pretty=format:%h %s"], {
            cwd: this.projectPath,
            stdio: "pipe",
            encoding: "utf-8",
            maxBuffer: DEFAULT_MAX_BUFFER
          });
          return output.trim().split("\n").filter((l) => l.trim());
        } catch (error) {
          throw new Error(`\u83B7\u53D6\u5386\u53F2\u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 检查是否为缓冲区溢出错误
       */
      isBufferOverflow(error) {
        if (!error)
          return false;
        return error.code === "ENOBUFS" || error.message && (error.message.includes("ENOBUFS") || error.message.includes("maxBuffer"));
      }
      /**
       * 当 diff 过大溢出时，降级获取改动统计摘要
       */
      getFallbackDiff(staged = true) {
        const args = staged ? ["diff", "--cached", "--stat"] : ["diff", "--stat"];
        try {
          const statOutput = (0, import_child_process.execFileSync)("git", args, {
            cwd: this.projectPath,
            stdio: "pipe",
            maxBuffer: DEFAULT_MAX_BUFFER
          });
          return `# \u9879\u76EE\u6539\u52A8\u89C4\u6A21\u8F83\u5927\uFF0C\u5DF2\u81EA\u52A8\u6C47\u603B\u53D8\u66F4\u7EDF\u8BA1\u4FE1\u606F:
${statOutput.toString()}`;
        } catch (_) {
          try {
            const nameStatusArgs = staged ? ["diff", "--cached", "--name-status"] : ["diff", "--name-status"];
            const nameStatus = (0, import_child_process.execFileSync)("git", nameStatusArgs, {
              cwd: this.projectPath,
              stdio: "pipe",
              maxBuffer: DEFAULT_MAX_BUFFER
            });
            return `# \u9879\u76EE\u6539\u52A8\u89C4\u6A21\u8F83\u5927\uFF0C\u5DF2\u81EA\u52A8\u63D0\u53D6\u53D8\u66F4\u6587\u4EF6\u5217\u8868:
${nameStatus.toString()}`;
          } catch (e) {
            return "# \u9879\u76EE\u6539\u52A8\u89C4\u6A21\u8F83\u5927\uFF0C\u5305\u542B\u5927\u91CF\u65B0\u6587\u4EF6\u6216\u521D\u59CB\u4EE3\u7801\u63D0\u4EA4";
          }
        }
      }
      /**
       * 获取 diff
       */
      async getDiff() {
        try {
          const output = (0, import_child_process.execFileSync)("git", ["diff"], {
            cwd: this.projectPath,
            stdio: "pipe",
            maxBuffer: DEFAULT_MAX_BUFFER
          });
          return output.toString();
        } catch (error) {
          if (this.isBufferOverflow(error)) {
            return this.getFallbackDiff(false);
          }
          throw new Error(`\u83B7\u53D6 diff \u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 获取暂存的 diff（自动过滤 lockfile 和二进制文件）
       */
      async getStagedDiff() {
        try {
          const output = (0, import_child_process.execFileSync)("git", ["diff", "--cached"], {
            cwd: this.projectPath,
            stdio: "pipe",
            maxBuffer: DEFAULT_MAX_BUFFER
          });
          return this.filterDiff(output.toString());
        } catch (error) {
          if (this.isBufferOverflow(error)) {
            return this.getFallbackDiff(true);
          }
          throw new Error(`\u83B7\u53D6\u6682\u5B58 diff \u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 过滤 diff 中的 lockfile 和二进制文件
       */
      filterDiff(diff) {
        const EXCLUDE_PATTERNS = [
          /package-lock\.json/,
          /yarn\.lock/,
          /pnpm-lock\.yaml/,
          /\.png$/,
          /\.jpg$/,
          /\.jpeg$/,
          /\.gif$/,
          /\.svg$/,
          /\.pdf$/,
          /\.zip$/,
          /\.tar\.gz$/,
          /\.ico$/,
          /\.woff2?$/
        ];
        const diffBlocks = diff.split(/(?=^diff --git )/m);
        const filtered = diffBlocks.filter((block) => {
          const match = block.match(/^diff --git a\/(.+?) b\//);
          if (!match)
            return true;
          const filePath = match[1];
          return !EXCLUDE_PATTERNS.some((pattern) => pattern.test(filePath));
        });
        return filtered.join("");
      }
      /**
       * 添加远程仓库
       */
      async addRemote(name, url) {
        try {
          (0, import_child_process.execFileSync)("git", ["remote", "add", name, url], {
            cwd: this.projectPath,
            stdio: "pipe"
          });
          return true;
        } catch (error) {
          const errStr = (error.message || "") + (error.stderr ? error.stderr.toString() : "");
          if (errStr.includes("already exists")) {
            try {
              (0, import_child_process.execFileSync)("git", ["remote", "set-url", name, url], {
                cwd: this.projectPath,
                stdio: "pipe"
              });
              return true;
            } catch (setErr) {
              throw new Error(`\u66F4\u65B0\u8FDC\u7A0B\u4ED3\u5E93\u5931\u8D25: ${setErr.message}`);
            }
          }
          throw new Error(`\u6DFB\u52A0\u8FDC\u7A0B\u4ED3\u5E93\u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 设置分支名称
       */
      async setBranch(branchName = "main") {
        try {
          (0, import_child_process.execFileSync)("git", ["branch", "-M", branchName], {
            cwd: this.projectPath,
            stdio: "pipe"
          });
          return true;
        } catch (error) {
          throw new Error(`\u8BBE\u7F6E\u5206\u652F\u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 检查是否是 Git 仓库
       */
      static isGitRepository(projectPath) {
        try {
          const gitDir = import_path3.default.join(projectPath, ".git");
          if (import_fs3.default.existsSync(gitDir)) {
            return true;
          }
          const topLevel = (0, import_child_process.execFileSync)("git", ["rev-parse", "--show-toplevel"], {
            cwd: projectPath,
            stdio: "pipe"
          }).toString().trim();
          const normalTop = import_path3.default.resolve(topLevel).toLowerCase();
          const normalProject = import_path3.default.resolve(projectPath).toLowerCase();
          return normalTop === normalProject;
        } catch (error) {
          return false;
        }
      }
      /**
       * 获取当前分支
       */
      async getCurrentBranch() {
        try {
          const output = (0, import_child_process.execFileSync)("git", ["branch", "--show-current"], {
            cwd: this.projectPath,
            stdio: "pipe"
          });
          return output.toString().trim();
        } catch (error) {
          throw new Error(`\u83B7\u53D6\u5F53\u524D\u5206\u652F\u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 获取已配置的远程仓库列表
       * @returns {Promise<Array<{name: string, url: string}>>}
       */
      async getRemotes() {
        try {
          const output = (0, import_child_process.execFileSync)("git", ["remote", "-v"], {
            cwd: this.projectPath,
            stdio: "pipe",
            encoding: "utf-8"
          });
          const remotes = [];
          const seen = /* @__PURE__ */ new Set();
          for (const line of output.split("\n")) {
            const match = line.trim().match(/^(\S+)\s+(\S+)\s+\((fetch|push)\)$/);
            if (!match)
              continue;
            const [, name, url] = match;
            if (seen.has(name))
              continue;
            seen.add(name);
            remotes.push({ name, url });
          }
          return remotes;
        } catch (error) {
          return [];
        }
      }
      /**
       * 回退到指定提交
       */
      async reset(commitHash, mode = "soft") {
        try {
          (0, import_child_process.execFileSync)("git", ["reset", `--${mode}`, commitHash], {
            cwd: this.projectPath,
            stdio: "pipe"
          });
          return true;
        } catch (error) {
          throw new Error(`\u56DE\u9000\u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 修改最后一次提交（amend）
       * @param {string} [newMessage] 新的提交信息（不传则保留原有）
       */
      async amend(newMessage) {
        try {
          const args = ["commit", "--amend"];
          if (newMessage) {
            args.push("-m", newMessage);
          } else {
            args.push("--no-edit");
          }
          (0, import_child_process.execFileSync)("git", args, {
            cwd: this.projectPath,
            stdio: "pipe",
            env: { ...process.env, GCA_BYPASS_HOOK: "1" }
          });
          return true;
        } catch (error) {
          throw new Error(`\u4FEE\u6539\u63D0\u4EA4\u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 创建并切换到新分支
       * @param {string} branchName 分支名称
       */
      async createBranch(branchName) {
        try {
          (0, import_child_process.execFileSync)("git", ["checkout", "-b", branchName], {
            cwd: this.projectPath,
            stdio: "pipe"
          });
          return true;
        } catch (error) {
          throw new Error(`\u521B\u5EFA\u5206\u652F\u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 合并（squash）最近 N 次提交
       * @param {number} count 要合并的提交数量
       * @param {string} message 新提交信息
       */
      async squash(count, message) {
        try {
          (0, import_child_process.execFileSync)("git", ["reset", "--soft", `HEAD~${count}`], {
            cwd: this.projectPath,
            stdio: "pipe"
          });
          (0, import_child_process.execFileSync)("git", ["commit", "-m", message], {
            cwd: this.projectPath,
            stdio: "pipe",
            env: { ...process.env, GCA_BYPASS_HOOK: "1" }
          });
          return true;
        } catch (error) {
          throw new Error(`\u5408\u5E76\u63D0\u4EA4\u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 获取指定文件的 diff
       * @param {string} filePath 文件路径
       */
      async getFileDiff(filePath) {
        try {
          const output = (0, import_child_process.execFileSync)("git", ["diff", "HEAD", "--", filePath], {
            cwd: this.projectPath,
            stdio: "pipe",
            maxBuffer: DEFAULT_MAX_BUFFER
          });
          return output.toString();
        } catch (error) {
          throw new Error(`\u83B7\u53D6\u6587\u4EF6 diff \u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 暂存指定文件
       * @param {string} filePath 文件路径
       */
      async stageFile(filePath) {
        return this.addFile(filePath);
      }
      /**
       * 取消暂存指定文件
       * @param {string} filePath 文件路径
       */
      async unstageFile(filePath) {
        try {
          (0, import_child_process.execFileSync)("git", ["reset", "HEAD", "--", filePath], {
            cwd: this.projectPath,
            stdio: "pipe"
          });
          return true;
        } catch (error) {
          throw new Error(`\u53D6\u6D88\u6682\u5B58\u5931\u8D25: ${error.message}`);
        }
      }
      /**
       * 获取详细的提交历史（带统计信息）
       * @param {object} options 选项
       * @param {string} [options.from] 起始 tag/commit
       * @param {string} [options.to] 结束 tag/commit
       * @param {number} [options.limit] 数量限制
       */
      async getDetailedCommitHistory({ from, to, limit = 50 } = {}) {
        try {
          const args = ["log", "--pretty=format:%H|%s|%an|%ad", "--date=short"];
          if (from && to) {
            args.push(`${from}..${to}`);
          } else if (from) {
            args.push(`${from}..HEAD`);
          } else {
            args.push(`-n`, String(limit));
          }
          const output = (0, import_child_process.execFileSync)("git", args, {
            cwd: this.projectPath,
            stdio: "pipe"
          });
          return output.toString().trim().split("\n").filter((l) => l.trim()).map((line) => {
            const [hash, subject, author, date] = line.split("|");
            return { hash, subject, author, date };
          });
        } catch (error) {
          throw new Error(`\u83B7\u53D6\u63D0\u4EA4\u5386\u53F2\u5931\u8D25: ${error.message}`);
        }
      }
    };
  }
});

// ../shared/git/gitignore.js
function detectProjectType(projectPath) {
  try {
    const rootEntries = import_fs4.default.readdirSync(projectPath, { withFileTypes: true });
    const rootFiles = rootEntries.filter((e) => e.isFile()).map((e) => e.name);
    const rootDirs = rootEntries.filter((e) => e.isDirectory()).map((e) => e.name);
    for (const detector of DETECTORS) {
      for (const pattern of detector.files) {
        if (pattern.includes("*")) {
          const ext = pattern.replace("*.", "");
          if (rootFiles.some((f) => f.endsWith("." + ext))) {
            return detector.type;
          }
        } else if (rootFiles.includes(pattern)) {
          return detector.type;
        }
      }
    }
    const checkDirs = ["backend", "frontend", "src", "app", "server", "client", "lib"];
    for (const dirName of checkDirs) {
      if (rootDirs.includes(dirName)) {
        const subPath = import_path4.default.join(projectPath, dirName);
        try {
          const subEntries = import_fs4.default.readdirSync(subPath, { withFileTypes: true });
          const subFiles = subEntries.filter((e) => e.isFile()).map((e) => e.name);
          for (const detector of DETECTORS) {
            for (const pattern of detector.files) {
              if (pattern.includes("*")) {
                const ext = pattern.replace("*.", "");
                if (subFiles.some((f) => f.endsWith("." + ext))) {
                  return detector.type;
                }
              } else if (subFiles.includes(pattern)) {
                return detector.type;
              }
            }
          }
        } catch (e) {
        }
      }
    }
  } catch (e) {
  }
  return "general";
}
function generateGitignore(projectType) {
  return GITIGNORE_TEMPLATES[projectType] || GITIGNORE_TEMPLATES.general;
}
function ensureGitignore(projectPath) {
  const gitignorePath = import_path4.default.join(projectPath, ".gitignore");
  if (import_fs4.default.existsSync(gitignorePath)) {
    return { created: false, type: "existing", path: gitignorePath };
  }
  const projectType = detectProjectType(projectPath);
  const content = generateGitignore(projectType);
  import_fs4.default.writeFileSync(gitignorePath, content, "utf-8");
  return { created: true, type: projectType, path: gitignorePath };
}
var import_fs4, import_path4, GITIGNORE_TEMPLATES, DETECTORS;
var init_gitignore = __esm({
  "../shared/git/gitignore.js"() {
    import_fs4 = __toESM(require("fs"), 1);
    import_path4 = __toESM(require("path"), 1);
    GITIGNORE_TEMPLATES = {
      dotnet: `# .NET \u7F16\u8BD1\u4EA7\u7269
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

# \u6570\u636E\u5E93\u6587\u4EF6
*.db
*.db-wal
*.db-shm
*.mdf
*.ldf
*.sqlite
*.sqlite3

# \u672C\u5730\u914D\u7F6E
appsettings.Development.json
appsettings.local.json
launchSettings.json

# IDE
.vs/
.idea/
*.swp
`,
      node: `# \u4F9D\u8D56
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-store/

# \u73AF\u5883\u53D8\u91CF
.env
.env.local
.env.development
.env.production
.env.test

# \u7F16\u8BD1\u4EA7\u7269
dist/
build/
*.tsbuildinfo
.next/
.nuxt/
.coverage
htmlcov/

# \u6570\u636E\u5E93
*.db
*.sqlite
*.sqlite3

# \u65E5\u5FD7
logs/
*.log
`,
      python: `# \u865A\u62DF\u73AF\u5883
venv/
env/
.venv/
__pycache__/
*.pyc
*.pyo
*.pyd
.pytest_cache/
.mypy_cache/

# \u73AF\u5883
.env
.env.local

# \u7F16\u8BD1
*.egg-info/
dist/
build/
*.so

# IDE
.vscode/
.idea/
`,
      java: `# \u7F16\u8BD1\u4EA7\u7269
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

# \u73AF\u5883
.env

# IDE
.idea/
.vscode/
*.swp
`,
      go: `# \u7F16\u8BD1\u4EA7\u7269
*.exe
*.test
*.out
vendor/

# \u73AF\u5883
.env

# IDE
.vscode/
.idea/
`,
      ruby: `# \u7F16\u8BD1\u4EA7\u7269
*.gem
.ruby-lsp/
vendor/bundle/

# \u73AF\u5883
.env

# IDE
.idea/
.vscode/
`,
      php: `# \u7F16\u8BD1\u4EA7\u7269
/vendor/
/vendor/bin/
/vendor/composer/

# \u73AF\u5883
.env
.env.local

# IDE
.idea/
.vscode/
`,
      // 通用兜底模板
      general: `# \u7F16\u8BD1\u4EA7\u7269
bin/
obj/
build/
dist/
target/
node_modules/
__pycache__/
vendor/

# \u73AF\u5883\u53D8\u91CF
.env
.env.local

# \u6570\u636E\u5E93
*.db
*.sqlite
*.sqlite3

# \u65E5\u5FD7
*.log
logs/

# IDE
.vs/
.idea/
.vscode/
*.swp

# \u4E34\u65F6\u6587\u4EF6
*.tmp
*.temp
.DS_Store
`
    };
    DETECTORS = [
      { files: ["*.csproj", "*.sln"], type: "dotnet" },
      { files: ["package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"], type: "node" },
      { files: ["requirements.txt", "setup.py", "pyproject.toml", "Pipfile"], type: "python" },
      { files: ["pom.xml", "build.gradle", "build.gradle.kts"], type: "java" },
      { files: ["go.mod", "go.sum"], type: "go" },
      { files: ["Gemfile", "Gemfile.lock"], type: "ruby" },
      { files: ["composer.json", "composer.lock"], type: "php" }
    ];
  }
});

// ../shared/platform/github.js
async function createGitHubRepo(repoName, description = "", isPrivate = false) {
  const config = readConfig();
  const token = config.githubToken || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("\u672A\u914D\u7F6E GitHub Token\uFF0C\u8BF7\u5148\u914D\u7F6E\uFF1Acodesync config set githubToken=your_token");
  }
  try {
    const response = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "CodeSync-App"
      },
      body: JSON.stringify({
        name: repoName,
        description,
        private: isPrivate,
        auto_init: false
      })
    });
    if (!response.ok) {
      let errorMsg = "\u521B\u5EFA GitHub \u4ED3\u5E93\u5931\u8D25";
      try {
        const error = await response.json();
        errorMsg = error.message || errorMsg;
      } catch (_) {
      }
      if (errorMsg.includes("Resource not accessible by personal access token")) {
        throw new Error(
          'GitHub \u62D2\u7EDD\u4E86\u6B64\u4EE4\u724C\u7684\u64CD\u4F5C\u6743\u9650\u3002\u539F\u56E0\u662F\u60A8\u914D\u7F6E\u7684\u662F\u7EC6\u7C92\u5EA6\u4EE4\u724C (\u4EE5 github_pat_ \u5F00\u5934)\uFF0C\u800C GitHub \u5B98\u65B9\u7B56\u7565\u660E\u786E\u89C4\u5B9A\u3010\u4E0D\u652F\u6301\u4F7F\u7528\u7EC6\u7C92\u5EA6\u4EE4\u724C\u521B\u5EFA\u4E2A\u4EBA\u4ED3\u5E93\u3011\u3002\n\u{1F449} \u89E3\u51B3\u65B9\u6CD5\uFF1A\u8BF7\u4F7F\u7528 GitHub \u7ECF\u5178\u4EE4\u724C\u3010Personal access token (classic)\u3011\uFF1A\n   1. \u6D4F\u89C8\u5668\u8BBF\u95EE\uFF1Ahttps://github.com/settings/tokens\n   2. \u70B9\u51FB\u53F3\u4E0A\u89D2 "Generate new token" \u4E0B\u62C9\u83DC\u5355\uFF0C\u9009\u62E9 "Generate new token (classic)"\n   3. Note \u586B codesync\uFF0C\u52FE\u9009 [x] repo \u6743\u9650\uFF08\u5FC5\u987B\u52FE\u9009\u5B8C\u6574 repo\uFF09\n   4. \u751F\u6210\u4EE5 ghp_ \u5F00\u5934\u7684\u7ECF\u5178\u4EE4\u724C\n   5. \u5728\u7EC8\u7AEF\u6267\u884C\u914D\u7F6E: codesync config set githubToken=ghp_\u4F60\u7684\u65B0\u4EE4\u724C'
        );
      }
      throw new Error(errorMsg);
    }
    const data = await response.json();
    return data.clone_url;
  } catch (error) {
    throw new Error(`GitHub API \u8C03\u7528\u5931\u8D25: ${error.message}`);
  }
}
var init_github = __esm({
  "../shared/platform/github.js"() {
    init_config();
  }
});

// ../shared/platform/gitee.js
async function createGiteeRepo(repoName, description = "", isPrivate = false) {
  const config = readConfig();
  const token = config.giteeToken || process.env.GITEE_TOKEN;
  if (!token) {
    throw new Error("\u672A\u914D\u7F6E Gitee Token\uFF0C\u8BF7\u5148\u914D\u7F6E\uFF1Acodesync config set giteeToken=your_token");
  }
  try {
    const response = await fetch("https://gitee.com/api/v5/user/repos", {
      method: "POST",
      headers: {
        "Authorization": `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: repoName,
        description,
        private: isPrivate,
        auto_init: false
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "\u521B\u5EFA Gitee \u4ED3\u5E93\u5931\u8D25");
    }
    const data = await response.json();
    return data.clone_url;
  } catch (error) {
    throw new Error(`Gitee API \u8C03\u7528\u5931\u8D25: ${error.message}`);
  }
}
var init_gitee = __esm({
  "../shared/platform/gitee.js"() {
    init_config();
  }
});

// ../shared/platform/gitlab.js
async function createGitLabRepo(repoName, description = "", isPrivate = false) {
  const config = readConfig();
  const token = config.gitlabToken || process.env.GITLAB_TOKEN;
  if (!token) {
    throw new Error("\u672A\u914D\u7F6E GitLab Token\uFF0C\u8BF7\u5148\u914D\u7F6E\uFF1Acodesync config set gitlabToken=your_token");
  }
  const gitlabBase = config.gitlabBase || process.env.GITLAB_BASE || "https://gitlab.com/api/v4";
  try {
    const response = await fetch(`${gitlabBase}/projects`, {
      method: "POST",
      headers: {
        "PRIVATE-TOKEN": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: repoName,
        description,
        visibility: isPrivate ? "private" : "public",
        initialize_with_readme: false
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "\u521B\u5EFA GitLab \u4ED3\u5E93\u5931\u8D25");
    }
    const data = await response.json();
    return data.http_url_to_repo;
  } catch (error) {
    throw new Error(`GitLab API \u8C03\u7528\u5931\u8D25: ${error.message}`);
  }
}
var init_gitlab = __esm({
  "../shared/platform/gitlab.js"() {
    init_config();
  }
});

// ../shared/platform/index.js
var init_platform = __esm({
  "../shared/platform/index.js"() {
    init_github();
    init_gitee();
    init_gitlab();
  }
});

// ../shared/ai/conflict.js
async function analyzeConflict(options = {}) {
  var _a, _b, _c, _d;
  const { conflictFiles = [], conflictDiff = "" } = options;
  if (conflictFiles.length === 0 && !conflictDiff) {
    return {
      summary: "\u672A\u68C0\u6D4B\u5230\u51B2\u7A81\u5185\u5BB9",
      files: [],
      suggestions: "\u5F53\u524D\u5DE5\u4F5C\u533A\u4EE3\u7801\u6CA1\u6709\u5408\u5E76\u51B2\u7A81\u3002"
    };
  }
  const config = readConfig();
  if (!config.apiKey) {
    return {
      summary: `\u68C0\u6D4B\u5230 ${conflictFiles.length} \u4E2A\u6587\u4EF6\u5B58\u5728\u591A\u4EBA\u534F\u4F5C\u51B2\u7A81`,
      files: conflictFiles,
      suggestions: [
        "\u{1F4A1} \u667A\u80FD\u4F53\u63D0\u793A\uFF1A\u8BF7\u6309\u4EE5\u4E0B\u6B65\u9AA4\u89E3\u51B3\u591A\u4EBA\u4EE3\u7801\u51B2\u7A81\uFF1A",
        ...conflictFiles.map((f) => `  - \u6253\u5F00\u6587\u4EF6 [${f}]\uFF0C\u641C\u7D22\u67E5\u627E <<<<<<< HEAD \u51B2\u7A81\u6807\u8BB0`),
        "  - \u5BF9\u6BD4\u672C\u5730\u4EE3\u7801\uFF08HEAD\uFF09\u4E0E\u8FDC\u7A0B\u56E2\u961F\u4EE3\u7801\uFF08incoming\uFF09\uFF0C\u9009\u62E9\u4FDD\u7559\u6216\u5408\u5E76",
        "  - \u5220\u9664 <<<<<<<, =======, >>>>>>> \u6807\u8BB0\u884C\u5E76\u4FDD\u5B58\u6587\u4EF6",
        "  - \u8FD0\u884C codesync push \u6216 git add \u91CD\u65B0\u63D0\u4EA4\u5373\u53EF\u5B8C\u6210\u5408\u5E76\u3002"
      ].join("\n")
    };
  }
  const safeDiff = (conflictDiff || conflictFiles.join("\n")).slice(0, 1e4);
  const prompt = `\u4F60\u662F\u4E00\u4E2A Git \u534F\u540C\u5F00\u53D1\u4E13\u5BB6\u4E0E\u51B2\u7A81\u5BA1\u67E5\u667A\u80FD\u4F53\u3002
\u5F53\u524D\u56E2\u961F\u6210\u5458\u5728\u534F\u4F5C\u63A8\u9001/\u62C9\u53D6\u4EE3\u7801\u65F6\u53D1\u751F\u4E86\u5408\u5E76\u51B2\u7A81\u3002
\u51B2\u7A81\u6587\u4EF6\u5217\u8868\uFF1A
${conflictFiles.map((f) => `- ${f}`).join("\n")}

\u51B2\u7A81\u8BE6\u60C5\u4E0E\u4EE3\u7801\u7247\u6BB5\uFF1A
\`\`\`diff
${safeDiff}
\`\`\`

\u8BF7\u7528\u6E05\u6670\u3001\u4E13\u4E1A\u7684\u7B80\u4F53\u4E2D\u6587\u8FDB\u884C\u5BA1\u67E5\uFF0C\u7ED9\u51FA\uFF1A
1. \u51B2\u7A81\u6838\u5FC3\u539F\u56E0\u5206\u6790\uFF08\u672C\u5730\u4FEE\u6539\u4E0E\u8FDC\u7A0B\u4FEE\u6539\u5206\u522B\u505A\u4E86\u4EC0\u4E48\uFF09\u3002
2. \u5177\u4F53\u89E3\u51B3\u7B56\u7565\u4E0E\u5EFA\u8BAE\uFF08\u5982\u4F55\u4FDD\u7559\u4E24\u8005\u7684\u6838\u5FC3\u903B\u8F91\uFF0C\u907F\u514D\u529F\u80FD\u4E22\u5931\uFF09\u3002
3. \u89E3\u51B3\u51B2\u7A81\u7684\u6807\u51C6\u64CD\u4F5C\u6B65\u9AA4\u3002`;
  try {
    let apiBase = (config.apiBase || "https://api.openai.com/v1").replace(/\/+$/, "");
    const endpoint = apiBase.endsWith("/chat/completions") ? apiBase : `${apiBase}/chat/completions`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model || "gpt-4o-mini",
        messages: [
          { role: "system", content: "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684 Git \u534F\u4F5C\u51B2\u7A81\u89E3\u51B3\u52A9\u624B\uFF0C\u8BF7\u7528\u7EAF\u7B80\u4F53\u4E2D\u6587\u56DE\u7B54\u3002" },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      })
    });
    if (!response.ok) {
      throw new Error(`AI \u670D\u52A1\u8FD4\u56DE HTTP ${response.status}`);
    }
    const data = await response.json();
    const suggestions = ((_d = (_c = (_b = (_a = data == null ? void 0 : data.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.message) == null ? void 0 : _c.content) == null ? void 0 : _d.trim()) || "";
    return {
      summary: `\u68C0\u6D4B\u5230 ${conflictFiles.length} \u4E2A\u6587\u4EF6\u5B58\u5728\u591A\u4EBA\u534F\u4F5C\u51B2\u7A81\uFF0CAI \u667A\u80FD\u4F53\u5DF2\u5B8C\u6210\u51B2\u7A81\u5206\u6790`,
      files: conflictFiles,
      suggestions: suggestions || "\u672A\u80FD\u751F\u6210\u5177\u4F53\u5206\u6790\u5EFA\u8BAE\uFF0C\u8BF7\u624B\u52A8\u6392\u67E5\u51B2\u7A81\u6807\u8BB0\u3002"
    };
  } catch (error) {
    return {
      summary: `\u68C0\u6D4B\u5230 ${conflictFiles.length} \u4E2A\u6587\u4EF6\u5B58\u5728\u51B2\u7A81`,
      files: conflictFiles,
      suggestions: [
        `\u26A0\uFE0F AI \u667A\u80FD\u4F53\u5206\u6790\u6682\u65F6\u4E0D\u53EF\u7528 (${error.message})\uFF0C\u964D\u7EA7\u6307\u5F15\u5982\u4E0B\uFF1A`,
        ...conflictFiles.map((f) => `  - \u8BF7\u68C0\u67E5\u6587\u4EF6 [${f}] \u4E2D\u7684\u51B2\u7A81\u6807\u8BB0\u5E76\u5408\u5E76`),
        "  - \u6D88\u9664\u51B2\u7A81\u6807\u8BB0\u540E\u6267\u884C git add \u6682\u5B58\u5E76\u91CD\u65B0\u63A8\u9001\u3002"
      ].join("\n")
    };
  }
}
var init_conflict = __esm({
  "../shared/ai/conflict.js"() {
    init_config();
  }
});

// ../shared/git/upload.js
async function uploadProject(options) {
  const {
    projectPath,
    platform,
    repoName,
    description = "",
    isPrivate = false,
    onProgress = () => {
    }
  } = options;
  const git = new GitOperations(projectPath);
  try {
    onProgress(10, "\u68C0\u67E5 Git \u4ED3\u5E93...");
    const isRepo = GitOperations.isGitRepository(projectPath);
    if (!isRepo) {
      onProgress(15, "\u521D\u59CB\u5316 Git \u4ED3\u5E93...");
      await git.init();
    }
    const gitignoreResult = ensureGitignore(projectPath);
    if (gitignoreResult.created) {
      onProgress(20, `\u5DF2\u751F\u6210 .gitignore (${gitignoreResult.type} \u6A21\u677F)...`);
    }
    onProgress(30, "\u6DFB\u52A0\u6587\u4EF6...");
    await git.addAll();
    onProgress(40, "\u751F\u6210\u63D0\u4EA4\u4FE1\u606F...");
    const diff = await git.getStagedDiff();
    let commitMessage = "Initial commit";
    if (diff && diff.trim()) {
      try {
        commitMessage = await generateCommitMessage(diff, "");
      } catch (error) {
        console.warn(`
\u26A0\uFE0F  AI \u751F\u6210\u63D0\u4EA4\u4FE1\u606F\u5931\u8D25 (${error.message})\uFF0C\u5C06\u4F7F\u7528\u9ED8\u8BA4\u63D0\u4EA4\u4FE1\u606F`);
      }
    }
    onProgress(50, "\u63D0\u4EA4\u66F4\u6539...");
    await git.commit(commitMessage, { bypassHooks: true });
    onProgress(60, "\u8BBE\u7F6E\u5206\u652F...");
    await git.setBranch("main");
    onProgress(70, `\u5728 ${platform} \u521B\u5EFA\u4ED3\u5E93...`);
    let repoUrl;
    if (platform === "github") {
      repoUrl = await createGitHubRepo(repoName, description, isPrivate);
    } else if (platform === "gitee") {
      repoUrl = await createGiteeRepo(repoName, description, isPrivate);
    } else if (platform === "gitlab") {
      repoUrl = await createGitLabRepo(repoName, description, isPrivate);
    } else {
      throw new Error(`\u4E0D\u652F\u6301\u7684\u5E73\u53F0: ${platform}\uFF0C\u652F\u6301\u7684\u5E73\u53F0: github, gitee, gitlab`);
    }
    onProgress(80, "\u5173\u8054\u8FDC\u7A0B\u4ED3\u5E93...");
    await git.addRemote("origin", repoUrl);
    onProgress(90, "\u63A8\u9001\u4EE3\u7801...");
    await git.push("origin", "main");
    onProgress(100, "\u5B8C\u6210\uFF01");
    return repoUrl;
  } catch (error) {
    throw new Error(`\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
  }
}
async function pullProject(options) {
  const {
    projectPath,
    remote = "origin",
    onProgress = () => {
    }
  } = options;
  const git = new GitOperations(projectPath);
  if (!GitOperations.isGitRepository(projectPath)) {
    throw new Error("\u5F53\u524D\u76EE\u5F55\u4E0D\u662F Git \u4ED3\u5E93");
  }
  try {
    onProgress(20, "\u68C0\u67E5\u5F53\u524D\u5206\u652F...");
    const branch = await git.getCurrentBranch();
    onProgress(50, `\u6B63\u5728\u4ECE ${remote}/${branch} \u62C9\u53D6\u8FDC\u7A0B\u6700\u65B0\u4EE3\u7801...`);
    const output = await git.pull(remote, branch);
    onProgress(100, "\u62C9\u53D6\u5B8C\u6210\uFF01\u5DF2\u540C\u6B65\u56E2\u961F\u6700\u65B0\u4EE3\u7801");
    return {
      success: true,
      branch,
      message: output.includes("Already up to date") ? "\u5F53\u524D\u4EE3\u7801\u5DF2\u662F\u6700\u65B0\uFF0C\u65E0\u65B0\u66F4\u65B0" : "\u5DF2\u6210\u529F\u5408\u5E76\u8FDC\u7A0B\u6700\u65B0\u4EE3\u7801"
    };
  } catch (error) {
    if (error.isConflict) {
      onProgress(85, "\u68C0\u6D4B\u5230\u591A\u4EBA\u4EE3\u7801\u51B2\u7A81\uFF0C\u6B63\u5728\u5524\u9192 AI \u667A\u80FD\u4F53\u5206\u6790\u51B2\u7A81...");
      const conflictFiles = await git.getConflictFiles();
      const conflictDiff = await git.getConflictDiff(conflictFiles);
      const aiAnalysis = await analyzeConflict({ conflictFiles, conflictDiff, projectPath });
      const conflictErr = new Error(`\u62C9\u53D6\u51B2\u7A81: \u8FDC\u7A0B\u4E0E\u672C\u5730\u4EE3\u7801\u53D1\u751F\u51B2\u7A81\u3002

\u3010\u51B2\u7A81\u6587\u4EF6\u3011:
${conflictFiles.map((f) => " - " + f).join("\n")}

\u3010AI \u667A\u80FD\u4F53\u5408\u5E76\u5EFA\u8BAE\u3011:
${aiAnalysis.suggestions}`);
      conflictErr.isConflict = true;
      conflictErr.conflictFiles = conflictFiles;
      conflictErr.aiAnalysis = aiAnalysis;
      throw conflictErr;
    }
    throw new Error(`\u66F4\u65B0\u5931\u8D25: ${error.message}`);
  }
}
async function syncProject(options) {
  const {
    projectPath,
    message,
    remote = "origin",
    bypassHooks = false,
    onProgress = () => {
    }
  } = options;
  const git = new GitOperations(projectPath);
  if (!GitOperations.isGitRepository(projectPath)) {
    throw new Error("\u5F53\u524D\u76EE\u5F55\u4E0D\u662F Git \u4ED3\u5E93");
  }
  try {
    onProgress(10, "\u68C0\u67E5\u672C\u5730\u6539\u52A8...");
    await git.addAll();
    const diff = await git.getStagedDiff();
    const branch = await git.getCurrentBranch();
    let committed = false;
    let commitMessage = message;
    if (diff && diff.trim()) {
      if (!commitMessage) {
        onProgress(30, "AI \u751F\u6210\u63D0\u4EA4\u4FE1\u606F...");
        commitMessage = await generateCommitMessage(diff, "");
      }
      onProgress(50, "\u63D0\u4EA4\u672C\u5730\u66F4\u6539...");
      await git.commit(commitMessage, { bypassHooks });
      committed = true;
    } else {
      onProgress(40, "\u672C\u5730\u65E0\u65B0\u4FEE\u6539\uFF0C\u51C6\u5907\u62C9\u53D6\u8FDC\u7A0B\u66F4\u65B0...");
    }
    onProgress(70, `\u62C9\u53D6 ${remote}/${branch} \u8FDC\u7A0B\u6700\u65B0\u4EE3\u7801\u4EE5\u9632\u51B2\u7A81...`);
    try {
      await git.pull(remote, branch);
    } catch (pullErr) {
      if (pullErr.isConflict) {
        onProgress(85, "\u68C0\u6D4B\u5230\u591A\u4EBA\u4EE3\u7801\u51B2\u7A81\uFF0C\u6B63\u5728\u7531 AI \u667A\u80FD\u4F53\u5206\u6790\u51B2\u7A81...");
        const conflictFiles = await git.getConflictFiles();
        const conflictDiff = await git.getConflictDiff(conflictFiles);
        const aiAnalysis = await analyzeConflict({ conflictFiles, conflictDiff, projectPath });
        const conflictErr = new Error(`\u591A\u4EBA\u4EE3\u7801\u51B2\u7A81: \u8FDC\u7A0B\u4E0E\u672C\u5730\u53D1\u751F\u91CD\u53E0\u51B2\u7A81\uFF0C\u5DF2\u63D0\u4EA4\u672C\u5730\u6682\u5B58\uFF0C\u8BF7\u89E3\u51B3\u51B2\u7A81\u540E\u63A8\u9001\u3002

\u3010\u51B2\u7A81\u6587\u4EF6\u3011:
${conflictFiles.map((f) => " - " + f).join("\n")}

\u3010AI \u667A\u80FD\u4F53\u5408\u5E76\u5EFA\u8BAE\u3011:
${aiAnalysis.suggestions}`);
        conflictErr.isConflict = true;
        conflictErr.conflictFiles = conflictFiles;
        conflictErr.aiAnalysis = aiAnalysis;
        throw conflictErr;
      }
      throw pullErr;
    }
    if (committed) {
      onProgress(90, `\u63A8\u9001\u5230\u8FDC\u7A0B ${remote}/${branch}...`);
      await git.push(remote, branch);
      onProgress(100, "\u534F\u540C\u540C\u6B65\u5B8C\u6210\uFF01");
      return { committed: true, commitMessage, branch };
    } else {
      onProgress(100, "\u540C\u6B65\u5B8C\u6210\uFF01\u5DF2\u6210\u529F\u62C9\u53D6\u56E2\u961F\u6700\u65B0\u4EE3\u7801");
      return { committed: false, pulled: true, branch, reason: "already-latest" };
    }
  } catch (error) {
    throw new Error(`\u540C\u6B65\u5931\u8D25: ${error.message}`);
  }
}
var init_upload = __esm({
  "../shared/git/upload.js"() {
    init_operations();
    init_gitignore();
    init_platform();
    init_commit();
    init_conflict();
  }
});

// src/gitService.ts
var vscode5, import_path5, GitService;
var init_gitService = __esm({
  "src/gitService.ts"() {
    "use strict";
    vscode5 = __toESM(require("vscode"));
    import_path5 = __toESM(require("path"));
    init_operations();
    init_upload();
    init_commit();
    GitService = class {
      constructor(configManager2) {
        this.configManager = configManager2;
      }
      /**
       * 推断当前操作的项目路径：优先当前打开文件所在目录，其次第一个工作区文件夹
       */
      static resolveProjectPath() {
        var _a, _b, _c;
        const activeUri = (_a = vscode5.window.activeTextEditor) == null ? void 0 : _a.document.uri;
        if (activeUri && activeUri.scheme === "file") {
          return import_path5.default.dirname(activeUri.fsPath);
        }
        return (_c = (_b = vscode5.workspace.workspaceFolders) == null ? void 0 : _b[0]) == null ? void 0 : _c.uri.fsPath;
      }
      /**
       * 是否是 Git 仓库
       */
      isRepository(projectPath) {
        return GitOperations.isGitRepository(projectPath);
      }
      /**
       * 获取远程仓库列表
       */
      async getRemotes(projectPath) {
        return new GitOperations(projectPath).getRemotes();
      }
      /**
       * 获取当前分支
       */
      async getCurrentBranch(projectPath) {
        return new GitOperations(projectPath).getCurrentBranch();
      }
      /**
       * 获取工作区状态
       */
      async getStatus(projectPath) {
        return new GitOperations(projectPath).status();
      }
      /**
       * 上传项目到远程仓库（新建仓库 + 推送）
       * @param options 上传参数
       */
      async upload(options) {
        return uploadProject({
          projectPath: options.projectPath,
          platform: options.platform,
          repoName: options.repoName,
          description: options.description,
          isPrivate: options.isPrivate,
          onProgress: options.onProgress
        });
      }
      /**
       * 拉取远程最新代码（多人协作防冲突）
       */
      async pull(options) {
        return pullProject({
          projectPath: options.projectPath,
          onProgress: options.onProgress
        });
      }
      /**
       * 协同同步已有仓库（暂存 → 提交 → 融合远程最新代码 → 推送）
       * @param options 同步参数
       */
      async sync(options) {
        return syncProject({
          projectPath: options.projectPath,
          message: options.message,
          bypassHooks: this.configManager.bypassHooks,
          onProgress: options.onProgress
        });
      }
      /**
       * 暂存全部改动并返回暂存区 diff
       */
      async stageAndGetDiff(projectPath) {
        const git = new GitOperations(projectPath);
        await git.addAll();
        return git.getStagedDiff();
      }
      /**
       * 生成提交信息（复用 shared/ai/commit.js，含缓存与智能模型选择）
       */
      async generateCommitMessage(diff) {
        return generateCommitMessage(diff, "");
      }
    };
  }
});

// src/commands/sync.ts
async function syncCommand(gitService2, configManager2) {
  const projectPath = GitService.resolveProjectPath();
  if (!projectPath) {
    vscode6.window.showErrorMessage("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u9879\u76EE\u6587\u4EF6\u5939");
    return;
  }
  if (!gitService2.isRepository(projectPath)) {
    const choice = await vscode6.window.showErrorMessage(
      "\u5F53\u524D\u76EE\u5F55\u4E0D\u662F Git \u4ED3\u5E93",
      "\u521D\u59CB\u5316\u5E76\u4E0A\u4F20"
    );
    if (choice === "\u521D\u59CB\u5316\u5E76\u4E0A\u4F20") {
      const { uploadCommand: uploadCommand2 } = await Promise.resolve().then(() => (init_upload2(), upload_exports));
      await uploadCommand2(gitService2, configManager2);
    }
    return;
  }
  const remotes = await gitService2.getRemotes(projectPath);
  if (remotes.length === 0) {
    const choice = await vscode6.window.showWarningMessage(
      "\u5F53\u524D\u9879\u76EE\u6CA1\u6709\u5173\u8054\u8FDC\u7A0B\u4ED3\u5E93",
      "\u521B\u5EFA\u4ED3\u5E93\u5E76\u4E0A\u4F20"
    );
    if (choice === "\u521B\u5EFA\u4ED3\u5E93\u5E76\u4E0A\u4F20") {
      const { uploadCommand: uploadCommand2 } = await Promise.resolve().then(() => (init_upload2(), upload_exports));
      await uploadCommand2(gitService2, configManager2);
    }
    return;
  }
  try {
    const diff = await vscode6.window.withProgress(
      { location: vscode6.ProgressLocation.Notification, title: "\u6B63\u5728\u5206\u6790\u53D8\u66F4...", cancellable: false },
      async () => gitService2.stageAndGetDiff(projectPath)
    );
    if (!diff || !diff.trim()) {
      vscode6.window.showInformationMessage("\u6CA1\u6709\u9700\u8981\u63D0\u4EA4\u7684\u66F4\u6539");
      return;
    }
    const suggested = await vscode6.window.withProgress(
      { location: vscode6.ProgressLocation.Notification, title: "\u6B63\u5728\u751F\u6210\u63D0\u4EA4\u4FE1\u606F...", cancellable: false },
      async () => gitService2.generateCommitMessage(diff)
    );
    const message = await vscode6.window.showInputBox({
      title: "\u786E\u8BA4\u63D0\u4EA4\u4FE1\u606F",
      value: suggested,
      ignoreFocusOut: true,
      validateInput: (value) => value.trim() ? null : "\u63D0\u4EA4\u4FE1\u606F\u4E0D\u80FD\u4E3A\u7A7A"
    });
    if (!message)
      return;
    const result = await vscode6.window.withProgress(
      {
        location: vscode6.ProgressLocation.Notification,
        title: "\u6B63\u5728\u63D0\u4EA4\u5E76\u63A8\u9001...",
        cancellable: false
      },
      async (progress) => {
        return gitService2.sync({
          projectPath,
          message: message.trim(),
          onProgress: (percent, msg) => {
            progress.report({ message: `${percent}% ${msg}` });
          }
        });
      }
    );
    if (result.committed) {
      const action = await vscode6.window.showInformationMessage(
        `\u2705 \u534F\u540C\u540C\u6B65\u6210\u529F\uFF1A\u5DF2\u81EA\u52A8\u878D\u5408\u8FDC\u7A0B\u6700\u65B0\u4EE3\u7801\u5E76\u63A8\u9001\u5230 ${result.branch} \u5206\u652F`,
        "\u67E5\u770B\u63D0\u4EA4"
      );
      if (action === "\u67E5\u770B\u63D0\u4EA4") {
        await vscode6.commands.executeCommand("git.viewHistory");
      }
    } else if (result.pulled) {
      vscode6.window.showInformationMessage(`\u2705 \u5DF2\u6210\u529F\u62C9\u53D6\u56E2\u961F\u6700\u65B0\u4EE3\u7801\uFF08\u5206\u652F: ${result.branch || "\u5F53\u524D\u5206\u652F"}\uFF09`);
    } else {
      vscode6.window.showInformationMessage("\u5F53\u524D\u5DE5\u4F5C\u533A\u5DF2\u662F\u6700\u65B0\uFF0C\u65E0\u5F85\u540C\u6B65\u9879");
    }
  } catch (error) {
    const message = (error == null ? void 0 : error.message) || String(error);
    if (message.includes("API Key")) {
      await configManager2.showNoConfigWarning();
    } else if (message.includes("\u591A\u4EBA\u4EE3\u7801\u51B2\u7A81") || (error == null ? void 0 : error.isConflict)) {
      vscode6.window.showErrorMessage(message, { modal: true });
    } else {
      vscode6.window.showErrorMessage(`\u540C\u6B65\u5931\u8D25: ${message}`);
    }
  }
}
var vscode6;
var init_sync = __esm({
  "src/commands/sync.ts"() {
    "use strict";
    vscode6 = __toESM(require("vscode"));
    init_gitService();
  }
});

// src/commands/upload.ts
var upload_exports = {};
__export(upload_exports, {
  uploadCommand: () => uploadCommand
});
async function uploadCommand(gitService2, configManager2) {
  const projectPath = GitService.resolveProjectPath();
  if (!projectPath) {
    vscode7.window.showErrorMessage("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u9879\u76EE\u6587\u4EF6\u5939");
    return;
  }
  if (gitService2.isRepository(projectPath)) {
    const remotes = await gitService2.getRemotes(projectPath);
    if (remotes.length > 0) {
      const choice = await vscode7.window.showInformationMessage(
        `\u5F53\u524D\u9879\u76EE\u5DF2\u5173\u8054\u8FDC\u7A0B\u4ED3\u5E93 ${remotes[0].url}\uFF0C\u76F4\u63A5\u63D0\u4EA4\u5E76\u63A8\u9001\u5373\u53EF\u3002`,
        "\u63D0\u4EA4\u5E76\u63A8\u9001",
        "\u4ECD\u7136\u65B0\u5EFA\u4ED3\u5E93"
      );
      if (choice === "\u63D0\u4EA4\u5E76\u63A8\u9001") {
        await syncCommand(gitService2, configManager2);
        return;
      }
      if (!choice)
        return;
    }
  }
  const platformPick = await vscode7.window.showQuickPick(
    PLATFORMS.map((p) => ({
      label: p.label,
      description: p.id === configManager2.defaultPlatform ? "\u9ED8\u8BA4" : void 0,
      id: p.id
    })),
    { title: "\u9009\u62E9\u4EE3\u7801\u6258\u7BA1\u5E73\u53F0", placeHolder: "GitHub / Gitee / GitLab" }
  );
  if (!platformPick)
    return;
  const platform = platformPick.id;
  const repoName = await vscode7.window.showInputBox({
    title: "\u4ED3\u5E93\u540D\u79F0",
    value: import_path6.default.basename(projectPath),
    ignoreFocusOut: true,
    validateInput: (value) => value.trim() ? null : "\u4ED3\u5E93\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A"
  });
  if (!repoName)
    return;
  const description = await vscode7.window.showInputBox({
    title: "\u4ED3\u5E93\u63CF\u8FF0\uFF08\u53EF\u9009\uFF09",
    placeHolder: "\u4E00\u53E5\u8BDD\u63CF\u8FF0\u8FD9\u4E2A\u9879\u76EE",
    ignoreFocusOut: true
  });
  if (description === void 0)
    return;
  const visibilityPick = await vscode7.window.showQuickPick(
    [
      { label: "\u516C\u5F00", description: "\u4EFB\u4F55\u4EBA\u90FD\u53EF\u4EE5\u770B\u5230", isPrivate: false },
      { label: "\u79C1\u6709", description: "\u4EC5\u81EA\u5DF1\u548C\u534F\u4F5C\u8005\u53EF\u89C1", isPrivate: true }
    ],
    { title: "\u4ED3\u5E93\u53EF\u89C1\u6027", placeHolder: "\u9009\u62E9\u516C\u5F00\u6216\u79C1\u6709" }
  );
  if (!visibilityPick)
    return;
  const isPrivate = visibilityPick.isPrivate;
  const confirm = await vscode7.window.showQuickPick(
    [
      {
        label: `$(check) \u786E\u8BA4\u4E0A\u4F20\u5230 ${platformPick.label}`,
        description: `${repoName}${isPrivate ? "\uFF08\u79C1\u6709\uFF09" : "\uFF08\u516C\u5F00\uFF09"}`,
        id: "yes"
      },
      { label: "$(close) \u53D6\u6D88", id: "no" }
    ],
    { title: "\u786E\u8BA4\u4E0A\u4F20\u4FE1\u606F", placeHolder: "\u786E\u8BA4\u65E0\u8BEF\u540E\u5F00\u59CB\u4E0A\u4F20" }
  );
  if (!confirm || confirm.id !== "yes")
    return;
  if (!configManager2.getToken(platform)) {
    const token = await vscode7.window.showInputBox({
      title: `\u914D\u7F6E ${platformPick.label} Token`,
      prompt: `\u672A\u68C0\u6D4B\u5230 ${platformPick.label} Token\uFF0C\u7C98\u8D34 Personal Access Token\uFF08\u4FDD\u5B58\u5230 ~/.git-commit-ai.json\uFF0C\u4E0E CLI \u5171\u7528\uFF09`,
      password: true,
      ignoreFocusOut: true
    });
    if (!token) {
      vscode7.window.showErrorMessage(`\u7F3A\u5C11 ${platformPick.label} Token\uFF0C\u5DF2\u53D6\u6D88\u4E0A\u4F20`);
      return;
    }
    await configManager2.saveConfig({ [`${platform}Token`]: token });
  }
  try {
    const repoUrl = await vscode7.window.withProgress(
      {
        location: vscode7.ProgressLocation.Notification,
        title: `\u6B63\u5728\u4E0A\u4F20\u5230 ${platformPick.label}...`,
        cancellable: false
      },
      async (progress) => {
        return gitService2.upload({
          projectPath,
          platform,
          repoName: repoName.trim(),
          description: description.trim(),
          isPrivate,
          onProgress: (percent, message) => {
            progress.report({ message: `${percent}% ${message}` });
          }
        });
      }
    );
    const action = await vscode7.window.showInformationMessage(
      `\u2705 \u4E0A\u4F20\u6210\u529F: ${repoUrl}`,
      "\u590D\u5236\u94FE\u63A5",
      "\u6253\u5F00\u4ED3\u5E93"
    );
    if (action === "\u590D\u5236\u94FE\u63A5") {
      await vscode7.env.clipboard.writeText(repoUrl);
    } else if (action === "\u6253\u5F00\u4ED3\u5E93") {
      await vscode7.env.openExternal(vscode7.Uri.parse(repoUrl));
    }
  } catch (error) {
    vscode7.window.showErrorMessage(`\u4E0A\u4F20\u5931\u8D25: ${(error == null ? void 0 : error.message) || error}`);
  }
}
var vscode7, import_path6;
var init_upload2 = __esm({
  "src/commands/upload.ts"() {
    "use strict";
    vscode7 = __toESM(require("vscode"));
    import_path6 = __toESM(require("path"));
    init_gitService();
    init_configManager();
    init_sync();
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode10 = __toESM(require("vscode"));

// src/commitPanelProvider.ts
var vscode2 = __toESM(require("vscode"));

// src/commitTreeItem.ts
var vscode = __toESM(require("vscode"));
var CommitTreeItem = class extends vscode.TreeItem {
  constructor(label, collapsibleState, command, contextValue, iconId) {
    super(label, collapsibleState);
    this.label = label;
    this.collapsibleState = collapsibleState;
    this.command = command;
    this.contextValue = contextValue;
    const icon = iconId || contextValue;
    if (icon) {
      const ICON_MAP = {
        generate: "edit",
        suggestion: "lightbulb",
        diff: "diff",
        files: "files",
        upload: "cloud-upload",
        "cloud-download": "cloud-download",
        pull: "cloud-download",
        sync: "sync",
        empty: "info",
        settings: "gear",
        wizard: "wand",
        key: "key",
        guide: "book",
        config: "settings-gear",
        status: "output"
      };
      const themeIconName = ICON_MAP[icon] || icon;
      this.iconPath = new vscode.ThemeIcon(themeIconName);
    }
  }
};

// src/commitPanelProvider.ts
var CommitPanelProvider = class {
  constructor(context, codeAssistant2, gitService2, configManager2) {
    this.context = context;
    this.codeAssistant = codeAssistant2;
    this.gitService = gitService2;
    this.configManager = configManager2;
    this._onDidChangeTreeData = new vscode2.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.stagedDiff = "";
    this.suggestedCommitMessage = "";
    this.loadStagedDiff();
  }
  refresh() {
    this.loadStagedDiff();
    this._onDidChangeTreeData.fire();
  }
  async loadStagedDiff() {
    try {
      const gitExtension = vscode2.extensions.getExtension("vscode.git");
      if (gitExtension) {
        await gitExtension.activate();
        const git = gitExtension.exports.getAPI(1);
        if (git) {
          const repo = git.repositories[0];
          if (repo) {
            this.stagedDiff = await repo.diffIndex();
          }
        }
      }
    } catch (error) {
      console.error("Failed to load staged diff:", error);
      this.stagedDiff = "";
    }
  }
  getTreeItem(element) {
    return element;
  }
  async getChildren(element) {
    if (!element) {
      const items = [];
      items.push(
        new CommitTreeItem(
          "\u4E0A\u4F20\u5230\u8FDC\u7A0B\u4ED3\u5E93",
          vscode2.TreeItemCollapsibleState.None,
          { command: "codesync.upload", title: "\u4E0A\u4F20\u5230\u8FDC\u7A0B\u4ED3\u5E93" },
          "upload"
        )
      );
      items.push(
        new CommitTreeItem(
          "\u62C9\u53D6\u56E2\u961F\u6700\u65B0\u4EE3\u7801",
          vscode2.TreeItemCollapsibleState.None,
          { command: "codesync.pull", title: "\u62C9\u53D6\u56E2\u961F\u6700\u65B0\u4EE3\u7801" },
          "cloud-download"
        )
      );
      items.push(
        new CommitTreeItem(
          "\u63D0\u4EA4\u5E76\u534F\u540C\u63A8\u9001",
          vscode2.TreeItemCollapsibleState.None,
          { command: "codesync.sync", title: "\u63D0\u4EA4\u5E76\u534F\u540C\u63A8\u9001" },
          "sync"
        )
      );
      if (!this.stagedDiff) {
        items.push(
          new CommitTreeItem(
            "\u6CA1\u6709\u6682\u5B58\u7684\u66F4\u6539 (\u6682\u5B58\u540E\u53EFAI\u751F\u6210\u63D0\u4EA4)",
            vscode2.TreeItemCollapsibleState.None,
            { command: "git.stage", title: "\u6682\u5B58\u66F4\u6539" },
            "empty"
          )
        );
      } else {
        items.push(
          new CommitTreeItem(
            "\u6682\u5B58\u7684\u66F4\u6539",
            vscode2.TreeItemCollapsibleState.Collapsed,
            void 0,
            "files"
          )
        );
        if (this.suggestedCommitMessage) {
          items.push(
            new CommitTreeItem(
              `\u5EFA\u8BAE: ${this.suggestedCommitMessage.substring(0, 50)}${this.suggestedCommitMessage.length > 50 ? "..." : ""}`,
              vscode2.TreeItemCollapsibleState.None,
              { command: "codesync.generateCommit", title: "\u91CD\u65B0\u751F\u6210" },
              "suggestion"
            )
          );
        } else {
          items.push(
            new CommitTreeItem(
              "\u751F\u6210\u63D0\u4EA4\u4FE1\u606F",
              vscode2.TreeItemCollapsibleState.None,
              { command: "codesync.generateCommit", title: "\u751F\u6210" },
              "generate"
            )
          );
        }
      }
      items.push(
        new CommitTreeItem(
          "\u914D\u7F6E\u4E0E\u4F7F\u7528\u6307\u5F15",
          vscode2.TreeItemCollapsibleState.Expanded,
          void 0,
          "settings"
        )
      );
      return items;
    } else if (element.contextValue === "files") {
      const diffPreview = this.stagedDiff.substring(0, 500) + (this.stagedDiff.length > 500 ? "\n... (\u5DF2\u622A\u65AD)" : "");
      return [new CommitTreeItem(diffPreview, vscode2.TreeItemCollapsibleState.None, void 0, "diff")];
    } else if (element.contextValue === "settings") {
      return [
        new CommitTreeItem(
          "\u4E00\u952E\u914D\u7F6E\u5411\u5BFC\uFF08\u65B0\u624B\u63A8\u8350\uFF09",
          vscode2.TreeItemCollapsibleState.None,
          { command: "codesync.setupWizard", title: "\u4E00\u952E\u914D\u7F6E\u5411\u5BFC" },
          "wizard"
        ),
        new CommitTreeItem(
          "\u914D\u7F6E\u4EE3\u7801\u5E73\u53F0 Token (GitHub/Gitee)",
          vscode2.TreeItemCollapsibleState.None,
          { command: "codesync.setToken", title: "\u914D\u7F6E\u5E73\u53F0 Token" },
          "key"
        ),
        new CommitTreeItem(
          "\u6253\u5F00\u5B8C\u6574\u8BBE\u7F6E (API Key / URL)",
          vscode2.TreeItemCollapsibleState.None,
          { command: "codesync.openSettings", title: "\u6253\u5F00\u5B8C\u6574\u8BBE\u7F6E" },
          "config"
        ),
        new CommitTreeItem(
          "\u67E5\u770B\u5F53\u524D\u751F\u6548\u914D\u7F6E",
          vscode2.TreeItemCollapsibleState.None,
          { command: "codesync.showConfig", title: "\u67E5\u770B\u5F53\u524D\u751F\u6548\u914D\u7F6E" },
          "status"
        ),
        new CommitTreeItem(
          "\u65B0\u624B\u5165\u95E8\u4E0E\u4F7F\u7528\u6307\u5357",
          vscode2.TreeItemCollapsibleState.None,
          { command: "codesync.openGuide", title: "\u65B0\u624B\u5165\u95E8\u4E0E\u4F7F\u7528\u6307\u5357" },
          "guide"
        )
      ];
    }
    return [];
  }
  /**
   * 生成提交信息并直接提交
   */
  async generateCommitMessage() {
    if (!this.stagedDiff) {
      vscode2.window.showWarningMessage("\u6CA1\u6709\u6682\u5B58\u7684\u66F4\u6539");
      return;
    }
    try {
      await vscode2.window.withProgress(
        {
          location: vscode2.ProgressLocation.Notification,
          title: "\u6B63\u5728\u751F\u6210\u63D0\u4EA4\u4FE1\u606F...",
          cancellable: false
        },
        async () => {
          var _a;
          this.suggestedCommitMessage = await this.codeAssistant.generateCommitMessage(this.stagedDiff);
          this._onDidChangeTreeData.fire();
          const result = await vscode2.window.showInputBox({
            title: "\u7F16\u8F91\u5E76\u786E\u8BA4\u63D0\u4EA4\u4FE1\u606F",
            value: this.suggestedCommitMessage,
            ignoreFocusOut: true
          });
          if (!result)
            return;
          const gitExtension = vscode2.extensions.getExtension("vscode.git");
          if (!gitExtension)
            return;
          await gitExtension.activate();
          const git = gitExtension.exports.getAPI(1);
          const repo = (_a = git == null ? void 0 : git.repositories) == null ? void 0 : _a[0];
          if (repo) {
            await repo.commit(result);
            vscode2.window.showInformationMessage("\u2705 \u63D0\u4EA4\u6210\u529F");
            this.suggestedCommitMessage = "";
            this.refresh();
          }
        }
      );
    } catch (error) {
      const message = (error == null ? void 0 : error.message) || String(error);
      if (message.includes("API Key")) {
        await this.configManager.showNoConfigWarning();
      } else {
        vscode2.window.showErrorMessage(`\u751F\u6210\u63D0\u4EA4\u4FE1\u606F\u5931\u8D25: ${message}`);
      }
    }
  }
};

// src/codeAssistant.ts
var vscode3 = __toESM(require("vscode"));

// ../shared/ai/annotate.js
init_config();
function buildChatUrl(apiBase) {
  const base = (apiBase || "https://api.openai.com/v1").trim().replace(/\/+$/, "");
  if (base.endsWith("/chat/completions")) {
    return base;
  }
  return `${base}/chat/completions`;
}
async function generateAnnotation(code, language = "javascript") {
  const config = readConfig();
  if (!config.apiKey) {
    throw new Error("API Key \u672A\u914D\u7F6E");
  }
  const prompt = `\u8BF7\u4E3A\u4EE5\u4E0B${language}\u4EE3\u7801\u751F\u6210\u8BE6\u7EC6\u7684\u4E2D\u6587\u6CE8\u91CA\uFF1A

${code}

\u8981\u6C42\uFF1A
1. \u4E3A\u6BCF\u4E2A\u51FD\u6570\u6DFB\u52A0\u6CE8\u91CA\u8BF4\u660E\u529F\u80FD
2. \u4E3A\u590D\u6742\u903B\u8F91\u6DFB\u52A0\u884C\u5185\u6CE8\u91CA
3. \u4FDD\u6301\u4EE3\u7801\u7ED3\u6784\u548C\u903B\u8F91\u4E0D\u53D8\uFF0C\u53EA\u6DFB\u52A0\u6CE8\u91CA
4. \u6CE8\u91CA\u8981\u6E05\u6670\u6613\u61C2\uFF0C\u5E2E\u52A9\u7406\u89E3\u4EE3\u7801
5. \u8F93\u51FA\u5B8C\u6574\u7684\u5E26\u6CE8\u91CA\u4EE3\u7801`;
  try {
    const response = await fetch(buildChatUrl(config.apiBase), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "system",
            content: "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u4EE3\u7801\u6CE8\u91CA\u52A9\u624B\uFF0C\u64C5\u957F\u4E3A\u4EE3\u7801\u6DFB\u52A0\u6E05\u6670\u3001\u6709\u7528\u7684\u6CE8\u91CA\u3002"
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });
    if (!response.ok) {
      throw new Error(`API \u8C03\u7528\u5931\u8D25: ${response.status}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    throw new Error(`\u751F\u6210\u6CE8\u91CA\u5931\u8D25: ${error.message}`);
  }
}
async function explainCode(code, language = "javascript") {
  const config = readConfig();
  if (!config.apiKey) {
    throw new Error("API Key \u672A\u914D\u7F6E");
  }
  const prompt = `\u8BF7\u8BE6\u7EC6\u89E3\u91CA\u4EE5\u4E0B${language}\u4EE3\u7801\u7684\u529F\u80FD\u548C\u903B\u8F91\uFF1A

${code}

\u8BF7\u4ECE\u4EE5\u4E0B\u65B9\u9762\u89E3\u91CA\uFF1A
1. \u4EE3\u7801\u7684\u6574\u4F53\u529F\u80FD\u662F\u4EC0\u4E48
2. \u5173\u952E\u51FD\u6570\u548C\u53D8\u91CF\u5206\u522B\u8D77\u4EC0\u4E48\u4F5C\u7528
3. \u4EE3\u7801\u7684\u6267\u884C\u6D41\u7A0B
4. \u53EF\u80FD\u5B58\u5728\u7684\u4F18\u5316\u5EFA\u8BAE
5. \u9002\u7528\u573A\u666F\u8BF4\u660E

\u8BF7\u7528\u901A\u4FD7\u6613\u61C2\u7684\u8BED\u8A00\u89E3\u91CA\uFF0C\u9002\u5408\u521D\u5B66\u8005\u7406\u89E3\u3002`;
  try {
    const response = await fetch(buildChatUrl(config.apiBase), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "system",
            content: "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u4EE3\u7801\u89E3\u91CA\u52A9\u624B\uFF0C\u64C5\u957F\u7528\u901A\u4FD7\u6613\u61C2\u7684\u8BED\u8A00\u89E3\u91CA\u4EE3\u7801\u3002"
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });
    if (!response.ok) {
      throw new Error(`API \u8C03\u7528\u5931\u8D25: ${response.status}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    throw new Error(`\u89E3\u91CA\u4EE3\u7801\u5931\u8D25: ${error.message}`);
  }
}
async function reviewCode(code, language = "javascript") {
  const config = readConfig();
  if (!config.apiKey) {
    throw new Error("API Key \u672A\u914D\u7F6E");
  }
  const prompt = `\u8BF7\u5BF9\u4EE5\u4E0B${language}\u4EE3\u7801\u8FDB\u884C\u5BA1\u67E5\uFF1A

${code}

\u8BF7\u4ECE\u4EE5\u4E0B\u65B9\u9762\u8FDB\u884C\u5BA1\u67E5\uFF1A
1. \u4EE3\u7801\u8D28\u91CF\uFF08\u53EF\u8BFB\u6027\u3001\u53EF\u7EF4\u62A4\u6027\uFF09
2. \u6F5C\u5728\u7684 bug \u6216\u9519\u8BEF
3. \u6027\u80FD\u4F18\u5316\u5EFA\u8BAE
4. \u5B89\u5168\u6027\u95EE\u9898
5. \u6700\u4F73\u5B9E\u8DF5\u5EFA\u8BAE
6. \u547D\u540D\u89C4\u8303\u68C0\u67E5

\u8BF7\u7ED9\u51FA\u5177\u4F53\u7684\u6539\u8FDB\u5EFA\u8BAE\uFF0C\u5305\u62EC\u4EE3\u7801\u793A\u4F8B\u3002`;
  try {
    const response = await fetch(buildChatUrl(config.apiBase), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "system",
            content: "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u4EE3\u7801\u5BA1\u67E5\u4E13\u5BB6\uFF0C\u64C5\u957F\u53D1\u73B0\u4EE3\u7801\u95EE\u9898\u548C\u63D0\u4F9B\u6539\u8FDB\u5EFA\u8BAE\u3002"
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });
    if (!response.ok) {
      throw new Error(`API \u8C03\u7528\u5931\u8D25: ${response.status}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    throw new Error(`\u4EE3\u7801\u5BA1\u67E5\u5931\u8D25: ${error.message}`);
  }
}

// src/codeAssistant.ts
init_commit();
var CodeAssistant = class {
  constructor(config) {
    this.config = config;
  }
  /**
   * 取得当前编辑器中选中的代码
   */
  getSelectedCode() {
    const editor = vscode3.window.activeTextEditor;
    if (!editor) {
      vscode3.window.showErrorMessage("\u6CA1\u6709\u6D3B\u52A8\u7684\u7F16\u8F91\u5668");
      return void 0;
    }
    const selectedText = editor.document.getText(editor.selection);
    if (!selectedText) {
      vscode3.window.showWarningMessage("\u8BF7\u5148\u9009\u4E2D\u8981\u5206\u6790\u7684\u4EE3\u7801");
      return void 0;
    }
    return { code: selectedText, language: editor.document.languageId };
  }
  /**
   * 打开一个只读文档展示结果
   */
  async showResult(content, language) {
    const doc = await vscode3.workspace.openTextDocument({ content, language });
    await vscode3.window.showTextDocument(doc);
  }
  /**
   * 统一的错误处理
   */
  handleError(error, action) {
    const message = (error == null ? void 0 : error.message) || String(error);
    if (message.includes("API Key")) {
      this.config.showNoConfigWarning();
    } else {
      vscode3.window.showErrorMessage(`${action}\u5931\u8D25: ${message}`);
    }
  }
  async explainCode() {
    const selected = this.getSelectedCode();
    if (!selected)
      return;
    try {
      await vscode3.window.withProgress(
        { location: vscode3.ProgressLocation.Notification, title: "\u6B63\u5728\u89E3\u91CA\u4EE3\u7801...", cancellable: false },
        async () => {
          const result = await explainCode(selected.code, selected.language);
          await this.showResult(result, "markdown");
        }
      );
    } catch (error) {
      this.handleError(error, "\u89E3\u91CA\u4EE3\u7801");
    }
  }
  async annotateCode() {
    const selected = this.getSelectedCode();
    if (!selected)
      return;
    try {
      await vscode3.window.withProgress(
        { location: vscode3.ProgressLocation.Notification, title: "\u6B63\u5728\u751F\u6210\u6CE8\u91CA...", cancellable: false },
        async () => {
          const result = await generateAnnotation(selected.code, selected.language);
          await this.showResult(result, selected.language);
        }
      );
    } catch (error) {
      this.handleError(error, "\u751F\u6210\u6CE8\u91CA");
    }
  }
  async reviewCode() {
    const selected = this.getSelectedCode();
    if (!selected)
      return;
    try {
      await vscode3.window.withProgress(
        { location: vscode3.ProgressLocation.Notification, title: "\u6B63\u5728\u5BA1\u67E5\u4EE3\u7801...", cancellable: false },
        async () => {
          const result = await reviewCode(selected.code, selected.language);
          await this.showResult(result, "markdown");
        }
      );
    } catch (error) {
      this.handleError(error, "\u4EE3\u7801\u5BA1\u67E5");
    }
  }
  /**
   * 根据 diff 生成提交信息
   */
  async generateCommitMessage(diff) {
    return generateCommitMessage(diff, "");
  }
};

// src/extension.ts
init_configManager();
init_gitService();
init_upload2();
init_sync();

// src/commands/pull.ts
var vscode8 = __toESM(require("vscode"));
init_gitService();
async function pullCommand(gitService2, configManager2) {
  const projectPath = GitService.resolveProjectPath();
  if (!projectPath) {
    vscode8.window.showErrorMessage("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u9879\u76EE\u6587\u4EF6\u5939");
    return;
  }
  if (!gitService2.isRepository(projectPath)) {
    vscode8.window.showErrorMessage("\u5F53\u524D\u76EE\u5F55\u4E0D\u662F Git \u4ED3\u5E93\uFF0C\u65E0\u6CD5\u6267\u884C\u62C9\u53D6");
    return;
  }
  try {
    const result = await vscode8.window.withProgress(
      {
        location: vscode8.ProgressLocation.Notification,
        title: "\u6B63\u5728\u62C9\u53D6\u8FDC\u7A0B\u56E2\u961F\u6700\u65B0\u4EE3\u7801...",
        cancellable: false
      },
      async (progress) => {
        return gitService2.pull({
          projectPath,
          onProgress: (percent, msg) => {
            progress.report({ message: `${percent}% ${msg}` });
          }
        });
      }
    );
    vscode8.window.showInformationMessage(`\u2705 ${result.message}\uFF08\u5206\u652F: ${result.branch || "\u5F53\u524D\u5206\u652F"}\uFF09`);
  } catch (error) {
    const message = (error == null ? void 0 : error.message) || String(error);
    if (message.includes("\u62C9\u53D6\u51B2\u7A81") || (error == null ? void 0 : error.isConflict)) {
      vscode8.window.showErrorMessage(message, { modal: true });
    } else {
      vscode8.window.showErrorMessage(`\u62C9\u53D6\u5931\u8D25: ${message}`);
    }
  }
}

// src/commands/config.ts
var vscode9 = __toESM(require("vscode"));
init_configManager();
var MASK = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
function mask(value) {
  if (!value)
    return "(\u672A\u914D\u7F6E)";
  return value.length <= 8 ? MASK : `${value.slice(0, 4)}${MASK}${value.slice(-4)}`;
}
var PROVIDER_PRESETS = [
  {
    label: "\u{1F31F} \u667A\u8C31 AI (GLM-4 / GLM-4-Flash)",
    description: "\u56FD\u5185\u76F4\u8FDE / \u514D\u8D39\u53CA\u9AD8\u6027\u4EF7\u6BD4 / \u6781\u901F\u54CD\u5E94",
    detail: "\u63A5\u53E3: https://open.bigmodel.cn/api/paas/v4/chat/completions",
    apiBase: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    model: "glm-4-flash",
    keyUrl: "https://open.bigmodel.cn/usercenter/apikeys"
  },
  {
    label: "\u{1F31F} DeepSeek (deepseek-chat)",
    description: "\u56FD\u5185\u76F4\u8FDE / \u8D85\u9AD8\u4EE3\u7801\u4E0E\u903B\u8F91\u6C34\u51C6 / \u6027\u4EF7\u6BD4\u4E4B\u738B",
    detail: "\u63A5\u53E3: https://api.deepseek.com/v1",
    apiBase: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    keyUrl: "https://platform.deepseek.com/api_keys"
  },
  {
    label: "\u{1F31F} \u963F\u91CC\u4E91\u901A\u4E49\u5343\u95EE (Qwen-Plus)",
    description: "\u56FD\u5185\u5927\u5382\u4E91\u670D\u52A1 / \u7A33\u5B9A\u53EF\u9760",
    detail: "\u63A5\u53E3: https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiBase: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus",
    keyUrl: "https://bailian.console.aliyun.com/"
  },
  {
    label: "\u{1F31F} \u6708\u4E4B\u6697\u9762 Moonshot (Kimi)",
    description: "\u957F\u6587\u672C\u4E0E\u4EE3\u7801\u7406\u89E3\u80FD\u529B\u5F3A",
    detail: "\u63A5\u53E3: https://api.moonshot.cn/v1",
    apiBase: "https://api.moonshot.cn/v1",
    model: "moonshot-v1-8k",
    keyUrl: "https://platform.moonshot.cn/console/api-keys"
  },
  {
    label: "\u{1F310} OpenAI \u5B98\u65B9 (GPT-4o-mini)",
    description: "\u56FD\u9645\u4E3B\u6D41\u901A\u7528\u5927\u6A21\u578B\uFF08\u9700\u8981\u6D77\u5916\u7F51\u7EDC\u73AF\u5883\uFF09",
    detail: "\u63A5\u53E3: https://api.openai.com/v1",
    apiBase: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    keyUrl: "https://platform.openai.com/api-keys"
  },
  {
    label: "\u{1F6E0}\uFE0F \u81EA\u5B9A\u4E49 OpenAI \u517C\u5BB9\u63A5\u53E3",
    description: "\u81EA\u884C\u6307\u5B9A\u63A5\u53E3\u5730\u5740\u4E0E\u6A21\u578B\u540D\u79F0\uFF08\u4E2D\u8F6C\u7AD9\u3001\u672C\u5730Ollama\u7B49\uFF09",
    detail: "\u624B\u52A8\u8F93\u5165 API Base \u4E0E Model",
    apiBase: "",
    model: "",
    keyUrl: ""
  }
];
async function setupWizardCommand(configManager2) {
  const selectedProvider = await vscode9.window.showQuickPick(PROVIDER_PRESETS, {
    title: "\u3010\u65B0\u624B\u5411\u5BFC \u7B2C1/3\u6B65\u3011\u9009\u62E9\u60A8\u7684\u5927\u6A21\u578B\u63D0\u4F9B\u5546",
    placeHolder: "\u63A8\u8350\u56FD\u5185\u65B0\u624B\u9009\u62E9\u3010\u667A\u8C31 AI\u3011\u6216\u3010DeepSeek\u3011\uFF0C\u65E0\u9700\u7F51\u7EDC\u4EE3\u7406\u5373\u53EF\u7545\u5FEB\u4F7F\u7528"
  });
  if (!selectedProvider)
    return;
  let finalApiBase = selectedProvider.apiBase;
  let finalModel = selectedProvider.model;
  if (!finalApiBase) {
    const inputBase = await vscode9.window.showInputBox({
      title: "\u8F93\u5165\u63A5\u53E3\u5730\u5740 (API Base URL)",
      prompt: "\u4F8B\u5982\uFF1Ahttps://api.openai.com/v1 \u6216\u60A8\u7684\u672C\u5730\u670D\u52A1\u5730\u5740",
      value: configManager2.apiBase || "https://api.openai.com/v1",
      ignoreFocusOut: true
    });
    if (!inputBase)
      return;
    finalApiBase = inputBase.trim();
    const inputModel = await vscode9.window.showInputBox({
      title: "\u8F93\u5165\u6A21\u578B\u540D\u79F0 (Model)",
      prompt: "\u4F8B\u5982\uFF1Agpt-4o-mini, deepseek-chat, glm-4-flash",
      value: configManager2.model || "gpt-4o-mini",
      ignoreFocusOut: true
    });
    if (!inputModel)
      return;
    finalModel = inputModel.trim();
  }
  const currentKey = configManager2.apiKey;
  const keyPrompt = selectedProvider.keyUrl ? `\u83B7\u53D6\u5BC6\u94A5\u7F51\u5740\uFF1A${selectedProvider.keyUrl} \uFF08\u5DF2\u914D\u8FC7\u53EF\u76F4\u63A5\u56DE\u8F66\uFF09` : "\u7C98\u8D34\u60A8\u7684 API Key / Token\uFF08\u5DF2\u914D\u8FC7\u53EF\u76F4\u63A5\u56DE\u8F66\uFF09";
  const inputKey = await vscode9.window.showInputBox({
    title: `\u3010\u65B0\u624B\u5411\u5BFC \u7B2C2/3\u6B65\u3011\u8F93\u5165 ${selectedProvider.label.split(" ")[1] || "\u6A21\u578B"} API Key`,
    prompt: keyPrompt,
    value: currentKey ? MASK : "",
    password: true,
    ignoreFocusOut: true
  });
  if (inputKey === void 0)
    return;
  const updates = {
    apiBase: finalApiBase,
    model: finalModel
  };
  if (inputKey && inputKey !== MASK) {
    updates.apiKey = inputKey.trim();
  }
  const tokenChoice = await vscode9.window.showQuickPick(
    [
      {
        label: "\u{1F419} \u914D\u7F6E GitHub \u4E2A\u4EBA\u4EE4\u724C (Personal Access Token)",
        description: "\u65B9\u4FBF\u5728 GitHub \u4E0A\u4E00\u952E\u521B\u5EFA\u4ED3\u5E93\u5E76\u63A8\u9001",
        id: "github"
      },
      {
        label: "\u{1F98A} \u914D\u7F6E Gitee \u7801\u4E91\u79C1\u4EBA\u4EE4\u724C (Private Token)",
        description: "\u65B9\u4FBF\u5728 Gitee \u7801\u4E91\u4E0A\u4E00\u952E\u521B\u5EFA\u4ED3\u5E93\u5E76\u63A8\u9001",
        id: "gitee"
      },
      {
        label: "\u23ED\uFE0F \u7A0D\u540E\u518D\u914D\uFF0C\u5148\u5B8C\u6210\u5927\u6A21\u578B\u914D\u7F6E",
        description: "\u4EE5\u540E\u9700\u8981\u4E0A\u4F20\u8FDC\u7A0B\u4ED3\u5E93\u65F6\u53EF\u968F\u65F6\u5728\u4FA7\u8FB9\u680F\u5355\u72EC\u914D\u7F6E",
        id: "skip"
      }
    ],
    {
      title: "\u3010\u65B0\u624B\u5411\u5BFC \u7B2C3/3\u6B65\u3011\u662F\u5426\u914D\u7F6E\u4EE3\u7801\u6258\u7BA1\u5E73\u53F0\u4EE4\u724C\uFF1F",
      placeHolder: "\u9009\u62E9\u8981\u914D\u7F6E\u7684\u4EE3\u7801\u5E73\u53F0\uFF08\u652F\u6301\u8DF3\u8FC7\uFF09"
    }
  );
  if (tokenChoice && tokenChoice.id !== "skip") {
    const platform = tokenChoice.id;
    const currentToken = configManager2.getToken(platform);
    const tokenTip = platform === "github" ? "GitHub \u4EE4\u724C\u521B\u5EFA\u7F51\u5740\uFF1Ahttps://github.com/settings/tokens \uFF08\u9700\u52FE\u9009 repo \u6743\u9650\uFF09" : "Gitee \u4EE4\u724C\u521B\u5EFA\u7F51\u5740\uFF1Ahttps://gitee.com/profile/personal_access_tokens \uFF08\u9700\u52FE\u9009 projects \u6743\u9650\uFF09";
    const platformToken = await vscode9.window.showInputBox({
      title: `\u914D\u7F6E ${platform === "github" ? "GitHub" : "Gitee"} \u4EE4\u724C`,
      prompt: tokenTip,
      value: currentToken ? MASK : "",
      password: true,
      ignoreFocusOut: true
    });
    if (platformToken && platformToken !== MASK) {
      updates[`${platform}Token`] = platformToken.trim();
    }
  }
  await configManager2.saveConfig(updates);
  const viewAction = "\u67E5\u770B\u751F\u6548\u914D\u7F6E";
  const settingsAction = "\u6253\u5F00\u8BBE\u7F6E\u9762\u677F";
  const notice = await vscode9.window.showInformationMessage(
    `\u{1F389} CodeSync \u914D\u7F6E\u5DF2\u6210\u529F\u4FDD\u5B58\uFF01\u5F53\u524D\u6A21\u578B\uFF1A${finalModel}`,
    viewAction,
    settingsAction
  );
  if (notice === viewAction) {
    await showConfigCommand(configManager2);
  } else if (notice === settingsAction) {
    await configManager2.openSettings();
  }
}
async function setTokenCommand(configManager2) {
  const platformPick = await vscode9.window.showQuickPick(
    PLATFORMS.map((p) => ({
      label: p.label,
      id: p.id,
      description: p.id === "github" ? "\u9700\u8981 repo \u6743\u9650\uFF08\u8BF7\u9009 classic \u7ECF\u5178\u4EE4\u724C\uFF09" : p.id === "gitee" ? "\u9700\u8981 projects \u6743\u9650" : "\u9700\u8981 api \u6743\u9650"
    })),
    { title: "\u9009\u62E9\u8981\u914D\u7F6E Token \u7684\u6258\u7BA1\u5E73\u53F0", placeHolder: "GitHub / Gitee / GitLab" }
  );
  if (!platformPick)
    return;
  const platform = platformPick.id;
  const current = configManager2.getToken(platform);
  const tip = platform === "github" ? "\u8BF7\u4F7F\u7528\u7ECF\u5178 Personal Access Token (classic) \u5E76\u52FE\u9009 repo \u6743\u9650" : platform === "gitee" ? "\u8BF7\u5728 Gitee \u8BBE\u7F6E\u4E2D\u521B\u5EFA\u79C1\u4EBA\u4EE4\u724C\u5E76\u52FE\u9009 projects \u6743\u9650" : "\u8BF7\u5728 GitLab \u4E2D\u521B\u5EFA\u4E2A\u4EBA\u8BBF\u95EE\u4EE4\u724C\u5E76\u52FE\u9009 api \u6743\u9650";
  const token = await vscode9.window.showInputBox({
    title: `\u914D\u7F6E ${platformPick.label} \u8BBF\u95EE\u4EE4\u724C`,
    prompt: tip,
    value: current ? MASK : "",
    password: true,
    ignoreFocusOut: true
  });
  if (!token || token === MASK)
    return;
  await configManager2.saveConfig({ [`${platform}Token`]: token.trim() });
  vscode9.window.showInformationMessage(`\u2705 ${platformPick.label} Token \u5DF2\u4FDD\u5B58\u81F3 ${configManager2.configFilePath}`);
}
async function showConfigCommand(configManager2) {
  const config = configManager2.getConfig();
  const lines = [
    "# \u{1F6E0}\uFE0F CodeSync \u5F53\u524D\u914D\u7F6E\u72B6\u6001",
    "",
    "> **\u6E29\u99A8\u63D0\u793A**\uFF1ACodeSync \u91C7\u7528\u7EDF\u4E00\u5171\u4EAB\u914D\u7F6E\u673A\u5236\u3002CLI \u7EC8\u7AEF\u3001\u684C\u9762\u5BA2\u6237\u7AEF\u4E0E VS Code \u63D2\u4EF6\u5747\u5171\u7528\u6B64\u914D\u7F6E\u3002",
    "",
    "## 1. \u57FA\u7840\u4FE1\u606F",
    `- \u7EDF\u4E00\u914D\u7F6E\u6587\u4EF6\u8DEF\u5F84: \`${configManager2.configFilePath}\``,
    `- \u5F53\u524D\u5927\u6A21\u578B API Key: \`${mask(config.apiKey)}\``,
    `- \u63A5\u53E3\u5730\u5740 (API Base): \`${config.apiBase || "(\u672A\u8BBE\u7F6E\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u5730\u5740)"}\``,
    `- \u5F53\u524D\u9009\u7528\u6A21\u578B: \`${config.model}\``,
    `- \u667A\u80FD\u6A21\u578B\u81EA\u9002\u5E94: \`${config.smartModel ? "\u5DF2\u5F00\u542F" : "\u5DF2\u5173\u95ED"}\``,
    `  - \u5FEB\u901F\u6A21\u578B: \`${config.fastModel}\``,
    `  - \u5F3A\u5927\u6A21\u578B: \`${config.powerfulModel}\``,
    `- \u63D0\u4EA4\u4FE1\u606F\u89C4\u8303: \`${config.convention}\``,
    `- \u63D0\u4EA4\u8BED\u8A00: \`${config.language}\``,
    `- \u672C\u5730\u7F13\u5B58: \`${config.enableCache ? "\u5DF2\u5F00\u542F" : "\u5DF2\u5173\u95ED"}\` (\u7F13\u5B58\u6709\u6548\u65F6\u957F: ${config.cacheTTL} \u6BEB\u79D2)`,
    "",
    "## 2. \u6258\u7BA1\u5E73\u53F0\u4EE4\u724C\u72B6\u6001 (\u7528\u4E8E\u4E00\u952E\u5EFA\u4ED3\u4E0E\u4E0A\u4F20\u63A8\u9001)",
    `- GitHub \u4EE4\u724C: \`${mask(config.githubToken)}\``,
    `- Gitee \u7801\u4E91\u4EE4\u724C: \`${mask(config.giteeToken)}\``,
    `- GitLab \u4EE4\u724C: \`${mask(config.gitlabToken)}\``,
    `- GitLab \u670D\u52A1\u5730\u5740: \`${config.gitlabBase}\``,
    "",
    "---",
    "### \u{1F4A1} \u5FEB\u6377\u4FEE\u6539\u65B9\u6CD5\uFF1A",
    "1. \u4FA7\u8FB9\u680F\u70B9\u51FB **\u3010\u4E00\u952E\u914D\u7F6E\u5411\u5BFC\u3011** \u8FDB\u884C\u50BB\u74DC\u5F0F\u5F15\u5BFC\u914D\u7F6E\uFF1B",
    "2. \u5FEB\u6377\u952E `Ctrl + ,` \u641C\u7D22 `codesync` \u6253\u5F00\u56FE\u5F62\u5316\u8BBE\u7F6E\u9875\u9762\u76F4\u63A5\u4FEE\u6539\uFF1B",
    "3. \u5728\u7EC8\u7AEF\u8FD0\u884C\u547D\u4EE4\u884C\u5DE5\u5177\u4FEE\u6539\uFF1A`codesync config set apiKey=\u4F60\u7684Key`\u3002"
  ];
  const doc = await vscode9.workspace.openTextDocument({
    content: lines.join("\n"),
    language: "markdown"
  });
  await vscode9.window.showTextDocument(doc);
}
async function openGuideCommand() {
  const guideContent = `# \u{1F4D6} CodeSync \u65B0\u624B\u4F7F\u7528\u4E0E\u914D\u7F6E\u5B8C\u5168\u6307\u5357

\u6B22\u8FCE\u4F7F\u7528 **CodeSync**\uFF01\u672C\u5DE5\u5177\u4E13\u4E3A\u5F00\u53D1\u8005\u8BBE\u8BA1\uFF0C\u63D0\u4F9B\u4E00\u952E\u5EFA\u4ED3\u4E0A\u4F20\u3001AI \u81EA\u52A8\u751F\u6210\u89C4\u8303\u63D0\u4EA4\u4FE1\u606F\u3001\u4EE3\u7801\u8BC4\u5BA1\u4E0E\u6CE8\u91CA\u7B49\u529F\u80FD\u3002
\u65E0\u8BBA\u60A8\u4F7F\u7528\u7684\u662F\u547D\u4EE4\u884C\u5DE5\u5177\u3001\u684C\u9762\u7AEF\u8FD8\u662F\u5F53\u524D VS Code \u63D2\u4EF6\uFF0C\u6240\u6709\u914D\u7F6E\u90FD\u662F**\u5168\u81EA\u52A8\u901A\u7528\u5171\u4EAB**\u7684\u3002

---

## \u{1F3AF} \u76EE\u5F55
1. [\u96F6\u57FA\u7840 1 \u5206\u949F\u5FEB\u901F\u914D\u7F6E\u5927\u6A21\u578B](#1-\u96F6\u57FA\u7840-1-\u5206\u949F\u5FEB\u901F\u914D\u7F6E\u5927\u6A21\u578B)
2. [\u5E38\u7528\u529F\u80FD\u600E\u4E48\u7528\uFF1F](#2-\u5E38\u7528\u529F\u80FD\u600E\u4E48\u7528)
3. [\u5E38\u89C1\u4EE3\u7801\u5E73\u53F0 Token \u83B7\u53D6\u6307\u5357](#3-\u5E38\u89C1\u4EE3\u7801\u5E73\u53F0-token-\u83B7\u53D6\u6307\u5357)
4. [\u5E38\u89C1\u95EE\u9898\u89E3\u7B54\uFF08FAQ\uFF09](#4-\u5E38\u89C1\u95EE\u9898\u89E3\u7B54faq)

---

## 1. \u96F6\u57FA\u7840 1 \u5206\u949F\u5FEB\u901F\u914D\u7F6E\u5927\u6A21\u578B

CodeSync \u751F\u6210\u63D0\u4EA4\u4FE1\u606F\u4E0E\u4EE3\u7801\u8BC4\u5BA1\u9700\u8981\u8C03\u7528\u5927\u6A21\u578B\u670D\u52A1\u3002\u6211\u4EEC\u5F3A\u70C8\u63A8\u8350\u56FD\u5185\u65B0\u624B\u4F18\u5148\u9009\u62E9**\u667A\u8C31 AI** \u6216 **DeepSeek**\uFF0C\u56FD\u5185\u7F51\u7EDC\u76F4\u8FDE\u3001\u6210\u672C\u6781\u4F4E\u4E14\u54CD\u5E94\u8FC5\u901F\u3002

### \u{1F31F} \u63A8\u8350\u670D\u52A1\u5546\u53C2\u6570\u5BF9\u7167\u8868\uFF08\u76F4\u63A5\u6284\u4F5C\u4E1A\uFF09

| \u670D\u52A1\u5546 | \u63A8\u8350\u6A21\u578B\u540D\u79F0 (\`model\`) | \u63A5\u53E3\u5730\u5740 (\`apiBase\`) | \u83B7\u53D6 API Key \u94FE\u63A5 |
| :--- | :--- | :--- | :--- |
| **\u667A\u8C31\u6E05\u8A00 (GLM)** | \`glm-4-flash\` \u6216 \`glm-4.6\` | \`https://open.bigmodel.cn/api/paas/v4/chat/completions\` | [open.bigmodel.cn](https://open.bigmodel.cn/usercenter/apikeys) |
| **DeepSeek** | \`deepseek-chat\` | \`https://api.deepseek.com/v1\` | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| **\u963F\u91CC\u901A\u4E49\u5343\u95EE** | \`qwen-plus\` | \`https://dashscope.aliyuncs.com/compatible-mode/v1\` | [dashscope.console.aliyun.com](https://dashscope.console.aliyun.com/) |
| **OpenAI (\u5B98\u65B9)** | \`gpt-4o-mini\` | \`https://api.openai.com/v1\` | [platform.openai.com](https://platform.openai.com/api-keys) |

### \u{1F6E0}\uFE0F \u5982\u4F55\u914D\u7F6E\uFF1F
- **\u6700\u5FEB\u6377\u65B9\u5F0F**\uFF1A\u5728\u5DE6\u4FA7 CodeSync \u4FA7\u8FB9\u680F\u4E2D\uFF0C\u70B9\u51FB **\u3010\u4E00\u952E\u914D\u7F6E\u5411\u5BFC\uFF08\u65B0\u624B\u63A8\u8350\uFF09\u3011**\uFF0C\u8DDF\u968F\u5F39\u7A97\u6307\u5F15\u9009\u62E9\u5382\u5546\u5E76\u7C98\u8D34 API Key \u5373\u53EF\u3002
- **\u56FE\u5F62\u5316\u65B9\u5F0F**\uFF1A\u6309\u5FEB\u6377\u952E \`Ctrl + ,\` \u6253\u5F00\u8BBE\u7F6E\uFF0C\u641C\u7D22 \`codesync\`\uFF0C\u5728\u5BF9\u5E94\u7684\u8F93\u5165\u6846\u4E2D\u586B\u5199\u5373\u53EF\u3002

---

## 2. \u5E38\u7528\u529F\u80FD\u600E\u4E48\u7528\uFF1F

### \u{1F680} 1. \u4E00\u952E\u4E0A\u4F20\u672C\u5730\u9879\u76EE\u5230 GitHub / Gitee
\u65E0\u9700\u5728\u7F51\u9875\u4E0A\u624B\u52A8\u65B0\u5EFA\u4ED3\u5E93\uFF0CCodeSync \u81EA\u52A8\u5E2E\u60A8\u5EFA\u4ED3\u3001\u5173\u8054\u8FDC\u7A0B\u5E76\u63A8\u9001\uFF1A
1. \u70B9\u51FB\u4FA7\u8FB9\u680F\u9876\u90E8 **\u3010\u4E0A\u4F20\u5230\u8FDC\u7A0B\u4ED3\u5E93\u3011**\uFF1B
2. \u9009\u62E9\u8981\u4E0A\u4F20\u5230\u7684\u5E73\u53F0\uFF08GitHub / Gitee / GitLab\uFF09\uFF1B
3. \u8F93\u5165\u4ED3\u5E93\u540D\u79F0\u3001\u63CF\u8FF0\uFF0C\u9009\u62E9\u516C\u5F00\uFF08Public\uFF09\u6216\u79C1\u6709\uFF08Private\uFF09\uFF1B
4. \u63D2\u4EF6\u5C06\u5168\u81EA\u52A8\u5B8C\u6210\uFF1A\u521D\u59CB\u5316 Git -> \u751F\u6210 .gitignore -> \u6682\u5B58\u6587\u4EF6 -> AI \u751F\u6210\u9996\u6761\u63D0\u4EA4\u4FE1\u606F -> \u7F51\u9875\u5EFA\u4ED3 -> \u81EA\u52A8\u63A8\u9001\uFF01

### \u{1F916} 2. AI \u667A\u80FD\u751F\u6210\u89C4\u8303\u63D0\u4EA4\u4FE1\u606F (Commit Message)
1. \u5728 VS Code \u7684\u6E90\u4EE3\u7801\u7BA1\u7406\u9762\u677F\u4E2D\u5C06\u4FEE\u6539\u7684\u6587\u4EF6**\u6682\u5B58 (Stage)**\uFF1B
2. \u70B9\u51FB\u4FA7\u8FB9\u680F\u7684 **\u3010\u751F\u6210\u63D0\u4EA4\u4FE1\u606F\u3011** \u6309\u94AE\uFF1B
3. AI \u4F1A\u667A\u80FD\u5206\u6790\u60A8\u7684\u4FEE\u6539\u5DEE\u5F02 (Diff)\uFF0C\u81EA\u52A8\u751F\u6210\u7B26\u5408\u56FD\u9645\u89C4\u8303\u7684\u63D0\u4EA4\u6458\u8981\uFF1B
4. \u5F39\u7A97\u652F\u6301\u4E8C\u6B21\u4FEE\u6539\uFF0C\u6309\u56DE\u8F66\u76F4\u63A5\u5B8C\u6210\u63D0\u4EA4\uFF01

### \u{1F465} 3. \u56E2\u961F\u534F\u4F5C\u62C9\u53D6\u4E0E\u9632\u51B2\u7A81\u540C\u6B65
- \u70B9\u51FB\u4FA7\u8FB9\u680F **\u3010\u62C9\u53D6\u56E2\u961F\u6700\u65B0\u4EE3\u7801\u3011**\uFF1A\u81EA\u52A8\u62C9\u53D6\u8FDC\u7AEF\u66F4\u65B0\uFF0C\u9632\u6B62\u4EE3\u7801\u51B2\u7A81\uFF1B
- \u70B9\u51FB\u4FA7\u8FB9\u680F **\u3010\u63D0\u4EA4\u5E76\u534F\u540C\u63A8\u9001\u3011**\uFF1A\u4E00\u6B21\u6027\u5B8C\u6210\u201C\u6682\u5B58 -> AI \u751F\u6210\u63D0\u4EA4 -> \u63D0\u4EA4 -> \u63A8\u9001\u201D\u3002

### \u{1F50D} 4. \u9009\u4E2D\u4EE3\u7801\u667A\u80FD\u89E3\u91CA\u4E0E\u8BC4\u5BA1
\u5728\u4EE3\u7801\u7F16\u8F91\u5668\u4E2D**\u9009\u4E2D\u4EFB\u610F\u4E00\u6BB5\u4EE3\u7801**\uFF0C\u9F20\u6807\u53F3\u952E\uFF1A
- **CodeSync: Explain Selected Code**\uFF08\u89E3\u91CA\u8FD9\u6BB5\u4EE3\u7801\u7684\u4F5C\u7528\u4E0E\u903B\u8F91\uFF09
- **CodeSync: Annotate Selected Code**\uFF08\u4E3A\u8FD9\u6BB5\u4EE3\u7801\u81EA\u52A8\u8865\u5145\u4E2D\u6587\u6CE8\u91CA\uFF09
- **CodeSync: Review Selected Code**\uFF08\u5BF9\u8FD9\u6BB5\u4EE3\u7801\u8FDB\u884C\u4EE3\u7801\u5BA1\u67E5\uFF0C\u627E\u51FA\u6F5C\u5728\u7F3A\u9677\u4E0E\u5B89\u5168\u9690\u60A3\uFF09

---

## 3. \u5E38\u89C1\u4EE3\u7801\u5E73\u53F0 Token \u83B7\u53D6\u6307\u5357

\u5982\u679C\u60A8\u9700\u8981\u4F7F\u7528\u201C\u4E00\u952E\u5EFA\u4ED3\u4E0A\u4F20\u201D\u529F\u80FD\uFF0C\u5FC5\u987B\u5411\u63D2\u4EF6\u63D0\u4F9B\u5BF9\u5E94\u5E73\u53F0\u7684\u4E2A\u4EBA\u8BBF\u95EE\u4EE4\u724C\uFF08Token\uFF09\u3002

### \u{1F419} GitHub \u4E2A\u4EBA\u4EE4\u724C (Personal Access Token)
1. \u6253\u5F00\u7F51\u9875\uFF1A[https://github.com/settings/tokens](https://github.com/settings/tokens)
2. \u70B9\u51FB\u53F3\u4E0A\u89D2 **Generate new token**\uFF0C\u9009\u62E9 **Generate new token (classic)**\uFF08\u7ECF\u5178\u4EE4\u724C\uFF0C\u5207\u52FF\u9009\u62E9\u7EC6\u7C92\u5EA6\u4EE4\u724C\uFF09\uFF1B
3. **Note**\uFF08\u5907\u6CE8\uFF09\u968F\u4FBF\u586B\uFF0C\u6BD4\u5982 \`codesync\`\uFF1B
4. **Expiration**\uFF08\u6709\u6548\u671F\uFF09\u53EF\u6839\u636E\u9700\u8981\u9009\u62E9 90 \u5929\u6216\u6C38\u4E0D\u8FC7\u671F\uFF1B
5. **\u6743\u9650\u52FE\u9009**\uFF1A\u52FE\u9009\u6700\u4E0A\u65B9\u7684 **\`repo\`**\uFF08\u5305\u542B repo:status, repo_deployment, public_repo \u7B49\u5168\u90E8\u4ED3\u5E93\u6743\u9650\uFF09\uFF1B
6. \u6ED1\u52A8\u5230\u5E95\u90E8\u70B9\u51FB\u7EFF\u8272\u6309\u94AE **Generate token**\uFF1B
7. \u590D\u5236\u751F\u6210\u7684 \`ghp_xxxx\` \u683C\u5F0F\u4EE4\u724C\uFF0C\u5728 CodeSync \u4FA7\u8FB9\u680F\u70B9\u51FB **\u3010\u914D\u7F6E\u5E73\u53F0 Token\u3011** \u7C98\u8D34\u4FDD\u5B58\u3002

### \u{1F98A} Gitee \u7801\u4E91\u79C1\u4EBA\u4EE4\u724C
1. \u6253\u5F00\u7F51\u9875\uFF1A[https://gitee.com/profile/personal_access_tokens](https://gitee.com/profile/personal_access_tokens)
2. \u70B9\u51FB\u53F3\u4E0A\u89D2 **\u751F\u6210\u65B0 Token**\uFF1B
3. \u4EE4\u724C\u63CF\u8FF0\u586B\u5199 \`codesync\`\uFF1B
4. **\u6743\u9650\u52FE\u9009**\uFF1A\u52FE\u9009 **\`projects\`**\uFF08\u9879\u76EE\u76F8\u5173\u7684\u8BFB\u5199\u6743\u9650\uFF09\uFF1B
5. \u70B9\u51FB\u63D0\u4EA4\uFF0C\u8F93\u5165\u5BC6\u7801\u540E\u590D\u5236\u751F\u6210\u7684 Token \u5E76\u4FDD\u5B58\u81F3 CodeSync \u4E2D\u3002

---

## 4. \u5E38\u89C1\u95EE\u9898\u89E3\u7B54\uFF08FAQ\uFF09

### Q1: \u63D0\u793A "CodeSync API Key \u672A\u914D\u7F6E" \u6216\u5927\u6A21\u578B\u8FDE\u63A5\u5931\u8D25\uFF1F
- \u8BF7\u68C0\u67E5\u60A8\u7684 API Key \u662F\u5426\u586B\u5199\u6B63\u786E\uFF1B
- \u5982\u679C\u4F7F\u7528\u7684\u662F\u56FD\u5185\u4E2D\u8F6C\u6216\u517C\u5BB9\u63A5\u53E3\uFF0C\u8BF7\u52A1\u5FC5\u6838\u5BF9 **API Base URL** \u662F\u5426\u5B8C\u6574\u586B\u5199\uFF0C\u4E0D\u80FD\u6709\u9057\u6F0F\u6216\u591A\u4F59\u7684\u659C\u6760\uFF1B
- \u5982\u679C\u4F7F\u7528\u7684\u662F\u5B98\u65B9 OpenAI \u63A5\u53E3\uFF0C\u9700\u8981\u786E\u8BA4\u60A8\u7684\u7F51\u7EDC\u73AF\u5883\u662F\u5426\u53EF\u4EE5\u76F4\u8FDE\u8BBF\u95EE\u6D77\u5916\u63A5\u53E3\u3002

### Q2: \u63D0\u793A GitHub \u65E0\u6CD5\u5EFA\u4ED3\u6216 401/403 \u6743\u9650\u4E0D\u8DB3\uFF1F
- \u8BF7\u786E\u8BA4\u521B\u5EFA GitHub \u4EE4\u724C\u65F6\uFF0C\u9009\u62E9\u7684\u662F **classic\uFF08\u7ECF\u5178\u4EE4\u724C\uFF09**\uFF0C\u5E76\u4E14\u52A1\u5FC5\u52FE\u9009\u4E86 **\`repo\`** \u6743\u9650\u3002

### Q3: \u4E3A\u4EC0\u4E48\u6211\u5728\u7EC8\u7AEF\u7528\u8FC7\u4E4B\u540E\uFF0C\u63D2\u4EF6\u4E0D\u9700\u8981\u91CD\u65B0\u8F93\u5165\uFF1F
- CodeSync \u8D2F\u5F7B\u7EDF\u4E00\u914D\u7F6E\u7406\u5FF5\uFF0C\u63D2\u4EF6\u81EA\u52A8\u8BFB\u53D6\u7EC8\u7AEF\u914D\u7F6E\u7684 \`~/.git-commit-ai.json\` \u6587\u4EF6\uFF0C\u771F\u6B63\u505A\u5230\u201C\u4E00\u6B21\u914D\u7F6E\uFF0C\u591A\u7AEF\u5171\u4EAB\u201D\uFF01
`;
  const doc = await vscode9.workspace.openTextDocument({
    content: guideContent,
    language: "markdown"
  });
  await vscode9.window.showTextDocument(doc);
}

// src/extension.ts
var commitPanelProvider;
var codeAssistant;
var configManager;
var gitService;
function activate(context) {
  console.log("CodeSync extension is now active!");
  configManager = new ConfigManager();
  codeAssistant = new CodeAssistant(configManager);
  gitService = new GitService(configManager);
  commitPanelProvider = new CommitPanelProvider(context, codeAssistant, gitService, configManager);
  const commitPanelView = vscode10.window.createTreeView("codesync.commitPanel", {
    treeDataProvider: commitPanelProvider,
    showCollapseAll: false
  });
  const commands4 = [
    vscode10.commands.registerCommand("codesync.generateCommit", () => {
      commitPanelProvider.generateCommitMessage();
    }),
    vscode10.commands.registerCommand("codesync.explainCode", () => {
      codeAssistant.explainCode();
    }),
    vscode10.commands.registerCommand("codesync.annotateCode", () => {
      codeAssistant.annotateCode();
    }),
    vscode10.commands.registerCommand("codesync.reviewCode", () => {
      codeAssistant.reviewCode();
    }),
    vscode10.commands.registerCommand("codesync.refreshDiff", () => {
      commitPanelProvider.refresh();
    }),
    vscode10.commands.registerCommand("codesync.openSettings", () => {
      configManager.openSettings();
    }),
    // 一键上传项目到远程仓库
    vscode10.commands.registerCommand("codesync.upload", () => {
      uploadCommand(gitService, configManager);
    }),
    // 拉取远程团队最新代码（多人协作防冲突）
    vscode10.commands.registerCommand("codesync.pull", () => {
      pullCommand(gitService, configManager);
    }),
    // 提交并协同推送
    vscode10.commands.registerCommand("codesync.sync", () => {
      syncCommand(gitService, configManager);
    }),
    // 配置平台 Token
    vscode10.commands.registerCommand("codesync.setToken", () => {
      setTokenCommand(configManager);
    }),
    // 查看当前配置
    vscode10.commands.registerCommand("codesync.showConfig", () => {
      showConfigCommand(configManager);
    }),
    // 新手一键配置向导
    vscode10.commands.registerCommand("codesync.setupWizard", () => {
      setupWizardCommand(configManager);
    }),
    // 新手入门与使用指引
    vscode10.commands.registerCommand("codesync.openGuide", () => {
      openGuideCommand();
    })
  ];
  const gitExtension = vscode10.extensions.getExtension("vscode.git");
  if (gitExtension) {
    gitExtension.activate().then(() => {
      const git = gitExtension.exports.getAPI(1);
      if (git) {
        git.onDidChangeState(() => {
          commitPanelProvider.refresh();
        });
      }
    });
  }
  context.subscriptions.push(commitPanelView, ...commands4);
}
function deactivate() {
  console.log("CodeSync extension is now deactivated!");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
