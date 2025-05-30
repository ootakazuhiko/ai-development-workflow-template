# AI開発ワークフローガイド

このドキュメントは、本テンプレートを利用したAI開発の標準的なワークフローを説明します。

## フェーズ概要

1.  **[Phase 1: 要件定義](#phase-1-要件定義)**
2.  **[Phase 2: PoC開発](#phase-2-poc開発)
3.  **[Phase 3: 実装](#phase-3-実装)
4.  **[Phase 4: レビュー](#phase-4-レビュー)
5.  **[Phase 5: テストとデプロイ](#phase-5-テストとデプロイ)**

## Phase 1: 要件定義

-   **目的**: 開発するAI機能の目的、スコープ、主要な要件を明確にします。
-   **担当**: プロダクトオーナー、ビジネスアナリスト、AIエンジニア
-   **使用AI**: Claude, ChatGPT, Geminiなど
-   **成果物**: `requirements-definition.md` Issue
-   **進め方**:
    1.  ビジネス課題、ユーザーストーリーを整理します。
    2.  AIを活用して解決可能な機能要件、非機能要件を洗い出します。
    3.  AIとの議論ログをIssueに記録します。
    4.  ステークホルダーレビューと承認を得ます。

## Phase 2: PoC開発

-   **目的**: 主要機能の技術的実現可能性を検証し、リスクを早期に特定します。
-   **担当**: AIエンジニア、開発者
-   **使用AI**: Windsurf, GitHub Copilotなど
-   **成果物**: `poc-results.md` Issue, PoCコード
-   **進め方**:
    1.  要件定義Issueに基づき、検証スコープを決定します。
    2.  選択したAIツールや技術スタックでプロトタイプを開発します。
    3.  検証結果、発見事項、推奨アーキテクチャをIssueにまとめます。
    4.  移行判断チェックリストに基づき、次フェーズへの移行を決定します。

## Phase 3: 実装

-   **目的**: PoCの結果と設計に基づき、本番品質のコードを開発します。
-   **担当**: 開発者、AIエンジニア
-   **使用AI**: GitHub Copilot, Cursorなど
-   **成果物**: `implementation-task.md` Issue, 実装コード, 単体/統合テストコード
-   **進め方**:
    1.  PoCで確立されたアーキテクチャと実装ガイドラインに従います。
    2.  機能ごとにタスクIssueを作成し、実装を進めます。
    3.  コーディング標準、セキュリティ要件を遵守します。
    4.  単体テスト、統合テストを実装し、カバレッジを確保します。

## Phase 4: レビュー

-   **目的**: 実装されたコードの品質、設計の妥当性、要件充足度を確認します。
-   **担当**: 開発チーム、GitHub Copilot Agent
-   **使用AI**: GitHub Copilot Agent
-   **成果物**: Pull Requestレビューコメント、修正済みコード
-   **進め方**:
    1.  Pull Requestを作成し、`pull_request_template.md` に従って情報を記載します。
    2.  GitHub Copilot Agentをレビュアーに追加し、自動レビューを依頼します。
    3.  人間のレビュアーは、ビジネスロジックや設計の妥当性を中心に確認します。
    4.  フィードバックに基づきコードを修正し、承認を得ます。

## Phase 5: テストとデプロイ

-   **目的**: システム全体の動作を検証し、本番環境へリリースします。
-   **担当**: QAエンジニア、開発者、運用担当
-   **使用AI**: GitHub Copilot, テスト自動化支援AIツールなど
-   **成果物**: テスト報告書、リリース済みアプリケーション
-   **進め方**:
    1.  **AIを活用したテスト**:
        -   **テストケース生成**: 要件定義や仕様書に基づき、AIにテストケース（正常系、異常系、境界値）の草案を生成させます。
        -   **テストデータ生成**: AIに多様な入力パターンや大量のテストデータを生成させます。機密データはマスキング処理やダミーデータ生成をAIに依頼します。
        -   **テストコード生成支援**: AIにテストフレームワークに基づいたテストコードの雛形やスニペットを生成させ、開発の効率を上げます。
        -   **テスト結果分析**: 大量のテストログをAIに分析させ、エラー傾向の特定やバグ予測に役立てます。
        -   **探索的テスト支援**: AIにアプリケーションを操作させ、人間が見落としがちな問題を発見させます。
    2.  E2Eテスト、パフォーマンステスト、受け入れテストを実施します。
    3.  デプロイ手順に従い、各環境へリリースします。
    4.  リリース後の動作監視と、必要に応じた対応を行います。

## ドキュメント更新

各フェーズ完了時には、以下の関連ドキュメントを適宜更新してください。

-   `docs/PROJECT_CONTEXT.md`
-   `docs/AI_INTERACTION_LOG.md`
-   `docs/ARCHITECTURE.md`
-   `README.md` (必要に応じて)
