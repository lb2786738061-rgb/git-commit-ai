import { GitOperations } from '../../../shared/git/operations.js';
import pc from 'picocolors';
import ora from 'ora';

// 敏感信息正则表达式模式
const SENSITIVE_PATTERNS = [
  {
    name: 'API Key',
    pattern: /(?:api[_-]?key|apikey|secret)[\s:=]+["']?[a-zA-Z0-9_\-]{20,}["']?/gi,
    severity: 'high'
  },
  {
    name: 'JWT Token',
    pattern: /eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/g,
    severity: 'high'
  },
  {
    name: 'GitHub Token',
    pattern: /ghp_[a-zA-Z0-9]{36}/g,
    severity: 'high'
  },
  {
    name: 'GitHub OAuth',
    pattern: /gho_[a-zA-Z0-9]{36}/g,
    severity: 'high'
  },
  {
    name: 'GitHub App Token',
    pattern: /ghu_[a-zA-Z0-9]{36}/g,
    severity: 'high'
  },
  {
    name: 'GitLab Token',
    pattern: /glpat-[a-zA-Z0-9_\-]{20}/g,
    severity: 'high'
  },
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'high'
  },
  {
    name: 'AWS Secret Key',
    pattern: /[0-9a-zA-Z/+]{40}/g,
    severity: 'high'
  },
  {
    name: 'Stripe API Key',
    pattern: /sk_(live|test)_[a-zA-Z0-9]{24,}/g,
    severity: 'high'
  },
  {
    name: 'Slack Token',
    pattern: /xox[baprs]-[a-zA-Z0-9\-]{10,}/g,
    severity: 'high'
  },
  {
    name: 'Password',
    pattern: /password[\s:=]+["']?[^\s"']{4,}["']?/gi,
    severity: 'medium'
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN [A-Z]+ PRIVATE KEY-----/g,
    severity: 'high'
  },
  {
    name: 'Database URL',
    pattern: /(?:mongodb|mysql|postgres|redis)://[^\s"']+/gi,
    severity: 'medium'
  },
  {
    name: 'Email',
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    severity: 'low'
  },
  {
    name: 'IP Address',
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    severity: 'low'
  }
];

export async function securityCommand(action, options) {
  console.log(pc.cyan(pc.bold('\n🔒 CodeSync - 安全检测')));
  console.log(pc.dim('─'.repeat(50)));

  try {
    switch (action) {
      case 'scan':
        await handleScan(options);
        break;
      case 'pre-commit':
        await handlePreCommit();
        break;
      case 'license':
        await handleLicenseCheck(options);
        break;
      default:
        console.error(pc.red('❌ 未知的操作类型'));
        console.log(pc.dim('可用操作: scan, pre-commit, license'));
        process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`\n❌ 操作失败: ${error.message}`));
    process.exit(1);
  }
}

async function handleScan(options) {
  const { path: projectPath, file } = options;
  const cwd = projectPath || process.cwd();

  const spinner = ora(pc.cyan('正在扫描敏感信息...')).start();

  let findings = [];

  if (file) {
    // 扫描单个文件
    findings = await scanFile(file);
  } else {
    // 扫描暂存区
    findings = await scanStaged(cwd);
  }

  spinner.succeed(pc.green('扫描完成'));

  if (findings.length === 0) {
    console.log(pc.green('\n✅ 未发现敏感信息'));
    return;
  }

  // 按严重程度分组
  const bySeverity = {
    high: findings.filter(f => f.severity === 'high'),
    medium: findings.filter(f => f.severity === 'medium'),
    low: findings.filter(f => f.severity === 'low')
  };

  console.log(pc.red(`\n⚠️  发现 ${findings.length} 处敏感信息\n`));

  if (bySeverity.high.length > 0) {
    console.log(pc.red(pc.bold('🔴 高风险:')));
    bySeverity.high.forEach(f => printFinding(f));
  }

  if (bySeverity.medium.length > 0) {
    console.log(pc.yellow(pc.bold('\n🟡 中风险:')));
    bySeverity.medium.forEach(f => printFinding(f));
  }

  if (bySeverity.low.length > 0) {
    console.log(pc.blue(pc.bold('\n🔵 低风险:')));
    bySeverity.low.forEach(f => printFinding(f));
  }

  console.log(pc.cyan('\n💡 建议:'));
  console.log(pc.dim('  - 使用环境变量存储敏感信息'));
  console.log(pc.dim('  - 将敏感文件添加到 .gitignore'));
  console.log(pc.dim('  - 使用 secrets 管理工具（如 .env 文件）'));
}

async function handlePreCommit() {
  const cwd = process.cwd();
  const spinner = ora(pc.cyan('正在检测暂存区敏感信息...')).start();

  const findings = await scanStaged(cwd);

  spinner.succeed(pc.green('检测完成'));

  if (findings.length > 0) {
    const highRisk = findings.filter(f => f.severity === 'high');
    if (highRisk.length > 0) {
      console.log(pc.red(`\n❌ 发现 ${highRisk.length} 处高风险敏感信息，阻止提交\n`));
      highRisk.forEach(f => printFinding(f));
      console.log(pc.yellow('\n请移除敏感信息后再提交'));
      process.exit(1);
    }

    console.log(pc.yellow(`\n⚠️  发现 ${findings.length} 处敏感信息（非高风险）\n`));
    findings.forEach(f => printFinding(f));

    const { default: prompts } = await import('prompts');
    const response = await prompts({
      type: 'confirm',
      name: 'continue',
      message: '是否继续提交？',
      initial: false
    });

    if (!response.continue) {
      console.log(pc.yellow('\n提交已取消'));
      process.exit(1);
    }
  }

  console.log(pc.green('\n✅ 安全检测通过'));
}

async function scanFile(filePath) {
  const fs = await import('fs');
  const path = await import('path');

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return detectSensitiveInfo(content, filePath);
  } catch (error) {
    console.error(pc.red(`无法读取文件 ${filePath}: ${error.message}`));
    return [];
  }
}

async function scanStaged(cwd) {
  if (!GitOperations.isGitRepository(cwd)) {
    throw new Error('当前目录不是 Git 仓库');
  }

  const git = new GitOperations(cwd);
  const diff = await git.getStagedDiff();

  if (!diff || diff.trim() === '') {
    return [];
  }

  return detectSensitiveInfo(diff, 'staged changes');
}

function detectSensitiveInfo(content, source) {
  const findings = [];

  for (const pattern of SENSITIVE_PATTERNS) {
    const matches = content.match(pattern.pattern);
    if (matches) {
      matches.forEach(match => {
        findings.push({
          type: pattern.name,
          severity: pattern.severity,
          value: maskSensitiveValue(match),
          source: source,
          line: findLineNumber(content, match)
        });
      });
    }
  }

  return findings;
}

function maskSensitiveValue(value) {
  if (value.length <= 8) {
    return '*'.repeat(value.length);
  }
  return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
}

function findLineNumber(content, match) {
  const index = content.indexOf(match);
  if (index === -1) return -1;

  const before = content.substring(0, index);
  return before.split('\n').length;
}

function printFinding(finding) {
  const severityColors = {
    high: pc.red,
    medium: pc.yellow,
    low: pc.blue
  };

  const color = severityColors[finding.severity];

  console.log(color(`  • ${finding.type}`));
  console.log(pc.dim(`    值: ${finding.value}`));
  console.log(pc.dim(`    来源: ${finding.source}`));
  if (finding.line !== -1) {
    console.log(pc.dim(`    行号: ${finding.line}`));
  }
  console.log();
}

async function handleLicenseCheck(options) {
  const { path: projectPath } = options;
  const cwd = projectPath || process.cwd();
  const spinner = ora(pc.cyan('正在检查依赖许可证...')).start();

  try {
    const packageJsonPath = path.join(cwd, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      spinner.warn(pc.yellow('未找到 package.json'));
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const dependencies = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {}
    };

    const licenseReport = [];
    
    for (const [name, version] of Object.entries(dependencies)) {
      try {
        const license = await getPackageLicense(name, version);
        licenseReport.push({
          name,
          version,
          license: license || 'Unknown',
          compliant: isLicenseCompliant(license)
        });
      } catch (error) {
        licenseReport.push({
          name,
          version,
          license: 'Unknown',
          compliant: false,
          error: error.message
        });
      }
    }

    spinner.succeed(pc.green('许可证检查完成'));

    // 按合规性分组
    const compliant = licenseReport.filter(r => r.compliant);
    const nonCompliant = licenseReport.filter(r => !r.compliant);

    console.log(pc.cyan('\n📋 许可证报告:'));
    console.log(pc.dim('─'.repeat(50)));
    console.log(pc.green(`✅ 合规: ${compliant.length}`));
    console.log(pc.red(`❌ 不合规: ${nonCompliant.length}`));

    if (nonCompliant.length > 0) {
      console.log(pc.red('\n⚠️  不合规的依赖:'));
      nonCompliant.forEach(dep => {
        console.log(pc.red(`  • ${dep.name}@${dep.version}`));
        console.log(pc.dim(`    许可证: ${dep.license}`));
      });

      console.log(pc.cyan('\n💡 建议:'));
      console.log(pc.dim('  - 检查不合规依赖的许可证'));
      console.log(pc.dim('  - 考虑替换为 MIT/Apache-2.0 等宽松许可证'));
      console.log(pc.dim('  - 在法律顾问的指导下评估风险'));
    }

    // 生成报告文件
    const reportPath = path.join(cwd, 'license-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(licenseReport, null, 2), 'utf-8');
    console.log(pc.cyan(`\n📄 报告已保存: ${reportPath}`));

  } catch (error) {
    spinner.fail(pc.red('许可证检查失败'));
    throw error;
  }
}

async function getPackageLicense(packageName, version) {
  try {
    const { execSync } = await import('child_process');
    const command = `npm view ${packageName}@${version} license`;
    const license = execSync(command, { encoding: 'utf-8' }).trim();
    return license;
  } catch (error) {
    return null;
  }
}

function isLicenseCompliant(license) {
  if (!license) return false;
  
  const compliantLicenses = [
    'MIT',
    'Apache-2.0',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'ISC',
    'Unlicense',
    '0BSD'
  ];

  const licenseUpper = license.toUpperCase();
  return compliantLicenses.some(l => licenseUpper.includes(l.toUpperCase()));
}
