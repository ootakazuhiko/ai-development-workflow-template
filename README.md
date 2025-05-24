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
