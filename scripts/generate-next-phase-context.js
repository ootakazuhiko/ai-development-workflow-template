#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { program } = require('commander');

/**
 * 前フェーズの文脈から次フェーズ開始用のIssue/文脈を自動生成
 */

program
  .option('--current-phase <phase>', 'Current completed phase')
  .option('--repository <repo>', 'Repository name')
  .parse();

const options = program.opts();

const PHASE_TEMPLATES = {
  'poc': {
    title: '🧪 PoC開発フェーズ開始',
    template: `
# PoC開発フェーズ

## 🎯 前フェーズからの継承情報

### 重要決定事項
{{key_decisions}}

### 制約条件
{{critical_constraints}}

### 学習パターン
{{learned_patterns}}

## 📋 PoCで検証すべき項目
{{poc_verification_items}}

## 🏗️ 技術検証アプローチ
- [ ] 基本アーキテクチャの検証
- [ ] 主要機能の実現可能性確認
- [ ] パフォーマンス初期評価
- [ ] セキュリティ要件の実現可能性

## 🔄 AI文脈継承チェックリスト
- [ ] 前フェーズの決定事項を理解
- [ ] 制約条件を把握
- [ ] 学習パターンを認識
- [ ] PoCの責務を明確化

## 📝 完了時の更新内容
- [ ] \`docs/ARCHITECTURE.md\` の更新
- [ ] PoC結果の記録
- [ ] 次フェーズへの推奨事項まとめ
`
  },
  'implementation': {
    title: '⚙️ 実装フェーズ開始',
    template: `
# 実装フェーズ

## 🎯 前フェーズからの継承情報

### 技術検証結果
{{technical_verification_results}}

### 推奨アーキテクチャ
{{recommended_architecture}}

### 重要な学習事項
{{learned_patterns}}

## 🏗️ 実装計画
{{implementation_plan}}

## 📋 実装タスク分割
- [ ] 基盤コンポーネント実装
- [ ] 主要機能実装
- [ ] 統合テスト実装
- [ ] ドキュメント整備

## 🔄 AI文脈継承チェックリスト
- [ ] PoCでの検証結果を理解
- [ ] 推奨アーキテクチャを把握
- [ ] 技術的制約を認識
- [ ] 実装品質基準を確認

## 📝 完了時の更新内容
- [ ] 実装内容の要約
- [ ] レビュー観点の整理
- [ ] テスト観点の明確化
`
  },
  'review': {
    title: '🔍 レビューフェーズ開始',
    template: `
# レビューフェーズ

## 🎯 前フェーズからの継承情報

### 実装内容要約
{{implementation_summary}}

### 重点レビュー観点
{{review_focus_areas}}

### 品質メトリクス
{{quality_metrics}}

## 📋 レビュー項目
- [ ] コード品質確認
- [ ] アーキテクチャ整合性
- [ ] セキュリティ要件充足
- [ ] パフォーマンス要件確認
- [ ] テストカバレッジ確認

## 🔄 AI文脈継承チェックリスト
- [ ] 実装内容を理解
- [ ] 重点観点を把握
- [ ] 品質基準を確認
- [ ] レビュー責務を明確化

## 📝 完了時の更新内容
- [ ] レビュー結果まとめ
- [ ] 修正事項の記録
- [ ] テスト観点の引き継ぎ
`
  },
  'testing': {
    title: '🧪 テスト・デプロイフェーズ開始',
    template: `
# テスト・デプロイフェーズ

## 🎯 前フェーズからの継承情報

### レビュー結果
{{review_results}}

### 修正済み事項
{{fixed_issues}}

### テスト観点
{{test_focus_areas}}

## 📋 AI支援テスト計画
- [ ] **テストケース生成**: 要件に基づくAI生成テストケース
- [ ] **テストデータ生成**: 多様なパターンのテストデータ自動生成
- [ ] **テストコード支援**: AIによるテストコード生成補助
- [ ] **結果分析**: テスト結果の自動分析
- [ ] **探索的テスト**: AI支援による未知の問題発見

## 🔄 AI文脈継承チェックリスト
- [ ] レビュー結果を理解
- [ ] 修正事項を把握
- [ ] テスト観点を認識
- [ ] 品質基準を確認

## 📝 完了時の更新内容
- [ ] テスト結果報告
- [ ] デプロイ結果記録
- [ ] プロジェクト振り返り
- [ ] 次回改善点まとめ
`
  }
};

async function generateNextPhaseContext() {
  const currentPhase = options.currentPhase;
  const nextPhase = getNextPhase(currentPhase);
  
  if (!nextPhase) {
    console.log('📋 最終フェーズのため、次フェーズなし');
    return;
  }
  
  console.log(`🔄 Generating next phase context: ${currentPhase} → ${nextPhase}`);
  
  // 前フェーズの文脈を読み取り
  const contextFile = path.join(process.cwd(), 'docs', 'ai-context', `ai-context-${currentPhase}.yml`);
  if (!await fs.pathExists(contextFile)) {
    console.error(`❌ Context file not found: ${contextFile}`);
    return;
  }
  
  const contextData = yaml.load(await fs.readFile(contextFile, 'utf8'));
  
  // 次フェーズ用テンプレートを生成
  const template = PHASE_TEMPLATES[nextPhase];
  if (!template) {
    console.error(`❌ Template not found for phase: ${nextPhase}`);
    return;
  }
  
  let content = template.template;
  
  // テンプレート変数を実際のデータで置換
  content = content.replace('{{key_decisions}}', formatDecisions(contextData.key_decisions));
  content = content.replace('{{critical_constraints}}', formatConstraints(contextData.critical_constraints));
  content = content.replace('{{learned_patterns}}', formatPatterns(contextData.learned_patterns));
  content = content.replace('{{poc_verification_items}}', formatPoCItems(contextData.next_phase_focus));
  content = content.replace('{{technical_verification_results}}', formatTechnicalResults(contextData));
  content = content.replace('{{recommended_architecture}}', formatArchitecture(contextData));
  content = content.replace('{{implementation_plan}}', formatImplementationPlan(contextData.next_phase_focus));
  content = content.replace('{{implementation_summary}}', formatImplementationSummary(contextData));
  content = content.replace('{{review_focus_areas}}', formatReviewFocus(contextData.next_phase_focus));
  content = content.replace('{{quality_metrics}}', formatQualityMetrics(contextData.quality_metrics));
  content = content.replace('{{review_results}}', formatReviewResults(contextData));
  content = content.replace('{{fixed_issues}}', formatFixedIssues(contextData));
  content = content.replace('{{test_focus_areas}}', formatTestFocus(contextData.next_phase_focus));
  
  // AI引き継ぎプロンプトを追加
  const aiPrompt = generateAIHandoffPrompt(nextPhase, contextData);
  content += `\n\n## 🤖 AI引き継ぎプロンプト\n\n\`\`\`text\n${aiPrompt}\n\`\`\``;
  
  // ファイル出力
  await fs.ensureDir('temp');
  await fs.writeFile('temp/next-phase-context.md', `# ${template.title}\n\n${content}`);
  
  console.log(`✅ Next phase context generated for ${nextPhase}`);
}

function formatDecisions(decisions) {
  if (!decisions || decisions.length === 0) return '- 記録された決定事項なし';
  
  return decisions.map(d => `- **${d.decision}**\n  - 理由: ${d.reasoning}\n  - 影響: ${d.impact}`).join('\n');
}

function formatConstraints(constraints) {
  if (!constraints || constraints.length === 0) return '- 記録された制約条件なし';
  
  return constraints.map(c => `- **${c.type}**: ${c.description}`).join('\n');
}

function formatPatterns(patterns) {
  if (!patterns || patterns.length === 0) return '- 記録された学習パターンなし';
  
  return patterns.map(p => `- ${p.pattern}\n  - 根拠: ${p.evidence}`).join('\n');
}

function formatPoCItems(nextFocus) {
  if (!nextFocus || nextFocus.length === 0) return '- 基本機能の実現可能性確認\n- 技術スタックの妥当性検証';
  
  return nextFocus.map(item => `- ${item}`).join('\n');
}

function formatTechnicalResults(contextData) {
  const artifacts = contextData.technical_artifacts || [];
  if (artifacts.length === 0) return '- 技術検証結果の記録なし';
  
  return artifacts.map(a => `- **${a.type}**: ${a.content}`).join('\n');
}

function formatArchitecture(contextData) {
  const decisions = contextData.key_decisions || [];
  const techDecisions = decisions.filter(d => d.decision.includes('技術') || d.decision.includes('アーキテクチャ'));
  
  if (techDecisions.length === 0) return '- アーキテクチャ推奨事項の記録なし';
  
  return techDecisions.map(d => `- ${d.decision}: ${d.reasoning}`).join('\n');
}

function formatImplementationPlan(nextFocus) {
  if (!nextFocus || nextFocus.length === 0) return '- 実装計画の詳細化が必要';
  
  return nextFocus.map(item => `- ${item}`).join('\n');
}

function formatImplementationSummary(contextData) {
  return '- 実装内容の詳細は前フェーズの記録を参照\n- 主要コンポーネントと機能の一覧\n- 技術的な実装上の工夫点';
}

function formatReviewFocus(nextFocus) {
  if (!nextFocus || nextFocus.length === 0) return '- コード品質\n- アーキテクチャ整合性\n- セキュリティ要件';
  
  return nextFocus.map(item => `- ${item}`).join('\n');
}

function formatQualityMetrics(metrics) {
  if (!metrics || Object.keys(metrics).length === 0) return '- 品質メトリクスの記録なし';
  
  return Object.entries(metrics).map(([key, value]) => `- **${key}**: ${value}`).join('\n');
}

function formatReviewResults(contextData) {
  return '- レビュー結果の詳細は前フェーズの記録を参照\n- 指摘事項と対応状況\n- 品質確認結果';
}

function formatFixedIssues(contextData) {
  return '- 修正済み事項の詳細は前フェーズの記録を参照\n- 主要な修正点\n- 残存課題（あれば）';
}

function formatTestFocus(nextFocus) {
  if (!nextFocus || nextFocus.length === 0) return '- 機能テスト\n- パフォーマンステスト\n- セキュリティテスト';
  
  return nextFocus.map(item => `- ${item}`).join('\n');
}

function generateAIHandoffPrompt(nextPhase, contextData) {
  const phaseNames = {
    'poc': 'PoC開発',
    'implementation': '実装',
    'review': 'レビュー',
    'testing': 'テスト・デプロイ'
  };
  
  return `あなたは${options.repository}の${phaseNames[nextPhase]}フェーズを担当するAIです。

前フェーズで以下が決定・学習されました：

## 重要決定事項
${formatDecisions(contextData.key_decisions)}

## 制約条件  
${formatConstraints(contextData.critical_constraints)}

## 学習パターン
${formatPatterns(contextData.learned_patterns)}

## あなたの今フェーズの責務
${getPhaseResponsibilities(nextPhase)}

これらの文脈を踏まえて、${phaseNames[nextPhase]}フェーズを開始してください。
不明点があれば質問してください。`;
}

function getPhaseResponsibilities(phase) {
  const responsibilities = {
    'poc': '- 技術実現可能性の検証\n- アーキテクチャ選択肢の提示\n- リスクの早期発見',
    'implementation': '- 高品質なコード実装\n- 設計原則の遵守\n- テスタブルなコード作成',
    'review': '- コード品質の確認\n- 設計の妥当性評価\n- セキュリティ・パフォーマンス確認',
    'testing': '- 包括的なテスト実施\n- 品質指標の確認\n- デプロイ準備'
  };
  
  return responsibilities[phase] || '- フェーズ責務の確認が必要';
}

function getNextPhase(currentPhase) {
  const phaseFlow = {
    'requirements': 'poc',
    'poc': 'implementation', 
    'implementation': 'review',
    'review': 'testing',
    'testing': null
  };
  
  return phaseFlow[currentPhase] || null;
}

if (require.main === module) {
  generateNextPhaseContext().catch(console.error);
}

module.exports = { generateNextPhaseContext };
