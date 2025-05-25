const fs = require('fs');
const yaml = require('js-yaml');
const { program } = require('commander');

program
  .option('--context-file <file>', 'AI文脈ファイルのパス')
  .option('--phase <phase>', '評価対象フェーズ')
  .parse();

const options = program.opts();

/**
 * AI文脈の品質を評価する
 */
async function evaluateContextQuality() {
  try {
    const contextFile = options.contextFile || `docs/ai-context/ai-context-${options.phase}.yml`;
    
    if (!fs.existsSync(contextFile)) {
      console.error(`文脈ファイルが見つかりません: ${contextFile}`);
      process.exit(1);
    }
    
    const contextData = yaml.load(fs.readFileSync(contextFile, 'utf8'));
    const qualityScore = calculateQualityScore(contextData);
    
    // 品質レポート生成
    const qualityReport = {
      file: contextFile,
      phase: options.phase,
      evaluated_at: new Date().toISOString(),
      overall_score: qualityScore.overall,
      detailed_scores: qualityScore.details,
      recommendations: generateRecommendations(qualityScore.details),
      quality_grade: getQualityGrade(qualityScore.overall)
    };
    
    // 品質レポート保存
    const reportFile = `docs/ai-context/quality-reports/quality-${options.phase}-${Date.now()}.yml`;
    fs.mkdirSync('docs/ai-context/quality-reports', { recursive: true });
    fs.writeFileSync(reportFile, yaml.dump(qualityReport));
    
    // 品質サマリー更新
    await updateQualitySummary(qualityReport);
    
    console.log(`\n🎯 AI文脈品質評価完了`);
    console.log(`ファイル: ${contextFile}`);
    console.log(`総合スコア: ${qualityScore.overall}/100`);
    console.log(`品質グレード: ${qualityReport.quality_grade}`);
    console.log(`詳細レポート: ${reportFile}`);
    
    // GitHub ActionsでOutputを設定
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::set-output name=quality-score::${qualityScore.overall}`);
      console.log(`::set-output name=quality-grade::${qualityReport.quality_grade}`);
      console.log(`::set-output name=needs-improvement::${qualityScore.overall < 70}`);
    }
    
  } catch (error) {
    console.error('品質評価エラー:', error);
    process.exit(1);
  }
}

/**
 * 文脈データの品質スコアを計算
 */
function calculateQualityScore(contextData) {
  const details = {};
  let totalScore = 0;
  let maxScore = 0;
  
  // 1. 重要決定事項の質 (25点満点)
  details.key_decisions = evaluateKeyDecisions(contextData.key_decisions || []);
  totalScore += details.key_decisions;
  maxScore += 25;
  
  // 2. 制約条件の明確性 (20点満点)
  details.constraints = evaluateConstraints(contextData.critical_constraints || []);
  totalScore += details.constraints;
  maxScore += 20;
  
  // 3. 学習パターンの有用性 (20点満点)
  details.learned_patterns = evaluateLearnedPatterns(contextData.learned_patterns || []);
  totalScore += details.learned_patterns;
  maxScore += 20;
  
  // 4. 技術情報の完全性 (15点満点)
  details.technical_artifacts = evaluateTechnicalArtifacts(contextData.technical_artifacts || []);
  totalScore += details.technical_artifacts;
  maxScore += 15;
  
  // 5. 次フェーズ指針の具体性 (20点満点)
  details.next_phase_focus = evaluateNextPhaseFocus(contextData.next_phase_focus || []);
  totalScore += details.next_phase_focus;
  maxScore += 20;
  
  const overall = Math.round((totalScore / maxScore) * 100);
  
  return {
    overall,
    details: {
      ...details,
      total_score: totalScore,
      max_score: maxScore
    }
  };
}

/**
 * 重要決定事項の評価
 */
function evaluateKeyDecisions(decisions) {
  if (!Array.isArray(decisions) || decisions.length === 0) return 0;
  
  let score = 0;
  const maxPerDecision = 5;
  const maxDecisions = 5;
  
  for (let i = 0; i < Math.min(decisions.length, maxDecisions); i++) {
    const decision = decisions[i];
    let decisionScore = 0;
    
    // 決定内容の記述があるか (2点)
    if (decision.decision && decision.decision.length > 10) {
      decisionScore += 2;
    }
    
    // 理由・根拠があるか (2点)
    if (decision.reasoning && decision.reasoning.length > 10) {
      decisionScore += 2;
    }
    
    // 影響範囲が明記されているか (1点)
    if (decision.impact && decision.impact.length > 5) {
      decisionScore += 1;
    }
    
    score += decisionScore;
  }
  
  return score;
}

/**
 * 制約条件の評価
 */
function evaluateConstraints(constraints) {
  if (!Array.isArray(constraints) || constraints.length === 0) return 0;
  
  let score = 0;
  const maxPerConstraint = 4;
  const maxConstraints = 5;
  
  for (let i = 0; i < Math.min(constraints.length, maxConstraints); i++) {
    const constraint = constraints[i];
    let constraintScore = 0;
    
    // タイプが分類されているか (1点)
    if (constraint.type) {
      constraintScore += 1;
    }
    
    // 具体的な説明があるか (3点)
    if (constraint.description && constraint.description.length > 15) {
      constraintScore += 3;
    }
    
    score += constraintScore;
  }
  
  return score;
}

/**
 * 学習パターンの評価
 */
function evaluateLearnedPatterns(patterns) {
  if (!Array.isArray(patterns) || patterns.length === 0) return 0;
  
  let score = 0;
  const maxPerPattern = 4;
  const maxPatterns = 5;
  
  for (let i = 0; i < Math.min(patterns.length, maxPatterns); i++) {
    const pattern = patterns[i];
    let patternScore = 0;
    
    // パターンの記述があるか (2点)
    if (pattern.pattern && pattern.pattern.length > 10) {
      patternScore += 2;
    }
    
    // 根拠・証拠があるか (2点)
    if (pattern.evidence && pattern.evidence.length > 5) {
      patternScore += 2;
    }
    
    score += patternScore;
  }
  
  return score;
}

/**
 * 技術情報の評価
 */
function evaluateTechnicalArtifacts(artifacts) {
  if (!Array.isArray(artifacts) || artifacts.length === 0) return 0;
  
  let score = 0;
  const bonusPoints = {
    'code_block': 3,
    'config_file': 2,
    'architecture_diagram': 4,
    'api_spec': 3,
    'database_schema': 3
  };
  
  for (const artifact of artifacts) {
    if (artifact.type && bonusPoints[artifact.type]) {
      score += bonusPoints[artifact.type];
    }
    
    if (artifact.content && artifact.content.length > 20) {
      score += 1;
    }
  }
  
  return Math.min(score, 15); // 最大15点
}

/**
 * 次フェーズ指針の評価
 */
function evaluateNextPhaseFocus(focusItems) {
  if (!Array.isArray(focusItems) || focusItems.length === 0) return 0;
  
  let score = 0;
  const pointPerItem = 4;
  const maxItems = 5;
  
  for (let i = 0; i < Math.min(focusItems.length, maxItems); i++) {
    const item = focusItems[i];
    
    if (typeof item === 'string' && item.length > 10) {
      score += pointPerItem;
    }
  }
  
  return score;
}

/**
 * 改善提案を生成
 */
function generateRecommendations(scores) {
  const recommendations = [];
  
  if (scores.key_decisions < 15) {
    recommendations.push("重要決定事項に理由と影響範囲を詳しく記述してください");
  }
  
  if (scores.constraints < 12) {
    recommendations.push("制約条件をタイプ別に分類し、具体的な説明を追加してください");
  }
  
  if (scores.learned_patterns < 12) {
    recommendations.push("学習パターンに根拠・証拠を含めてください");
  }
  
  if (scores.technical_artifacts < 8) {
    recommendations.push("技術的アーティファクト（コード、設定、図表）を追加してください");
  }
  
  if (scores.next_phase_focus < 12) {
    recommendations.push("次フェーズの重点項目をより具体的に記述してください");
  }
  
  return recommendations;
}

/**
 * 品質グレードを決定
 */
function getQualityGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

/**
 * 品質サマリーを更新
 */
async function updateQualitySummary(qualityReport) {
  const summaryFile = 'docs/ai-context/quality-summary.yml';
  let summary = {};
  
  if (fs.existsSync(summaryFile)) {
    summary = yaml.load(fs.readFileSync(summaryFile, 'utf8')) || {};
  }
  
  if (!summary.phases) summary.phases = {};
  if (!summary.history) summary.history = [];
  
  // 最新の品質情報を更新
  summary.phases[qualityReport.phase] = {
    latest_score: qualityReport.overall_score,
    latest_grade: qualityReport.quality_grade,
    last_evaluated: qualityReport.evaluated_at,
    needs_improvement: qualityReport.overall_score < 70
  };
  
  // 履歴を追加
  summary.history.unshift({
    phase: qualityReport.phase,
    score: qualityReport.overall_score,
    grade: qualityReport.quality_grade,
    evaluated_at: qualityReport.evaluated_at
  });
  
  // 履歴は最新20件まで保持
  summary.history = summary.history.slice(0, 20);
  
  // 全体統計を計算
  const phaseScores = Object.values(summary.phases).map(p => p.latest_score);
  summary.overall_stats = {
    average_score: Math.round(phaseScores.reduce((a, b) => a + b, 0) / phaseScores.length),
    phases_completed: phaseScores.length,
    high_quality_phases: phaseScores.filter(score => score >= 80).length,
    needs_improvement_phases: phaseScores.filter(score => score < 70).length
  };
  
  fs.writeFileSync(summaryFile, yaml.dump(summary));
}

if (require.main === module) {
  evaluateContextQuality();
}

module.exports = {
  evaluateContextQuality,
  calculateQualityScore
};
