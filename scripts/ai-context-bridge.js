const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * AI文脈継承ブリッジスクリプト
 * フェーズ間でのAI文脈継承を自動化・支援
 */

const PHASES = {
  'requirements': {
    name: '要件定義',
    next: 'poc',
    contextFile: 'ai-context-requirements.yml'
  },
  'poc': {
    name: 'PoC開発',
    next: 'implementation',
    contextFile: 'ai-context-poc.yml'
  },
  'implementation': {
    name: '実装',
    next: 'review',
    contextFile: 'ai-context-implementation.yml'
  },
  'review': {
    name: 'レビュー',
    next: 'testing',
    contextFile: 'ai-context-review.yml'
  },
  'testing': {
    name: 'テスト・デプロイ',
    next: null,
    contextFile: 'ai-context-testing.yml'
  }
};

async function main() {
  console.log(chalk.blue('🤖 AI文脈継承ブリッジ'));
  console.log(chalk.blue('==============================='));
  console.log('');

  const action = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '実行するアクションを選択してください:',
      choices: [
        { name: '📝 フェーズ完了文脈の記録', value: 'complete' },
        { name: '🔄 次フェーズ開始文脈の生成', value: 'start' },
        { name: '📊 文脈継承品質チェック', value: 'check' },
        { name: '📈 継承メトリクス表示', value: 'metrics' }
      ]
    }
  ]);

  switch (action.action) {
    case 'complete':
      await completePhase();
      break;
    case 'start':
      await startPhase();
      break;
    case 'check':
      await checkContextQuality();
      break;
    case 'metrics':
      await showMetrics();
      break;
  }
}

/**
 * フェーズ完了時の文脈記録
 */
async function completePhase() {
  console.log(chalk.yellow('\n📝 フェーズ完了文脈の記録'));
  
  const phaseInfo = await inquirer.prompt([
    {
      type: 'list',
      name: 'phase',
      message: '完了したフェーズを選択してください:',
      choices: Object.entries(PHASES).map(([key, value]) => ({
        name: value.name,
        value: key
      }))
    }
  ]);

  const currentPhase = PHASES[phaseInfo.phase];
  
  const contextData = await inquirer.prompt([
    {
      type: 'input',
      name: 'aiTools',
      message: '使用したAIツール (カンマ区切り):',
      default: 'GitHub Copilot, Claude'
    },
    {
      type: 'editor',
      name: 'keyDecisions',
      message: '重要な決定事項を記入してください (YAML形式):'
    },
    {
      type: 'editor',
      name: 'constraints',
      message: '重要な制約条件を記入してください (YAML形式):'
    },
    {
      type: 'editor',
      name: 'learnedPatterns',
      message: '学習したパターン・知見を記入してください (YAML形式):'
    },
    {
      type: 'editor',
      name: 'nextFocus',
      message: '次フェーズの重点項目を記入してください (YAML形式):'
    }
  ]);

  const contextYaml = generateContextYaml(phaseInfo.phase, contextData);
  
  const contextDir = path.join(process.cwd(), 'docs', 'ai-context');
  await fs.ensureDir(contextDir);
  
  const contextFilePath = path.join(contextDir, currentPhase.contextFile);
  await fs.writeFile(contextFilePath, contextYaml);
  
  console.log(chalk.green(`✅ 文脈情報を保存しました: ${contextFilePath}`));
  
  // 次フェーズの準備
  if (currentPhase.next) {
    const prepareNext = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'prepare',
        message: `次フェーズ（${PHASES[currentPhase.next].name}）の文脈継承プロンプトを生成しますか？`,
        default: true
      }
    ]);
    
    if (prepareNext.prepare) {
      await generateNextPhasePrompt(phaseInfo.phase, currentPhase.next);
    }
  }
}

/**
 * 次フェーズ開始時の文脈継承プロンプト生成
 */
async function startPhase() {
  console.log(chalk.yellow('\n🔄 次フェーズ開始文脈の生成'));
  
  const phaseInfo = await inquirer.prompt([
    {
      type: 'list',
      name: 'currentPhase',
      message: '開始するフェーズを選択してください:',
      choices: Object.entries(PHASES)
        .filter(([key]) => key !== 'requirements') // 最初のフェーズは除外
        .map(([key, value]) => ({
          name: value.name,
          value: key
        }))
    }
  ]);

  const previousPhaseKey = Object.entries(PHASES)
    .find(([key, value]) => value.next === phaseInfo.currentPhase)?.[0];
  
  if (!previousPhaseKey) {
    console.log(chalk.red('❌ 前フェーズが見つかりません'));
    return;
  }

  await generateNextPhasePrompt(previousPhaseKey, phaseInfo.currentPhase);
}

/**
 * 文脈継承品質チェック
 */
async function checkContextQuality() {
  console.log(chalk.yellow('\n📊 文脈継承品質チェック'));
  
  const contextDir = path.join(process.cwd(), 'docs', 'ai-context');
  
  try {
    const files = await fs.readdir(contextDir);
    const yamlFiles = files.filter(f => f.endsWith('.yml'));
    
    console.log(chalk.cyan('\n保存済み文脈ファイル:'));
    for (const file of yamlFiles) {
      const filePath = path.join(contextDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n').length;
      console.log(`  ✓ ${file} (${lines} lines)`);
    }
    
    // 品質チェック項目
    const qualityCheck = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'checkedItems',
        message: '文脈継承品質チェック項目を確認してください:',
        choices: [
          '重要決定事項が記録されている',
          '制約条件が明確に記載されている',
          '学習パターンが具体的である',
          '次フェーズの重点項目が明確である',
          '前フェーズからの一貫性がある',
          'AI文脈継承プロンプトが生成済み'
        ]
      }
    ]);
    
    const checkedCount = qualityCheck.checkedItems.length;
    const totalCount = 6;
    const qualityScore = (checkedCount / totalCount) * 100;
    
    console.log(chalk.cyan(`\n品質スコア: ${qualityScore.toFixed(1)}% (${checkedCount}/${totalCount})`));
    
    if (qualityScore >= 80) {
      console.log(chalk.green('✅ 高品質な文脈継承です！'));
    } else if (qualityScore >= 60) {
      console.log(chalk.yellow('⚠️  文脈継承に改善の余地があります'));
    } else {
      console.log(chalk.red('❌ 文脈継承の品質向上が必要です'));
    }
    
  } catch (error) {
    console.log(chalk.red('❌ 文脈ファイルが見つかりません'));
    console.log(chalk.gray('   まず "フェーズ完了文脈の記録" を実行してください'));
  }
}

/**
 * 継承メトリクス表示
 */
async function showMetrics() {
  console.log(chalk.yellow('\n📈 継承メトリクス表示'));
  
  // TODO: 実際のメトリクス収集・分析機能を実装
  console.log(chalk.cyan('開発中の機能です。将来的に以下のメトリクスを提供予定:'));
  console.log('  • フェーズ間文脈継承完了率');
  console.log('  • AI出力品質スコア');
  console.log('  • 手戻り率の推移');
  console.log('  • 決定事項の一貫性評価');
}

/**
 * 文脈YAMLファイル生成
 */
function generateContextYaml(phase, data) {
  const aiToolsList = data.aiTools.split(',').map(tool => `  - ${tool.trim()}`).join('\n');
  
  return `# AI文脈継承ファイル - ${PHASES[phase].name}フェーズ
phase: "${phase}"
completion_date: "${new Date().toISOString().split('T')[0]}"
ai_tools_used:
${aiToolsList}

key_decisions:
${data.keyDecisions.split('\n').map(line => line ? `  ${line}` : '').join('\n')}

critical_constraints:
${data.constraints.split('\n').map(line => line ? `  ${line}` : '').join('\n')}

learned_patterns:
${data.learnedPatterns.split('\n').map(line => line ? `  ${line}` : '').join('\n')}

next_phase_focus:
${data.nextFocus.split('\n').map(line => line ? `  ${line}` : '').join('\n')}

# 品質メタデータ
quality_metrics:
  completeness_score: null  # 人間レビューで設定
  consistency_score: null   # 自動計算で設定
  usability_score: null     # 次フェーズでの利用実績で設定
`;
}

/**
 * 次フェーズ向けAI文脈継承プロンプト生成
 */
async function generateNextPhasePrompt(currentPhase, nextPhase) {
  console.log(chalk.yellow(`\n🔄 ${PHASES[nextPhase].name}フェーズ向けプロンプト生成中...`));
  
  try {
    const contextDir = path.join(process.cwd(), 'docs', 'ai-context');
    const contextFile = path.join(contextDir, PHASES[currentPhase].contextFile);
    const contextContent = await fs.readFile(contextFile, 'utf8');
    
    const prompt = `# AI文脈継承プロンプト - ${PHASES[nextPhase].name}フェーズ開始

あなたは「${PHASES[nextPhase].name}」フェーズを担当するAI専門家です。
前フェーズ（${PHASES[currentPhase].name}）で確立された文脈を引き継いでください。

## 📋 前フェーズの成果・文脈情報

\`\`\`yaml
${contextContent}
\`\`\`

## 🎯 今フェーズでのあなたの責務

${getPhaseResponsibilities(nextPhase)}

## 📝 文脈継承確認

以下を確認してから作業を開始してください：
- [ ] 前フェーズの重要決定事項を理解しました
- [ ] 制約条件を把握しました  
- [ ] 学習パターンを認識しました
- [ ] 今フェーズの重点項目を把握しました

## 🤝 協働開始

これらの文脈を踏まえて、${PHASES[nextPhase].name}フェーズを開始してください。
不明点や追加で必要な情報があれば、遠慮なく質問してください。

準備が整いましたら「文脈継承完了、${PHASES[nextPhase].name}を開始します」と返答してください。
`;

    const promptDir = path.join(process.cwd(), 'docs', 'ai-context');
    const promptFile = path.join(promptDir, `handoff-prompt-${nextPhase}.md`);
    await fs.writeFile(promptFile, prompt);
    
    console.log(chalk.green(`✅ 文脈継承プロンプトを生成しました: ${promptFile}`));
    console.log(chalk.cyan('💡 このプロンプトをAIツールにコピペして使用してください'));
    
  } catch (error) {
    console.log(chalk.red(`❌ 前フェーズの文脈ファイルが見つかりません: ${error.message}`));
  }
}

/**
 * フェーズ別責務取得
 */
function getPhaseResponsibilities(phase) {
  const responsibilities = {
    'poc': `
- 技術的実現可能性の検証
- アーキテクチャ選択肢の提示と評価
- 主要技術リスクの早期発見
- プロトタイプの設計・実装支援
- 本実装への移行判断材料の提供`,
    
    'implementation': `
- 本番品質コードの実装支援
- アーキテクチャ設計の詳細化
- コーディング標準の遵守確認
- テスト実装の支援
- パフォーマンス・セキュリティ考慮`,
    
    'review': `
- コード品質の包括的レビュー
- セキュリティ脆弱性の検出
- パフォーマンス最適化の提案
- 保守性・拡張性の評価
- ベストプラクティスの共有`,
    
    'testing': `
- テストケース設計・生成
- テストデータの作成支援
- テスト自動化の実装支援
- パフォーマンステストの設計
- デプロイメント戦略の検討`
  };
  
  return responsibilities[phase] || '- フェーズ固有の責務を確認してください';
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
