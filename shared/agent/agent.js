import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import { GitOperations } from '../git/operations.js';
import { generateCommitMessage } from '../ai/commit.js';
import { readConfig } from '../config.js';
import pc from 'picocolors';

/**
 * CodeSync Agent - 智能代码上传助手
 * 自动监听文件变化，生成提交信息，上传到远程仓库
 */
export class CodeSyncAgent {
  constructor(options = {}) {
    this.projectPath = options.projectPath || process.cwd();
    this.config = {
      // 监听配置
      watchPaths: options.watchPaths || ['.'],
      ignored: options.ignored || [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.DS_Store',
        '**/*.log'
      ],
      
      // 上传策略
      strategy: options.strategy || 'smart', // 'smart', 'immediate', 'batch', 'scheduled'
      batchSize: options.batchSize || 5, // 批量上传的文件数量阈值
      interval: options.interval || 60000, // 定时上传间隔（毫秒）
      
      // 提交配置
      autoCommit: options.autoCommit !== false,
      autoPush: options.autoPush !== false,
      commitConvention: options.commitConvention || 'angular',
      commitLanguage: options.commitLanguage || 'zh',
      
      // AI 配置
      useAI: options.useAI !== false,
      aiModel: options.aiModel || 'gpt-4o-mini',
      
      // 通知配置
      notify: options.notify !== false,
      
      // 安全配置
      requireConfirmation: options.requireConfirmation !== false,
      
      ...options
    };

    this.git = new GitOperations(this.projectPath);
    this.watcher = null;
    this.pendingFiles = new Set();
    this.batchTimer = null;
    this.isRunning = false;
    this.stats = {
      totalCommits: 0,
      totalFiles: 0,
      lastCommitTime: null,
      startTime: null
    };
  }

  /**
   * 启动智能体
   */
  async start() {
    if (this.isRunning) {
      console.log(pc.yellow('⚠️  智能体已在运行中'));
      return;
    }

    console.log(pc.cyan(pc.bold('\n🤖 CodeSync Agent 启动中...')));
    console.log(pc.dim('─'.repeat(50)));

    // 检查 Git 仓库
    if (!this.git.isGitRepository(this.projectPath)) {
      throw new Error('当前目录不是 Git 仓库');
    }

    // 检查远程仓库
    try {
      const remote = await this.git.getRemote();
      if (!remote) {
        console.log(pc.yellow('⚠️  未配置远程仓库，将仅提交不推送'));
      }
    } catch (error) {
      console.log(pc.yellow('⚠️  无法检测远程仓库'));
    }

    // 启动文件监听
    this.startWatcher();

    // 根据策略启动定时器
    if (this.config.strategy === 'scheduled') {
      this.startScheduledUpload();
    }

    this.isRunning = true;
    this.stats.startTime = new Date();

    console.log(pc.green('✅ 智能体已启动'));
    console.log(pc.cyan('\n📋 配置信息:'));
    console.log(pc.dim(`  监听路径: ${this.config.watchPaths.join(', ')}`));
    console.log(pc.dim(`  上传策略: ${this.config.strategy}`));
    console.log(pc.dim(`  AI 生成: ${this.config.useAI ? '启用' : '禁用'}`));
    console.log(pc.dim(`  自动提交: ${this.config.autoCommit ? '启用' : '禁用'}`));
    console.log(pc.dim(`  自动推送: ${this.config.autoPush ? '启用' : '禁用'}`));
    console.log(pc.dim(`  需要确认: ${this.config.requireConfirmation ? '是' : '否'}`));
    console.log(pc.cyan('\n💡 提示:'));
    console.log(pc.dim('  智能体将自动监听文件变化并上传'));
    console.log(pc.dim('  按 Ctrl+C 停止智能体'));
  }

  /**
   * 停止智能体
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }

    console.log(pc.yellow('\n正在停止智能体...'));

    // 停止文件监听
    if (this.watcher) {
      await this.watcher.close();
    }

    // 清除定时器
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // 处理待上传文件
    if (this.pendingFiles.size > 0) {
      console.log(pc.yellow(`检测到 ${this.pendingFiles.size} 个待上传文件`));
      const { default: prompts } = await import('prompts');
      const response = await prompts({
        type: 'confirm',
        name: 'upload',
        message: '是否在停止前上传这些文件？',
        initial: true
      });

      if (response.upload) {
        await this.uploadChanges();
      }
    }

    this.isRunning = false;

    // 显示统计信息
    this.printStats();

    console.log(pc.green('✅ 智能体已停止'));
  }

  /**
   * 启动文件监听
   */
  startWatcher() {
    this.watcher = chokidar.watch(this.config.watchPaths, {
      ignored: this.config.ignored,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', (path) => this.handleFileChange('add', path))
      .on('change', (path) => this.handleFileChange('change', path))
      .on('unlink', (path) => this.handleFileChange('delete', path));

    console.log(pc.cyan('👀 文件监听已启动'));
  }

  /**
   * 处理文件变化
   */
  async handleFileChange(type, filePath) {
    const relativePath = path.relative(this.projectPath, filePath);
    console.log(pc.dim(`📝 ${type.toUpperCase()}: ${relativePath}`));

    this.pendingFiles.add(relativePath);
    this.stats.totalFiles++;

    // 根据策略处理上传
    switch (this.config.strategy) {
      case 'immediate':
        await this.uploadChanges();
        break;
      case 'batch':
        if (this.pendingFiles.size >= this.config.batchSize) {
          await this.uploadChanges();
        } else {
          this.scheduleBatchUpload();
        }
        break;
      case 'smart':
        // 智能策略：根据文件类型和数量决定
        if (this.shouldUploadNow()) {
          await this.uploadChanges();
        } else {
          this.scheduleBatchUpload();
        }
        break;
      case 'scheduled':
        // 定时策略：由定时器处理
        break;
    }
  }

  /**
   * 判断是否应该立即上传
   */
  shouldUploadNow() {
    // 如果文件数量达到阈值
    if (this.pendingFiles.size >= this.config.batchSize) {
      return true;
    }

    // 如果是重要文件（如配置文件）
    const importantFiles = ['package.json', 'tsconfig.json', '.env', 'README.md'];
    for (const file of this.pendingFiles) {
      if (importantFiles.includes(path.basename(file))) {
        return true;
      }
    }

    return false;
  }

  /**
   * 安排批量上传
   */
  scheduleBatchUpload() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.uploadChanges();
    }, this.config.interval);
  }

  /**
   * 启动定时上传
   */
  startScheduledUpload() {
    setInterval(() => {
      if (this.pendingFiles.size > 0) {
        this.uploadChanges();
      }
    }, this.config.interval);

    console.log(pc.cyan(`⏰ 定时上传已启动（间隔: ${this.config.interval / 1000}秒）`));
  }

  /**
   * 上传变更
   */
  async uploadChanges() {
    if (this.pendingFiles.size === 0) {
      return;
    }

    const files = Array.from(this.pendingFiles);
    this.pendingFiles.clear();

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    console.log(pc.cyan(`\n📤 准备上传 ${files.length} 个文件...`));

    try {
      // 如果需要确认
      if (this.config.requireConfirmation) {
        const { default: prompts } = await import('prompts');
        const response = await prompts({
          type: 'confirm',
          name: 'confirm',
          message: `是否上传这 ${files.length} 个文件的变更？`,
          initial: true
        });

        if (!response.confirm) {
          console.log(pc.yellow('❌ 已取消上传'));
          return;
        }
      }

      // 暂存文件
      console.log(pc.dim('  暂存文件...'));
      for (const file of files) {
        await this.git.stageFile(file);
      }

      // 生成提交信息
      let commitMessage;
      if (this.config.useAI) {
        console.log(pc.dim('  AI 生成提交信息...'));
        const diff = await this.git.getStagedDiff();
        const config = readConfig();
        commitMessage = await generateCommitMessage(diff, {
          convention: this.config.commitConvention,
          language: this.config.commitLanguage,
          model: this.config.aiModel || config.model
        });
      } else {
        commitMessage = `Update ${files.length} files via CodeSync Agent`;
      }

      console.log(pc.cyan(`  提交信息: ${commitMessage}`));

      // 提交
      if (this.config.autoCommit) {
        console.log(pc.dim('  提交变更...'));
        await this.git.commit(commitMessage);
        this.stats.totalCommits++;
        this.stats.lastCommitTime = new Date();
      }

      // 推送
      if (this.config.autoPush) {
        console.log(pc.dim('  推送到远程...'));
        try {
          await this.git.push();
          console.log(pc.green('✅ 上传成功'));
        } catch (error) {
          console.log(pc.yellow('⚠️  推送失败（可能没有远程仓库）'));
        }
      } else {
        console.log(pc.green('✅ 提交成功（未推送）'));
      }

      // 发送通知
      if (this.config.notify) {
        this.sendNotification('CodeSync Agent', `成功上传 ${files.length} 个文件`);
      }

    } catch (error) {
      console.error(pc.red(`❌ 上传失败: ${error.message}`));
      // 失败的文件重新加入待处理
      files.forEach(file => this.pendingFiles.add(file));
    }
  }

  /**
   * 发送通知
   */
  sendNotification(title, message) {
    // 在实际应用中，可以使用系统通知或集成其他通知服务
    console.log(pc.cyan(`🔔 ${title}: ${message}`));
  }

  /**
   * 打印统计信息
   */
  printStats() {
    const duration = this.stats.startTime 
      ? Math.floor((Date.now() - this.stats.startTime.getTime()) / 1000)
      : 0;

    console.log(pc.cyan('\n📊 统计信息:'));
    console.log(pc.dim('─'.repeat(50)));
    console.log(pc.dim(`  总提交数: ${this.stats.totalCommits}`));
    console.log(pc.dim(`  总文件数: ${this.stats.totalFiles}`));
    console.log(pc.dim(`  运行时长: ${duration}秒`));
    if (this.stats.lastCommitTime) {
      console.log(pc.dim(`  最后提交: ${this.stats.lastCommitTime.toLocaleString()}`));
    }
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      pendingFiles: Array.from(this.pendingFiles),
      stats: this.stats,
      config: this.config
    };
  }
}
