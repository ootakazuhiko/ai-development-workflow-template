\
# AI Development Workflow Template 利用・テストガイド

## 1. はじめに

このドキュメントは、「AI Development Workflow Template」の基本的な利用手順と、各機能が正しく動作するかを確認するためのテスト手順を説明します。
このテンプレートを効果的に活用し、AI支援による開発プロセスを円滑に進めるためにお役立てください。

## 2. セットアップ

### 2.1. 前提条件

まず、`README.md` の「[📋 前提条件](README.md#前提条件)」セクションに記載されている必要なアカウントやツールが準備されていることを確認してください。

### 2.2. リポジトリの作成と初期設定

1.  **テンプレートからリポジトリを作成:**
    `README.md` の「[🚀 クイックスタート](README.md#クイックスタート)」セクションの手順に従い、このテンプレートから新しいリポジトリを作成します。

2.  **ローカル環境へのクローンと依存関係のインストール:**
    作成したリポジトリをローカルにクローンし、必要な依存関係をインストールします。
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_NEW_PROJECT_NAME.git
    cd YOUR_NEW_PROJECT_NAME
    npm install
    ```

3.  **プロジェクト初期設定スクリプトの実行:**
    以下のコマンドを実行し、対話形式でプロジェクト情報を入力します。
    ```bash
    npm run setup
    ```
    *   **確認ポイント:**
        *   スクリプトが正常に完了すること。
        *   `package.json` の `name`, `version`, `description`, `author` が入力内容で更新されていること。
        *   `docs/PROJECT_CONTEXT.md` が入力内容で更新されていること（`PROJECT_CONTEXT.template.md` からコピー・生成）。
        *   `docs/CODING_STANDARDS.md` が選択した言語に応じて内容が調整されていること（`CODING_STANDARDS.template.md` からコピー・生成）。
        *   `docs/ARCHITECTURE.md` にMermaid.jsのサンプル図が挿入されていること（`ARCHITECTURE.template.md` からコピー・生成）。

### 2.3. Dev Container の利用 (推奨)

`README.md` の「[🛠️ 開発環境](README.md#開発環境)」セクションを参照し、Dev Container を利用して開発環境を構築します。

*   **確認ポイント:**
    *   VS Code でコンテナが正常に起動し、プロジェクトが開けること。
    *   推奨されるVS Code拡張機能（`.vscode/extensions.json` に記載）がインストールされていること。
    *   ターミナルが利用可能で、Node.jsやnpmコマンドが実行できること。

## 3. 基本的な利用フロー（兼テストシナリオ）

ここでは、テンプレートの主要な機能を一通り利用する手順を説明します。これがそのままテストシナリオとなります。
詳細なワークフローについては `docs/WORKFLOW_GUIDE.md` も参照してください。

### 3.1. Phase 1: 要件定義

1.  **要件定義 Issue の作成:**
    *   GitHubリポジトリの Issues タブを開き、「New issue」をクリックします。
    *   「要件定義」テンプレートを選択し、必要な情報を入力して Issue を作成します。
    *   **確認ポイント:**
        *   Issue が「要件定義」テンプレートの内容で正しく作成されること。
        *   GitHub Actions (`ai-development-workflow.yml`) がトリガーされ、Issue 作成時に設定されたガイダンスコメントが自動的に投稿されること。

2.  **プロジェクトコンテキストの更新:**
    *   `docs/PROJECT_CONTEXT.md` を開き、プロジェクトの目的、スコープ、主要機能などの詳細を追記・更新します。
    *   **確認ポイント:** Markdownファイルが正しく編集・保存できること。

3.  **AI との対話記録:**
    *   （任意）要件定義に関してAI（例: ChatGPT, Claude）と対話した場合、その主要なやり取りや結論を `docs/AI_INTERACTION_LOG.md` に記録します。
    *   AIプロンプトのヒントは `templates/ai-prompts.md` を参照してください。

### 3.2. Phase 2: PoC (Proof of Concept) 開発

1.  **PoC 結果報告 Issue の作成:**
    *   「PoC結果報告」テンプレートを使って Issue を作成し、PoCの目的、実施内容、結果、考察などを記録します。
    *   関連する「要件定義」Issueへのリンクを記載します (例: `Related to #1`)。
    *   **確認ポイント:** Issue が正しく作成され、関連Issueへのリンクが機能すること。

2.  **アーキテクチャドキュメントの更新:**
    *   PoCの結果や設計検討に基づき、`docs/ARCHITECTURE.md` にシステム構成図（Mermaid.jsを利用推奨）、コンポーネント設計、技術選定理由などを記述します。
    *   **確認ポイント:** Mermaid図が正しく表示されること（VS CodeのプレビューやGitHub上での表示）。

### 3.3. Phase 3-4: 実装

1.  **実装タスク Issue の作成:**
    *   「実装タスク」テンプレートを使って、具体的な開発タスクの Issue を作成します。
    *   担当者、期限、受け入れ基準などを明確にします。

2.  **ブランチの作成:**
    *   作成した実装タスク Issue から、または `feature/issue番号-短い説明` のような命名規則で新しいブランチを作成します。

3.  **コードの実装:**
    *   （例として）`examples/sample-project/app.js` に簡単なAPIエンドポイントを追加するなどの変更を行います。
    *   コーディング規約は `docs/CODING_STANDARDS.md` を参照してください。
    *   AIツール（GitHub Copilotなど）を活用してコーディングを行います。推奨ツールについては `docs/AI_TOOLS_GUIDE.md` を参照してください。

4.  **コミットとプッシュ:**
    *   変更内容をコミットし、リモートリポジトリにプッシュします。

5.  **Pull Request (PR) の作成:**
    *   作成したブランチから `main` (または開発用ブランチ) への Pull Request を作成します。
    *   PRのタイトルや説明には、関連する Issue 番号を記載します。
    *   **確認ポイント:**
        *   `.github/pull_request_template.md` の内容がPRの説明に自動的に挿入されること。
        *   GitHub Actions がトリガーされること。
            *   PR作成時に設定されたガイダンスコメントが自動的に投稿されること。
            *   `@github-copilot` （または設定したレビュアー）が自動的にレビュアーとして割り当てられること（リポジトリ設定で Copilot のレビューが許可されている場合）。
            *   `lint-and-test` ジョブが実行されること（現状はスタブなので成功するはずです。実際のプロジェクトではテストコマンドを設定してください）。

### 3.4. Phase 5: コードレビューとマージ

1.  **コードレビュー:**
    *   （手動で）レビュアーがコードを確認し、コメントや修正提案を行います。
    *   GitHub Copilot Chat などのAIツールを活用して、レビューの観点や改善案を得ることも有効です。

2.  **修正と再レビュー:**
    *   指摘事項に基づきコードを修正し、再度プッシュします。

3.  **マージ:**
    *   レビューが完了し、CI/CD（設定していれば）が成功したら、PRをマージします。
    *   **確認ポイント:** PRが正常にマージできること。

## 4. 各ドキュメントの参照

開発の各フェーズで以下のドキュメントを参照してください。

-   **全体的な開発ワークフロー:** `docs/WORKFLOW_GUIDE.md`
-   **AIツールの利用方法:** `docs/AI_TOOLS_GUIDE.md`
-   **コーディング規約:** `docs/CODING_STANDARDS.md` (初期設定スクリプトで生成・カスタマイズ済み)
-   **プロジェクト固有情報:** `docs/PROJECT_CONTEXT.md` (初期設定スクリプトで生成・カスタマイズ済み)
-   **AIプロンプト集:** `templates/ai-prompts.md`

## 5. トラブルシューティング

-   **GitHub Actions が動作しない:**
    *   リポジトリの Settings > Actions > General で、Workflow permissions が "Read and write permissions" になっているか確認してください。
    *   ワークフローファイル (`.github/workflows/ai-development-workflow.yml`) の構文エラーがないか確認してください。
-   **Dev Container が起動しない:**
    *   Docker Desktop が起動しているか確認してください。
    *   `.devcontainer/devcontainer.json` や `docker-compose.yml`, `Dockerfile` の記述に誤りがないか確認してください。

## 6. その他

このテンプレートは基本的な枠組みを提供します。プロジェクトの特性に合わせて、Issueテンプレート、ワークフロー、ドキュメントなどを自由にカスタマイズしてください。

フィードバックや改善提案があれば、Issueでお知らせいただけると幸いです。
