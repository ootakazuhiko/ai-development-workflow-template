# GitHub連携AI開発ワークフロー - 拡張機能ガイド

## 🎯 概要

このドキュメントは、基本的なGitHub連携自動文脈継承システムに追加された拡張機能について説明します。これらの機能により、プロジェクトの品質管理、進捗追跡、チーム連携がより強化されます。

## 🚀 新機能一覧

### 1. 📊 リアルタイム進捗追跡システム
- フェーズ別進捗の自動追跡
- ボトルネック自動検出
- 進捗バッジの自動更新
- タイムライン分析

### 2. 🎯 AI文脈品質評価システム
- 文脈データの自動品質評価
- スコア算出とグレード判定
- 改善提案の自動生成
- 品質履歴の追跡

### 3. 📱 チーム通知システム
- Slack/Teams自動通知
- フェーズ完了時の即座な連絡
- 品質スコア含む詳細レポート
- カスタマイズ可能な通知内容

### 4. 📈 包括的プロジェクト分析
- 全体進捗の可視化
- Pull Request統計
- ブロック要因の特定
- 履歴データの蓄積

## 🔧 設定方法

### 基本設定（必須）

#### 1. GitHub Secrets設定
```bash
# リポジトリの Settings → Secrets and variables → Actions で以下を設定:

GITHUB_TOKEN           # 自動設定済み（通常変更不要）
```

#### 2. 進捗追跡用Labels設定
リポジトリに以下のラベルを作成してください：

**フェーズラベル**（必須）:
- `phase:requirements` - 要件定義フェーズ
- `phase:poc` - PoCフェーズ  
- `phase:implementation` - 実装フェーズ
- `phase:review` - レビューフェーズ
- `phase:testing` - テスト・デプロイフェーズ

**状態ラベル**（推奨）:
- `blocked` - ブロック状態
- `waiting-for-review` - レビュー待ち
- `auto-generated` - 自動生成

### オプション設定

#### 3. Slack通知設定（オプション）
```bash
# Slack Webhook URL を GitHub Secrets に追加:
SLACK_WEBHOOK_URL      # Slack Incoming Webhook URL
```

Slack Webhook URL の取得方法：
1. Slack ワークスペースで "Incoming Webhooks" アプリを追加
2. 通知先チャネルを選択
3. 生成されたWebhook URLをコピー

#### 4. Microsoft Teams通知設定（オプション）
```bash
# Teams Webhook URL を GitHub Secrets に追加:
TEAMS_WEBHOOK_URL      # Teams Incoming Webhook URL
```

Teams Webhook URL の取得方法：
1. Teamsチャネルで "Connectors" を選択
2. "Incoming Webhook" を追加
3. 生成されたWebhook URLをコピー

## 📱 使用方法

### 自動進捗追跡

進捗追跡は以下の場合に自動実行されます：
- Issue の作成・クローズ・ラベル変更時
- Pull Request の作成・クローズ・レビュー時
- Issue へのコメント追加時

**手動実行**:
```bash
# 基本的な進捗確認
npm run progress-update

# 詳細な進捗分析（GitHub Token必要）
node scripts/progress-tracker.js --token YOUR_TOKEN --repository owner/repo

# JSON形式で出力
node scripts/progress-tracker.js --output-format json

# YAML形式で出力  
node scripts/progress-tracker.js --output-format yaml
```

### AI文脈品質評価

品質評価は文脈継承時に自動実行されますが、手動でも実行可能です：

```bash
# 特定フェーズの品質評価
npm run quality-check -- --phase requirements

# カスタムファイルの品質評価
node scripts/ai-context-quality-evaluator.js \
  --context-file docs/ai-context/ai-context-custom.yml \
  --phase custom
```

**品質スコア基準**:
- **90-100点 (A+)**: 極めて高品質、優秀な文脈継承
- **80-89点 (A)**: 高品質、十分な情報量
- **70-79点 (B)**: 良好、軽微な改善で十分
- **60-69点 (C)**: 普通、いくつかの改善が必要
- **0-59点 (D)**: 要改善、大幅な見直しが必要

### チーム通知

通知は自動送信されますが、手動でも送信可能です：

```bash
# Slack通知の手動送信
npm run notify-team -- \
  --webhook-url "YOUR_SLACK_WEBHOOK" \
  --phase requirements \
  --issue-url "https://github.com/owner/repo/issues/123" \
  --repository owner/repo \
  --quality-score 85

# Teams通知の手動送信  
npm run notify-team -- \
  --teams-webhook "YOUR_TEAMS_WEBHOOK" \
  --phase poc \
  --issue-url "https://github.com/owner/repo/issues/124" \
  --repository owner/repo \
  --quality-score 92
```

## 📊 生成されるファイル

### 進捗追跡関連
```
docs/ai-context/
├── progress-dashboard.yml           # 最新の進捗データ
├── quality-summary.yml             # AI文脈品質サマリー
├── progress-history/                # 進捗履歴
│   ├── progress-2025-01-15.yml
│   └── progress-2025-01-16.yml
└── quality-reports/                 # 品質評価レポート
    ├── quality-requirements-*.yml
    └── quality-poc-*.yml
```

### 進捗ダッシュボードの構造
```yaml
updated_at: "2025-01-16T10:30:00.000Z"
project_phases:
  requirements:
    total: 3
    completed: 2
    in_progress: 1
    blocked: 0
  poc:
    total: 2
    completed: 1
    in_progress: 1
    blocked: 0
overall_progress:
  total_issues: 15
  completed_issues: 8
  completion_rate: 53
  block_rate: 7
quality_metrics:
  overall_stats:
    average_score: 82
    phases_completed: 3
    high_quality_phases: 2
bottlenecks:
  - type: "long_open_issues"
    severity: "medium"
    count: 2
```

## 🎛️ カスタマイズ

### 品質評価基準のカスタマイズ

`scripts/ai-context-quality-evaluator.js` を編集して評価基準を調整可能：

```javascript
// 評価項目の重み調整
details.key_decisions = evaluateKeyDecisions(contextData.key_decisions || []);
totalScore += details.key_decisions;
maxScore += 25; // 重要決定事項の配点（25点満点）

// 品質グレードのしきい値調整
function getQualityGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  // カスタマイズ可能
}
```

### 通知内容のカスタマイズ

`scripts/team-notifications.js` を編集して通知メッセージを調整：

```javascript
// Slack通知メッセージのカスタマイズ
const slackMessage = {
  text: `${phaseEmoji} ${options.phase}フェーズ完了`,
  blocks: [
    // ブロック構造をカスタマイズ
  ]
};
```

### 進捗追跡項目の追加

`scripts/progress-tracker.js` を編集してカスタム分析を追加：

```javascript
// 新しい分析項目を追加
function analyzeCustomMetrics(issues, pullRequests) {
  // カスタム分析ロジック
  return customMetrics;
}
```

## 🔍 トラブルシューティング

### よくある問題

#### 1. GitHub Actions が実行されない
**症状**: Issue クローズ時に自動処理が動作しない

**確認項目**:
- フェーズラベル（`phase:*`）が正しく付与されているか
- `.github/workflows/auto-context-bridge.yml` が存在するか
- Actions タブでエラーログを確認

#### 2. 品質評価が低スコアになる
**症状**: 文脈継承の品質スコアが想定より低い

**対策**:
- Issue テンプレートの必須セクションを埋める
- 決定事項に理由と影響範囲を記載
- 制約条件を具体的に記述
- 学習パターンに根拠を含める

#### 3. 通知が届かない
**症状**: Slack/Teams に通知が送信されない

**確認項目**:
- Webhook URL が正しく設定されているか
- GitHub Secrets に URL が保存されているか
- Webhook URL の有効性をテスト

#### 4. 進捗データが更新されない
**症状**: 進捗ダッシュボードに変更が反映されない

**対策**:
- ラベルの命名規則を確認（`phase:*`）
- 手動で進捗追跡を実行
- GitHub Token の権限を確認

### デバッグ用コマンド

```bash
# ローカルでの動作確認
node scripts/auto-context-extractor.js \
  --phase="requirements" \
  --issue-number="123" \
  --issue-title="テストIssue" \
  --issue-body="テスト本文" \
  --repository="owner/repo"

# 品質評価のテスト実行
node scripts/ai-context-quality-evaluator.js \
  --phase="requirements" \
  --context-file="docs/ai-context/ai-context-requirements.yml"

# 進捗追跡のテスト実行  
node scripts/progress-tracker.js \
  --token="YOUR_TOKEN" \
  --repository="owner/repo" \
  --output-format="console"
```

## 📈 効果測定

### KPI指標

新機能の効果は以下の指標で測定できます：

**進捗管理効率**:
- 進捗確認作業時間の削減
- ボトルネック発見までの時間短縮
- プロジェクト完了予測精度の向上

**品質向上**:
- AI文脈品質スコアの平均値向上
- フェーズ間での情報ロス削減
- 手戻り作業の減少

**チーム連携**:
- フェーズ完了通知の即時性
- チームメンバーの状況把握向上
- 意思決定速度の向上

### レポート生成

```bash
# 週次レポート生成
node scripts/generate-weekly-report.js

# 月次分析レポート生成  
node scripts/generate-monthly-analysis.js

# カスタム期間でのレポート生成
node scripts/generate-custom-report.js --from 2025-01-01 --to 2025-01-31
```

## 🚀 今後の拡張予定

### Phase 2: AI統合強化
- Claude/ChatGPT API との直接連携
- 自動コードレビューと品質評価
- 自然言語による進捗クエリ機能

### Phase 3: 高度な分析機能
- 機械学習による予測分析
- プロジェクト成功要因の特定
- ベストプラクティスの自動提案

### Phase 4: 外部ツール連携
- Jira/Asana との双方向同期
- CI/CD パイプラインとの統合
- カスタムダッシュボード構築

---

## 📞 サポート

質問や問題がある場合は、プロジェクトのIssueを作成するか、開発チームにお問い合わせください。

**関連ドキュメント**:
- [基本的な使用方法](GITHUB_AUTO_CONTEXT_BRIDGE.md)
- [AI文脈継承システム](AI_CONTEXT_BRIDGE.md)
- [ワークフローガイド](WORKFLOW_GUIDE.md)
