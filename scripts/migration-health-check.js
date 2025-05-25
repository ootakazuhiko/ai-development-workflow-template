#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const { program } = require('commander');

/**
 * 移行後健全性チェックスクリプト
 * 移行後のシステムが正常に動作しているかを定期的にチェック
 */

program
  .option('--report <format>', 'レポート形式 (console, json, md)', 'console')
  .option('--fix-issues', '検出された問題の自動修正を試行')
  .option('--detailed', '詳細な診断情報を表示')
  .parse();

const options = program.opts();

// 健全性チェック項目
const HEALTH_CHECKS = {
  'files-integrity': {
    name: 'ファイル整合性',
    category: 'system',
    check: async () => {
      const requiredFiles = [
        'docs/PROJECT_CONTEXT.md',
        'docs/WORKFLOW_GUIDE.md',
        'scripts/ai-context-bridge.js',
        'scripts/progress-tracker.js',
        '.github/pull_request_template.md'
      ];

      const missing = [];
      const corrupted = [];

      for (const file of requiredFiles) {
        const filePath = path.join(process.cwd(), file);
        if (!await fs.pathExists(filePath)) {
          missing.push(file);
        } else {
          try {
            const content = await fs.readFile(filePath, 'utf8');
            if (content.length < 50) { // 最小内容チェック
              corrupted.push(file);
            }
          } catch (error) {
            corrupted.push(file);
          }
        }
      }

      return {
        passed: missing.length === 0 && corrupted.length === 0,
        score: ((requiredFiles.length - missing.length - corrupted.length) / requiredFiles.length) * 100,
        details: {
          total: requiredFiles.length,
          missing: missing.length,
          corrupted: corrupted.length,
          missingFiles: missing,
          corruptedFiles: corrupted
        },
        recommendations: missing.length > 0 ? 
          ['移行を再実行するか、不足ファイルを手動で追加してください'] : 
          []
      };
    }
  },

  'script-functionality': {
    name: 'スクリプト機能',
    category: 'functionality',
    check: async () => {
      const testResults = [];
      
      // 各スクリプトの基本動作テスト
      const scripts = [
        { name: 'ai-context', command: 'npm run ai-context -- --help', expectOutput: 'usage' },
        { name: 'progress-update', command: 'npm run progress-update -- --help', expectOutput: 'progress' },
        { name: 'quality-check', command: 'npm run quality-check -- --help', expectOutput: 'quality' }
      ];

      for (const script of scripts) {
        try {
          const output = execSync(script.command, { 
            encoding: 'utf8', 
            timeout: 5000,
            stdio: 'pipe'
          });
          testResults.push({
            script: script.name,
            status: 'ok',
            working: output.toLowerCase().includes(script.expectOutput)
          });
        } catch (error) {
          testResults.push({
            script: script.name,
            status: 'error',
            working: false,
            error: error.message
          });
        }
      }

      const workingScripts = testResults.filter(r => r.working).length;
      
      return {
        passed: workingScripts === scripts.length,
        score: (workingScripts / scripts.length) * 100,
        details: { testResults, workingScripts, totalScripts: scripts.length },
        recommendations: workingScripts < scripts.length ? 
          ['npm install を実行して依存関係を再インストールしてください'] : 
          []
      };
    }
  },

  'github-integration': {
    name: 'GitHub統合',
    category: 'integration',
    check: async () => {
      const checks = [];

      // GitHub Actions設定確認
      const workflowPath = path.join(process.cwd(), '.github/workflows/auto-context-bridge.yml');
      checks.push({
        name: 'GitHub Actions設定',
        status: await fs.pathExists(workflowPath) ? 'ok' : 'missing'
      });

      // PRテンプレート確認
      const prTemplatePath = path.join(process.cwd(), '.github/pull_request_template.md');
      checks.push({
        name: 'PRテンプレート',
        status: await fs.pathExists(prTemplatePath) ? 'ok' : 'missing'
      });

      // Issueテンプレート確認
      const issueTemplateDir = path.join(process.cwd(), '.github/ISSUE_TEMPLATE');
      const hasIssueTemplates = await fs.pathExists(issueTemplateDir);
      checks.push({
        name: 'Issueテンプレート',
        status: hasIssueTemplates ? 'ok' : 'missing'
      });

      // Git リモート確認
      try {
        const gitConfig = execSync('git remote -v', { encoding: 'utf8', stdio: 'pipe' });
        const hasGitHub = gitConfig.includes('github.com');
        checks.push({
          name: 'GitHubリモート',
          status: hasGitHub ? 'ok' : 'warning'
        });
      } catch (error) {
        checks.push({
          name: 'GitHubリモート',
          status: 'error'
        });
      }

      const okCount = checks.filter(c => c.status === 'ok').length;
      
      return {
        passed: okCount >= 3, // 最低3項目がOKであれば合格
        score: (okCount / checks.length) * 100,
        details: { checks, okCount, totalChecks: checks.length },
        recommendations: okCount < 3 ? 
          ['GitHub設定ファイルが不足しています。移行スクリプトを再実行してください'] : 
          []
      };
    }
  },

  'ai-context-system': {
    name: 'AI文脈継承システム',
    category: 'ai-features',
    check: async () => {
      const contextDir = path.join(process.cwd(), 'docs/ai-context');
      const promptsDir = path.join(process.cwd(), 'docs/ai-prompts');
      
      const checks = [
        { name: 'ai-context ディレクトリ', path: contextDir },
        { name: 'ai-prompts ディレクトリ', path: promptsDir },
        { name: 'PROJECT_CONTEXT.md', path: path.join(process.cwd(), 'docs/PROJECT_CONTEXT.md') },
        { name: 'AI_INTERACTION_LOG.md', path: path.join(process.cwd(), 'docs/AI_INTERACTION_LOG.md') }
      ];

      let score = 0;
      const details = [];

      for (const check of checks) {
        const exists = await fs.pathExists(check.path);
        if (exists) {
          score += 25; // 各項目25点
          details.push({ ...check, status: 'ok' });
        } else {
          details.push({ ...check, status: 'missing' });
        }
      }

      return {
        passed: score >= 75, // 75点以上で合格
        score,
        details: { checks: details },
        recommendations: score < 75 ? 
          ['AI文脈継承システムの設定が不完全です。npm run setup を実行してください'] : 
          []
      };
    }
  },

  'workflow-metrics': {
    name: 'ワークフロー指標',
    category: 'metrics',
    check: async () => {
      try {
        // 最近のcommit数 (過去30日)
        const commitCount = execSync(
          'git rev-list --count --since="30 days ago" HEAD', 
          { encoding: 'utf8', stdio: 'pipe' }
        ).trim();

        // Issue数（GitHub CLI使用可能の場合）
        let issueCount = 0;
        try {
          const issueOutput = execSync('gh issue list --state=all --limit=100 --json number', { 
            encoding: 'utf8', 
            stdio: 'pipe',
            timeout: 5000
          });
          const issues = JSON.parse(issueOutput);
          issueCount = issues.length;
        } catch (error) {
          // GitHub CLI利用不可の場合はスキップ
        }

        // AI文脈記録の使用状況
        const contextLogPath = path.join(process.cwd(), 'docs/AI_INTERACTION_LOG.md');
        let contextEntries = 0;
        if (await fs.pathExists(contextLogPath)) {
          const content = await fs.readFile(contextLogPath, 'utf8');
          contextEntries = (content.match(/## \d{4}-\d{2}-\d{2}/g) || []).length;
        }

        const score = Math.min(100, 
          (parseInt(commitCount) * 2) + 
          (issueCount * 1) + 
          (contextEntries * 5)
        );

        return {
          passed: score > 0,
          score,
          details: {
            commitCount: parseInt(commitCount),
            issueCount,
            contextEntries,
            calculatedScore: score
          },
          recommendations: score < 20 ? 
            ['プロジェクトの活動が少ないようです。AI文脈継承システムの活用を検討してください'] : 
            []
        };
      } catch (error) {
        return {
          passed: false,
          score: 0,
          details: { error: error.message },
          recommendations: ['Git履歴の確認に失敗しました。リポジトリの状態を確認してください']
        };
      }
    }
  }
};

/**
 * 健全性チェックの実行
 */
async function runHealthCheck() {
  console.log(chalk.blue('🏥 移行後健全性チェック実行中...'));
  console.log(chalk.blue('=========================================='));
  console.log('');

  const results = {
    timestamp: new Date().toISOString(),
    overall: {
      passed: 0,
      total: Object.keys(HEALTH_CHECKS).length,
      score: 0
    },
    categories: {},
    checks: {},
    recommendations: []
  };

  // 各チェック項目を実行
  for (const [checkId, checkConfig] of Object.entries(HEALTH_CHECKS)) {
    console.log(chalk.yellow(`🔍 ${checkConfig.name} をチェック中...`));
    
    try {
      const result = await checkConfig.check();
      results.checks[checkId] = {
        ...result,
        name: checkConfig.name,
        category: checkConfig.category
      };

      if (result.passed) {
        results.overall.passed++;
        console.log(chalk.green(`✅ ${checkConfig.name}: 合格 (${result.score.toFixed(1)}%)`));
      } else {
        console.log(chalk.red(`❌ ${checkConfig.name}: 不合格 (${result.score.toFixed(1)}%)`));
      }

      results.overall.score += result.score;
      
      // カテゴリ別集計
      if (!results.categories[checkConfig.category]) {
        results.categories[checkConfig.category] = { passed: 0, total: 0, score: 0 };
      }
      results.categories[checkConfig.category].total++;
      results.categories[checkConfig.category].score += result.score;
      if (result.passed) {
        results.categories[checkConfig.category].passed++;
      }

      // 推奨事項の収集
      if (result.recommendations && result.recommendations.length > 0) {
        results.recommendations.push(...result.recommendations);
      }

      if (options.detailed) {
        console.log(`   詳細: ${JSON.stringify(result.details, null, 2)}`);
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ ${checkConfig.name}: エラー - ${error.message}`));
      results.checks[checkId] = {
        passed: false,
        score: 0,
        name: checkConfig.name,
        category: checkConfig.category,
        error: error.message
      };
    }

    console.log('');
  }

  // 全体スコアの計算
  results.overall.score = results.overall.score / results.overall.total;

  return results;
}

/**
 * レポートの出力
 */
function outputReport(results) {
  switch (options.report) {
    case 'json':
      console.log(JSON.stringify(results, null, 2));
      break;
    
    case 'md':
      outputMarkdownReport(results);
      break;
    
    default:
      outputConsoleReport(results);
  }
}

/**
 * コンソールレポートの出力
 */
function outputConsoleReport(results) {
  console.log(chalk.blue('\n📊 健全性チェック結果サマリー'));
  console.log(chalk.blue('================================'));
  
  // 全体結果
  const overallColor = results.overall.score >= 80 ? chalk.green : 
                      results.overall.score >= 60 ? chalk.yellow : chalk.red;
  
  console.log(`\n全体スコア: ${overallColor(results.overall.score.toFixed(1) + '%')}`);
  console.log(`合格項目: ${results.overall.passed}/${results.overall.total}`);

  // カテゴリ別結果
  console.log('\n📋 カテゴリ別結果:');
  for (const [category, data] of Object.entries(results.categories)) {
    const categoryScore = data.score / data.total;
    const categoryColor = categoryScore >= 80 ? chalk.green : 
                         categoryScore >= 60 ? chalk.yellow : chalk.red;
    
    console.log(`  ${category}: ${categoryColor(categoryScore.toFixed(1) + '%')} (${data.passed}/${data.total})`);
  }

  // 推奨事項
  if (results.recommendations.length > 0) {
    console.log(chalk.yellow('\n💡 推奨事項:'));
    results.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  // 総合判定
  console.log('\n🎯 総合判定:');
  if (results.overall.score >= 90) {
    console.log(chalk.green('🎉 優秀: 移行は非常に成功しており、全機能が正常に動作しています'));
  } else if (results.overall.score >= 75) {
    console.log(chalk.green('✅ 良好: 移行は成功しており、基本機能が正常に動作しています'));
  } else if (results.overall.score >= 60) {
    console.log(chalk.yellow('⚠️ 注意: いくつかの問題があります。推奨事項を確認してください'));
  } else {
    console.log(chalk.red('❌ 要対応: 重要な問題があります。移行の見直しが必要です'));
  }
}

/**
 * Markdownレポートの出力
 */
function outputMarkdownReport(results) {
  const report = `# 移行後健全性チェックレポート

**実行日時**: ${new Date(results.timestamp).toLocaleString('ja-JP')}
**全体スコア**: ${results.overall.score.toFixed(1)}%
**合格項目**: ${results.overall.passed}/${results.overall.total}

## カテゴリ別結果

${Object.entries(results.categories).map(([category, data]) => {
  const score = (data.score / data.total).toFixed(1);
  return `- **${category}**: ${score}% (${data.passed}/${data.total})`;
}).join('\n')}

## 詳細結果

${Object.entries(results.checks).map(([checkId, result]) => {
  const status = result.passed ? '✅ 合格' : '❌ 不合格';
  return `### ${result.name}
- **ステータス**: ${status}
- **スコア**: ${result.score.toFixed(1)}%
- **カテゴリ**: ${result.category}
${result.error ? `- **エラー**: ${result.error}` : ''}
`;
}).join('\n')}

## 推奨事項

${results.recommendations.length > 0 ? 
  results.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n') :
  '特に推奨事項はありません。'}

---
*このレポートは \`npm run migration-health\` により自動生成されました*
`;

  console.log(report);
}

/**
 * 問題の自動修正試行
 */
async function tryAutoFix(results) {
  if (!options.fixIssues) return;

  console.log(chalk.yellow('\n🔧 自動修正を試行中...'));

  for (const [checkId, result] of Object.entries(results.checks)) {
    if (!result.passed && checkId === 'files-integrity') {
      // ファイル整合性の問題を修正
      if (result.details.missingFiles.length > 0) {
        console.log('不足ファイルの復元を試行...');
        try {
          const { execSync } = require('child_process');
          execSync('npm run migrate -- --force', { stdio: 'inherit' });
          console.log(chalk.green('✅ ファイル復元完了'));
        } catch (error) {
          console.log(chalk.red(`❌ ファイル復元失敗: ${error.message}`));
        }
      }
    }
  }
}

/**
 * メイン処理
 */
async function main() {
  try {
    const results = await runHealthCheck();
    
    if (options.fixIssues) {
      await tryAutoFix(results);
    }
    
    outputReport(results);

    // 終了コードの設定
    process.exit(results.overall.score >= 60 ? 0 : 1);
    
  } catch (error) {
    console.error(chalk.red('❌ 健全性チェック中にエラーが発生しました:'), error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  runHealthCheck,
  HEALTH_CHECKS
};
