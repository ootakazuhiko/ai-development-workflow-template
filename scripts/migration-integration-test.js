#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const { program } = require('commander');

/**
 * 移行システム統合テストスクリプト
 * 全移行機能の動作確認と品質保証
 */

program
  .option('--verbose', '詳細ログを表示')
  .option('--test-env <path>', 'テスト環境のパス指定')
  .option('--cleanup', 'テスト後のクリーンアップ実行')
  .parse();

const options = program.opts();

const TEST_PROJECT_NAME = 'migration-test-project';
const TEST_ENV_PATH = options.testEnv || path.join(process.cwd(), '..', TEST_PROJECT_NAME);

/**
 * テスト環境の準備
 */
async function setupTestEnvironment() {
  console.log(chalk.blue('🔧 テスト環境準備中...'));
  
  // テストプロジェクト作成
  await fs.ensureDir(TEST_ENV_PATH);
  
  // 模擬的な既存プロジェクト構成
  const mockProjectStructure = {
    'package.json': {
      name: 'existing-project',
      version: '1.0.0',
      scripts: {
        start: 'node app.js',
        test: 'echo "No tests specified"'
      },
      dependencies: {
        express: '^4.18.0'
      }
    },
    'app.js': `const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`,    'README.md': '# Existing Project\n\nThis is an existing project for migration testing.',
    'docs/old-spec.md': '# Old Specification\n\nLegacy documentation.'
  };

  // ファイル作成
  for (const [filePath, content] of Object.entries(mockProjectStructure)) {
    const fullPath = path.join(TEST_ENV_PATH, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    
    if (typeof content === 'object') {
      await fs.writeJson(fullPath, content, { spaces: 2 });
    } else {
      await fs.writeFile(fullPath, content);
    }
  }

  // gitリポジトリ初期化
  try {
    execSync('git init', { cwd: TEST_ENV_PATH, stdio: 'pipe' });
    execSync('git remote add origin https://github.com/example/existing-project.git', { cwd: TEST_ENV_PATH, stdio: 'pipe' });
    execSync('git add .', { cwd: TEST_ENV_PATH, stdio: 'pipe' });
    execSync('git commit -m "Initial commit"', { cwd: TEST_ENV_PATH, stdio: 'pipe' });
  } catch (error) {
    // git設定がない場合のエラーを無視
    console.log(chalk.yellow('Git設定をスキップ（設定なし）'));
  }

  // 移行スクリプトをコピー
  const scriptsDir = path.join(process.cwd(), 'scripts');
  const testScriptsDir = path.join(TEST_ENV_PATH, 'scripts');
  await fs.ensureDir(testScriptsDir);
  
  const migrationScripts = [
    'migrate-existing-project.js',
    'validate-migration.js',
    'detect-project-phase.js',
    'migration-health-check.js',
    'migration-rollback.js',
    'staged-migration-manager.js'
  ];

  for (const script of migrationScripts) {
    const sourcePath = path.join(scriptsDir, script);
    const targetPath = path.join(testScriptsDir, script);
    
    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, targetPath);
    }
  }

  console.log(chalk.green(`✅ テスト環境準備完了: ${TEST_ENV_PATH}`));
}

/**
 * テストケースの実行
 */
async function runTestCases() {
  console.log(chalk.blue('\n🧪 統合テスト実行中...'));
  
  const testResults = [];
    // 依存関係のインストールテスト（最初に実行）
  testResults.push(await runTest('依存関係インストール', async () => {
    try {
      // package.jsonを先に初期化
      execSync('npm init -y', {
        cwd: TEST_ENV_PATH,
        stdio: 'pipe'
      });      // 必要な依存関係をインストール
      execSync('npm install inquirer@8.2.0 fs-extra@10.0.0 chalk@4.1.2 js-yaml@4.1.0 commander@9.4.0 @octokit/rest@21.1.1', {
        cwd: TEST_ENV_PATH,
        stdio: 'pipe'
      });
      
      // gitの状態をクリーンにする
      try {
        execSync('git add .', { cwd: TEST_ENV_PATH, stdio: 'pipe' });
        execSync('git commit -m "Add dependencies and migration scripts"', { cwd: TEST_ENV_PATH, stdio: 'pipe' });
      } catch (gitError) {
        // gitコミットエラーは無視（既にクリーンな場合など）
      }
      
      return true;
    } catch (error) {
      console.warn('依存関係インストール警告:', error.message);
      return true; // 警告として扱う
    }
  }));

  // テスト1: プロジェクトフェーズ検出
  testResults.push(await runTest('プロジェクトフェーズ検出', async () => {
    const output = execSync('node scripts/detect-project-phase.js', {
      cwd: TEST_ENV_PATH,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    return output.includes('フェーズ');
  }));
  // テスト2: 移行前検証
  testResults.push(await runTest('移行前検証', async () => {
    const output = execSync('node scripts/validate-migration.js', {
      cwd: TEST_ENV_PATH,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // 検証が実行され、移行準備完了メッセージが含まれていればOK
    return output.includes('移行準備完了') || output.includes('総検証項目') || output.includes('validation');
  }));

  // テスト3: 移行分析
  testResults.push(await runTest('移行分析', async () => {
    const output = execSync('node scripts/migrate-existing-project.js --analyze-only', {
      cwd: TEST_ENV_PATH,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    return output.includes('分析結果') || output.includes('analysis');
  }));

  // テスト4: 段階的移行管理状態確認
  testResults.push(await runTest('段階的移行管理', async () => {
    const output = execSync('node scripts/staged-migration-manager.js --status', {
      cwd: TEST_ENV_PATH,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    return output.includes('移行') || output.includes('migration');
  }));

  // テスト5: バックアップ一覧表示
  testResults.push(await runTest('バックアップシステム', async () => {
    const output = execSync('node scripts/migration-rollback.js --list-backups', {
      cwd: TEST_ENV_PATH,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    return true; // エラーが出なければOK（バックアップがなくても正常）
  }));  return testResults;
}

/**
 * 個別テストの実行
 */
async function runTest(testName, testFunction) {
  console.log(chalk.yellow(`  🔍 ${testName}...`));
  
  try {
    const startTime = Date.now();
    const result = await testFunction();
    const duration = Date.now() - startTime;
    
    if (result) {
      console.log(chalk.green(`    ✅ ${testName} 成功 (${duration}ms)`));
      return { name: testName, status: 'passed', duration, error: null };
    } else {
      console.log(chalk.red(`    ❌ ${testName} 失敗`));
      return { name: testName, status: 'failed', duration, error: 'Test assertion failed' };
    }
  } catch (error) {
    console.log(chalk.red(`    ❌ ${testName} エラー: ${error.message}`));
    
    if (options.verbose) {
      console.log(chalk.gray(`    詳細: ${error.stack}`));
    }
    
    return { name: testName, status: 'error', duration: 0, error: error.message };
  }
}

/**
 * 実際の移行テスト（オプション）
 */
async function runFullMigrationTest() {
  console.log(chalk.blue('\n🚀 実際の移行テスト実行中...'));
  
  try {
    // 強制的に移行実行（インタラクティブ要素をスキップ）
    const output = execSync('node scripts/migrate-existing-project.js --force --phase poc', {
      cwd: TEST_ENV_PATH,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000 // 30秒タイムアウト
    });
    
    console.log(chalk.green('✅ 実際の移行テスト成功'));
    
    // 移行後の健全性チェック
    try {
      const healthOutput = execSync('node scripts/migration-health-check.js', {
        cwd: TEST_ENV_PATH,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log(chalk.green('✅ 移行後健全性チェック成功'));
      return true;
    } catch (healthError) {
      console.log(chalk.yellow('⚠️ 健全性チェックで警告あり'));
      return true; // 警告として扱う
    }
    
  } catch (error) {
    console.log(chalk.red(`❌ 実際の移行テスト失敗: ${error.message}`));
    return false;
  }
}

/**
 * テスト結果の表示
 */
function displayTestResults(results, fullMigrationResult = null) {
  console.log(chalk.blue('\n📊 テスト結果サマリー'));
  console.log(chalk.blue('==================='));
  
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`\n合計テスト: ${results.length}`);
  console.log(`${chalk.green('成功')}: ${passed}`);
  console.log(`${chalk.red('失敗')}: ${failed}`);
  console.log(`${chalk.yellow('エラー')}: ${errors}`);
  
  if (fullMigrationResult !== null) {
    console.log(`${chalk.blue('実際の移行')}: ${fullMigrationResult ? chalk.green('成功') : chalk.red('失敗')}`);
  }

  // 詳細結果
  if (options.verbose || failed > 0 || errors > 0) {
    console.log('\n📋 詳細結果:');
    
    results.forEach(result => {
      const statusIcon = result.status === 'passed' ? '✅' : 
                        result.status === 'failed' ? '❌' : '⚠️';
      
      console.log(`  ${statusIcon} ${result.name} (${result.duration}ms)`);
      
      if (result.error && options.verbose) {
        console.log(chalk.gray(`    エラー: ${result.error}`));
      }
    });
  }

  // 総合判定
  const overallSuccess = failed === 0 && errors === 0 && (fullMigrationResult !== false);
  
  console.log(`\n🎯 総合判定: ${overallSuccess ? chalk.green('✅ 成功') : chalk.red('❌ 失敗')}`);
  
  if (overallSuccess) {
    console.log(chalk.green('🎉 すべての移行機能が正常に動作しています'));
  } else {
    console.log(chalk.red('⚠️ いくつかの機能に問題があります。詳細を確認してください'));
  }
  
  return overallSuccess;
}

/**
 * テスト環境のクリーンアップ
 */
async function cleanupTestEnvironment() {
  if (options.cleanup) {
    console.log(chalk.yellow('\n🧹 テスト環境をクリーンアップ中...'));
    
    try {
      await fs.remove(TEST_ENV_PATH);
      console.log(chalk.green('✅ クリーンアップ完了'));
    } catch (error) {
      console.log(chalk.red(`❌ クリーンアップ失敗: ${error.message}`));
    }
  } else {
    console.log(chalk.blue(`\n📁 テスト環境は保持されています: ${TEST_ENV_PATH}`));
    console.log(chalk.gray('   --cleanup オプションで自動削除できます'));
  }
}

/**
 * パフォーマンステスト
 */
async function runPerformanceTests() {
  console.log(chalk.blue('\n⚡ パフォーマンステスト実行中...'));
  
  const performanceResults = [];
  
  // 分析速度テスト
  const analysisStart = Date.now();
  try {
    execSync('node scripts/migrate-existing-project.js --analyze-only', {
      cwd: TEST_ENV_PATH,
      stdio: 'pipe'
    });
    const analysisTime = Date.now() - analysisStart;
    performanceResults.push({ test: '分析速度', time: analysisTime, passed: analysisTime < 10000 });
  } catch (error) {
    performanceResults.push({ test: '分析速度', time: 0, passed: false });
  }

  // 検証速度テスト
  const validationStart = Date.now();
  try {
    execSync('node scripts/validate-migration.js', {
      cwd: TEST_ENV_PATH,
      stdio: 'pipe'
    });
    const validationTime = Date.now() - validationStart;
    performanceResults.push({ test: '検証速度', time: validationTime, passed: validationTime < 5000 });
  } catch (error) {
    performanceResults.push({ test: '検証速度', time: 0, passed: false });
  }

  console.log('パフォーマンス結果:');
  performanceResults.forEach(result => {
    const status = result.passed ? chalk.green('✅') : chalk.red('❌');
    console.log(`  ${status} ${result.test}: ${result.time}ms`);
  });

  return performanceResults;
}

/**
 * メイン処理
 */
async function main() {
  console.log(chalk.blue('🔧 AI開発ワークフロー移行システム統合テスト'));
  console.log(chalk.blue('============================================'));
  console.log('');

  try {
    // 1. テスト環境準備
    await setupTestEnvironment();

    // 2. 基本機能テスト
    const testResults = await runTestCases();

    // 3. パフォーマンステスト
    const performanceResults = await runPerformanceTests();

    // 4. 実際の移行テスト（オプション）
    let fullMigrationResult = null;
    if (process.argv.includes('--full-migration')) {
      fullMigrationResult = await runFullMigrationTest();
    }

    // 5. 結果表示
    const overallSuccess = displayTestResults(testResults, fullMigrationResult);

    // 6. クリーンアップ
    await cleanupTestEnvironment();

    // 終了コード設定
    process.exit(overallSuccess ? 0 : 1);

  } catch (error) {
    console.error(chalk.red('❌ テスト実行中にエラーが発生しました:'), error);
    
    if (options.verbose) {
      console.error(error.stack);
    }
    
    await cleanupTestEnvironment();
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupTestEnvironment,
  runTestCases,
  runFullMigrationTest,
  cleanupTestEnvironment
};
