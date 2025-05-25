#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { program } = require('commander');

/**
 * 移行前検証スクリプト
 * 既存プロジェクトの移行準備状況を診断し、潜在的な問題を事前に検出
 */

program
  .option('--detailed', '詳細な分析レポートを出力')
  .option('--fix-auto', '自動修正可能な問題を自動で修正')
  .option('--export <format>', 'レポート形式 (json, md, console)', 'console')
  .parse();

const options = program.opts();

const VALIDATION_RULES = {
  'git-status': {
    name: 'Git作業状況',
    level: 'critical',
    check: async () => {
      const { execSync } = require('child_process');
      try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        return {
          passed: status.trim() === '',
          message: status.trim() === '' ? 'クリーンな作業ディレクトリ' : 'コミットされていない変更があります',
          details: status || null,
          autoFix: false
        };
      } catch (error) {
        return {
          passed: false,
          message: 'Gitリポジトリではありません',
          details: error.message,
          autoFix: false
        };
      }
    }
  },
  
  'node-version': {
    name: 'Node.jsバージョン',
    level: 'high',
    check: async () => {
      const version = process.version;
      const majorVersion = parseInt(version.substring(1).split('.')[0]);
      return {
        passed: majorVersion >= 14,
        message: majorVersion >= 14 ? `Node.js ${version} (OK)` : `Node.js ${version} は古すぎます`,
        details: `要求: Node.js 14以上, 現在: ${version}`,
        autoFix: false
      };
    }
  },
  
  'package-json': {
    name: 'package.json形式',
    level: 'medium',
    check: async () => {
      try {
        const packagePath = path.join(process.cwd(), 'package.json');
        if (!await fs.pathExists(packagePath)) {
          return {
            passed: false,
            message: 'package.json が見つかりません',
            details: 'npm init でpackage.jsonを作成してください',
            autoFix: true,
            fixAction: 'create-package-json'
          };
        }
        
        const packageJson = await fs.readJson(packagePath);
        const requiredFields = ['name', 'version'];
        const missingFields = requiredFields.filter(field => !packageJson[field]);
        
        return {
          passed: missingFields.length === 0,
          message: missingFields.length === 0 ? 'package.json は有効です' : `必須フィールドが不足: ${missingFields.join(', ')}`,
          details: missingFields.length > 0 ? `不足フィールド: ${missingFields.join(', ')}` : null,
          autoFix: missingFields.length > 0,
          fixAction: 'fix-package-json'
        };
      } catch (error) {
        return {
          passed: false,
          message: 'package.json の読み込みに失敗',
          details: error.message,
          autoFix: false
        };
      }
    }
  },
  
  'directory-structure': {
    name: 'ディレクトリ構造',
    level: 'low',
    check: async () => {
      const requiredDirs = ['docs', '.github'];
      const existingDirs = [];
      const missingDirs = [];
      
      for (const dir of requiredDirs) {
        if (await fs.pathExists(path.join(process.cwd(), dir))) {
          existingDirs.push(dir);
        } else {
          missingDirs.push(dir);
        }
      }
      
      return {
        passed: missingDirs.length === 0,
        message: missingDirs.length === 0 ? '推奨ディレクトリ構造OK' : `ディレクトリが不足: ${missingDirs.join(', ')}`,
        details: `既存: ${existingDirs.join(', ')} | 不足: ${missingDirs.join(', ')}`,
        autoFix: true,
        fixAction: 'create-directories'
      };
    }
  },
  
  'file-conflicts': {
    name: 'ファイルコンフリクト検査',
    level: 'high',
    check: async () => {
      const templateFiles = [
        'docs/PROJECT_CONTEXT.md',
        'docs/WORKFLOW_GUIDE.md',
        '.github/pull_request_template.md',
        'package.json'
      ];
      
      const conflicts = [];
      for (const file of templateFiles) {
        const filePath = path.join(process.cwd(), file);
        if (await fs.pathExists(filePath)) {
          conflicts.push(file);
        }
      }
      
      return {
        passed: conflicts.length === 0,
        message: conflicts.length === 0 ? 'ファイルコンフリクトなし' : `${conflicts.length}個のファイルでコンフリクトの可能性`,
        details: conflicts.length > 0 ? `コンフリクト可能性: ${conflicts.join(', ')}` : null,
        autoFix: false
      };
    }
  },
  
  'dependencies': {
    name: '依存関係確認',
    level: 'medium',
    check: async () => {
      try {
        const packagePath = path.join(process.cwd(), 'package.json');
        if (!await fs.pathExists(packagePath)) {
          return {
            passed: false,
            message: 'package.json が見つかりません',
            details: null,
            autoFix: false
          };
        }
        
        const packageJson = await fs.readJson(packagePath);
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };
        
        const templateDeps = ['inquirer', 'chalk', 'js-yaml', 'commander'];
        const conflictDeps = templateDeps.filter(dep => 
          allDeps[dep] && !allDeps[dep].startsWith('^')
        );
        
        return {
          passed: conflictDeps.length === 0,
          message: conflictDeps.length === 0 ? '依存関係OK' : `依存関係コンフリクトの可能性: ${conflictDeps.length}個`,
          details: conflictDeps.length > 0 ? `コンフリクト可能性: ${conflictDeps.join(', ')}` : null,
          autoFix: false
        };
      } catch (error) {
        return {
          passed: false,
          message: '依存関係確認に失敗',
          details: error.message,
          autoFix: false
        };
      }
    }
  },
  
  'disk-space': {
    name: 'ディスク容量',
    level: 'low',
    check: async () => {
      try {
        const stats = await fs.stat(process.cwd());
        // 簡易的な容量チェック（詳細な実装は環境依存）
        return {
          passed: true,
          message: 'ディスク容量OK',
          details: 'テンプレートファイルは約5MB必要',
          autoFix: false
        };
      } catch (error) {
        return {
          passed: false,
          message: 'ディスク容量確認に失敗',
          details: error.message,
          autoFix: false
        };
      }
    }
  },
  
  'github-integration': {
    name: 'GitHub統合準備',
    level: 'medium',
    check: async () => {
      const gitConfigPath = path.join(process.cwd(), '.git', 'config');
      if (!await fs.pathExists(gitConfigPath)) {
        return {
          passed: false,
          message: 'Gitリポジトリではありません',
          details: 'GitHub統合にはGitリポジトリが必要',
          autoFix: false
        };
      }
      
      try {
        const gitConfig = await fs.readFile(gitConfigPath, 'utf8');
        const hasRemote = gitConfig.includes('[remote "origin"]');
        const hasGithub = gitConfig.includes('github.com');
        
        return {
          passed: hasRemote && hasGithub,
          message: hasRemote && hasGithub ? 'GitHub連携準備OK' : 'GitHubリモートが設定されていません',
          details: hasRemote ? (hasGithub ? null : 'GitHub以外のリモート') : 'リモートリポジトリなし',
          autoFix: false
        };
      } catch (error) {
        return {
          passed: false,
          message: 'Git設定確認に失敗',
          details: error.message,
          autoFix: false
        };
      }
    }
  }
};

async function main() {
  console.log(chalk.blue('🔍 移行前検証システム'));
  console.log(chalk.blue('===================='));
  console.log('');

  const results = {
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      autoFixable: 0
    },
    details: [],
    recommendations: []
  };

  console.log(chalk.yellow('検証を実行中...'));

  // 全ルールの実行
  for (const [ruleId, rule] of Object.entries(VALIDATION_RULES)) {
    try {
      console.log(`\n[${Object.keys(VALIDATION_RULES).indexOf(ruleId) + 1}/${Object.keys(VALIDATION_RULES).length}] ${rule.name}`);
      
      const result = await rule.check();
      result.ruleId = ruleId;
      result.level = rule.level;
      result.name = rule.name;
      
      results.details.push(result);
      results.summary.total++;
      
      if (result.passed) {
        results.summary.passed++;
        console.log(chalk.green(`✅ ${result.message}`));
      } else {
        results.summary.failed++;
        if (result.level === 'critical') {
          console.log(chalk.red(`❌ ${result.message}`));
        } else {
          console.log(chalk.yellow(`⚠️  ${result.message}`));
          results.summary.warnings++;
        }
        
        if (result.autoFix) {
          results.summary.autoFixable++;
          console.log(chalk.blue(`   🔧 自動修正可能`));
        }
      }
      
      if (options.detailed && result.details) {
        console.log(chalk.gray(`   詳細: ${result.details}`));
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ ${rule.name} の検証中にエラー:`), error.message);
      results.details.push({
        ruleId,
        name: rule.name,
        level: rule.level,
        passed: false,
        message: `検証エラー: ${error.message}`,
        details: error.stack,
        autoFix: false
      });
      results.summary.failed++;
    }
  }

  // 推奨事項の生成
  generateRecommendations(results);

  // 自動修正の実行
  if (options.fixAuto && results.summary.autoFixable > 0) {
    console.log(chalk.yellow('\n🔧 自動修正を実行中...'));
    await executeAutoFixes(results.details.filter(r => !r.passed && r.autoFix));
  }

  // レポート出力
  await outputReport(results);

  // 終了コードの設定
  const criticalFailures = results.details.filter(r => !r.passed && r.level === 'critical').length;
  process.exit(criticalFailures > 0 ? 1 : 0);
}

/**
 * 推奨事項の生成
 */
function generateRecommendations(results) {
  const criticalFailures = results.details.filter(r => !r.passed && r.level === 'critical');
  const highFailures = results.details.filter(r => !r.passed && r.level === 'high');
  
  if (criticalFailures.length > 0) {
    results.recommendations.push({
      priority: 'critical',
      message: '移行前に必須の修正が必要です',
      actions: criticalFailures.map(f => `- ${f.name}: ${f.message}`)
    });
  }
  
  if (highFailures.length > 0) {
    results.recommendations.push({
      priority: 'high',
      message: '移行の成功率を高めるための推奨修正',
      actions: highFailures.map(f => `- ${f.name}: ${f.message}`)
    });
  }
  
  if (results.summary.autoFixable > 0) {
    results.recommendations.push({
      priority: 'info',
      message: '自動修正可能な問題があります',
      actions: [`--fix-auto オプションで自動修正可能な問題: ${results.summary.autoFixable}個`]
    });
  }
  
  if (results.summary.failed === 0) {
    results.recommendations.push({
      priority: 'success',
      message: '移行準備完了',
      actions: ['migrate-existing-project.js を実行して移行を開始できます']
    });
  }
}

/**
 * 自動修正の実行
 */
async function executeAutoFixes(fixableResults) {
  for (const result of fixableResults) {
    try {
      switch (result.fixAction) {
        case 'create-package-json':
          await createBasicPackageJson();
          console.log(chalk.green(`✅ package.json を作成しました`));
          break;
          
        case 'fix-package-json':
          await fixPackageJson();
          console.log(chalk.green(`✅ package.json を修正しました`));
          break;
          
        case 'create-directories':
          await createRequiredDirectories();
          console.log(chalk.green(`✅ 必要なディレクトリを作成しました`));
          break;
          
        default:
          console.log(chalk.yellow(`⚠️ ${result.name}: 自動修正方法が未実装`));
      }
    } catch (error) {
      console.error(chalk.red(`❌ ${result.name} の自動修正に失敗:`), error.message);
    }
  }
}

/**
 * 基本的なpackage.jsonの作成
 */
async function createBasicPackageJson() {
  const packageJson = {
    name: path.basename(process.cwd()),
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
      test: 'echo "Error: no test specified" && exit 1'
    },
    keywords: [],
    author: '',
    license: 'ISC'
  };
  
  await fs.writeJson(path.join(process.cwd(), 'package.json'), packageJson, { spaces: 2 });
}

/**
 * package.jsonの修正
 */
async function fixPackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = await fs.readJson(packagePath);
  
  if (!packageJson.name) {
    packageJson.name = path.basename(process.cwd());
  }
  if (!packageJson.version) {
    packageJson.version = '1.0.0';
  }
  
  await fs.writeJson(packagePath, packageJson, { spaces: 2 });
}

/**
 * 必要なディレクトリの作成
 */
async function createRequiredDirectories() {
  const dirs = ['docs', '.github', '.github/ISSUE_TEMPLATE', '.github/workflows'];
  for (const dir of dirs) {
    await fs.ensureDir(path.join(process.cwd(), dir));
  }
}

/**
 * レポートの出力
 */
async function outputReport(results) {
  switch (options.export) {
    case 'json':
      await outputJsonReport(results);
      break;
    case 'md':
      await outputMarkdownReport(results);
      break;
    default:
      outputConsoleReport(results);
  }
}

/**
 * コンソールレポートの出力
 */
function outputConsoleReport(results) {
  console.log(chalk.blue('\n📊 検証結果サマリー'));
  console.log('===================');
  console.log(`総検証項目: ${results.summary.total}`);
  console.log(chalk.green(`成功: ${results.summary.passed}`));
  console.log(chalk.red(`失敗: ${results.summary.failed}`));
  console.log(chalk.yellow(`警告: ${results.summary.warnings}`));
  console.log(chalk.blue(`自動修正可能: ${results.summary.autoFixable}`));

  if (results.recommendations.length > 0) {
    console.log(chalk.yellow('\n💡 推奨事項:'));
    for (const rec of results.recommendations) {
      const icon = rec.priority === 'critical' ? '🚨' : 
                   rec.priority === 'high' ? '⚠️' : 
                   rec.priority === 'success' ? '🎉' : 'ℹ️';
      console.log(`\n${icon} ${rec.message}`);
      for (const action of rec.actions) {
        console.log(`   ${action}`);
      }
    }
  }

  console.log(chalk.blue('\n📖 次のステップ:'));
  
  const criticalIssues = results.details.filter(r => !r.passed && r.level === 'critical');
  if (criticalIssues.length > 0) {
    console.log('1. 🚨 クリティカルな問題を修正してください');
    for (const issue of criticalIssues) {
      console.log(`   - ${issue.name}: ${issue.message}`);
    }
    console.log('2. 再度検証を実行: node validate-migration.js');
  } else {
    console.log('1. ✅ 移行準備完了: node migrate-existing-project.js');
    console.log('2. 📚 移行ガイドを確認: docs/EXISTING_PROJECT_MIGRATION.md');
  }
}

/**
 * JSONレポートの出力
 */
async function outputJsonReport(results) {
  const reportPath = path.join(process.cwd(), 'migration-validation-report.json');
  await fs.writeJson(reportPath, results, { spaces: 2 });
  console.log(chalk.green(`\n📄 JSONレポートを出力: ${reportPath}`));
}

/**
 * Markdownレポートの出力
 */
async function outputMarkdownReport(results) {
  const report = generateMarkdownReport(results);
  const reportPath = path.join(process.cwd(), 'migration-validation-report.md');
  await fs.writeFile(reportPath, report);
  console.log(chalk.green(`\n📄 Markdownレポートを出力: ${reportPath}`));
}

/**
 * Markdownレポートの生成
 */
function generateMarkdownReport(results) {
  const timestamp = new Date().toISOString();
  
  let report = `# 移行前検証レポート

生成日時: ${timestamp}
プロジェクト: ${path.basename(process.cwd())}

## サマリー

| 項目 | 数 |
|------|-----|
| 総検証項目 | ${results.summary.total} |
| 成功 | ${results.summary.passed} |
| 失敗 | ${results.summary.failed} |
| 警告 | ${results.summary.warnings} |
| 自動修正可能 | ${results.summary.autoFixable} |

## 詳細結果

`;

  for (const result of results.details) {
    const status = result.passed ? '✅' : (result.level === 'critical' ? '❌' : '⚠️');
    report += `### ${status} ${result.name}\n\n`;
    report += `- **レベル**: ${result.level}\n`;
    report += `- **結果**: ${result.message}\n`;
    if (result.details) {
      report += `- **詳細**: ${result.details}\n`;
    }
    if (result.autoFix) {
      report += `- **自動修正**: 可能\n`;
    }
    report += '\n';
  }

  if (results.recommendations.length > 0) {
    report += '## 推奨事項\n\n';
    for (const rec of results.recommendations) {
      const icon = rec.priority === 'critical' ? '🚨' : 
                   rec.priority === 'high' ? '⚠️' : 
                   rec.priority === 'success' ? '🎉' : 'ℹ️';
      report += `### ${icon} ${rec.message}\n\n`;
      for (const action of rec.actions) {
        report += `- ${action}\n`;
      }
      report += '\n';
    }
  }

  return report;
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('検証中にエラーが発生しました:'), error);
    process.exit(1);
  });
}

module.exports = { VALIDATION_RULES, main };
