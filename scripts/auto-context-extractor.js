#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { program } = require('commander');

/**
 * GitHub Issue/PRから自動的に文脈情報を抽出し、構造化データとして保存
 */

program
  .option('--phase <phase>', 'Current phase')
  .option('--issue-number <number>', 'Issue number')
  .option('--issue-title <title>', 'Issue title')
  .option('--issue-body <body>', 'Issue body')
  .option('--repository <repo>', 'Repository name')
  .parse();

const options = program.opts();

async function extractContextFromIssue() {
  console.log(`🔍 Extracting context from ${options.phase} phase issue #${options.issueNumber}`);
  
  const contextDir = path.join(process.cwd(), 'docs', 'ai-context');
  await fs.ensureDir(contextDir);
  
  // AIを使って構造化された文脈情報を抽出
  const extractedContext = await extractStructuredContext(options.issueBody);
  
  // 文脈ファイル生成
  const contextData = {
    phase: options.phase,
    completion_date: new Date().toISOString().split('T')[0],
    issue_reference: `#${options.issueNumber}`,
    repository: options.repository,
    ai_tools_used: extractAITools(options.issueBody),
    key_decisions: extractedContext.decisions,
    critical_constraints: extractedContext.constraints,
    learned_patterns: extractedContext.patterns,
    next_phase_focus: extractedContext.nextFocus,
    technical_artifacts: extractTechnicalArtifacts(options.issueBody),
    quality_metrics: extractQualityMetrics(options.issueBody)
  };
  
  const contextFile = path.join(contextDir, `ai-context-${options.phase}.yml`);
  await fs.writeFile(contextFile, yaml.dump(contextData, { indent: 2 }));
  
  console.log(`✅ Context saved to ${contextFile}`);
  
  // 次フェーズが必要かどうかを判定
  const nextPhase = getNextPhase(options.phase);
  if (nextPhase) {
    await fs.outputFile('temp/next-phase-needed.txt', nextPhase);
    console.log(`::set-output name=next-phase-needed::true`);
    console.log(`::set-output name=next-phase::${nextPhase}`);
  }
  
  console.log(`::set-output name=success::true`);
}

async function extractStructuredContext(issueBody) {
  // Issue本文から重要な情報を抽出するロジック
  const decisions = extractDecisions(issueBody);
  const constraints = extractConstraints(issueBody);
  const patterns = extractPatterns(issueBody);
  const nextFocus = extractNextFocus(issueBody);
  
  return { decisions, constraints, patterns, nextFocus };
}

function extractDecisions(text) {
  const decisions = [];
  
  // マークダウンセクションから決定事項を抽出
  const decisionPatterns = [
    /## 決定事項\s*\n([\s\S]*?)(?=\n##|$)/gi,
    /## 重要な判断\s*\n([\s\S]*?)(?=\n##|$)/gi,
    /### 技術選択\s*\n([\s\S]*?)(?=\n##|$)/gi
  ];
  
  decisionPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const items = extractListItems(match);
        items.forEach(item => {
          if (item.trim()) {
            decisions.push({
              decision: item.trim(),
              reasoning: "Extracted from issue description",
              impact: "To be determined"
            });
          }
        });
      });
    }
  });
  
  return decisions;
}

function extractConstraints(text) {
  const constraints = [];
  
  // 制約条件の抽出パターン
  const constraintPatterns = [
    /制約|制限|要件|条件/gi
  ];
  
  const lines = text.split('\n');
  lines.forEach(line => {
    constraintPatterns.forEach(pattern => {
      if (pattern.test(line) && line.includes('- ')) {
        constraints.push({
          type: "requirement",
          description: line.replace(/^- /, '').trim()
        });
      }
    });
  });
  
  return constraints;
}

function extractPatterns(text) {
  const patterns = [];
  
  // 学習パターンの抽出
  const patternKeywords = [
    '学習', '気づき', '発見', 'パターン', 'トレンド'
  ];
  
  const lines = text.split('\n');
  lines.forEach(line => {
    patternKeywords.forEach(keyword => {
      if (line.includes(keyword) && line.includes('- ')) {
        patterns.push({
          pattern: line.replace(/^- /, '').trim(),
          evidence: "Extracted from issue discussion"
        });
      }
    });
  });
  
  return patterns;
}

function extractNextFocus(text) {
  const focus = [];
  
  // 次フェーズへのフォーカス抽出
  const focusPatterns = [
    /## 次のステップ\s*\n([\s\S]*?)(?=\n##|$)/gi,
    /## Next Steps\s*\n([\s\S]*?)(?=\n##|$)/gi,
    /次フェーズ|次の段階/gi
  ];
  
  focusPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const items = extractListItems(match);
        focus.push(...items.filter(item => item.trim()));
      });
    }
  });
  
  return focus;
}

function extractListItems(text) {
  const items = [];
  const lines = text.split('\n');
  
  lines.forEach(line => {
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      items.push(line.replace(/^[\s\-\*]+/, '').trim());
    }
  });
  
  return items;
}

function extractAITools(text) {
  const tools = [];
  const toolPatterns = [
    /GitHub Copilot/gi,
    /Claude/gi,
    /ChatGPT/gi,
    /Windsurf/gi,
    /Cursor/gi,
    /Gemini/gi
  ];
  
  toolPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match && !tools.includes(match[0].toLowerCase())) {
        tools.push(match[0].toLowerCase());
      }
    }
  });
  
  return tools;
}

function extractTechnicalArtifacts(text) {
  const artifacts = [];
  
  // コードブロック、ファイル参照、リンクを抽出
  const codeBlocks = text.match(/```[\s\S]*?```/g) || [];
  const fileReferences = text.match(/`[^`]+\.(js|ts|py|md|yml|json)`/g) || [];
  const links = text.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  
  artifacts.push(...codeBlocks.map(block => ({ type: 'code_block', content: block })));
  artifacts.push(...fileReferences.map(ref => ({ type: 'file_reference', content: ref })));
  artifacts.push(...links.map(link => ({ type: 'reference_link', content: link })));
  
  return artifacts;
}

function extractQualityMetrics(text) {
  const metrics = {};
  
  // 品質関連のメトリクスを抽出
  const metricPatterns = [
    /カバレッジ[\s:：]*(\d+(?:\.\d+)?%?)/gi,
    /テスト[\s:：]*(\d+)\s*件/gi,
    /バグ[\s:：]*(\d+)\s*件/gi,
    /レビュー[\s:：]*(\d+)\s*回/gi
  ];
  
  metricPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const [full, value] = match.match(/(\d+(?:\.\d+)?%?)/) || [];
        if (value) {
          if (match.includes('カバレッジ')) metrics.coverage = value;
          if (match.includes('テスト')) metrics.test_count = value;
          if (match.includes('バグ')) metrics.bug_count = value;
          if (match.includes('レビュー')) metrics.review_count = value;
        }
      });
    }
  });
  
  return metrics;
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
  extractContextFromIssue().catch(console.error);
}

module.exports = { extractContextFromIssue };
