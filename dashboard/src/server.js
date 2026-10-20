import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pc from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CodeSync Dashboard is running' });
});

// Git 统计 API
app.get('/api/stats', async (req, res) => {
  try {
    const { execSync } = await import('child_process');
    
    // 获取提交统计
    const totalCommits = execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim();
    
    // 获取贡献者
    const contributors = execSync('git shortlog -sn --all', { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .map(line => {
        const [count, ...nameParts] = line.split('\t');
        return { count: parseInt(count), name: nameParts.join('\t') };
      });

    // 获取分支列表
    const branches = execSync('git branch -a', { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .map(line => line.replace(/^\*?\s*/, '').trim());

    res.json({
      totalCommits: parseInt(totalCommits),
      contributors,
      branches
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 提交历史 API
app.get('/api/commits', async (req, res) => {
  try {
    const { execSync } = await import('child_process');
    const limit = req.query.limit || 20;
    
    const commits = execSync(`git log -${limit} --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso`, { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .map(line => {
        const [hash, author, email, date, subject] = line.split('|');
        return { hash, author, email, date, subject };
      });

    res.json(commits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 文件变更统计 API
app.get('/api/file-stats', async (req, res) => {
  try {
    const { execSync } = await import('child_process');
    
    const fileStats = execSync('git log --name-only --pretty=format: --diff-filter=A | sort | uniq -c | sort -rn', { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [count, ...fileParts] = line.trim().split(/\s+/);
        return { count: parseInt(count), file: fileParts.join(' ') };
      });

    res.json(fileStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(pc.cyan(pc.bold('\n📊 CodeSync Dashboard')));
  console.log(pc.dim('─'.repeat(50)));
  console.log(pc.green(`✅ 服务器运行在 http://localhost:${PORT}`));
  console.log(pc.cyan('\n📡 API 端点:'));
  console.log(pc.dim(`  GET  /api/health - 健康检查`));
  console.log(pc.dim(`  GET  /api/stats - Git 统计`));
  console.log(pc.dim(`  GET  /api/commits - 提交历史`));
  console.log(pc.dim(`  GET  /api/file-stats - 文件变更统计`));
  console.log(pc.dim('\n💡 按 Ctrl+C 停止服务器'));
});
