#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { program } = require('commander');

/**
 * 既存プロジェクトの現在フェーズ自動判定スクリプト
 * プロジェクトの状況から最適な移行ポイントを判定
 */

program
  .option('--detailed', '詳細な分析を表示')
  .option('--confidence-threshold <number>', '判定信頼度の閾値 (0-1)', '0.7')
  .parse();

const options = program.opts();

const PHASE_INDICATORS = {
  'discovery': {
    name: '企画・発見段階',
    description: 'プロジェクト構想段階、技術選定前',
    weight: 0.1,
    indicators: [
      {
        type: 'file_absence',
        target: 'package.json',
        weight: 0.3,
        description: 'package.jsonが存在しない'
      },
      {
        type: 'dir_absence',
        target: 'src',
        weight: 0.2,
        description: 'ソースコードディレクトリが存在しない'
      },
      {
        type: 'file_absence',
        target: 'README.md',
        weight: 0.1,
        description: 'READMEが簡素または存在しない'
      },
      {
        type: 'git_history',
        target: 'commit_count_low',
        weight: 0.2,
        description: 'Gitコミット数が少ない（10未満）'
      },
      {
        type: 'file_count',
        target: 'low_file_count',
        weight: 0.2,
        description: 'プロジェクトファイル数が少ない（20未満）'
      }
    ]
  },
  
  'requirements': {
    name: '要件定義段階',
    description: '要件定義作業中、基本設計段階',
    weight: 0.15,
    indicators: [
      {
        type: 'file_presence',
        target: 'docs/requirements.md',
        weight: 0.3,
        description: '要件定義ドキュメントが存在'
      },
      {
        type: 'file_presence',
        target: 'docs/specification.md',
        weight: 0.2,
        description: '仕様書が存在'
      },
      {
        type: 'file_presence',
        target: 'README.md',
        weight: 0.1,
        description: 'READMEに要件記載'
      },
      {
        type: 'file_content',
        target: 'package.json',
        keywords: ['name', 'description'],
        weight: 0.2,
        description: 'package.jsonに基本情報記載'
      },
      {
        type: 'dir_absence',
        target: 'src',
        weight: 0.2,
        description: '実装がまだ開始されていない'
      }
    ]
  },
  
  'poc': {
    name: 'PoC開発段階',
    description: 'プロトタイプ作成、技術検証中',
    weight: 0.2,
    indicators: [
      {
        type: 'file_presence',
        target: 'prototype',
        weight: 0.3,
        description: 'プロトタイプディレクトリ存在'
      },
      {
        type: 'file_presence',
        target: 'poc',
        weight: 0.3,
        description: 'PoCディレクトリ存在'
      },
      {
        type: 'package_dependencies',
        target: 'few_dependencies',
        weight: 0.2,
        description: '依存関係が少ない（実験的）'
      },
      {
        type: 'file_content',
        target: 'README.md',
        keywords: ['poc', 'prototype', 'proof of concept'],
        weight: 0.1,
        description: 'PoCに関する記述'
      },
      {
        type: 'git_history',
        target: 'experimental_commits',
        weight: 0.1,
        description: '実験的なコミットメッセージ'
      }
    ]
  },
  
  'implementation': {
    name: '実装段階',
    description: 'メイン機能開発中',
    weight: 0.25,
    indicators: [
      {
        type: 'dir_presence',
        target: 'src',
        weight: 0.3,
        description: 'ソースコードディレクトリ存在'
      },
      {
        type: 'package_dependencies',
        target: 'substantial_dependencies',
        weight: 0.2,
        description: '本格的な依存関係'
      },
      {
        type: 'file_presence',
        target: 'test',
        weight: 0.1,
        description: 'テストファイル存在'
      },
      {
        type: 'git_history',
        target: 'regular_commits',
        weight: 0.2,
        description: '定期的な開発コミット'
      },
      {
        type: 'file_content',
        target: 'package.json',
        keywords: ['scripts', 'start', 'build'],
        weight: 0.2,
        description: 'ビルド・実行スクリプト存在'
      }
    ]
  },
  
  'review': {
    name: 'レビュー段階',
    description: 'コードレビュー、品質向上段階',
    weight: 0.15,
    indicators: [
      {
        type: 'file_presence',
        target: '.github/pull_request_template.md',
        weight: 0.2,
        description: 'PRテンプレート存在'
      },
      {
        type: 'git_history',
        target: 'pr_history',
        weight: 0.3,
        description: 'プルリクエスト履歴'
      },
      {
        type: 'file_presence',
        target: '.eslintrc',
        weight: 0.1,
        description: 'Linter設定存在'
      },
      {
        type: 'file_presence',
        target: '.prettierrc',
        weight: 0.1,
        description: 'フォーマッター設定存在'
      },
      {
        type: 'package_dependencies',
        target: 'quality_tools',
        weight: 0.3,
        description: '品質管理ツール導入'
      }
    ]
  },
  
  'testing': {
    name: 'テスト段階',
    description: 'テスト実装、CI/CD構築段階',
    weight: 0.1,
    indicators: [
      {
        type: 'file_presence',
        target: '.github/workflows',
        weight: 0.3,
        description: 'GitHub Actions設定'
      },
      {
        type: 'dir_presence',
        target: 'test',
        weight: 0.2,
        description: 'テストディレクトリ存在'
      },
      {
        type: 'package_dependencies',
        target: 'testing_frameworks',
        weight: 0.2,
        description: 'テストフレームワーク導入'
      },
      {
        type: 'file_content',
        target: 'package.json',
        keywords: ['test', 'jest', 'mocha', 'cypress'],
        weight: 0.3,
        description: 'テストスクリプト設定'
      }
    ]
  },
  
  'production': {
    name: '本番運用段階',
    description: 'デプロイ済み、運用・保守段階',
    weight: 0.05,
    indicators: [
      {
        type: 'package_version',
        target: 'stable_version',
        weight: 0.3,
        description: '安定バージョン（1.0.0以上）'
      },
      {
        type: 'file_presence',
        target: 'docker',
        weight: 0.2,
        description: 'Docker設定存在'
      },
      {
        type: 'file_presence',
        target: 'deployment',
        weight: 0.2,
        description: 'デプロイメント設定'
      },
      {
        type: 'git_history',
        target: 'release_tags',
        weight: 0.3,
        description: 'リリースタグ存在'
      }
    ]
  }
};

async function main() {
  console.log(chalk.blue('🎯 プロジェクトフェーズ自動判定'));
  console.log(chalk.blue('==============================='));
  console.log('');

  try {
    const projectRoot = process.cwd();
    console.log(chalk.yellow(`分析対象: ${projectRoot}`));
    console.log(chalk.yellow('分析中...'));

    const analysis = await analyzeProject(projectRoot);
    const phaseScores = await calculatePhaseScores(analysis);
    const recommendation = generateRecommendation(phaseScores);

    displayResults(phaseScores, recommendation, analysis);

  } catch (error) {
    console.error(chalk.red('分析中にエラーが発生しました:'), error);
    process.exit(1);
  }
}

/**
 * プロジェクト分析
 */
async function analyzeProject(projectRoot) {
  const analysis = {
    files: [],
    directories: [],
    packageJson: null,
    gitHistory: null,
    fileCount: 0,
    indicators: {}
  };

  // ファイル・ディレクトリ構造の分析
  await analyzeFileStructure(projectRoot, analysis);

  // package.json の分析
  await analyzePackageJson(projectRoot, analysis);

  // Git履歴の分析
  await analyzeGitHistory(projectRoot, analysis);

  return analysis;
}

/**
 * ファイル構造の分析
 */
async function analyzeFileStructure(projectRoot, analysis) {
  const items = await fs.readdir(projectRoot, { withFileTypes: true });
  
  for (const item of items) {
    if (item.isFile()) {
      analysis.files.push(item.name);
    } else if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      analysis.directories.push(item.name);
    }
  }

  // 再帰的にファイル数をカウント
  analysis.fileCount = await countFiles(projectRoot);
}

/**
 * ファイル数の再帰的カウント
 */
async function countFiles(dir, count = 0) {
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.name.startsWith('.') || item.name === 'node_modules') {
        continue;
      }
      
      const fullPath = path.join(dir, item.name);
      if (item.isFile()) {
        count++;
      } else if (item.isDirectory()) {
        count = await countFiles(fullPath, count);
      }
    }
  } catch (error) {
    // アクセス権限エラーなどは無視
  }
  return count;
}

/**
 * package.json の分析
 */
async function analyzePackageJson(projectRoot, analysis) {
  const packagePath = path.join(projectRoot, 'package.json');
  
  if (await fs.pathExists(packagePath)) {
    try {
      analysis.packageJson = await fs.readJson(packagePath);
    } catch (error) {
      console.warn(chalk.yellow('package.json の読み込みに失敗しました'));
    }
  }
}

/**
 * Git履歴の分析
 */
async function analyzeGitHistory(projectRoot, analysis) {
  try {
    const { execSync } = require('child_process');
    
    // コミット数
    const commitCount = execSync('git rev-list --all --count', { 
      cwd: projectRoot, 
      encoding: 'utf8' 
    }).trim();
    
    // 最近のコミットメッセージ
    const recentCommits = execSync('git log --oneline -10', { 
      cwd: projectRoot, 
      encoding: 'utf8' 
    }).trim().split('\n');
    
    // タグ一覧
    const tags = execSync('git tag', { 
      cwd: projectRoot, 
      encoding: 'utf8' 
    }).trim().split('\n').filter(tag => tag);

    analysis.gitHistory = {
      commitCount: parseInt(commitCount) || 0,
      recentCommits,
      tags
    };
    
  } catch (error) {
    // Gitリポジトリでない場合など
    analysis.gitHistory = {
      commitCount: 0,
      recentCommits: [],
      tags: []
    };
  }
}

/**
 * フェーズスコアの計算
 */
async function calculatePhaseScores(analysis) {
  const scores = {};

  for (const [phaseId, phaseConfig] of Object.entries(PHASE_INDICATORS)) {
    let totalScore = 0;
    let totalWeight = 0;
    const indicatorResults = [];

    for (const indicator of phaseConfig.indicators) {
      const result = await evaluateIndicator(indicator, analysis);
      const weightedScore = result.score * indicator.weight;
      
      totalScore += weightedScore;
      totalWeight += indicator.weight;
      
      indicatorResults.push({
        ...indicator,
        score: result.score,
        confidence: result.confidence,
        details: result.details
      });
    }

    const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    scores[phaseId] = {
      score: normalizedScore,
      confidence: calculateConfidence(indicatorResults),
      indicators: indicatorResults,
      name: phaseConfig.name,
      description: phaseConfig.description
    };
  }

  return scores;
}

/**
 * 個別指標の評価
 */
async function evaluateIndicator(indicator, analysis) {
  let score = 0;
  let confidence = 1.0;
  let details = '';

  try {
    switch (indicator.type) {
      case 'file_presence':
        score = await evaluateFilePresence(indicator.target, analysis);
        details = `ファイル ${indicator.target} の存在: ${score > 0 ? 'あり' : 'なし'}`;
        break;

      case 'file_absence':
        score = await evaluateFileAbsence(indicator.target, analysis);
        details = `ファイル ${indicator.target} の不在: ${score > 0 ? 'なし' : 'あり'}`;
        break;

      case 'dir_presence':
        score = evaluateDirectoryPresence(indicator.target, analysis);
        details = `ディレクトリ ${indicator.target} の存在: ${score > 0 ? 'あり' : 'なし'}`;
        break;

      case 'dir_absence':
        score = evaluateDirectoryAbsence(indicator.target, analysis);
        details = `ディレクトリ ${indicator.target} の不在: ${score > 0 ? 'なし' : 'あり'}`;
        break;

      case 'package_dependencies':
        score = evaluatePackageDependencies(indicator.target, analysis);
        details = `依存関係評価 (${indicator.target}): ${score.toFixed(2)}`;
        break;

      case 'file_content':
        score = await evaluateFileContent(indicator.target, indicator.keywords, analysis);
        details = `ファイル内容評価: ${score.toFixed(2)}`;
        break;

      case 'git_history':
        score = evaluateGitHistory(indicator.target, analysis);
        details = `Git履歴評価 (${indicator.target}): ${score.toFixed(2)}`;
        break;

      case 'package_version':
        score = evaluatePackageVersion(indicator.target, analysis);
        details = `バージョン評価: ${score.toFixed(2)}`;
        break;

      case 'file_count':
        score = evaluateFileCount(indicator.target, analysis);
        details = `ファイル数評価: ${analysis.fileCount}個`;
        break;

      default:
        confidence = 0.5;
        details = `未知の指標タイプ: ${indicator.type}`;
    }
  } catch (error) {
    confidence = 0.3;
    details = `評価エラー: ${error.message}`;
  }

  return { score: Math.max(0, Math.min(1, score)), confidence, details };
}

/**
 * ファイル存在の評価
 */
async function evaluateFilePresence(target, analysis) {
  const variations = [
    target,
    target.toLowerCase(),
    target.replace(/\.[^/.]+$/, ''), // 拡張子なし
    `${target}.md`,
    `${target}.txt`
  ];

  for (const variation of variations) {
    if (analysis.files.includes(variation) || 
        analysis.files.some(file => file.includes(variation))) {
      return 1.0;
    }
  }

  // ディレクトリ内のファイルもチェック
  const targetPath = path.join(process.cwd(), target);
  if (await fs.pathExists(targetPath)) {
    return 1.0;
  }

  return 0.0;
}

/**
 * ファイル不在の評価
 */
async function evaluateFileAbsence(target, analysis) {
  const presence = await evaluateFilePresence(target, analysis);
  return 1.0 - presence;
}

/**
 * ディレクトリ存在の評価
 */
function evaluateDirectoryPresence(target, analysis) {
  return analysis.directories.includes(target) ? 1.0 : 0.0;
}

/**
 * ディレクトリ不在の評価
 */
function evaluateDirectoryAbsence(target, analysis) {
  return analysis.directories.includes(target) ? 0.0 : 1.0;
}

/**
 * 依存関係の評価
 */
function evaluatePackageDependencies(target, analysis) {
  if (!analysis.packageJson) return 0.0;

  const deps = {
    ...analysis.packageJson.dependencies,
    ...analysis.packageJson.devDependencies
  };
  const depCount = Object.keys(deps).length;

  switch (target) {
    case 'few_dependencies':
      return depCount <= 5 ? 1.0 : Math.max(0, 1.0 - (depCount - 5) / 10);
    
    case 'substantial_dependencies':
      return depCount >= 5 ? Math.min(1.0, depCount / 15) : depCount / 5;
    
    case 'quality_tools':
      const qualityTools = ['eslint', 'prettier', 'husky', 'lint-staged'];
      const matches = qualityTools.filter(tool => deps[tool]);
      return matches.length / qualityTools.length;
    
    case 'testing_frameworks':
      const testTools = ['jest', 'mocha', 'cypress', 'testing-library'];
      const testMatches = testTools.filter(tool => 
        Object.keys(deps).some(dep => dep.includes(tool))
      );
      return testMatches.length > 0 ? 1.0 : 0.0;
    
    default:
      return 0.0;
  }
}

/**
 * ファイル内容の評価
 */
async function evaluateFileContent(target, keywords, analysis) {
  try {
    const filePath = path.join(process.cwd(), target);
    if (!await fs.pathExists(filePath)) return 0.0;

    const content = await fs.readFile(filePath, 'utf8');
    const lowerContent = content.toLowerCase();
    
    const matches = keywords.filter(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    );
    
    return matches.length / keywords.length;
  } catch (error) {
    return 0.0;
  }
}

/**
 * Git履歴の評価
 */
function evaluateGitHistory(target, analysis) {
  if (!analysis.gitHistory) return 0.0;

  switch (target) {
    case 'commit_count_low':
      return analysis.gitHistory.commitCount < 10 ? 1.0 : 
             Math.max(0, 1.0 - (analysis.gitHistory.commitCount - 10) / 20);
    
    case 'regular_commits':
      return analysis.gitHistory.commitCount >= 20 ? 1.0 : 
             analysis.gitHistory.commitCount / 20;
    
    case 'experimental_commits':
      const expKeywords = ['poc', 'experiment', 'test', 'try', 'prototype'];
      const expCommits = analysis.gitHistory.recentCommits.filter(commit =>
        expKeywords.some(keyword => commit.toLowerCase().includes(keyword))
      );
      return expCommits.length / Math.max(1, analysis.gitHistory.recentCommits.length);
    
    case 'pr_history':
      // 簡易的にmergeコミットをPRとして判定
      const mergeCommits = analysis.gitHistory.recentCommits.filter(commit =>
        commit.toLowerCase().includes('merge')
      );
      return mergeCommits.length > 0 ? 1.0 : 0.0;
    
    case 'release_tags':
      return analysis.gitHistory.tags.length > 0 ? 1.0 : 0.0;
    
    default:
      return 0.0;
  }
}

/**
 * パッケージバージョンの評価
 */
function evaluatePackageVersion(target, analysis) {
  if (!analysis.packageJson?.version) return 0.0;

  const version = analysis.packageJson.version;
  const [major] = version.split('.').map(v => parseInt(v) || 0);

  switch (target) {
    case 'stable_version':
      return major >= 1 ? 1.0 : 0.0;
    
    default:
      return 0.0;
  }
}

/**
 * ファイル数の評価
 */
function evaluateFileCount(target, analysis) {
  switch (target) {
    case 'low_file_count':
      return analysis.fileCount < 20 ? 1.0 : 
             Math.max(0, 1.0 - (analysis.fileCount - 20) / 50);
    
    default:
      return 0.0;
  }
}

/**
 * 信頼度の計算
 */
function calculateConfidence(indicatorResults) {
  const avgConfidence = indicatorResults.reduce((sum, r) => sum + r.confidence, 0) / indicatorResults.length;
  const scoreVariance = calculateVariance(indicatorResults.map(r => r.score));
  
  // 分散が小さいほど信頼度が高い
  const varianceFactor = Math.max(0, 1 - scoreVariance * 2);
  
  return avgConfidence * varianceFactor;
}

/**
 * 分散の計算
 */
function calculateVariance(scores) {
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  return variance;
}

/**
 * 推奨事項の生成
 */
function generateRecommendation(phaseScores) {
  const sortedPhases = Object.entries(phaseScores)
    .sort(([,a], [,b]) => b.score - a.score);

  const topPhase = sortedPhases[0];
  const [topPhaseId, topPhaseData] = topPhase;
  
  const confidenceThreshold = parseFloat(options.confidenceThreshold);
  
  const recommendation = {
    primaryPhase: topPhaseId,
    confidence: topPhaseData.confidence,
    certainty: topPhaseData.confidence >= confidenceThreshold ? 'high' : 'medium',
    alternatives: [],
    migrationStrategy: '',
    nextSteps: []
  };

  // 代替候補の特定（スコア差が0.2以内）
  for (let i = 1; i < sortedPhases.length; i++) {
    const [phaseId, phaseData] = sortedPhases[i];
    if (topPhaseData.score - phaseData.score <= 0.2) {
      recommendation.alternatives.push({
        phase: phaseId,
        score: phaseData.score,
        confidence: phaseData.confidence
      });
    }
  }

  // 移行戦略の決定
  if (topPhaseData.confidence >= confidenceThreshold) {
    recommendation.migrationStrategy = 'targeted';
    recommendation.nextSteps = generateTargetedNextSteps(topPhaseId);
  } else {
    recommendation.migrationStrategy = 'gradual';
    recommendation.nextSteps = generateGradualNextSteps(sortedPhases.slice(0, 3));
  }

  return recommendation;
}

/**
 * 的確な次ステップの生成
 */
function generateTargetedNextSteps(phaseId) {
  const stepMap = {
    'discovery': [
      'プロジェクト初期設定: npm run setup',
      '全テンプレートの適用を推奨',
      '要件定義Issueの作成から開始'
    ],
    'requirements': [
      'PoC以降のテンプレート適用',
      '既存要件定義をPROJECT_CONTEXT.mdに移行',
      'AI文脈継承システムの導入'
    ],
    'poc': [
      '実装以降のテンプレート適用',
      'PoC結果の構造化記録',
      'アーキテクチャドキュメントの更新'
    ],
    'implementation': [
      'レビュープロセスの強化',
      'AI文脈継承システムの導入',
      'コード品質管理ツールの適用'
    ],
    'review': [
      'テスト自動化の導入',
      'GitHub Actions ワークフローの設定',
      '品質評価システムの適用'
    ],
    'testing': [
      'CI/CD パイプラインの強化',
      'デプロイメント自動化の検討',
      '運用監視システムの準備'
    ],
    'production': [
      '継続改善プロセスの導入',
      '次期開発への知見蓄積',
      'チーム学習支援システムの活用'
    ]
  };

  return stepMap[phaseId] || ['カスタム移行プランの検討'];
}

/**
 * 段階的次ステップの生成
 */
function generateGradualNextSteps(topPhases) {
  return [
    '複数フェーズの可能性があります',
    '手動分析による詳細確認を推奨',
    'migrate-existing-project.js での分析実行',
    '段階的移行プランの検討'
  ];
}

/**
 * 結果の表示
 */
function displayResults(phaseScores, recommendation, analysis) {
  console.log(chalk.green('\n🎯 フェーズ判定結果'));
  console.log('================');

  // トップフェーズの表示
  const topPhaseData = phaseScores[recommendation.primaryPhase];
  console.log(`\n${chalk.cyan('推定フェーズ:')} ${chalk.bold(topPhaseData.name)}`);
  console.log(`${chalk.cyan('スコア:')} ${(topPhaseData.score * 100).toFixed(1)}%`);
  console.log(`${chalk.cyan('信頼度:')} ${(topPhaseData.confidence * 100).toFixed(1)}%`);
  console.log(`${chalk.cyan('確実性:')} ${recommendation.certainty === 'high' ? '高' : '中'}`);
  
  if (options.detailed) {
    console.log(chalk.yellow('\n📊 詳細スコア:'));
    const sortedPhases = Object.entries(phaseScores)
      .sort(([,a], [,b]) => b.score - a.score);

    for (const [phaseId, phaseData] of sortedPhases) {
      const bar = '█'.repeat(Math.round(phaseData.score * 20));
      const percentage = (phaseData.score * 100).toFixed(1);
      console.log(`${phaseData.name.padEnd(15)} ${bar.padEnd(20)} ${percentage}%`);
    }

    // 主要指標の表示
    console.log(chalk.yellow('\n🔍 主要判定要因:'));
    const topIndicators = topPhaseData.indicators
      .filter(ind => ind.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    for (const indicator of topIndicators) {
      console.log(`✓ ${indicator.description} (${(indicator.score * 100).toFixed(1)}%)`);
    }
  }

  // 代替候補
  if (recommendation.alternatives.length > 0) {
    console.log(chalk.yellow('\n🤔 代替候補:'));
    for (const alt of recommendation.alternatives) {
      const altData = phaseScores[alt.phase];
      console.log(`• ${altData.name} (スコア: ${(alt.score * 100).toFixed(1)}%)`);
    }
  }

  // 推奨移行戦略
  console.log(chalk.cyan('\n📋 推奨移行戦略:'));
  const strategyName = recommendation.migrationStrategy === 'targeted' ? '集中移行' : '段階移行';
  console.log(`戦略: ${strategyName}`);

  console.log(chalk.cyan('\n📝 次のステップ:'));
  for (const [index, step] of recommendation.nextSteps.entries()) {
    console.log(`${index + 1}. ${step}`);
  }

  // プロジェクト概要
  if (options.detailed) {
    console.log(chalk.yellow('\n📁 プロジェクト概要:'));
    console.log(`ファイル数: ${analysis.fileCount}`);
    console.log(`ディレクトリ数: ${analysis.directories.length}`);
    if (analysis.packageJson) {
      const depCount = Object.keys({
        ...analysis.packageJson.dependencies,
        ...analysis.packageJson.devDependencies
      }).length;
      console.log(`依存関係数: ${depCount}`);
    }
    if (analysis.gitHistory) {
      console.log(`Gitコミット数: ${analysis.gitHistory.commitCount}`);
    }
  }

  // コマンド提案
  console.log(chalk.blue('\n🔧 推奨コマンド:'));
  if (recommendation.certainty === 'high') {
    console.log(`node migrate-existing-project.js --phase ${recommendation.primaryPhase}`);
  } else {
    console.log('node migrate-existing-project.js  # 対話式分析');
  }
  console.log('node validate-migration.js  # 移行前検証');
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('分析中にエラーが発生しました:'), error);
    process.exit(1);
  });
}

module.exports = { PHASE_INDICATORS, main };
