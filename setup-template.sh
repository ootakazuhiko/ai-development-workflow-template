#!/bin/bash

echo "🤖 AI Development Workflow Template Repository Setup"
echo "=================================================="

# ディレクトリ構造作成
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p .github/workflows
mkdir -p docs
mkdir -p scripts
mkdir -p templates
mkdir -p examples/sample-project

echo "📁 ディレクトリ構造作成完了"

# .github/ISSUE_TEMPLATE/config.yml
cat > .github/ISSUE_TEMPLATE/config.yml << 'EOF'
blank_issues_enabled: false
contact_links:
  - name: 📖 ワークフローガイド
    url: https://github.com/your-username/ai-development-workflow-template/blob/main/docs/WORKFLOW_GUIDE.md
    about: ワークフローの詳細な使い方
  - name: 🤖 AI Tools設定ガイド
    url: https://github.com/your-username/ai-development-workflow-template/blob/main/docs/AI_TOOLS_CONFIG.md
    about: AI Toolsの設定方法
EOF

# .github/ISSUE_TEMPLATE/requirements-definition.md
cat > .github/ISSUE_TEMPLATE/requirements-definition.md << 'EOF'
---
name: 🎯 要件定義
about: Claude/Gemini/ChatGPTでの議論結果を構造化
title: "[REQ] "
labels: requirements, phase-1, human-review-required
assignees: ''
---

## 📋 要件概要
<!-- Claude等での議論結果のサマリー -->

## 🎯 ビジネス目標
- [ ] 目標1
- [ ] 目標2

## 👥 ユーザーストーリー
### ペルソナ1
- As a [ユーザー種別]
- I want [機能]
- So that [価値]

## 🔧 機能要件
### 主要機能
1. **機能A**
   - 詳細仕様：
   - 制約条件：
   - 優先度：High/Medium/Low

### 非機能要件
- **パフォーマンス**: 
- **セキュリティ**: 
- **可用性**: 

## 💬 AIとの議論ログ
<details>
<summary>Claude/ChatGPT/Gemini議論ログ</summary>

```
[AI議論の重要部分をコピペ]
```
</details>

## 🔗 関連情報
- 参考URL: 
- 関連Issue: 
- 設計ドキュメント: 

## ✅ 承認チェックリスト
- [ ] ステークホルダー確認済み
- [ ] 技術的実現性確認済み
- [ ] ROI試算完了
- [ ] 次フェーズ移行承認

## 🚀 次のアクション
承認後、[PoC結果テンプレート](https://github.com/your-username/ai-development-workflow-template/issues/new?template=poc-results.md)でPoC開発に移行
EOF

# .github/ISSUE_TEMPLATE/poc-results.md
cat > .github/ISSUE_TEMPLATE/poc-results.md << 'EOF'
---
name: 🧪 PoC結果
about: Windsurfでの開発結果と学習事項
title: "[POC] "
labels: poc, phase-2, human-review-required
assignees: ''
---

## 🧪 検証対象
- 対象要件: #xxx (要件定義Issue)
- 検証期間: yyyy/mm/dd - yyyy/mm/dd
- 使用ツール: Windsurf

## ✅ 検証結果
### 技術的実現性
- [ ] 基本機能実装: ✅/❌
- [ ] パフォーマンス要件: ✅/❌  
- [ ] 統合可能性: ✅/❌

### 発見事項
#### 💡 成功ポイント
1. 技術A が期待以上に効果的
2. ライブラリBの活用で開発効率向上

#### ⚠️ 課題・制約
1. パフォーマンス懸念: 
2. セキュリティ考慮点: 

## 📝 実装アプローチ
### 推奨アーキテクチャ
```
[アーキテクチャ図またはテキスト説明]
```

### 技術スタック
- フロントエンド: 
- バックエンド: 
- データベース: 
- インフラ: 

## 🔗 成果物
- PoCリポジトリ: [リンク]
- デモ環境: [リンク] 
- パフォーマンステスト結果: [リンク]

## ✅ 移行判断チェックリスト
- [ ] 主要機能は期待通り動作するか
- [ ] パフォーマンス要件は満たしているか
- [ ] 本番環境での拡張性は確保されているか
- [ ] セキュリティ設計は適切か
- [ ] 本実装進行を承認するか

## 🚀 次のアクション
- [ ] 本実装への移行判断
- [ ] アーキテクチャ詳細設計
- [ ] 開発チーム割り当て
EOF

# .github/ISSUE_TEMPLATE/implementation-task.md
cat > .github/ISSUE_TEMPLATE/implementation-task.md << 'EOF'
---
name: ⚙️ 実装タスク
about: GitHub Copilot/Cursorでの実装タスク
title: "[IMPL] "
labels: implementation, phase-4
assignees: ''
---

## 🎯 実装対象
- 元Issue: #xxx (要件定義 or PoC結果)
- 担当AI: GitHub Copilot / Cursor
- 期間: yyyy/mm/dd - yyyy/mm/dd

## 📋 実装内容
### 実装する機能
- [ ] 機能1
- [ ] 機能2
- [ ] 機能3

### 技術仕様
- **言語**: 
- **フレームワーク**: 
- **データベース**: 
- **API**: 

## 🏗️ アーキテクチャ
```
[PoCで確立されたアーキテクチャの参照]
```

## 📝 実装ガイドライン
### コーディング標準
- [docs/CODING_STANDARDS.md](../docs/CODING_STANDARDS.md) 準拠
- テストカバレッジ: 80%以上
- ESLint/Prettier: エラーゼロ

### セキュリティ要件
- 入力値検証必須
- 認証・認可実装
- ログ出力基準遵守

## 🧪 テスト要件
- [ ] 単体テスト実装
- [ ] 統合テスト実装
- [ ] E2Eテスト実装
- [ ] パフォーマンステスト

## ✅ 完了条件
- [ ] 全機能動作確認
- [ ] テストケース合格
- [ ] コードレビュー合格
- [ ] ドキュメント更新
- [ ] PRマージ完了

## 🔗 関連情報
- PoCリポジトリ: 
- 設計ドキュメント: 
- API仕様: 

## 🚀 次のアクション
実装完了後、GitHub Copilot Agentによる自動レビュー実行
EOF

# .github/pull_request_template.md
cat > .github/pull_request_template.md << 'EOF'
## 🎯 実装内容
<!-- 実装した機能の詳細説明 -->

## 📝 変更点
- [ ] 新機能追加
- [ ] バグ修正
- [ ] リファクタリング
- [ ] ドキュメント更新
- [ ] テスト追加

### 主要な変更
- 変更点1: 
- 変更点2: 
- 変更点3: 

## 🧪 テスト
- [ ] 単体テスト実装済み (カバレッジ: __%)
- [ ] 統合テスト実装済み
- [ ] E2Eテスト実行済み
- [ ] 手動テスト完了
- [ ] パフォーマンステスト実行

## 🔒 セキュリティチェック
- [ ] 入力値検証確認
- [ ] 認証・認可実装確認
- [ ] 機密情報の適切な取り扱い確認
- [ ] SQLインジェクション対策確認

## 📋 コード品質チェック
- [ ] コーディング標準準拠 (docs/CODING_STANDARDS.md)
- [ ] ESLint/Prettier エラーゼロ
- [ ] 不要コメント・デバッグコード削除
- [ ] 適切な変数・関数命名

## 📖 ドキュメント
- [ ] README更新（必要に応じて）
- [ ] API仕様書更新（必要に応じて）
- [ ] アーキテクチャドキュメント更新（必要に応じて）
- [ ] CHANGELOG.md更新

## 🤖 AIレビュー依頼
<!-- GitHub Copilot Agent に具体的なレビューポイントを指示 -->
@github-copilot 以下の観点でレビューをお願いします：
- [ ] セキュリティ要件の確認
- [ ] パフォーマンスの考慮
- [ ] エラーハンドリングの適切性
- [ ] テストカバレッジの妥当性

## 🔗 関連情報
- 関連Issue: #xxx
- 設計ドキュメント: 
- テスト結果: 

## 📸 スクリーンショット（UI変更の場合）
<!-- Before/After のスクリーンショットを添付 -->

## ⚠️ 破壊的変更
- [ ] APIの破壊的変更なし
- [ ] データベーススキーマ変更なし
- [ ] 設定ファイル変更なし

## 🚀 デプロイメント
- [ ] ローカル環境で動作確認
- [ ] ステージング環境で動作確認
- [ ] 本番環境への影響評価完了
EOF

# .github/workflows/ai-development-workflow.yml
cat > .github/workflows/ai-development-workflow.yml << 'EOF'
name: AI Development Workflow

on:
  issues:
    types: [opened, edited, labeled]
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches: [main, develop]

jobs:
  phase-detection:
    runs-on: ubuntu-latest
    outputs:
      phase: ${{ steps.detect.outputs.phase }}
    steps:
    - name: Detect Development Phase
      id: detect
      uses: actions/github-script@v6
      with:
        script: |
          const labels = context.payload.issue?.labels?.map(l => l.name) || 
                        context.payload.pull_request?.labels?.map(l => l.name) || [];
          
          if (labels.includes('requirements')) {
            core.setOutput('phase', 'requirements');
          } else if (labels.includes('poc')) {
            core.setOutput('phase', 'poc');
          } else if (labels.includes('implementation')) {
            core.setOutput('phase', 'implementation');
          } else if (context.eventName === 'pull_request') {
            core.setOutput('phase', 'review');
          }

  requirements-phase:
    needs: phase-detection
    if: needs.phase-detection.outputs.phase == 'requirements'
    runs-on: ubuntu-latest
    steps:
    - name: Requirements Phase Notification
      uses: actions/github-script@v6
      with:
        script: |
          const comment = `## 🎯 要件定義フェーズが開始されました
          
          ### 📋 次のステップ
          1. **AI議論**: Claude/Gemini/ChatGPTで要件を詳細化
          2. **参照ドキュメント**: [PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md)
          3. **議論ログ**: AI議論の重要部分をこのIssueに記録
          4. **人間レビュー**: 議論完了後、承認チェックリストを確認
          
          ### 🤖 推奨プロンプト
          \`\`\`
          以下のプロジェクト情報を参考に、要件定義を行ってください：
          [PROJECT_CONTEXT.mdの内容を参照]
          
          検討したい機能: [具体的な機能要求]
          制約条件: [技術的・ビジネス的制約]
          \`\`\`
          
          ### ⚠️ 重要
          - セキュリティ要件を必ず検討してください
          - パフォーマンス要件を明確化してください
          - 承認チェックリスト完了後、次フェーズに移行してください`;
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: comment
          });

  poc-phase:
    needs: phase-detection
    if: needs.phase-detection.outputs.phase == 'poc'
    runs-on: ubuntu-latest
    steps:
    - name: PoC Phase Notification
      uses: actions/github-script@v6
      with:
        script: |
          const comment = `## 🧪 PoCフェーズが開始されました
          
          ### 📋 次のステップ
          1. **Windsurf開発**: 自動運転モードで迅速にプロトタイプ作成
          2. **参照情報**: [AI_INTERACTION_LOG.md](./docs/AI_INTERACTION_LOG.md)から前フェーズの文脈を確認
          3. **検証実行**: 基本機能・パフォーマンス・統合可能性を確認
          4. **結果記録**: 発見事項と推奨アプローチをIssueに記録
          
          ### 🤖 Windsurf向けプロンプト
          \`\`\`
          要件定義結果に基づいてPoCを開発してください：
          - 実装場所: /poc/ ディレクトリ
          - 参照基準: docs/CODING_STANDARDS.md
          - 優先度: セキュリティ > 機能 > パフォーマンス
          \`\`\`
          
          ### ⚠️ 重要
          - 動作するプロトタイプレベルで十分です
          - パフォーマンス測定も実施してください  
          - 本実装での課題・推奨事項を必ず記録してください`;
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: comment
          });

  pr-automation:
    needs: phase-detection
    if: needs.phase-detection.outputs.phase == 'review'
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Add Copilot as Reviewer
      uses: actions/github-script@v6
      with:
        script: |
          // GitHub Copilot Agentをレビュアーに追加
          try {
            await github.rest.pulls.requestReviewers({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
              team_reviewers: ['copilot']
            });
          } catch (error) {
            console.log('Copilot reviewer addition failed:', error.message);
          }
          
    - name: AI Review Context
      uses: actions/github-script@v6
      with:
        script: |
          const comment = `## 🤖 AI Code Review Context
          
          ### 📋 レビュー基準
          - **コーディング標準**: [CODING_STANDARDS.md](./docs/CODING_STANDARDS.md)
          - **アーキテクチャ**: [ARCHITECTURE.md](./docs/ARCHITECTURE.md) 
          - **セキュリティ要件**: 入力値検証、認証・認可、ログ出力基準
          
          ### 🔍 重点確認項目
          - [ ] セキュリティ要件の実装
          - [ ] パフォーマンスの考慮
          - [ ] エラーハンドリングの適切性
          - [ ] テストカバレッジの妥当性
          - [ ] コーディング標準準拠
          
          @github-copilot 上記基準に従ってレビューをお願いします。`;
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: comment
          });

  security-scan:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Initialize CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: javascript, python
        
    - name: Autobuild
      uses: github/codeql-action/autobuild@v2
      
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2

  human-review-reminder:
    runs-on: ubuntu-latest
    if: contains(github.event.issue.labels.*.name, 'human-review-required')
    steps:
    - name: Human Review Reminder
      uses: actions/github-script@v6
      with:
        script: |
          const comment = `## 🚨 人間レビューが必要です
          
          このIssueは人間による重要な判断が必要です：
          
          ### ✅ レビューチェックリスト
          - [ ] **ビジネス価値確認**: ROIと優先度は適切か
          - [ ] **技術的妥当性**: 提案アプローチは実現可能か
          - [ ] **リスク評価**: 特定されたリスクは許容範囲か
          - [ ] **リソース計画**: スケジュール・人員は現実的か
          - [ ] **次フェーズ移行承認**: 次段階への進行を承認するか
          
          ### ⏰ アクション
          レビュー完了後、適切なラベルを追加してください：
          - \`approved\`: 承認・次フェーズ移行OK
          - \`needs-revision\`: 修正が必要
          - \`rejected\`: 却下・代替案検討`;
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: comment
          });
EOF

# README.md
cat > README.md << 'EOF'
# 🤖 AI Development Workflow Template

GitHub中心の自動運転開発ワークフローを即座にセットアップできるテンプレートです。

## 🎯 概要

このテンプレートは、AI開発ツール（GitHub Copilot、Claude、Windsurf等）を統合した高度に自動化された開発ワークフローを提供します。要件定義からリリースまでの全フェーズで最大90%のタスクをAIが自動実行し、人間は戦略的判断と品質確認に集中できます。

## 🚀 クイックスタート

### 1. このテンプレートからリポジトリ作成
```bash
# GitHubで "Use this template" ボタンをクリック
# または
gh repo create my-project --template your-username/ai-development-workflow-template
```

### 2. 自動セットアップ実行
```bash
git clone https://github.com/your-username/my-project.git
cd my-project
chmod +x setup.sh
./setup.sh
```

### 3. プロジェクト詳細設定
```bash
npm install
npm run configure
```

## 📋 前提条件

### 必須
- [ ] GitHub Business アカウント
- [ ] GitHub Copilot Business ライセンス  
- [ ] Node.js 18+ （セットアップスクリプト用）

### 推奨AI Tools
- [ ] Claude/ChatGPT アカウント（要件定義用）
- [ ] Windsurf ライセンス（PoC・テスト用）
- [ ] Cursor Pro（実装補助用）

## 🎯 ワークフロー概要

### Phase 1: 要件収集・基本設計
- **AI**: Claude/Gemini/ChatGPT
- **人間**: 戦略的判断・ビジネス価値評価
- **成果物**: 構造化された要件定義Issue

### Phase 2: PoC開発  
- **AI**: Windsurf（自動運転モード）
- **人間**: 検証結果評価・実装計画判断
- **成果物**: 動作するプロトタイプと技術的推奨事項

### Phase 3-4: 実装
- **AI**: GitHub Copilot/Cursor
- **人間**: 複雑な問題解決・進捗管理
- **成果物**: 本番品質のコード

### Phase 5: コードレビュー
- **AI**: GitHub Copilot Coding Agent
- **人間**: ビジネスロジック確認・最終判断
- **成果物**: レビュー済み・承認されたコード

### Phase 6-9: テスト・修正・リファクタリング・ドキュメント
- **AI**: Windsurf, GitHub Copilot Agent, Claude
- **人間**: 品質確認・方針決定
- **成果物**: 本番リリース可能な完成品

## 🎯 含まれる機能

### ✅ Issue Templates
- **要件定義**: Claude等のAI議論を構造化
- **PoC結果**: Windsurf開発結果と学習事項記録
- **実装タスク**: Copilot/Cursor実装タスク管理

### ✅ GitHub Actions自動化
- **フェーズ自動検出**: ラベルに基づく自動ワークフロー起動
- **AIレビュー支援**: Copilot Agentの自動レビュアー追加
- **品質チェック**: セキュリティスキャン・コード品質分析
- **人間レビュー提醒**: 重要判断ポイントでの自動通知

### ✅ ドキュメントテンプレート
- **PROJECT_CONTEXT.md**: プロジェクト全体文脈管理
- **AI_INTERACTION_LOG.md**: AI間での文脈継承システム
- **ARCHITECTURE.md**: アーキテクチャドキュメント
- **CODING_STANDARDS.md**: コーディング標準とAI指示

### ✅ AI Prompt Library
- **フェーズ別最適化プロンプト**: 各フェーズに特化したAI指示
- **文脈継承テンプレート**: AI間での情報継承システム
- **レビューチェックリスト**: 人間レビューポイント明確化

## 📖 詳細ガイド

- [📘 セットアップガイド](./docs/SETUP_GUIDE.md)
- [📙 ワークフロー詳細](./docs/WORKFLOW_GUIDE.md)  
- [📗 AI利用ガイド](./templates/ai-prompts.md)
- [📕 トラブルシューティング](./docs/TROUBLESHOOTING.md)

## 🔧 カスタマイズ

組織のニーズに合わせてカスタマイズ可能：

- [⚙️ 技術スタック設定](./docs/TECH_STACK_CONFIG.md)
- [🤖 AI Tools設定](./docs/AI_TOOLS_CONFIG.md)
- [🔄 ワークフロー調整](./docs/WORKFLOW_CUSTOMIZATION.md)

## 📊 期待効果

- **開発効率**: 70-80%向上（自動化による）
- **品質向上**: AI多層チェックによるバグ削減
- **文脈継続**: フェーズ間での情報喪失ゼロ
- **チーム負荷**: 戦略的作業に集中、ルーチン作業削減

## 🤝 Contributing

改善提案やバグレポートは Issues または Pull Requests でお寄せください。

## 📄 License

MIT License - 詳細は [LICENSE](./LICENSE) を参照

---

*最終更新: 2025年5月*
EOF

# package.json
cat > package.json << 'EOF'
{
  "name": "ai-development-workflow-template",
  "version": "1.0.0",
  "description": "GitHub AI Development Workflow Template",
  "main": "index.js",
  "scripts": {
    "setup": "node scripts/setup-project.js",
    "configure": "node scripts/setup-project.js",
    "create-sample-issues": "node scripts/create-issues.js",
    "validate-setup": "node scripts/validate-setup.js"
  },
  "keywords": [
    "github",
    "ai",
    "development",
    "workflow", 
    "template",
    "copilot",
    "automation"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "@octokit/rest": "^19.0.0",
    "inquirer": "^8.2.0",
    "chalk": "^4.1.2",
    "fs-extra": "^10.0.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^2.5.0"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-username/ai-development-workflow-template.git"
  },
  "bugs": {
    "url": "https://github.com/your-username/ai-development-workflow-template/issues"
  },
  "homepage": "https://github.com/your-username/ai-development-workflow-template#readme"
}
EOF

# scripts/setup-project.js
cat > scripts/setup-project.js << 'EOF'
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function setupProject() {
  console.log(chalk.blue('🤖 AI Development Workflow Template Setup'));
  console.log(chalk.blue('================================================'));
  console.log('');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'プロジェクト名:',
      validate: input => input.length > 0 || 'プロジェクト名は必須です'
    },
    {
      type: 'input', 
      name: 'description',
      message: 'プロジェクト説明:',
      default: '新しいAI開発プロジェクト'
    },
    {
      type: 'list',
      name: 'language',
      message: '主要言語:',
      choices: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Other']
    },
    {
      type: 'list',
      name: 'framework',
      message: 'フレームワーク:',
      choices: ['React', 'Vue.js', 'Angular', 'Express.js', 'Django', 'FastAPI', 'Spring Boot', 'Other']
    },
    {
      type: 'checkbox',
      name: 'aiTools',
      message: '使用予定のAI Tools:',
      choices: [
        { name: 'GitHub Copilot', checked: true },
        { name: 'Claude', checked: true },
        { name: 'ChatGPT', checked: false },
        { name: 'Windsurf', checked: true },
        { name: 'Cursor', checked: false },
        { name: 'Google Gemini', checked: false }
      ]
    },
    {
      type: 'input',
      name: 'teamSize',
      message: 'チームサイズ（人数）:',
      default: '3-5'
    },
    {
      type: 'list',
      name: 'securityLevel',
      message: 'セキュリティ要件レベル:',
      choices: ['低（内部ツール）', '中（一般的なWebアプリ）', '高（金融・医療等）']
    }
  ]);

  console.log(chalk.yellow('\n🔧 プロジェクトファイルを生成中...'));

  // PROJECT_CONTEXT.md の生成
  const projectContext = generateProjectContext(answers);
  await fs.writeFile('docs/PROJECT_CONTEXT.md', projectContext);

  // CODING_STANDARDS.md のカスタマイズ
  const codingStandards = generateCodingStandards(answers);
  await fs.writeFile('docs/CODING_STANDARDS.md', codingStandards);

  // AI_INTERACTION_LOG.md の初期化
  const aiLog = generateAILog(answers);
  await fs.writeFile('docs/AI_INTERACTION_LOG.md', aiLog);

  // ARCHITECTURE.md の初期化
  const architecture = generateArchitecture(answers);
  await fs.writeFile('docs/ARCHITECTURE.md', architecture);

  console.log(chalk.green('\n✅ プロジェクトセットアップ完了！'));
  console.log(chalk.yellow('\n📖 次のステップ:'));
  console.log('1. GitHub Settings → Actions → General → 権限設定');
  console.log('2. Settings → General → Template repository にチェック（テンプレート化する場合）');
  console.log('3. チームメンバーの招待');
  console.log('4. Issues → New issue → 要件定義テンプレートで開始');
  console.log('\n💡 詳細は docs/ フォルダ内のガイドを参照してください。');
}

function generateProjectContext(answers) {
  return `# プロジェクト文脈情報

## 🎯 プロジェクト概要
- **名称**: ${answers.projectName}
- **目的**: ${answers.description}
- **期間**: ${new Date().toISOString().split('T')[0]} - [予定終了日]
- **チーム**: ${answers.teamSize}名

## 🏗️ 技術スタック
### 確定済み
- **言語**: ${answers.language}
- **フレームワーク**: ${answers.framework}
- **データベース**: [設定予定]
- **インフラ**: [設定予定]

## 🤖 AI Tools
${answers.aiTools.map(tool => `- ${tool}`).join('\n')}

## 🔒 制約条件
- **セキュリティレベル**: ${answers.securityLevel}
- **パフォーマンス**: [要件を記載]
- **コンプライアンス**: [要件を記載]

## 📊 成功指標
- **KPI1**: [指標と目標値]
- **KPI2**: [指標と目標値]

## 🤖 AI利用ポリシー
- **許可範囲**: コード生成、レビュー、テスト、ドキュメント
- **制限事項**: 機密情報の外部送信禁止
- **レビュー方針**: 全AI出力に人間による確認必須

## 📝 更新履歴
- ${new Date().toISOString().split('T')[0]}: プロジェクト初期設定
`;
}

function generateCodingStandards(answers) {
  const languageConfig = {
    'JavaScript': {
      style: 'ESLint + Prettier',
      naming: 'camelCase',
      testing: 'Jest',
      security: 'npm audit + ESLint security rules'
    },
    'TypeScript': {
      style: 'ESLint + Prettier + TypeScript',
      naming: 'camelCase',
      testing: 'Jest + @types',
      security: 'npm audit + ESLint security rules'
    },
    'Python': {
      style: 'PEP 8 + Black + isort',
      naming: 'snake_case',
      testing: 'pytest',
      security: 'bandit + safety'
    }
  };

  const config = languageConfig[answers.language] || languageConfig['JavaScript'];

  return `# コーディング標準

## 🎨 スタイルガイド
### 言語: ${answers.language}
- **スタイル**: ${config.style}
- **命名規則**: ${config.naming}
- **テストフレームワーク**: ${config.testing}
- **セキュリティツール**: ${config.security}

### 命名規則
- **変数**: ${config.naming}
- **関数**: ${config.naming}
- **クラス**: PascalCase
- **定数**: UPPER_SNAKE_CASE

## 🔒 セキュリティ標準
### レベル: ${answers.securityLevel}

#### 基本要件
- **入力値検証**: 全入力値を検証
- **認証**: JWTトークン使用
- **ログ**: 機密情報をログ出力禁止

${answers.securityLevel.includes('高') ? `
#### 高セキュリティ要件
- **暗号化**: 保存データの暗号化必須
- **監査ログ**: 全操作の記録
- **アクセス制御**: 最小権限の原則
- **定期検査**: セキュリティスキャン必須
` : ''}

## 🧪 テスト標準
- **単体テスト**: カバレッジ80%以上
- **統合テスト**: APIエンドポイント全件
- **E2Eテスト**: 主要ユーザーフロー

## 📦 依存関係管理
- **更新方針**: 四半期ごとに最新化
- **脆弱性**: 発見次第即座に対応
- **ライセンス**: MIT/Apache2.0のみ使用可能

## 🤖 AI生成コード品質基準
- **レビュー必須**: 全AI生成コードに人間レビュー
- **テスト必須**: AI生成機能に対応するテスト実装
- **ドキュメント**: 複雑なAI生成ロジックにコメント必須
`;
}

function generateAILog(answers) {
  return `# AI間文脈継承ログ

## プロジェクト: ${answers.projectName}

## 🤖 使用AI Tools
${answers.aiTools.map(tool => `- ${tool}`).join('\n')}

## 📋 フェーズ別文脈継承記録

### 🎯 要件定義 → PoC 継承情報
*要件定義完了後に更新*

### 🧪 PoC → 実装 継承情報  
*PoC完了後に更新*

### ⚙️ 実装 → レビュー 継承情報
*実装完了後に更新*

### 🧪 レビュー → テスト 継承情報
*レビュー完了後に更新*

## 📝 重要決定事項ログ
*各フェーズでの重要な技術的判断を記録*

## 🔄 改善事項
*ワークフロー改善のための学習事項*

---
*このファイルは各フェーズ完了時に更新してください*
`;
}

function generateArchitecture(answers) {
  return `# システムアーキテクチャ

## 🏗️ プロジェクト: ${answers.projectName}

## 📋 技術スタック
- **言語**: ${answers.language}
- **フレームワーク**: ${answers.framework}
- **データベース**: [設定予定]
- **インフラ**: [設定予定]

## 🏛️ アーキテクチャ概要
*PoC完了後に詳細を記載*

### システム構成図
\`\`\`
[アーキテクチャ図をここに記載]
\`\`\`

### コンポーネント構成
*主要コンポーネントとその責務*

## 🔗 API設計
*API仕様をここに記載*

## 🗄️ データベース設計
*テーブル設計・ER図をここに記載*

## 🔒 セキュリティアーキテクチャ
*セキュリティ要件: ${answers.securityLevel}*

## 📈 拡張性・可用性設計
*非機能要件の実現方法*

## 📝 更新履歴
- ${new Date().toISOString().split('T')[0]}: 初期ドキュメント作成
`;
}

if (require.main === module) {
  setupProject().catch(console.error);
}

module.exports = { setupProject };
EOF

echo "✅ すべてのファイルが作成されました！"
echo ""
echo "📋 次のステップ:"
echo "1. git add ."
echo "2. git commit -m 'Add AI Development Workflow Template'"
echo "3. git push origin main"
echo "4. GitHub Settings → General → Template repository にチェック"
echo "5. npm install（セットアップスクリプト用）"
echo ""
echo "🎯 初期セットアップ実行:"
echo "npm run configure"