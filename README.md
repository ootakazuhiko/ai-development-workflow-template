# 🤖 AI Development Workflow Template

GitHubを中心としたAI活用開発ワークフローを迅速にセットアップするためのテンプレートです。
このテンプレートは、Issue管理、プロジェクトドキュメント、GitHub Actionsによる自動化、開発環境の標準化を支援し、AIを活用した効率的な開発プロセスを実現します。

## 🌟 主な機能

- **標準化されたドキュメントテンプレート:**
  - `docs/PROJECT_CONTEXT.template.md`: プロジェクトの背景、目的、技術スタックなどを一元管理。
  - `docs/AI_INTERACTION_LOG.template.md`: AIとの主要なやり取りや決定事項を記録。
  - `docs/CODING_STANDARDS.template.md`: プロジェクトのコーディング規約を定義。
  - `docs/ARCHITECTURE.md`: システムアーキテクチャを記述。
  - `templates/ai-prompts.md`: 各開発フェーズで利用できるAIプロンプト集。
- **GitHub Issueテンプレート:**
  - 要件定義、PoC結果報告、実装タスクなど、開発フェーズに応じたテンプレートを提供。
  - `.github/ISSUE_TEMPLATE/`
- **GitHub Actionsワークフロー:**
  - IssueやPull Requestに応じた自動コメント投稿、レビュアー割り当てなどを自動化。
  - `.github/workflows/ai-development-workflow.yml`
- **プロジェクト初期設定スクリプト:**
  - `scripts/setup-project.js`: 対話形式でプロジェクト情報を入力し、各種設定ファイルを自動生成・更新。
- **Dev Container対応:**
  - `.devcontainer/`: 標準化された開発環境をDockerコンテナーで提供。

## 📂 フォルダー構成

```text
.
├── .devcontainer/      # Dev Container 設定
├── .github/            # GitHub 関連設定 (Issueテンプレート, Workflows)
├── docs/               # プロジェクトドキュメントテンプレート
├── examples/           # サンプルプロジェクト
├── scripts/            # 各種スクリプト (プロジェクトセットアップ等)
├── templates/          # AI プロンプト等のテンプレート
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

## 🚀 クイックスタート

### 1. このテンプレートからリポジトリ作成

GitHub CLIを使用する場合:

```bash
gh repo create YOUR_NEW_PROJECT_NAME --private --template YOUR_TEMPLATE_REPOSITORY_NAME
```

または、GitHub UI上で "Use this template" ボタンをクリックして新しいリポジトリを作成します。
（このテンプレートのリポジトリ名を`YOUR_TEMPLATE_REPOSITORY_NAME`の部分に指定してください）

### 2. プロジェクトのセットアップ

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_NEW_PROJECT_NAME.git
cd YOUR_NEW_PROJECT_NAME
npm install
npm run setup
```

`npm run setup`を実行すると、対話形式でプロジェクト名や使用技術などを設定でき、関連するドキュメントや`package.json`が自動的に更新されます。
（`npm run configure`も`npm run setup`と同じ動作をします）

## 🛠️ 開発環境

### Dev Container（推奨）

このテンプレートはDev Containerをサポートしており、VS Codeで一貫した開発環境を簡単に構築できます。

1. VS Codeでプロジェクトを開きます。
2. 左下の緑色のリモートウィンドウインジケーターをクリックするか、コマンドパレット（`Ctrl+Shift+P`または`Cmd+Shift+P`）を開いて "Remote-Containers: Reopen in Container" を選択します。
3. コンテナーのビルドが完了すると、開発環境が自動的にセットアップされます。

Dev Containerを利用することで、必要なツールや拡張機能がプリインストールされた環境で開発を開始できます。

## 📋 前提条件

### 必須

- [ ] GitHub Businessアカウント
- [ ] GitHub Copilot Businessライセンス
- [ ] Node.js 18+

### 推奨AI Tools

- [ ] Claude/ChatGPTアカウント（要件定義用）
- [ ] Windsurfライセンス（PoC・テスト用）
- [ ] Cursor Pro（実装補助用）

## 🎯 ワークフロー概要

### Phase 1: 要件収集・基本設計

- **AI**: Claude/Gemini/ChatGPT
- **人間**: 戦略的判断・ビジネス価値評価

### Phase 2: PoC開発

- **AI**: Windsurf（自動運転モード）
- **人間**: 検証結果評価・実装計画判断

### Phase 3-4: 実装

- **AI**: GitHub Copilot/Cursor
- **人間**: 複雑な問題解決・進捗管理

### Phase 5: コードレビュー

- **AI**: GitHub Copilot Coding Agent
- **人間**: ビジネスロジック確認・最終判断

## 📄 License

MIT License
