#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const yaml = require('js-yaml');
const { program } = require('commander');

/**
 * 既存プロジェクト移行支援スクリプト
 * 既存のプロジェクトにAI開発ワークフローテンプレートを途中適用する
 */

program
  .option('--analyze-only', '分析のみ実行（変更は行わない）')
  .option('--phase <phase>', '現在のプロジェクトフェーズを指定')
  .option('--force', '確認なしで実行')
  .parse();

const options = program.opts();

const MIGRATION_PHASES = {
  'discovery': {
    name: '開発開始前',
    description: 'プロジェクト企画・構想段階',
    templates: ['all']
  },
  'requirements': {
    name: '要件定義中',
    description: '要件定義作業中',
    templates: ['poc', 'implementation', 'review', 'testing', 'workflows']
  },
  'poc': {
    name: 'PoC開発中',
    description: 'プロトタイプ・検証中',
    templates: ['implementation', 'review', 'testing', 'workflows']
  },
  'implementation': {
    name: '実装中',
    description: 'メイン開発作業中',
    templates: ['review', 'testing', 'workflows', 'context-bridge']
  },
  'review': {
    name: 'レビュー中',
    description: 'コードレビュー・品質確認中',
    templates: ['testing', 'workflows', 'context-bridge']
  },
  'testing': {
    name: 'テスト中',
    description: 'テスト・デプロイ準備中',
    templates: ['workflows', 'context-bridge']
  },
  'production': {
    name: '本番運用中',
    description: '本番環境でサービス提供中',
    templates: ['context-bridge', 'monitoring']
  }
};

const COMPONENT_CATEGORIES = {
  'core-docs': {
    name: 'コアドキュメント',
    files: [
      'docs/PROJECT_CONTEXT.md',
      'docs/WORKFLOW_GUIDE.md',
      'docs/AI_INTERACTION_LOG.md',
      'docs/CODING_STANDARDS.md',
      'docs/ARCHITECTURE.md'
    ],
    priority: 'high',
    description: 'プロジェクト運営に必要な基礎ドキュメント'
  },
  'github-templates': {
    name: 'GitHubテンプレート',
    files: [
      '.github/ISSUE_TEMPLATE/',
      '.github/pull_request_template.md'
    ],
    priority: 'high',
    description: 'Issue/PRテンプレート'
  },
  'workflows': {
    name: 'GitHub Actions',
    files: [
      '.github/workflows/auto-context-bridge.yml',
      '.github/workflows/progress-tracker.yml'
    ],
    priority: 'medium',
    description: '自動化ワークフロー'
  },
  'scripts': {
    name: 'スクリプト群',
    files: [
      'scripts/ai-context-bridge.js',
      'scripts/ai-context-quality-evaluator.js',
      'scripts/auto-context-extractor.js',
      'scripts/collect-metrics.js',
      'scripts/generate-next-phase-context.js',
      'scripts/progress-tracker.js',
      'scripts/team-notifications.js'
    ],
    priority: 'high',
    description: 'AI文脈継承・自動化スクリプト'
  },
  'advanced-docs': {
    name: '拡張ドキュメント',
    files: [
      'docs/ADVANCED_FEATURES_GUIDE.md',
      'docs/GITHUB_AUTO_CONTEXT_BRIDGE.md',
      'docs/PROMPT_ENGINEERING_STRATEGY.md',
      'docs/WORKFLOW_METRICS_ANALYSIS.md',
      'docs/USAGE_AND_TESTING_GUIDE.md'
    ],
    priority: 'low',
    description: '詳細ガイド・戦略文書'
  },
  'ai-context': {
    name: 'AI文脈管理',
    files: [
      'docs/ai-context/',
      'docs/ai-prompts/'
    ],
    priority: 'medium',
    description: 'AI文脈継承データ格納ディレクトリ'
  }
};

async function main() {
  console.log(chalk.blue('🔄 既存プロジェクト移行支援システム'));
  console.log(chalk.blue('====================================='));
  console.log('');

  try {
    // 1. 現在のプロジェクト状況を分析
    const projectAnalysis = await analyzeCurrentProject();
    console.log(chalk.green('✅ プロジェクト分析完了'));

    // 2. 移行プランの提案
    const migrationPlan = await generateMigrationPlan(projectAnalysis);
    
    if (options.analyzeOnly) {
      console.log(chalk.yellow('\n📊 分析結果（変更は行いません）:'));
      displayAnalysisResults(projectAnalysis, migrationPlan);
      return;
    }

    // 3. 移行計画の確認
    const confirmed = await confirmMigration(migrationPlan);
    if (!confirmed) {
      console.log(chalk.yellow('移行をキャンセルしました。'));
      return;
    }

    // 4. 段階的移行の実行
    await executeMigration(migrationPlan, projectAnalysis);

    console.log(chalk.green('\n🎉 移行完了！'));
    displayPostMigrationGuide(migrationPlan);

  } catch (error) {
    console.error(chalk.red('❌ 移行中にエラーが発生しました:'), error);
    process.exit(1);
  }
}

/**
 * 現在のプロジェクト状況を分析
 */
async function analyzeCurrentProject() {
  console.log(chalk.yellow('🔍 プロジェクト状況を分析中...'));
  
  const analysis = {
    projectRoot: process.cwd(),
    packageJson: null,
    gitRepo: false,
    existingFiles: {},
    phase: null,
    conflictFiles: [],
    recommendations: []
  };

  // package.json の確認
  try {
    const packagePath = path.join(analysis.projectRoot, 'package.json');
    if (await fs.pathExists(packagePath)) {
      analysis.packageJson = await fs.readJson(packagePath);
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️ package.json が読み込めません'));
  }

  // Git リポジトリの確認
  analysis.gitRepo = await fs.pathExists(path.join(analysis.projectRoot, '.git'));

  // 既存ファイルの確認
  for (const [category, config] of Object.entries(COMPONENT_CATEGORIES)) {
    analysis.existingFiles[category] = {
      existing: [],
      missing: [],
      conflicts: []
    };

    for (const filePath of config.files) {
      const fullPath = path.join(analysis.projectRoot, filePath);
      if (await fs.pathExists(fullPath)) {
        analysis.existingFiles[category].existing.push(filePath);
        
        // コンフリクトの可能性をチェック
        if (await checkFileConflict(fullPath, filePath)) {
          analysis.existingFiles[category].conflicts.push(filePath);
          analysis.conflictFiles.push(filePath);
        }
      } else {
        analysis.existingFiles[category].missing.push(filePath);
      }
    }
  }

  // 現在のフェーズ推定
  analysis.phase = await estimateCurrentPhase(analysis);

  // 推奨事項の生成
  analysis.recommendations = generateRecommendations(analysis);

  return analysis;
}

/**
 * ファイルのコンフリクト可能性をチェック
 */
async function checkFileConflict(existingPath, templatePath) {
  try {
    const templateFullPath = path.join(__dirname, '..', templatePath);
    if (!await fs.pathExists(templateFullPath)) {
      return false;
    }

    const existingContent = await fs.readFile(existingPath, 'utf8');
    const templateContent = await fs.readFile(templateFullPath, 'utf8');

    // 基本的な差分チェック（詳細な比較は実装時に）
    return existingContent !== templateContent && 
           existingContent.length > 100; // 既存ファイルが実質的な内容を持つ場合
  } catch (error) {
    return false;
  }
}

/**
 * 現在のプロジェクトフェーズを推定
 */
async function estimateCurrentPhase(analysis) {
  // コマンドライン引数で指定されている場合
  if (options.phase && MIGRATION_PHASES[options.phase]) {
    return options.phase;
  }

  // ファイル存在パターンからの推定
  const indicators = {
    'discovery': () => !analysis.packageJson || Object.keys(analysis.packageJson.dependencies || {}).length === 0,
    'requirements': () => analysis.existingFiles['core-docs'].existing.includes('docs/PROJECT_CONTEXT.md'),
    'poc': () => analysis.existingFiles['core-docs'].existing.includes('docs/ARCHITECTURE.md'),
    'implementation': () => (analysis.packageJson?.dependencies && Object.keys(analysis.packageJson.dependencies).length > 5),
    'review': () => analysis.existingFiles['workflows'].existing.length > 0,
    'testing': () => (analysis.packageJson?.scripts?.test !== undefined),
    'production': () => (analysis.packageJson?.version && !analysis.packageJson.version.includes('0.'))
  };

  // フェーズを逆順で確認（より進んだフェーズを優先）
  const phases = Object.keys(indicators).reverse();
  for (const phase of phases) {
    if (indicators[phase]()) {
      return phase;
    }
  }

  return 'discovery'; // デフォルト
}

/**
 * 推奨事項を生成
 */
function generateRecommendations(analysis) {
  const recommendations = [];

  if (!analysis.gitRepo) {
    recommendations.push({
      type: 'critical',
      message: 'Gitリポジトリの初期化が必要です',
      action: 'git init を実行してください'
    });
  }

  if (!analysis.packageJson) {
    recommendations.push({
      type: 'high',
      message: 'package.json の作成が推奨されます',
      action: 'npm init を実行してください'
    });
  }

  if (analysis.conflictFiles.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `${analysis.conflictFiles.length}個のファイルでコンフリクトの可能性があります`,
      action: 'バックアップを作成してから移行を実行してください'
    });
  }

  const totalMissing = Object.values(analysis.existingFiles)
    .reduce((sum, category) => sum + category.missing.length, 0);
  
  if (totalMissing > 10) {
    recommendations.push({
      type: 'info',
      message: `${totalMissing}個の新しいファイルが追加されます`,
      action: '段階的な移行を推奨します'
    });
  }

  return recommendations;
}

/**
 * 移行プランの生成
 */
async function generateMigrationPlan(analysis) {
  const currentPhase = analysis.phase;
  const availablePhases = MIGRATION_PHASES[currentPhase]?.templates || [];

  console.log(chalk.yellow(`\n📋 移行プラン生成中... (現在フェーズ: ${MIGRATION_PHASES[currentPhase].name})`));

  const plan = {
    currentPhase,
    strategy: 'staged', // staged, all-at-once, custom
    steps: [],
    backupRequired: analysis.conflictFiles.length > 0,
    estimatedTime: '15-30分',
    riskLevel: 'low'
  };

  // ステップ生成
  if (analysis.conflictFiles.length > 0) {
    plan.steps.push({
      id: 'backup',
      name: 'バックアップ作成',
      description: '既存ファイルのバックアップを作成',
      files: analysis.conflictFiles,
      required: true
    });
    plan.riskLevel = 'medium';
  }

  // カテゴリ別の移行ステップ
  const priorities = ['high', 'medium', 'low'];
  for (const priority of priorities) {
    const categories = Object.entries(COMPONENT_CATEGORIES)
      .filter(([_, config]) => config.priority === priority);

    for (const [categoryId, config] of categories) {
      const missing = analysis.existingFiles[categoryId].missing;
      const conflicts = analysis.existingFiles[categoryId].conflicts;

      if (missing.length > 0 || conflicts.length > 0) {
        plan.steps.push({
          id: categoryId,
          name: config.name,
          description: config.description,
          files: [...missing, ...conflicts],
          priority,
          conflicts: conflicts.length > 0
        });
      }
    }
  }

  // package.json 更新
  if (analysis.packageJson) {
    plan.steps.push({
      id: 'package-json',
      name: 'package.json更新',
      description: '新しいNPMスクリプトの追加',
      files: ['package.json'],
      required: true
    });
  }

  // 時間とリスクの再計算
  plan.estimatedTime = calculateEstimatedTime(plan.steps);
  if (plan.steps.length > 10) {
    plan.riskLevel = plan.riskLevel === 'low' ? 'medium' : 'high';
  }

  return plan;
}

/**
 * 推定時間の計算
 */
function calculateEstimatedTime(steps) {
  const baseTime = steps.length * 2; // 1ステップあたり2分
  if (baseTime < 10) return '5-10分';
  if (baseTime < 20) return '10-20分';
  if (baseTime < 40) return '20-40分';
  return '40分以上';
}

/**
 * 移行確認
 */
async function confirmMigration(plan) {
  if (options.force) return true;

  console.log(chalk.yellow('\n📋 移行プラン:'));
  console.log(`フェーズ: ${MIGRATION_PHASES[plan.currentPhase].name}`);
  console.log(`ステップ数: ${plan.steps.length}`);
  console.log(`推定時間: ${plan.estimatedTime}`);
  console.log(`リスクレベル: ${plan.riskLevel}`);

  if (plan.backupRequired) {
    console.log(chalk.red('\n⚠️ 既存ファイルとのコンフリクトが検出されました'));
    console.log('バックアップを作成してから移行を実行します');
  }

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: '移行を実行しますか？',
      default: false
    }
  ]);

  return confirmed;
}

/**
 * 移行の実行
 */
async function executeMigration(plan, analysis) {
  console.log(chalk.yellow('\n🔄 移行を実行中...'));

  for (const [index, step] of plan.steps.entries()) {
    console.log(`\n[${index + 1}/${plan.steps.length}] ${step.name}`);
    
    try {
      await executeStep(step, analysis);
      console.log(chalk.green(`✅ ${step.name} 完了`));
    } catch (error) {
      console.error(chalk.red(`❌ ${step.name} 失敗:`), error.message);
      
      const { continueOnError } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueOnError',
          message: 'エラーが発生しましたが、続行しますか？',
          default: false
        }
      ]);

      if (!continueOnError) {
        throw new Error('ユーザーによって移行が中断されました');
      }
    }
  }
}

/**
 * 個別ステップの実行
 */
async function executeStep(step, analysis) {
  const templateRoot = path.join(__dirname, '..');

  switch (step.id) {
    case 'backup':
      return await createBackup(step.files, analysis);

    case 'package-json':
      await updatePackageJsonForMigration(analysis.packageJson);
      break;

    default:
      // ファイルコピー
      for (const filePath of step.files) {
        const sourcePath = path.join(templateRoot, filePath);
        const targetPath = path.join(analysis.projectRoot, filePath);

        if (await fs.pathExists(sourcePath)) {
          await fs.ensureDir(path.dirname(targetPath));
          
          if (step.conflicts && await fs.pathExists(targetPath)) {
            // コンフリクトファイルのマージまたは置換
            await handleFileConflict(sourcePath, targetPath, filePath);
          } else {
            await fs.copy(sourcePath, targetPath);
          }
        }
      }
      break;
  }
}

/**
 * バックアップの作成
 */
async function createBackup(files, analysis) {
  const timestamp = Date.now();
  const backupDir = path.join(process.cwd(), `.backup-${timestamp}`);
  await fs.ensureDir(backupDir);

  let fileCount = 0;
  const backedUpFiles = [];

  // 指定されたファイルのバックアップ
  for (const filePath of files) {
    const sourcePath = path.join(process.cwd(), filePath);
    const backupPath = path.join(backupDir, filePath);

    if (await fs.pathExists(sourcePath)) {
      await fs.ensureDir(path.dirname(backupPath));
      await fs.copy(sourcePath, backupPath);
      fileCount++;
      backedUpFiles.push(filePath);
    }
  }

  // package.jsonの特別処理
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const backupPackagePath = path.join(backupDir, 'package.json');
    await fs.copy(packageJsonPath, backupPackagePath);
    fileCount++;
    backedUpFiles.push('package.json');
  }

  // バックアップメタデータの作成
  const metadata = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    projectPhase: analysis.phase,
    migrationPhase: MIGRATION_PHASES[analysis.phase]?.name || 'Unknown',
    filesCount: fileCount,
    backedUpFiles: backedUpFiles,
    projectRoot: process.cwd(),
    backupReason: 'migration',
    originalPackageJson: analysis.packageJson ? {
      name: analysis.packageJson.name,
      version: analysis.packageJson.version
    } : null
  };

  const metaPath = path.join(backupDir, '_backup_meta.json');
  await fs.writeJson(metaPath, metadata, { spaces: 2 });

  console.log(chalk.green(`✅ バックアップを作成しました: ${path.basename(backupDir)}`));
  console.log(chalk.gray(`   ファイル数: ${fileCount}, パス: ${backupDir}`));
  
  return backupDir;
}

/**
 * ファイルコンフリクトの処理
 */
async function handleFileConflict(sourcePath, targetPath, filePath) {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: `${filePath} が既に存在します。どうしますか？`,
      choices: [
        { name: '既存ファイルを保持（スキップ）', value: 'keep' },
        { name: 'テンプレートで置換', value: 'replace' },
        { name: '手動でマージ後に続行', value: 'manual' }
      ]
    }
  ]);

  switch (action) {
    case 'keep':
      // 何もしない
      break;
    case 'replace':
      await fs.copy(sourcePath, targetPath);
      break;
    case 'manual':
      console.log(chalk.yellow(`手動マージが必要: ${targetPath}`));
      console.log(`テンプレートファイル: ${sourcePath}`);
      await inquirer.prompt([
        {
          type: 'confirm',
          name: 'ready',
          message: 'マージ完了後、Enterを押してください'
        }
      ]);
      break;
  }
}

/**
 * package.json の移行用更新
 */
async function updatePackageJsonForMigration(existingPackageJson) {
  const templatePackagePath = path.join(__dirname, '..', 'package.json');
  const templatePackage = await fs.readJson(templatePackagePath);

  // 新しいスクリプトを追加
  const newScripts = {
    'setup': 'node scripts/setup-project.js',
    'ai-context': 'node scripts/ai-context-bridge.js',
    'context-bridge': 'node scripts/ai-context-bridge.js',
    'progress-update': 'node scripts/progress-tracker.js',
    'quality-check': 'node scripts/ai-context-quality-evaluator.js',
    'collect-metrics': 'node scripts/collect-metrics.js',
    'notify-team': 'node scripts/team-notifications.js'
  };

  const updatedPackage = {
    ...existingPackageJson,
    scripts: {
      ...existingPackageJson.scripts,
      ...newScripts
    },
    devDependencies: {
      ...existingPackageJson.devDependencies,
      ...templatePackage.devDependencies
    }
  };

  await fs.writeJson(path.join(process.cwd(), 'package.json'), updatedPackage, { spaces: 2 });
}

/**
 * 分析結果の表示
 */
function displayAnalysisResults(analysis, plan) {
  console.log('\n📊 プロジェクト分析結果:');
  console.log(`現在フェーズ: ${MIGRATION_PHASES[analysis.phase].name}`);
  console.log(`Gitリポジトリ: ${analysis.gitRepo ? '✅' : '❌'}`);
  console.log(`package.json: ${analysis.packageJson ? '✅' : '❌'}`);
  
  console.log('\n📁 ファイル状況:');
  for (const [category, data] of Object.entries(analysis.existingFiles)) {
    const config = COMPONENT_CATEGORIES[category];
    console.log(`\n${config.name}:`);
    console.log(`  既存: ${data.existing.length}/${config.files.length}`);
    console.log(`  不足: ${data.missing.length}`);
    console.log(`  コンフリクト: ${data.conflicts.length}`);
  }

  if (analysis.recommendations.length > 0) {
    console.log('\n💡 推奨事項:');
    for (const rec of analysis.recommendations) {
      const icon = rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} ${rec.message}`);
      console.log(`   ${rec.action}`);
    }
  }
}

/**
 * 移行後ガイドの表示
 */
function displayPostMigrationGuide(plan) {
  console.log(chalk.yellow('\n📖 移行完了後の次ステップ:'));
  
  console.log('\n1. 依存関係のインストール:');
  console.log('   npm install');
  
  console.log('\n2. AI文脈継承システムの初期化:');
  console.log('   npm run ai-context');
  
  console.log('\n3. 進捗状況の確認:');
  console.log('   npm run progress-update');
  
  console.log('\n4. GitHub Actionsの設定:');
  console.log('   - Settings → Actions → General → 権限設定');
  console.log('   - 必要に応じてSecretsの設定');
  
  console.log('\n5. チーム通知の設定:');
  console.log('   - Slack/Teams Webhook URLの設定');
  
  console.log('\n📚 詳細ガイド:');
  console.log('   - docs/USAGE_AND_TESTING_GUIDE.md');
  console.log('   - docs/ADVANCED_FEATURES_GUIDE.md');
  console.log('   - docs/GITHUB_AUTO_CONTEXT_BRIDGE.md');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzeCurrentProject,
  generateMigrationPlan,
  executeMigration,
  MIGRATION_PHASES,
  COMPONENT_CATEGORIES
};
