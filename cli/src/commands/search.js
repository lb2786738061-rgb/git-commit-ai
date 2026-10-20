import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import ora from 'ora';
import { execSync } from 'child_process';

export async function searchCommand(query, options) {
  console.log(pc.cyan(pc.bold('\n🔍 CodeSync - 代码搜索')));
  console.log(pc.dim('─'.repeat(50)));

  try {
    const { type = 'text', file } = options;

    if (!query) {
      console.error(pc.red('❌ 缺少搜索查询'));
      console.log(pc.dim('  使用: codesync search "<query>" [--type text|semantic] [--file <file>]'));
      return;
    }

    const spinner = ora(pc.cyan('正在搜索...')).start();

    let results = [];

    if (type === 'semantic') {
      results = await semanticSearch(query, file);
    } else {
      results = await textSearch(query, file);
    }

    spinner.succeed(pc.green(`找到 ${results.length} 个结果`));

    if (results.length === 0) {
      console.log(pc.dim('  没有找到匹配的结果'));
      return;
    }

    console.log(pc.cyan('\n📋 搜索结果:'));
    console.log(pc.dim('─'.repeat(50)));

    results.forEach((result, index) => {
      console.log(pc.cyan(`\n${index + 1}. ${result.file}`));
      console.log(pc.dim(`   行 ${result.line}: ${result.preview}`));
      if (result.context) {
        console.log(pc.dim(`   上下文: ${result.context}`));
      }
    });

  } catch (error) {
    console.error(pc.red(`\n❌ 搜索失败: ${error.message}`));
    process.exit(1);
  }
}

async function textSearch(query, file) {
  const results = [];
  const cwd = process.cwd();

  // 使用 ripgrep 搜索
  try {
    const rgPath = path.join(cwd, file || '.');
    const command = `rg -n --context 2 "${query}" ${rgPath} --type-add 'web:*.{html,css,js,jsx,ts,tsx,vue,svelte}' -t web -t js -t ts -t py -t go -t rs`;
    const output = execSync(command, { encoding: 'utf-8', cwd });

    const lines = output.split('\n');
    let currentFile = '';
    let currentResult = null;

    lines.forEach(line => {
      if (!line.trim()) return;

      const match = line.match(/^([^:]+):(\d+):(.*)$/);
      if (match) {
        const [, filePath, lineNum, content] = match;
        
        if (filePath !== currentFile) {
          if (currentResult) {
            results.push(currentResult);
          }
          currentFile = filePath;
          currentResult = {
            file: filePath,
            line: parseInt(lineNum),
            preview: content.trim(),
            context: []
          };
        } else {
          if (currentResult) {
            currentResult.context.push(content.trim());
          }
        }
      }
    });

    if (currentResult) {
      results.push(currentResult);
    }

  } catch (error) {
    // ripgrep 未安装或无结果，使用 grep
    const command = file 
      ? `grep -n -C 2 "${query}" ${file}`
      : `grep -rn -C 2 "${query}" . --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" --include="*.py" --include="*.go" --include="*.rs"`;
    
    try {
      const output = execSync(command, { encoding: 'utf-8', cwd });
      const lines = output.split('\n');
      
      lines.forEach(line => {
        const match = line.match(/^([^:]+):(\d+):(.*)$/);
        if (match) {
          const [, filePath, lineNum, content] = match;
          results.push({
            file: filePath,
            line: parseInt(lineNum),
            preview: content.trim()
          });
        }
      });
    } catch (grepError) {
      // 无结果
    }
  }

  return results;
}

async function semanticSearch(query, file) {
  // 语义搜索需要 AI 集成，这里简化为基于关键词的搜索
  // 实际实现可以使用向量数据库或 AI embedding
  
  const results = [];
  const cwd = process.cwd();
  const searchPath = file || path.join(cwd, 'src');

  // 递归搜索代码文件
  const codeFiles = findCodeFiles(searchPath);

  for (const filePath of codeFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // 简单的关键词匹配（实际应该使用 AI embedding）
    const keywords = query.toLowerCase().split(/\s+/);
    
    lines.forEach((line, index) => {
      const lineLower = line.toLowerCase();
      const matchCount = keywords.filter(kw => lineLower.includes(kw)).length;
      
      if (matchCount > 0) {
        results.push({
          file: path.relative(cwd, filePath),
          line: index + 1,
          preview: line.trim(),
          context: getSurroundingLines(lines, index, 2),
          score: matchCount
        });
      }
    });
  }

  // 按匹配度排序
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, 20); // 返回前 20 个结果
}

function findCodeFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h'];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // 跳过 node_modules 等目录
      if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
        files.push(...findCodeFiles(fullPath));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (codeExtensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function getSurroundingLines(lines, index, context) {
  const start = Math.max(0, index - context);
  const end = Math.min(lines.length, index + context + 1);
  return lines.slice(start, end).join('\n');
}
