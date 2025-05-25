#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { program } = require('commander');

/**
 * 段階的移行管理スクリプト
 * 移行の一時停止、再開、進捗管理を行う
 */

program
  .option('--status', '現在の移行状況を表示')
  .option('--resume', '中断された移行を再開')
  .option('--pause', '移行を一時停止')
  .option('--reset', '移行状態をリセット')
  .option('--schedule <phase>', '指定フェーズまでの移行をスケジュール')
  .parse();

const options = program.opts();

const MIGRATION_STATE_FILE = '.migration-state.json';

/**
 * 移行状態の読み込み
 */
async function loadMigrationState() {
  const statePath = path.join(process.cwd(), MIGRATION_STATE_FILE);
  
  if (await fs.pathExists(statePath)) {
    try {
      return await fs.readJson(statePath);
    } catch (error) {
      console.warn('移行状態ファイルの読み込みに失敗しました');
      return null;
    }
  }
  
  return null;
}

/**
 * 移行状態の保存
 */
async function saveMigrationState(state) {
  const statePath = path.join(process.cwd(), MIGRATION_STATE_FILE);
  await fs.writeJson(statePath, state, { spaces: 2 });
}

/**
 * 移行進捗の表示
 */
function displayMigrationStatus(state) {
  if (!state) {
    console.log(chalk.yellow('📊 移行は実行されていません'));
    return;
  }

  console.log(chalk.blue('\n📊 移行進捗状況'));
  console.log(chalk.blue('================'));
  
  console.log(`\n開始日時: ${new Date(state.startTime).toLocaleString('ja-JP')}`);
  console.log(`現在フェーズ: ${state.currentPhase}`);
  console.log(`ステータス: ${getStatusDisplay(state.status)}`);
  
  if (state.lastUpdate) {
    console.log(`最終更新: ${new Date(state.lastUpdate).toLocaleString('ja-JP')}`);
  }

  // 完了済みステップ
  console.log(`\n✅ 完了済みステップ: ${state.completedSteps.length}/${state.totalSteps}`);
  
  if (state.completedSteps.length > 0) {
    console.log(chalk.green('完了済み:'));
    state.completedSteps.forEach(step => {
      console.log(`  ✓ ${step.name} (${new Date(step.completedAt).toLocaleString('ja-JP')})`);
    });
  }

  // 残りステップ
  const remainingSteps = state.plannedSteps.filter(
    step => !state.completedSteps.some(completed => completed.id === step.id)
  );
  
  if (remainingSteps.length > 0) {
    console.log(chalk.yellow('\n⏳ 残りステップ:'));
    remainingSteps.forEach(step => {
      console.log(`  ○ ${step.name}`);
    });
  }

  // バックアップ情報
  if (state.backupPath) {
    console.log(`\n💾 バックアップ: ${state.backupPath}`);
  }

  // エラー情報
  if (state.errors && state.errors.length > 0) {
    console.log(chalk.red('\n❌ エラー履歴:'));
    state.errors.forEach(error => {
      console.log(`  - ${error.step}: ${error.message} (${new Date(error.timestamp).toLocaleString('ja-JP')})`);
    });
  }
}

/**
 * ステータス表示のフォーマット
 */
function getStatusDisplay(status) {
  const statusMap = {
    'in_progress': chalk.yellow('実行中'),
    'paused': chalk.blue('一時停止'),
    'completed': chalk.green('完了'),
    'failed': chalk.red('失敗'),
    'scheduled': chalk.cyan('スケジュール済み')
  };
  
  return statusMap[status] || status;
}

/**
 * 移行の再開
 */
async function resumeMigration() {
  const state = await loadMigrationState();
  
  if (!state) {
    console.log(chalk.red('❌ 再開可能な移行が見つかりません'));
    return;
  }

  if (state.status === 'completed') {
    console.log(chalk.green('✅ 移行は既に完了しています'));
    return;
  }

  if (state.status !== 'paused' && state.status !== 'failed') {
    console.log(chalk.yellow('⚠️ 移行は現在実行中です'));
    return;
  }

  console.log(chalk.blue('🔄 移行を再開しています...'));
  
  // 移行スクリプトを呼び出し
  const { spawn } = require('child_process');
  const migrationProcess = spawn('node', ['scripts/migrate-existing-project.js', '--resume-from-state'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  migrationProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green('✅ 移行再開完了'));
    } else {
      console.log(chalk.red('❌ 移行再開失敗'));
    }
  });
}

/**
 * 移行の一時停止
 */
async function pauseMigration() {
  const state = await loadMigrationState();
  
  if (!state) {
    console.log(chalk.yellow('📊 実行中の移行が見つかりません'));
    return;
  }

  if (state.status !== 'in_progress') {
    console.log(chalk.yellow('⚠️ 移行は実行中ではありません'));
    return;
  }

  state.status = 'paused';
  state.pausedAt = new Date().toISOString();
  state.lastUpdate = new Date().toISOString();

  await saveMigrationState(state);
  console.log(chalk.blue('⏸️ 移行を一時停止しました'));
}

/**
 * 移行状態のリセット
 */
async function resetMigrationState() {
  const statePath = path.join(process.cwd(), MIGRATION_STATE_FILE);
  
  if (await fs.pathExists(statePath)) {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: '移行状態をリセットしますか？ (進捗情報が失われます)',
        default: false
      }
    ]);

    if (confirmed) {
      await fs.remove(statePath);
      console.log(chalk.green('✅ 移行状態をリセットしました'));
    } else {
      console.log(chalk.yellow('リセットをキャンセルしました'));
    }
  } else {
    console.log(chalk.yellow('📊 移行状態ファイルが見つかりません'));
  }
}

/**
 * 移行スケジュールの設定
 */
async function scheduleMigration(targetPhase) {
  console.log(chalk.blue(`📅 ${targetPhase} フェーズまでの移行をスケジュール中...`));
  
  const state = {
    startTime: new Date().toISOString(),
    targetPhase: targetPhase,
    currentPhase: 'discovery',
    status: 'scheduled',
    totalSteps: 0,
    completedSteps: [],
    plannedSteps: [],
    errors: [],
    lastUpdate: new Date().toISOString()
  };

  // 段階的移行計画の生成
  const migrationPhases = ['discovery', 'requirements', 'poc', 'implementation', 'review', 'testing', 'production'];
  const targetIndex = migrationPhases.indexOf(targetPhase);
  
  if (targetIndex === -1) {
    console.log(chalk.red('❌ 無効なフェーズが指定されました'));
    return;
  }

  // 各フェーズの移行ステップを計画
  const phases = migrationPhases.slice(0, targetIndex + 1);
  let stepCount = 0;
  
  for (const phase of phases) {
    // フェーズ別のステップを定義
    const phaseSteps = generatePhaseSteps(phase);
    state.plannedSteps.push(...phaseSteps);
    stepCount += phaseSteps.length;
  }

  state.totalSteps = stepCount;
  
  await saveMigrationState(state);
  
  console.log(chalk.green(`✅ ${targetPhase} フェーズまでの移行がスケジュールされました`));
  console.log(`   予定ステップ数: ${stepCount}`);
  
  // スケジュールの確認
  displayMigrationStatus(state);
  
  const { startNow } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'startNow',
      message: '今すぐ移行を開始しますか？',
      default: true
    }
  ]);

  if (startNow) {
    await resumeMigration();
  }
}

/**
 * フェーズ別ステップの生成
 */
function generatePhaseSteps(phase) {
  const stepTemplates = {
    'discovery': [
      { id: 'core-docs', name: 'コアドキュメント作成', priority: 'high' }
    ],
    'requirements': [
      { id: 'github-templates', name: 'GitHubテンプレート', priority: 'high' },
      { id: 'issue-templates', name: 'Issueテンプレート', priority: 'medium' }
    ],
    'poc': [
      { id: 'scripts-basic', name: '基本スクリプト', priority: 'high' },
      { id: 'ai-context', name: 'AI文脈継承', priority: 'high' }
    ],
    'implementation': [
      { id: 'workflows', name: 'GitHub Actions', priority: 'medium' },
      { id: 'quality-tools', name: '品質管理ツール', priority: 'medium' }
    ],
    'review': [
      { id: 'review-automation', name: 'レビュー自動化', priority: 'medium' },
      { id: 'metrics-collection', name: 'メトリクス収集', priority: 'low' }
    ],
    'testing': [
      { id: 'test-automation', name: 'テスト自動化', priority: 'low' }
    ],
    'production': [
      { id: 'monitoring', name: '監視システム', priority: 'low' },
      { id: 'maintenance', name: 'メンテナンス機能', priority: 'low' }
    ]
  };

  return stepTemplates[phase] || [];
}

/**
 * 移行進捗の更新
 */
async function updateMigrationProgress(stepId, stepName, status = 'completed') {
  const state = await loadMigrationState();
  
  if (!state) {
    return;
  }

  if (status === 'completed') {
    // 完了済みステップに追加
    state.completedSteps.push({
      id: stepId,
      name: stepName,
      completedAt: new Date().toISOString()
    });
  } else if (status === 'failed') {
    // エラーに追加
    state.errors.push({
      step: stepName,
      message: 'Step execution failed',
      timestamp: new Date().toISOString()
    });
    state.status = 'failed';
  }

  state.lastUpdate = new Date().toISOString();
  
  // 全ステップ完了チェック
  if (state.completedSteps.length >= state.totalSteps && state.status !== 'failed') {
    state.status = 'completed';
    state.completedAt = new Date().toISOString();
  }

  await saveMigrationState(state);
}

/**
 * メイン処理
 */
async function main() {
  console.log(chalk.blue('🎛️ 段階的移行管理システム'));
  console.log(chalk.blue('============================'));
  console.log('');

  try {
    if (options.status) {
      const state = await loadMigrationState();
      displayMigrationStatus(state);
      return;
    }

    if (options.resume) {
      await resumeMigration();
      return;
    }

    if (options.pause) {
      await pauseMigration();
      return;
    }

    if (options.reset) {
      await resetMigrationState();
      return;
    }

    if (options.schedule) {
      await scheduleMigration(options.schedule);
      return;
    }

    // デフォルト: ステータス表示とメニュー
    const state = await loadMigrationState();
    displayMigrationStatus(state);

    if (!state || state.status === 'completed') {
      console.log(chalk.yellow('\n💡 利用可能なコマンド:'));
      console.log('  --schedule <phase>  : 指定フェーズまでの移行をスケジュール');
      console.log('  --status           : 移行状況を表示');
      return;
    }

    const actions = [];
    
    if (state.status === 'paused' || state.status === 'failed') {
      actions.push({ name: '移行を再開', value: 'resume' });
    }
    
    if (state.status === 'in_progress') {
      actions.push({ name: '移行を一時停止', value: 'pause' });
    }
    
    actions.push(
      { name: '移行状態をリセット', value: 'reset' },
      { name: '終了', value: 'exit' }
    );

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '実行する操作を選択してください:',
        choices: actions
      }
    ]);

    switch (action) {
      case 'resume':
        await resumeMigration();
        break;
      case 'pause':
        await pauseMigration();
        break;
      case 'reset':
        await resetMigrationState();
        break;
      case 'exit':
        console.log('終了します');
        break;
    }

  } catch (error) {
    console.error(chalk.red('❌ エラーが発生しました:'), error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  loadMigrationState,
  saveMigrationState,
  updateMigrationProgress,
  displayMigrationStatus
};
