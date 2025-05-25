# 既存プロジェクト移行ガイド

## 📋 概要

既存のプロジェクトにAI開発ワークフローテンプレートを途中適用するための包括的ガイドです。プロジェクトの現在の状況に応じて、最適な移行戦略を提供します。

## 🎯 移行パターン

### 1. フェーズ別移行パターン

| 現在の状況 | 移行優先度 | 推奨コンポーネント | 推定時間 |
|------------|------------|-------------------|----------|
| **企画段階** | 🔥 最高 | 全コンポーネント | 30-45分 |
| **要件定義中** | 🔥 高 | PoC以降 + ワークフロー | 20-30分 |
| **PoC開発中** | 🔥 高 | 実装以降 + 文脈継承 | 15-25分 |
| **実装中** | 🟡 中 | レビュー以降 + AI文脈 | 10-20分 |
| **レビュー中** | 🟡 中 | テスト + 品質管理 | 5-15分 |
| **テスト中** | 🟢 低 | 文脈継承のみ | 5-10分 |
| **本番運用中** | 🟢 低 | 監視 + 改善支援 | 5-10分 |

### 2. 移行戦略パターン

#### A. 段階的移行（推奨）
- **適用場面**: チームサイズ3名以上、重要プロジェクト
- **メリット**: リスク最小化、チーム学習時間確保
- **手順**: コアドキュメント → GitHub設定 → 自動化 → 拡張機能

#### B. 一括移行
- **適用場面**: 小規模チーム、緊急性高
- **メリット**: 速やかな効果実現
- **手順**: 全コンポーネント同時適用

#### C. カスタム移行
- **適用場面**: 特殊要件、大規模組織
- **メリット**: 組織に特化した最適化
- **手順**: 個別コンポーネント選択適用

## 🚀 クイックスタート

### 自動移行スクリプトの使用

```bash
# プロジェクトルートで実行
cd /path/to/your/existing/project

# テンプレートスクリプトのダウンロード
curl -O https://raw.githubusercontent.com/your-repo/scripts/migrate-existing-project.js
npm install inquirer fs-extra chalk js-yaml commander

# 分析のみ実行（変更なし）
npm run migrate:analyze

# 移行前検証
npm run migrate:validate

# 移行実行
npm run migrate

# 移行後健全性チェック
npm run migration-health
```

### 段階的移行管理（推奨）

大規模プロジェクトや慎重な移行が必要な場合：

```bash
# 指定フェーズまでの移行をスケジュール
npm run migrate -- --schedule implementation

# 移行進捗の確認
node scripts/staged-migration-manager.js --status

# 移行の一時停止
node scripts/staged-migration-manager.js --pause

# 移行の再開
node scripts/staged-migration-manager.js --resume
```

### 緊急時のロールバック

```bash
# 利用可能なバックアップを確認
npm run migration-rollback -- --list-backups

# 完全ロールバック
npm run migration-rollback

# 部分的ロールバック（例：スクリプトのみ）
npm run migration-rollback -- --partial scripts,github
```

### 手動移行手順

#### Step 1: 事前準備（必須）
```bash
# バックアップ作成
git add -A
git commit -m "Before AI workflow template migration"

# ブランチ作成（推奨）
git checkout -b feature/ai-workflow-integration
```

#### Step 2: 現状分析
```bash
# プロジェクト状況の確認
ls -la docs/                    # 既存ドキュメント確認
ls -la .github/                 # GitHub設定確認
cat package.json | grep scripts # 既存スクリプト確認
```

#### Step 3: 段階的適用

##### 🔥 Phase 1: コアドキュメント（優先度: 最高）
```bash
mkdir -p docs
cp template/docs/PROJECT_CONTEXT.template.md docs/PROJECT_CONTEXT.md
cp template/docs/WORKFLOW_GUIDE.md docs/
cp template/docs/AI_INTERACTION_LOG.template.md docs/AI_INTERACTION_LOG.md
```

**手動編集が必要なファイル:**
- `docs/PROJECT_CONTEXT.md`: プロジェクト情報を記入
- `docs/AI_INTERACTION_LOG.md`: プロジェクト名の更新

##### 🔥 Phase 2: GitHub設定（優先度: 高）
```bash
mkdir -p .github/ISSUE_TEMPLATE
cp -r template/.github/ISSUE_TEMPLATE/* .github/ISSUE_TEMPLATE/
cp template/.github/pull_request_template.md .github/
```

##### 🟡 Phase 3: スクリプト群（優先度: 高）
```bash
mkdir -p scripts
cp template/scripts/ai-context-bridge.js scripts/
cp template/scripts/ai-context-quality-evaluator.js scripts/
cp template/scripts/progress-tracker.js scripts/
```

**package.json 更新:**
```json
{
  "scripts": {
    "ai-context": "node scripts/ai-context-bridge.js",
    "quality-check": "node scripts/ai-context-quality-evaluator.js",
    "progress-update": "node scripts/progress-tracker.js"
  },
  "devDependencies": {
    "inquirer": "^8.2.5",
    "chalk": "^4.1.2",
    "js-yaml": "^4.1.0",
    "commander": "^9.4.1"
  }
}
```

##### 🟢 Phase 4: GitHub Actions（優先度: 中）
```bash
mkdir -p .github/workflows
cp template/.github/workflows/auto-context-bridge.yml .github/workflows/
```

**設定が必要:**
- Settings → Actions → General → Write permissions

## 🎯 フェーズ別詳細移行手順

### 企画段階からの移行

#### 概要
- **タイミング**: プロジェクト開始前～要件定義開始前
- **メリット**: 最大限の効果、全機能活用
- **所要時間**: 30-45分

#### 移行手順
1. **全コンポーネント適用**
   ```bash
   node migrate-existing-project.js
   # または手動で全ファイルコピー
   ```

2. **初期設定実行**
   ```bash
   npm install
   npm run setup
   ```

3. **第一Issue作成**
   - 「要件定義」テンプレートを使用
   - AI文脈継承システムを初期化

### 要件定義中からの移行

#### 概要
- **タイミング**: 要件定義作業中
- **メリット**: PoCから自動化活用、文脈継承効果
- **所要時間**: 20-30分

#### 移行手順
1. **現在の要件定義をフォーマット化**
   ```bash
   # 既存の要件定義文書を確認
   ls docs/requirements* docs/spec* README.md
   
   # PROJECT_CONTEXT.mdに移行
   node scripts/ai-context-bridge.js
   ```

2. **PoC以降のテンプレート適用**
   ```bash
   cp template/.github/ISSUE_TEMPLATE/poc-*.md .github/ISSUE_TEMPLATE/
   cp template/.github/ISSUE_TEMPLATE/implementation-*.md .github/ISSUE_TEMPLATE/
   ```

3. **要件定義完了時の文脈記録**
   ```bash
   npm run ai-context
   # → "フェーズ完了文脈の記録" を選択
   ```

### 実装中からの移行

#### 概要
- **タイミング**: メイン開発作業中
- **メリット**: コードレビュー自動化、品質向上
- **所要時間**: 10-20分

#### 移行手順
1. **AI文脈継承のみ導入**
   ```bash
   cp template/scripts/ai-context-bridge.js scripts/
   cp template/scripts/ai-context-quality-evaluator.js scripts/
   npm install inquirer chalk js-yaml
   ```

2. **現在の実装状況を記録**
   ```bash
   npm run ai-context
   # 既存の実装決定事項を記録
   ```

3. **レビュープロセス強化**
   ```bash
   cp template/.github/pull_request_template.md .github/
   cp template/.github/workflows/auto-context-bridge.yml .github/workflows/
   ```

### 本番運用中からの移行

#### 概要
- **タイミング**: 既にリリース済み
- **メリット**: 継続改善、次期開発準備
- **所要時間**: 5-10分

#### 移行手順
1. **文脈継承システムのみ導入**
   ```bash
   mkdir -p docs/ai-context
   cp template/scripts/ai-context-bridge.js scripts/
   ```

2. **これまでの学習事項を記録**
   ```bash
   npm run ai-context
   # プロダクション運用で得た知見を記録
   ```

3. **次期開発への準備**
   ```bash
   cp template/docs/PROMPT_ENGINEERING_STRATEGY.md docs/
   ```

## ⚠️ 注意点とトラブルシューティング

### 一般的な問題と解決策

#### 1. 既存ファイルとのコンフリクト
**問題**: 同名ファイルが既に存在
**解決策**:
```bash
# バックアップ作成
cp existing-file existing-file.backup

# 手動マージまたは選択的置換
diff existing-file template-file
```

#### 2. package.json のコンフリクト
**問題**: スクリプト名の重複
**解決策**:
```json
{
  "scripts": {
    "ai-context": "node scripts/ai-context-bridge.js",
    "ai-quality": "node scripts/ai-context-quality-evaluator.js",
    "ai-progress": "node scripts/progress-tracker.js"
  }
}
```

#### 3. GitHub Actions の権限エラー
**問題**: GITHUB_TOKEN の権限不足
**解決策**:
1. Settings → Actions → General
2. Workflow permissions → Read and write permissions

#### 4. 依存関係のコンフリクト
**問題**: Node.js バージョン非互換
**解決策**:
```bash
# Node.js バージョン確認
node --version  # v14以上推奨

# 依存関係の個別インストール
npm install inquirer@^8.0.0 chalk@^4.0.0
```

### ファイルコンフリクト解決パターン

#### パターン1: 内容マージ
```bash
# 既存ファイルの重要部分を保持しながらテンプレート適用
cp existing-file temp-backup
cp template-file existing-file
# 手動で temp-backup の内容を existing-file にマージ
```

#### パターン2: 選択的置換
```bash
# 特定セクションのみテンプレートから適用
sed -n '1,20p' existing-file > temp-file
sed -n '21,$p' template-file >> temp-file
mv temp-file existing-file
```

## 📊 移行効果の測定

### 導入前後の比較指標

| 指標 | 導入前 | 導入後目標 | 測定方法 |
|------|--------|------------|----------|
| **フェーズ間情報継承** | 手動・不完全 | 90%以上自動化 | `npm run quality-check` |
| **Issue対応時間** | ベースライン | 20%短縮 | GitHub Analytics |
| **AI活用効率** | 個人依存 | 標準化 | チームアンケート |
| **コードレビュー品質** | 主観的 | 定量的評価 | 品質スコア |

### 成功指標の測定

```bash
# 進捗データの収集
npm run collect-metrics

# 品質評価の実行
npm run quality-check

# レポート生成
npm run progress-update --format json > progress-report.json
```

## 🎛️ 高度な移行機能

### 段階的移行管理

#### 移行のスケジューリング
```bash
# 特定フェーズまでの移行を計画
node scripts/staged-migration-manager.js --schedule poc

# 現在の移行状況を確認
node scripts/staged-migration-manager.js --status
```

#### 移行の制御
```bash
# 移行の一時停止
node scripts/staged-migration-manager.js --pause

# 移行の再開
node scripts/staged-migration-manager.js --resume

# 移行状態のリセット
node scripts/staged-migration-manager.js --reset
```

### 健全性監視

#### 移行後の健全性チェック
```bash
# 基本チェック
npm run migration-health

# 詳細診断
npm run migration-health -- --detailed

# 問題の自動修正
npm run migration-health -- --fix-issues

# レポート出力
npm run migration-health -- --report json > health-report.json
npm run migration-health -- --report md > health-report.md
```

#### チェック項目
- **ファイル整合性**: 必要ファイルの存在・内容確認
- **スクリプト機能**: NPMスクリプトの動作確認
- **GitHub統合**: Actions、テンプレートの設定確認
- **AI文脈継承システム**: 文脈管理機能の動作確認
- **ワークフロー指標**: プロジェクト活動度の測定

### バックアップ・ロールバック

#### 自動バックアップ
移行実行時に自動的に作成される包括的バックアップ：
- 既存ファイルの完全コピー
- package.json の元の状態
- メタデータ（フェーズ、タイムスタンプ、ファイル数）

#### ロールバック機能
```bash
# 利用可能なバックアップ一覧
npm run migration-rollback -- --list-backups

# 完全ロールバック
npm run migration-rollback

# 部分的ロールバック
npm run migration-rollback -- --partial docs,scripts

# 強制実行（確認スキップ）
npm run migration-rollback -- --force
```

#### ロールバック後の確認
- 自動健全性チェック実行
- Gitコミットの自動作成
- 依存関係の再インストール

### トラブルシューティング支援

#### 移行前検証
```bash
# 包括的な事前チェック
npm run migrate:validate

# 問題の自動修正
npm run migrate:validate-fix

# 詳細レポート出力
npm run migrate:validate -- --detailed --export md > validation-report.md
```

#### プロジェクトフェーズの自動判定
```bash
# 現在のプロジェクトフェーズを分析
npm run detect-phase

# 詳細分析結果の出力
npm run detect-phase -- --detailed --export json > phase-analysis.json
```

## 🔄 継続的改善

### 移行後の定期メンテナンス

#### 週次タスク
```bash
# 進捗状況の更新
npm run progress-update

# 品質評価の実行
npm run quality-check
```

#### 月次タスク
```bash
# メトリクス収集と分析
npm run collect-metrics

# 健全性の総合チェック
npm run migration-health -- --detailed

# テンプレートの最新化確認
git remote add template https://github.com/original/template.git
git fetch template
```

#### フェーズ移行時
```bash
# 文脈継承の記録
npm run ai-context

# 次フェーズ向けIssue作成
# 該当フェーズテンプレートを使用
```

### カスタマイズガイド

#### 組織固有の調整
1. **Issueテンプレートのカスタマイズ**
   - `.github/ISSUE_TEMPLATE/` 内のテンプレートを組織要件に合わせて調整

2. **品質評価基準の調整**
   - `scripts/ai-context-quality-evaluator.js` の評価項目をカスタマイズ

3. **通知設定のカスタマイズ**
   - `scripts/team-notifications.js` でSlack/Teams連携を設定

## 📚 関連ドキュメント

- [使用・テストガイド](USAGE_AND_TESTING_GUIDE.md)
- [GitHub連携自動化ガイド](GITHUB_AUTO_CONTEXT_BRIDGE.md)
- [拡張機能ガイド](ADVANCED_FEATURES_GUIDE.md)
- [プロンプトエンジニアリング戦略](PROMPT_ENGINEERING_STRATEGY.md)

## 📈 成功事例とベストプラクティス

### 成功パターン

#### パターン1: 段階的移行（大規模チーム）
**状況**: 10名規模の開発チーム、実装中フェーズ
**アプローチ**: 
1. まずAI文脈継承のみ導入（1週間）
2. レビュープロセス強化（2週目）
3. 自動化機能追加（3週目）

**結果**: 
- チーム学習時間確保により導入阻害なし
- 段階的効果実感でチーム全体の受け入れ向上
- 3週間で完全移行完了

#### パターン2: 一括移行（小規模チーム）
**状況**: 3名チーム、PoC段階
**アプローチ**: 全コンポーネント同時適用

**結果**:
- 30分で移行完了
- 即座に全機能活用開始
- 開発効率20%向上

#### パターン3: 部分導入（運用中プロジェクト）
**状況**: 本番運用中、新機能開発並行
**アプローチ**: AI文脈継承と次期開発準備のみ

**結果**:
- 運用リスクゼロ
- 次期開発で本格活用準備完了
- レガシー知識の効果的継承

### ベストプラクティス

#### 移行前の準備
```bash
# 1. 必ずバックアップとGitコミット
git add -A && git commit -m "Before AI workflow template migration"

# 2. 移行前検証を必ず実行
npm run migrate:validate

# 3. チーム合意形成
# - 移行目的の明確化
# - 段階的導入スケジュールの策定
# - 責任者の明確化
```

#### 移行中の注意点
```bash
# 1. 段階的移行の活用
npm run staged-migration -- --schedule implementation

# 2. 定期的な健全性チェック
npm run migration-health

# 3. 問題発生時の迅速な対応体制
npm run migration-rollback -- --list-backups
```

#### 移行後の継続活動
```bash
# 1. 週次健全性チェック
npm run migration-health -- --detailed

# 2. 効果測定の実施
npm run collect-metrics

# 3. チームフィードバックの収集
npm run ai-context  # 改善点の記録
```

### 避けるべき失敗パターン

#### ❌ 準備不足での一括移行
**問題**: バックアップなし、チーム合意なしでの強行
**対策**: 必ず事前検証とチーム合意を実施

#### ❌ 移行後の放置
**問題**: 移行後の効果測定や改善活動なし
**対策**: 定期的な健全性チェックと効果測定

#### ❌ エラー発生時の対応遅延
**問題**: ロールバック手順の未整備
**対策**: 事前にロールバック手順を確認・テスト

### 組織別推奨アプローチ

| 組織サイズ | 推奨アプローチ | 移行期間 | 重点ポイント |
|------------|----------------|----------|--------------|
| **個人開発** | 一括移行 | 30分 | 全機能即座活用 |
| **小規模チーム(2-5名)** | 一括移行 | 1-2時間 | チーム学習時間確保 |
| **中規模チーム(6-15名)** | 段階的移行 | 1-2週間 | 段階的効果実感 |
| **大規模チーム(16名以上)** | カスタム移行 | 2-4週間 | 組織固有要件対応 |

### 効果測定指標

#### 導入効果の定量評価
```bash
# AI活用効率の測定
npm run collect-metrics -- --ai-usage

# フェーズ間情報継承率の測定
npm run quality-check -- --inheritance-rate

# Issue対応時間の変化
npm run collect-metrics -- --issue-metrics
```

#### 成功基準の例
- フェーズ間情報継承率: 90%以上
- AI文脈活用率: 週3回以上
- Issue対応時間: 20%短縮
- チーム満足度: 8/10以上

## 🆘 サポート

### 移行支援が必要な場合

1. **自動分析の実行**:
   ```bash
   npm run migrate:analyze
   ```

2. **段階的移行の相談**:
   - Issue作成時に「migration-support」ラベルを付与

3. **コミュニティサポート**:
   - Discussions での質問・情報共有

---

*このガイドは継続的に更新されます。最新版は公式リポジトリをご確認ください。*
