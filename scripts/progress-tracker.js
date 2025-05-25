const fs = require('fs');
const yaml = require('js-yaml');
const { program } = require('commander');
const { Octokit } = require('@octokit/rest');

program
  .option('--token <token>', 'GitHub Personal Access Token')
  .option('--repository <repo>', 'Repository (owner/repo)')
  .option('--output-format <format>', 'Output format (json|yaml|console)', 'console')
  .parse();

const options = program.opts();

/**
 * プロジェクト進捗を追跡・更新
 */
async function trackProgress() {
  try {
    const octokit = new Octokit({
      auth: options.token || process.env.GITHUB_TOKEN
    });
    
    const [owner, repo] = (options.repository || process.env.GITHUB_REPOSITORY || '').split('/');
    
    if (!owner || !repo) {
      console.error('リポジトリが指定されていません');
      process.exit(1);
    }
    
    console.log(`📊 プロジェクト進捗追跡開始: ${owner}/${repo}`);
    
    // Issues とPull Requestsを取得
    const [issues, pullRequests] = await Promise.all([
      getAllIssues(octokit, owner, repo),
      getAllPullRequests(octokit, owner, repo)
    ]);
    
    // 進捗データを分析
    const progressData = analyzeProgress(issues, pullRequests);
    
    // AI文脈品質データを追加
    const qualityData = loadQualityData();
    progressData.quality_metrics = qualityData;
    
    // タイムライン分析
    progressData.timeline = analyzeTimeline(issues, pullRequests);
    
    // ボトルネック分析
    progressData.bottlenecks = analyzeBottlenecks(issues, pullRequests);
    
    // 出力
    await outputProgress(progressData);
    
    // ファイルに保存
    await saveProgressData(progressData);
    
    console.log('✅ 進捗追跡完了');
    
  } catch (error) {
    console.error('進捗追跡エラー:', error);
    process.exit(1);
  }
}

/**
 * 全てのIssuesを取得
 */
async function getAllIssues(octokit, owner, repo) {
  const issues = [];
  let page = 1;
  
  while (true) {
    const response = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      per_page: 100,
      page
    });
    
    issues.push(...response.data.filter(issue => !issue.pull_request));
    
    if (response.data.length < 100) break;
    page++;
  }
  
  return issues;
}

/**
 * 全てのPull Requestsを取得
 */
async function getAllPullRequests(octokit, owner, repo) {
  const pullRequests = [];
  let page = 1;
  
  while (true) {
    const response = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 100,
      page
    });
    
    pullRequests.push(...response.data);
    
    if (response.data.length < 100) break;
    page++;
  }
  
  return pullRequests;
}

/**
 * 進捗データを分析
 */
function analyzeProgress(issues, pullRequests) {
  const phases = {
    requirements: { total: 0, completed: 0, in_progress: 0, blocked: 0 },
    poc: { total: 0, completed: 0, in_progress: 0, blocked: 0 },
    implementation: { total: 0, completed: 0, in_progress: 0, blocked: 0 },
    review: { total: 0, completed: 0, in_progress: 0, blocked: 0 },
    testing: { total: 0, completed: 0, in_progress: 0, blocked: 0 }
  };
  
  const phaseMappings = {
    'phase:requirements': 'requirements',
    'phase:poc': 'poc',
    'phase:implementation': 'implementation',
    'phase:review': 'review',
    'phase:testing': 'testing'
  };
  
  // Issues分析
  for (const issue of issues) {
    const phaseLabel = issue.labels.find(label => phaseMappings[label.name]);
    if (phaseLabel) {
      const phase = phaseMappings[phaseLabel.name];
      phases[phase].total++;
      
      if (issue.state === 'closed') {
        phases[phase].completed++;
      } else {
        // ブロック状態チェック
        const isBlocked = issue.labels.some(label => 
          label.name.includes('blocked') || label.name.includes('waiting')
        );
        
        if (isBlocked) {
          phases[phase].blocked++;
        } else {
          phases[phase].in_progress++;
        }
      }
    }
  }
  
  // Pull Request分析
  const prStats = {
    total: pullRequests.length,
    merged: pullRequests.filter(pr => pr.merged_at).length,
    open: pullRequests.filter(pr => pr.state === 'open').length,
    closed: pullRequests.filter(pr => pr.state === 'closed' && !pr.merged_at).length
  };
  
  // 全体統計
  const totalIssues = Object.values(phases).reduce((sum, phase) => sum + phase.total, 0);
  const completedIssues = Object.values(phases).reduce((sum, phase) => sum + phase.completed, 0);
  const blockedIssues = Object.values(phases).reduce((sum, phase) => sum + phase.blocked, 0);
  
  return {
    updated_at: new Date().toISOString(),
    project_phases: phases,
    pull_request_stats: prStats,
    overall_progress: {
      total_issues: totalIssues,
      completed_issues: completedIssues,
      in_progress_issues: totalIssues - completedIssues - blockedIssues,
      blocked_issues: blockedIssues,
      completion_rate: totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0,
      block_rate: totalIssues > 0 ? Math.round((blockedIssues / totalIssues) * 100) : 0
    }
  };
}

/**
 * タイムライン分析
 */
function analyzeTimeline(issues, pullRequests) {
  const timeline = {};
  const now = new Date();
  
  // 過去30日間のデータを分析
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    timeline[dateStr] = {
      issues_opened: 0,
      issues_closed: 0,
      prs_opened: 0,
      prs_merged: 0
    };
  }
  
  // Issues分析
  for (const issue of issues) {
    const createdDate = new Date(issue.created_at).toISOString().split('T')[0];
    if (timeline[createdDate]) {
      timeline[createdDate].issues_opened++;
    }
    
    if (issue.closed_at) {
      const closedDate = new Date(issue.closed_at).toISOString().split('T')[0];
      if (timeline[closedDate]) {
        timeline[closedDate].issues_closed++;
      }
    }
  }
  
  // Pull Request分析
  for (const pr of pullRequests) {
    const createdDate = new Date(pr.created_at).toISOString().split('T')[0];
    if (timeline[createdDate]) {
      timeline[createdDate].prs_opened++;
    }
    
    if (pr.merged_at) {
      const mergedDate = new Date(pr.merged_at).toISOString().split('T')[0];
      if (timeline[mergedDate]) {
        timeline[mergedDate].prs_merged++;
      }
    }
  }
  
  return timeline;
}

/**
 * ボトルネック分析
 */
function analyzeBottlenecks(issues, pullRequests) {
  const bottlenecks = [];
  
  // 長期間オープンのIssues
  const longOpenIssues = issues.filter(issue => {
    if (issue.state !== 'open') return false;
    const daysSinceCreated = (Date.now() - new Date(issue.created_at)) / (1000 * 60 * 60 * 24);
    return daysSinceCreated > 14; // 14日以上オープン
  });
  
  if (longOpenIssues.length > 0) {
    bottlenecks.push({
      type: 'long_open_issues',
      severity: 'medium',
      count: longOpenIssues.length,
      description: `${longOpenIssues.length}個のIssueが14日以上オープン状態です`,
      items: longOpenIssues.slice(0, 5).map(issue => ({
        title: issue.title,
        url: issue.html_url,
        days_open: Math.floor((Date.now() - new Date(issue.created_at)) / (1000 * 60 * 60 * 24))
      }))
    });
  }
  
  // ブロック状態のIssues
  const blockedIssues = issues.filter(issue => 
    issue.state === 'open' && 
    issue.labels.some(label => label.name.includes('blocked') || label.name.includes('waiting'))
  );
  
  if (blockedIssues.length > 0) {
    bottlenecks.push({
      type: 'blocked_issues',
      severity: 'high',
      count: blockedIssues.length,
      description: `${blockedIssues.length}個のIssueがブロック状態です`,
      items: blockedIssues.slice(0, 5).map(issue => ({
        title: issue.title,
        url: issue.html_url,
        block_labels: issue.labels.filter(label => 
          label.name.includes('blocked') || label.name.includes('waiting')
        ).map(label => label.name)
      }))
    });
  }
  
  // レビュー待ちPR
  const reviewPendingPRs = pullRequests.filter(pr => 
    pr.state === 'open' && 
    pr.requested_reviewers && 
    pr.requested_reviewers.length > 0
  );
  
  if (reviewPendingPRs.length > 0) {
    bottlenecks.push({
      type: 'review_pending_prs',
      severity: 'medium',
      count: reviewPendingPRs.length,
      description: `${reviewPendingPRs.length}個のPRがレビュー待ちです`,
      items: reviewPendingPRs.slice(0, 5).map(pr => ({
        title: pr.title,
        url: pr.html_url,
        requested_reviewers: pr.requested_reviewers.map(reviewer => reviewer.login)
      }))
    });
  }
  
  return bottlenecks;
}

/**
 * AI文脈品質データを読み込み
 */
function loadQualityData() {
  const qualitySummaryFile = 'docs/ai-context/quality-summary.yml';
  
  if (fs.existsSync(qualitySummaryFile)) {
    return yaml.load(fs.readFileSync(qualitySummaryFile, 'utf8'));
  }
  
  return {
    phases: {},
    overall_stats: {
      average_score: 0,
      phases_completed: 0,
      high_quality_phases: 0,
      needs_improvement_phases: 0
    }
  };
}

/**
 * 進捗データを出力
 */
async function outputProgress(progressData) {
  switch (options.outputFormat) {
    case 'json':
      console.log(JSON.stringify(progressData, null, 2));
      break;
      
    case 'yaml':
      console.log(yaml.dump(progressData));
      break;
      
    default: // console
      displayProgressConsole(progressData);
      break;
  }
}

/**
 * コンソール形式で進捗表示
 */
function displayProgressConsole(progressData) {
  console.log('\n📊 プロジェクト進捗レポート');
  console.log('=' .repeat(50));
  
  // 全体進捗
  const overall = progressData.overall_progress;
  console.log(`\n🎯 全体進捗: ${overall.completion_rate}%`);
  console.log(`   完了: ${overall.completed_issues}/${overall.total_issues}`);
  console.log(`   進行中: ${overall.in_progress_issues}`);
  console.log(`   ブロック: ${overall.blocked_issues} (${overall.block_rate}%)`);
  
  // フェーズ別進捗
  console.log('\n📋 フェーズ別進捗:');
  for (const [phase, data] of Object.entries(progressData.project_phases)) {
    const rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
    const status = rate === 100 ? '✅' : rate > 0 ? '🔄' : '⏸️';
    console.log(`   ${status} ${phase}: ${rate}% (${data.completed}/${data.total})`);
    if (data.blocked > 0) {
      console.log(`      ⚠️ ブロック: ${data.blocked}`);
    }
  }
  
  // Pull Request統計
  console.log('\n🔄 Pull Request統計:');
  const prStats = progressData.pull_request_stats;
  console.log(`   総数: ${prStats.total}`);
  console.log(`   マージ済み: ${prStats.merged}`);
  console.log(`   オープン: ${prStats.open}`);
  console.log(`   クローズ: ${prStats.closed}`);
  
  // AI文脈品質
  if (progressData.quality_metrics.overall_stats) {
    const quality = progressData.quality_metrics.overall_stats;
    console.log('\n🤖 AI文脈品質:');
    console.log(`   平均スコア: ${quality.average_score}/100`);
    console.log(`   完了フェーズ: ${quality.phases_completed}`);
    console.log(`   高品質: ${quality.high_quality_phases}`);
    console.log(`   要改善: ${quality.needs_improvement_phases}`);
  }
  
  // ボトルネック
  if (progressData.bottlenecks.length > 0) {
    console.log('\n⚠️ ボトルネック:');
    for (const bottleneck of progressData.bottlenecks) {
      const severity = bottleneck.severity === 'high' ? '🔴' : '🟡';
      console.log(`   ${severity} ${bottleneck.description}`);
    }
  }
  
  console.log(`\n最終更新: ${new Date(progressData.updated_at).toLocaleString('ja-JP')}`);
}

/**
 * 進捗データを保存
 */
async function saveProgressData(progressData) {
  // メインの進捗ファイル
  fs.writeFileSync('docs/ai-context/progress-dashboard.yml', yaml.dump(progressData));
  
  // 履歴用ファイル
  const historyDir = 'docs/ai-context/progress-history';
  fs.mkdirSync(historyDir, { recursive: true });
  
  const timestamp = new Date().toISOString().split('T')[0];
  const historyFile = `${historyDir}/progress-${timestamp}.yml`;
  fs.writeFileSync(historyFile, yaml.dump(progressData));
  
  console.log(`💾 進捗データ保存: progress-dashboard.yml, ${historyFile}`);
}

if (require.main === module) {
  trackProgress();
}

module.exports = {
  trackProgress,
  analyzeProgress
};
