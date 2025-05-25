#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { execSync } = require('child_process');
const { program } = require('commander');

/**
 * 移行ロールバックスクリプト
 * 移行による変更を元に戻し、バックアップから復元する
 */

program
  .option('--backup-dir <dir>', 'バックアップディレクトリを指定', '.backup')
  .option('--force', '確認なしで実行')
  .option('--partial <components>', '部分的ロールバック（カンマ区切り）')
  .option('--list-backups', '利用可能なバックアップを一覧表示')
  .parse();

const options = program.opts();

/**
 * バックアップの検出と一覧表示
 */
async function listAvailableBackups() {
  const backupDir = path.join(process.cwd(), options.backupDir);
  
  if (!await fs.pathExists(backupDir)) {
    console.log(chalk.yellow('📁 バックアップディレクトリが見つかりません'));
    return [];
  }

  const backups = [];
  const items = await fs.readdir(backupDir);
  
  for (const item of items) {
    const itemPath = path.join(backupDir, item);
    const stats = await fs.stat(itemPath);
    
    if (stats.isDirectory()) {
      // バックアップディレクトリの詳細情報を取得
      const metaPath = path.join(itemPath, '_backup_meta.json');
      let meta = {};
      
      if (await fs.pathExists(metaPath)) {
        try {
          meta = await fs.readJson(metaPath);
        } catch (error) {
          console.warn(`バックアップメタデータの読み込み失敗: ${item}`);
        }
      }

      backups.push({
        name: item,
        path: itemPath,
        created: stats.mtime,
        meta: meta,
        size: await calculateDirectorySize(itemPath)
      });
    }
  }

  // 作成日時で降順ソート
  backups.sort((a, b) => b.created - a.created);
  
  return backups;
}

/**
 * ディレクトリサイズの計算
 */
async function calculateDirectorySize(dirPath) {
  let totalSize = 0;
  
  try {
    const items = await fs.readdir(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = await fs.stat(itemPath);
      
      if (stats.isDirectory()) {
        totalSize += await calculateDirectorySize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // エラーの場合は0を返す
  }
  
  return totalSize;
}

/**
 * バックアップ一覧の表示
 */
function displayBackupList(backups) {
  console.log(chalk.blue('\n📦 利用可能なバックアップ:'));
  console.log(chalk.blue('========================'));
  
  if (backups.length === 0) {
    console.log(chalk.yellow('バックアップが見つかりません'));
    return;
  }

  backups.forEach((backup, index) => {
    const sizeStr = formatFileSize(backup.size);
    const dateStr = backup.created.toLocaleString('ja-JP');
    
    console.log(`\n${index + 1}. ${chalk.green(backup.name)}`);
    console.log(`   作成日時: ${dateStr}`);
    console.log(`   サイズ: ${sizeStr}`);
    
    if (backup.meta.version) {
      console.log(`   バージョン: ${backup.meta.version}`);
    }
    if (backup.meta.migrationPhase) {
      console.log(`   移行フェーズ: ${backup.meta.migrationPhase}`);
    }
    if (backup.meta.filesCount) {
      console.log(`   ファイル数: ${backup.meta.filesCount}`);
    }
  });
}

/**
 * ファイルサイズのフォーマット
 */
function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * 移行ファイルの検出
 */
async function detectMigrationFiles() {
  const migrationFiles = [
    // コアドキュメント
    'docs/PROJECT_CONTEXT.md',
    'docs/WORKFLOW_GUIDE.md',
    'docs/AI_INTERACTION_LOG.md',
    'docs/CODING_STANDARDS.md',
    'docs/ARCHITECTURE.md',
    
    // GitHub設定
    '.github/ISSUE_TEMPLATE/',
    '.github/pull_request_template.md',
    '.github/workflows/auto-context-bridge.yml',
    '.github/workflows/progress-tracker.yml',
    
    // スクリプト
    'scripts/ai-context-bridge.js',
    'scripts/ai-context-quality-evaluator.js',
    'scripts/auto-context-extractor.js',
    'scripts/collect-metrics.js',
    'scripts/generate-next-phase-context.js',
    'scripts/progress-tracker.js',
    'scripts/team-notifications.js',
    'scripts/migrate-existing-project.js',
    'scripts/validate-migration.js',
    'scripts/detect-project-phase.js',
    'scripts/migration-health-check.js',
    
    // 拡張ドキュメント
    'docs/ADVANCED_FEATURES_GUIDE.md',
    'docs/GITHUB_AUTO_CONTEXT_BRIDGE.md',
    'docs/PROMPT_ENGINEERING_STRATEGY.md',
    'docs/WORKFLOW_METRICS_ANALYSIS.md',
    'docs/USAGE_AND_TESTING_GUIDE.md',
    'docs/EXISTING_PROJECT_MIGRATION.md',
    
    // AI文脈管理
    'docs/ai-context/',
    'docs/ai-prompts/'
  ];

  const existingFiles = [];
  for (const file of migrationFiles) {
    const filePath = path.join(process.cwd(), file);
    if (await fs.pathExists(filePath)) {
      existingFiles.push(file);
    }
  }

  return existingFiles;
}

/**
 * ロールバック対象の確認
 */
async function confirmRollback(backup, filesToRestore) {
  if (options.force) return true;

  console.log(chalk.yellow(`\n⚠️ ロールバック確認:`));
  console.log(`バックアップ: ${backup.name}`);
  console.log(`復元ファイル数: ${filesToRestore.length}`);
  console.log(`作成日時: ${backup.created.toLocaleString('ja-JP')}`);

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'このバックアップからロールバックしますか？',
      default: false
    }
  ]);

  return confirmed;
}

/**
 * package.jsonのロールバック
 */
async function rollbackPackageJson(backupPath) {
  const backupPackageJson = path.join(backupPath, 'package.json');
  const currentPackageJson = path.join(process.cwd(), 'package.json');
  
  if (await fs.pathExists(backupPackageJson)) {
    console.log(chalk.yellow('📄 package.json をロールバック中...'));
    
    // 現在のpackage.jsonをバックアップ
    const tempBackup = path.join(process.cwd(), 'package.json.rollback-backup');
    await fs.copy(currentPackageJson, tempBackup);
    
    try {
      // バックアップから復元
      await fs.copy(backupPackageJson, currentPackageJson);
      console.log(chalk.green('✅ package.json ロールバック完了'));
      
      // 依存関係の再インストール
      console.log(chalk.yellow('📦 依存関係を再インストール中...'));
      execSync('npm install', { stdio: 'inherit' });
      
    } catch (error) {
      console.error(chalk.red('❌ package.json ロールバック失敗:'), error.message);
      // 失敗した場合は元に戻す
      await fs.copy(tempBackup, currentPackageJson);
      throw error;
    } finally {
      // 一時バックアップの削除
      await fs.remove(tempBackup);
    }
  }
}

/**
 * ファイルのロールバック
 */
async function rollbackFiles(backupPath, filesToRestore) {
  console.log(chalk.yellow(`\n🔄 ${filesToRestore.length}個のファイルをロールバック中...`));
  
  const failures = [];
  
  for (const [index, file] of filesToRestore.entries()) {
    const backupFilePath = path.join(backupPath, file);
    const currentFilePath = path.join(process.cwd(), file);
    
    console.log(`[${index + 1}/${filesToRestore.length}] ${file}`);
    
    try {
      if (await fs.pathExists(backupFilePath)) {
        // バックアップファイルから復元
        await fs.ensureDir(path.dirname(currentFilePath));
        await fs.copy(backupFilePath, currentFilePath);
      } else {
        // バックアップにない場合は削除
        if (await fs.pathExists(currentFilePath)) {
          await fs.remove(currentFilePath);
        }
      }
    } catch (error) {
      console.error(chalk.red(`❌ ${file} の復元失敗: ${error.message}`));
      failures.push({ file, error: error.message });
    }
  }
  
  if (failures.length > 0) {
    console.log(chalk.red(`\n⚠️ ${failures.length}個のファイルの復元に失敗しました:`));
    failures.forEach(failure => {
      console.log(`  - ${failure.file}: ${failure.error}`);
    });
  }
  
  return failures;
}

/**
 * Gitコミットの作成
 */
async function createRollbackCommit(backup) {
  try {
    // Gitの状態確認
    execSync('git status --porcelain', { stdio: 'pipe' });
    
    console.log(chalk.yellow('📝 ロールバックコミットを作成中...'));
    
    execSync('git add -A', { stdio: 'pipe' });
    execSync(`git commit -m "Rollback AI workflow template migration (from backup: ${backup.name})"`, { 
      stdio: 'pipe' 
    });
    
    console.log(chalk.green('✅ ロールバックコミット作成完了'));
    
  } catch (error) {
    console.log(chalk.yellow('⚠️ Gitコミットの作成をスキップしました'));
  }
}

/**
 * ロールバック後の確認
 */
async function verifyRollback() {
  console.log(chalk.yellow('\n🔍 ロールバック結果を確認中...'));
  
  // 移行後健全性チェックが利用可能かチェック
  const healthCheckPath = path.join(process.cwd(), 'scripts/migration-health-check.js');
  
  if (await fs.pathExists(healthCheckPath)) {
    try {
      console.log('健全性チェックを実行...');
      execSync('npm run migration-health', { stdio: 'inherit' });
    } catch (error) {
      console.log(chalk.yellow('健全性チェックをスキップしました'));
    }
  }
}

/**
 * 部分的ロールバック
 */
async function performPartialRollback(backup, components) {
  console.log(chalk.yellow(`\n🎯 部分的ロールバック: ${components.join(', ')}`));
  
  const componentFiles = {
    'docs': ['docs/'],
    'github': ['.github/'],
    'scripts': ['scripts/'],
    'workflows': ['.github/workflows/'],
    'package': ['package.json']
  };
  
  const filesToRestore = [];
  for (const component of components) {
    if (componentFiles[component]) {
      filesToRestore.push(...componentFiles[component]);
    }
  }
  
  return await rollbackFiles(backup.path, filesToRestore);
}

/**
 * メイン処理
 */
async function main() {
  console.log(chalk.blue('🔙 移行ロールバックシステム'));
  console.log(chalk.blue('==========================='));
  console.log('');

  try {
    // バックアップの検出
    const backups = await listAvailableBackups();
    
    if (options.listBackups) {
      displayBackupList(backups);
      return;
    }
    
    if (backups.length === 0) {
      console.log(chalk.red('❌ 利用可能なバックアップが見つかりません'));
      console.log('移行時にバックアップが作成されていることを確認してください');
      return;
    }

    // バックアップの選択
    let selectedBackup;
    
    if (backups.length === 1) {
      selectedBackup = backups[0];
      console.log(chalk.green(`📦 バックアップを自動選択: ${selectedBackup.name}`));
    } else {
      displayBackupList(backups);
      
      const { backupIndex } = await inquirer.prompt([
        {
          type: 'list',
          name: 'backupIndex',
          message: 'ロールバックに使用するバックアップを選択してください:',
          choices: backups.map((backup, index) => ({
            name: `${backup.name} (${backup.created.toLocaleString('ja-JP')})`,
            value: index
          }))
        }
      ]);
      
      selectedBackup = backups[backupIndex];
    }

    // ロールバック対象ファイルの検出
    const migrationFiles = await detectMigrationFiles();
    
    // 部分的ロールバックの処理
    if (options.partial) {
      const components = options.partial.split(',').map(c => c.trim());
      const confirmed = await confirmRollback(selectedBackup, ['部分的ロールバック']);
      
      if (!confirmed) {
        console.log(chalk.yellow('ロールバックをキャンセルしました。'));
        return;
      }
      
      await performPartialRollback(selectedBackup, components);
      console.log(chalk.green('\n🎉 部分的ロールバック完了！'));
      return;
    }

    // 完全ロールバックの確認
    const confirmed = await confirmRollback(selectedBackup, migrationFiles);
    
    if (!confirmed) {
      console.log(chalk.yellow('ロールバックをキャンセルしました。'));
      return;
    }

    // ロールバック実行
    console.log(chalk.yellow('\n🔄 ロールバックを実行中...'));
    
    // 1. package.jsonのロールバック
    await rollbackPackageJson(selectedBackup.path);
    
    // 2. ファイルのロールバック
    const failures = await rollbackFiles(selectedBackup.path, migrationFiles);
    
    // 3. Gitコミットの作成
    await createRollbackCommit(selectedBackup);
    
    // 4. ロールバック結果の確認
    await verifyRollback();

    console.log(chalk.green('\n🎉 ロールバック完了！'));
    
    if (failures.length > 0) {
      console.log(chalk.yellow(`⚠️ ${failures.length}個のファイルで問題が発生しました`));
      console.log('詳細は上記のエラーメッセージを確認してください');
    }

    console.log('\n📋 次のステップ:');
    console.log('1. プロジェクトの動作確認');
    console.log('2. 必要に応じて追加の修正');
    console.log('3. チームメンバーへの通知');
    
  } catch (error) {
    console.error(chalk.red('❌ ロールバック中にエラーが発生しました:'), error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  listAvailableBackups,
  rollbackFiles,
  detectMigrationFiles
};
