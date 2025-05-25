const fs = require('fs-extra');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const chalk = require('chalk');

/**
 * ワークフロー効果測定・分析スクリプト
 * GitHub API を使用してメトリクスを収集し、分析レポートを生成
 */

class WorkflowMetricsCollector {
  constructor(githubToken, owner, repo) {
    this.octokit = new Octokit({ auth: githubToken });
    this.owner = owner;
    this.repo = repo;
    this.metricsDir = path.join(process.cwd(), 'docs', 'metrics');
  }

  async initialize() {
    await fs.ensureDir(this.metricsDir);
  }

  /**
   * フェーズ別メトリクス収集
   */
  async collectPhaseMetrics(startDate, endDate) {
    console.log(chalk.yellow('📊 フェーズ別メトリクス収集中...'));

    try {
      const issues = await this.octokit.rest.issues.listForRepo({
        owner: this.owner,
        repo: this.repo,
        state: 'all',
        since: startDate,
        per_page: 100
      });

      const phaseMetrics = {
        requirements: { count: 0, avgDuration: 0, completed: 0 },
        poc: { count: 0, avgDuration: 0, completed: 0 },
        implementation: { count: 0, avgDuration: 0, completed: 0 },
        review: { count: 0, avgDuration: 0, completed: 0 },
        testing: { count: 0, avgDuration: 0, completed: 0 }
      };

      for (const issue of issues.data) {
        const phase = this.detectPhaseFromLabels(issue.labels);
        if (phase && phaseMetrics[phase]) {
          phaseMetrics[phase].count++;
          
          if (issue.state === 'closed') {
            phaseMetrics[phase].completed++;
            const duration = this.calculateDuration(issue.created_at, issue.closed_at);
            phaseMetrics[phase].avgDuration += duration;
          }
        }
      }

      // 平均期間の計算
      Object.keys(phaseMetrics).forEach(phase => {
        if (phaseMetrics[phase].completed > 0) {
          phaseMetrics[phase].avgDuration = 
            phaseMetrics[phase].avgDuration / phaseMetrics[phase].completed;
        }
      });

      return phaseMetrics;
    } catch (error) {
      console.error(chalk.red('❌ フェーズメトリクス収集エラー:'), error.message);
      return null;
    }
  }

  /**
   * Pull Request メトリクス収集
   */
  async collectPRMetrics(startDate, endDate) {
    console.log(chalk.yellow('🔄 Pull Request メトリクス収集中...'));

    try {
      const prs = await this.octokit.rest.pulls.list({
        owner: this.owner,
        repo: this.repo,
        state: 'all',
        per_page: 100
      });

      const prMetrics = {
        totalPRs: 0,
        mergedPRs: 0,
        avgReviewTime: 0,
        avgLinesChanged: 0,
        avgCommits: 0,
        reviewEfficiency: 0
      };

      let totalReviewTime = 0;
      let totalLines = 0;
      let totalCommits = 0;
      let totalReviews = 0;

      for (const pr of prs.data) {
        if (new Date(pr.created_at) >= new Date(startDate)) {
          prMetrics.totalPRs++;

          if (pr.merged_at) {
            prMetrics.mergedPRs++;
            const reviewTime = this.calculateDuration(pr.created_at, pr.merged_at);
            totalReviewTime += reviewTime;
          }

          // PR詳細情報取得
          const prDetails = await this.octokit.rest.pulls.get({
            owner: this.owner,
            repo: this.repo,
            pull_number: pr.number
          });

          totalLines += prDetails.data.additions + prDetails.data.deletions;
          totalCommits += prDetails.data.commits;

          // レビューコメント数取得
          const reviews = await this.octokit.rest.pulls.listReviews({
            owner: this.owner,
            repo: this.repo,
            pull_number: pr.number
          });
          totalReviews += reviews.data.length;
        }
      }

      if (prMetrics.mergedPRs > 0) {
        prMetrics.avgReviewTime = totalReviewTime / prMetrics.mergedPRs;
        prMetrics.avgLinesChanged = totalLines / prMetrics.totalPRs;
        prMetrics.avgCommits = totalCommits / prMetrics.totalPRs;
        prMetrics.reviewEfficiency = totalReviews / prMetrics.totalPRs;
      }

      return prMetrics;
    } catch (error) {
      console.error(chalk.red('❌ PRメトリクス収集エラー:'), error.message);
      return null;
    }
  }

  /**
   * AI活用メトリクス収集
   */
  async collectAIUsageMetrics() {
    console.log(chalk.yellow('🤖 AI活用メトリクス収集中...'));

    try {
      // コミットメッセージからAI関連の活動を検出
      const commits = await this.octokit.rest.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        per_page: 100
      });

      const aiMetrics = {
        aiGeneratedCommits: 0,
        copilotMentions: 0,
        aiToolMentions: {
          'copilot': 0,
          'claude': 0,
          'chatgpt': 0,
          'windsurf': 0,
          'cursor': 0
        },
        totalCommits: commits.data.length
      };

      for (const commit of commits.data) {
        const message = commit.commit.message.toLowerCase();
        
        // AI生成を示すキーワード検出
        if (message.includes('[ai') || message.includes('copilot') || 
            message.includes('generated') || message.includes('ai:')) {
          aiMetrics.aiGeneratedCommits++;
        }

        // 各AIツールの言及回数
        Object.keys(aiMetrics.aiToolMentions).forEach(tool => {
          if (message.includes(tool)) {
            aiMetrics.aiToolMentions[tool]++;
          }
        });
      }

      // AI文脈継承ファイルの確認
      const contextDir = path.join(process.cwd(), 'docs', 'ai-context');
      let contextFiles = 0;
      try {
        const files = await fs.readdir(contextDir);
        contextFiles = files.filter(f => f.endsWith('.yml')).length;
      } catch (error) {
        // ディレクトリが存在しない場合は0
      }

      aiMetrics.contextInheritanceFiles = contextFiles;

      return aiMetrics;
    } catch (error) {
      console.error(chalk.red('❌ AI活用メトリクス収集エラー:'), error.message);
      return null;
    }
  }

  /**
   * 品質メトリクス収集
   */
  async collectQualityMetrics() {
    console.log(chalk.yellow('🔍 品質メトリクス収集中...'));

    try {
      // Issuesから品質関連の情報を収集
      const issues = await this.octokit.rest.issues.listForRepo({
        owner: this.owner,
        repo: this.repo,
        labels: 'bug',
        state: 'all',
        per_page: 100
      });

      const qualityMetrics = {
        totalBugs: issues.data.length,
        openBugs: issues.data.filter(issue => issue.state === 'open').length,
        closedBugs: issues.data.filter(issue => issue.state === 'closed').length,
        avgBugFixTime: 0
      };

      // バグ修正時間の計算
      let totalFixTime = 0;
      let fixedBugs = 0;

      for (const bug of issues.data) {
        if (bug.state === 'closed' && bug.closed_at) {
          const fixTime = this.calculateDuration(bug.created_at, bug.closed_at);
          totalFixTime += fixTime;
          fixedBugs++;
        }
      }

      if (fixedBugs > 0) {
        qualityMetrics.avgBugFixTime = totalFixTime / fixedBugs;
      }

      return qualityMetrics;
    } catch (error) {
      console.error(chalk.red('❌ 品質メトリクス収集エラー:'), error.message);
      return null;
    }
  }

  /**
   * 総合レポート生成
   */
  async generateReport(startDate, endDate) {
    console.log(chalk.blue('\n📈 ワークフロー効果測定レポート生成中...'));

    await this.initialize();

    const [phaseMetrics, prMetrics, aiMetrics, qualityMetrics] = await Promise.all([
      this.collectPhaseMetrics(startDate, endDate),
      this.collectPRMetrics(startDate, endDate),
      this.collectAIUsageMetrics(),
      this.collectQualityMetrics()
    ]);

    const report = this.formatReport({
      period: { start: startDate, end: endDate },
      phase: phaseMetrics,
      pullRequest: prMetrics,
      aiUsage: aiMetrics,
      quality: qualityMetrics,
      generatedAt: new Date().toISOString()
    });

    // レポートファイル保存
    const reportFile = path.join(
      this.metricsDir, 
      `workflow-metrics-${new Date().toISOString().split('T')[0]}.md`
    );
    await fs.writeFile(reportFile, report);

    console.log(chalk.green(`✅ レポートを生成しました: ${reportFile}`));
    return reportFile;
  }

  /**
   * レポートフォーマット
   */
  formatReport(data) {
    return `# ワークフロー効果測定レポート

**期間**: ${data.period.start} ～ ${data.period.end}
**生成日時**: ${data.generatedAt}

## 📊 サマリー

### フェーズ別パフォーマンス
| フェーズ | 総数 | 完了数 | 完了率 | 平均期間 |
|---------|------|-------|-------|---------|
| 要件定義 | ${data.phase?.requirements?.count || 0} | ${data.phase?.requirements?.completed || 0} | ${this.calculatePercentage(data.phase?.requirements?.completed, data.phase?.requirements?.count)}% | ${this.formatDuration(data.phase?.requirements?.avgDuration)} |
| PoC | ${data.phase?.poc?.count || 0} | ${data.phase?.poc?.completed || 0} | ${this.calculatePercentage(data.phase?.poc?.completed, data.phase?.poc?.count)}% | ${this.formatDuration(data.phase?.poc?.avgDuration)} |
| 実装 | ${data.phase?.implementation?.count || 0} | ${data.phase?.implementation?.completed || 0} | ${this.calculatePercentage(data.phase?.implementation?.completed, data.phase?.implementation?.count)}% | ${this.formatDuration(data.phase?.implementation?.avgDuration)} |
| レビュー | ${data.phase?.review?.count || 0} | ${data.phase?.review?.completed || 0} | ${this.calculatePercentage(data.phase?.review?.completed, data.phase?.review?.count)}% | ${this.formatDuration(data.phase?.review?.avgDuration)} |
| テスト | ${data.phase?.testing?.count || 0} | ${data.phase?.testing?.completed || 0} | ${this.calculatePercentage(data.phase?.testing?.completed, data.phase?.testing?.count)}% | ${this.formatDuration(data.phase?.testing?.avgDuration)} |

### Pull Request 効率性
- **総PR数**: ${data.pullRequest?.totalPRs || 0}
- **マージ率**: ${this.calculatePercentage(data.pullRequest?.mergedPRs, data.pullRequest?.totalPRs)}%
- **平均レビュー時間**: ${this.formatDuration(data.pullRequest?.avgReviewTime)}
- **平均変更行数**: ${Math.round(data.pullRequest?.avgLinesChanged || 0)} 行
- **平均コミット数**: ${Math.round(data.pullRequest?.avgCommits || 0)} 個

### AI活用状況
- **AI生成コミット割合**: ${this.calculatePercentage(data.aiUsage?.aiGeneratedCommits, data.aiUsage?.totalCommits)}%
- **文脈継承ファイル数**: ${data.aiUsage?.contextInheritanceFiles || 0}

#### AIツール別活用度
${Object.entries(data.aiUsage?.aiToolMentions || {}).map(([tool, count]) => 
  `- **${tool}**: ${count} 回`
).join('\n')}

### 品質メトリクス
- **総バグ数**: ${data.quality?.totalBugs || 0}
- **未解決バグ**: ${data.quality?.openBugs || 0}
- **解決バグ**: ${data.quality?.closedBugs || 0}
- **平均バグ修正時間**: ${this.formatDuration(data.quality?.avgBugFixTime)}

## 📈 改善提案

### 高パフォーマンス領域
${this.generateImprovementSuggestions(data).strengths.map(s => `- ✅ ${s}`).join('\n')}

### 改善機会
${this.generateImprovementSuggestions(data).improvements.map(i => `- 🔄 ${i}`).join('\n')}

## 🎯 次のアクション

${this.generateActionItems(data).map(action => `- [ ] ${action}`).join('\n')}

---
*このレポートは AI Development Workflow Template の効果測定機能により自動生成されました。*
`;
  }

  /**
   * ヘルパーメソッド
   */
  detectPhaseFromLabels(labels) {
    const labelNames = labels.map(label => label.name.toLowerCase());
    
    if (labelNames.some(label => label.includes('requirements') || label.includes('要件'))) return 'requirements';
    if (labelNames.some(label => label.includes('poc'))) return 'poc';
    if (labelNames.some(label => label.includes('implementation') || label.includes('実装'))) return 'implementation';
    if (labelNames.some(label => label.includes('review') || label.includes('レビュー'))) return 'review';
    if (labelNames.some(label => label.includes('testing') || label.includes('テスト'))) return 'testing';
    
    return null;
  }

  calculateDuration(startDate, endDate) {
    return (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24); // 日数
  }

  formatDuration(days) {
    if (!days) return '未計測';
    return `${Math.round(days * 10) / 10} 日`;
  }

  calculatePercentage(numerator, denominator) {
    if (!denominator || denominator === 0) return 0;
    return Math.round((numerator / denominator) * 100);
  }

  generateImprovementSuggestions(data) {
    const strengths = [];
    const improvements = [];

    // フェーズ効率性の評価
    if (data.phase?.requirements?.avgDuration <= 3) {
      strengths.push('要件定義フェーズの効率性が高い');
    } else if (data.phase?.requirements?.avgDuration > 5) {
      improvements.push('要件定義フェーズの期間短縮を検討');
    }

    // AI活用率の評価
    const aiUsageRate = this.calculatePercentage(
      data.aiUsage?.aiGeneratedCommits, 
      data.aiUsage?.totalCommits
    );
    if (aiUsageRate >= 30) {
      strengths.push('AI活用率が高く、生産性向上に寄与');
    } else if (aiUsageRate < 15) {
      improvements.push('AI活用率を向上させる余地あり');
    }

    // 品質の評価
    if (data.quality?.avgBugFixTime <= 2) {
      strengths.push('バグ修正の迅速性が高い');
    } else if (data.quality?.avgBugFixTime > 5) {
      improvements.push('バグ修正プロセスの効率化が必要');
    }

    return { strengths, improvements };
  }

  generateActionItems(data) {
    const actions = [];

    // 基本的なアクション項目
    actions.push('週次メトリクスレビューの実施');
    actions.push('チームでの振り返り会議開催');

    // データに基づく具体的なアクション
    if (data.aiUsage?.contextInheritanceFiles < 3) {
      actions.push('AI文脈継承の活用促進');
    }

    const aiUsageRate = this.calculatePercentage(
      data.aiUsage?.aiGeneratedCommits, 
      data.aiUsage?.totalCommits
    );
    if (aiUsageRate < 20) {
      actions.push('AIツール活用研修の実施');
    }

    if (data.quality?.openBugs > 5) {
      actions.push('未解決バグの優先度見直し');
    }

    return actions;
  }
}

module.exports = WorkflowMetricsCollector;

// CLI実行時
if (require.main === module) {
  const githubToken = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || 'your-username';
  const repo = process.env.GITHUB_REPO || 'your-repo';

  if (!githubToken) {
    console.error(chalk.red('❌ GITHUB_TOKEN環境変数が設定されていません'));
    process.exit(1);
  }

  const collector = new WorkflowMetricsCollector(githubToken, owner, repo);
  
  // 過去30日間のメトリクス収集
  const endDate = new Date().toISOString();
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  collector.generateReport(startDate, endDate)
    .then(reportFile => {
      console.log(chalk.green(`\n✅ メトリクス収集完了: ${reportFile}`));
    })
    .catch(error => {
      console.error(chalk.red('❌ メトリクス収集エラー:'), error);
    });
}
