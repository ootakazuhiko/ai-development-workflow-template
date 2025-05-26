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
-   **関連Issueテンプレート**:
    -   `requirements-definition.md` ([テンプレート](../../.github/ISSUE_TEMPLATE/requirements-definition.md))
-   **主要参照ドキュメント**:
    -   `docs/PROJECT_CONTEXT.md` ([内容はこちら](../../docs/PROJECT_CONTEXT.md))
    -   `docs/AI_INTERACTION_LOG.template.md` ([テンプレート](../../docs/AI_INTERACTION_LOG.template.md))
    -   `templates/ai-prompts.md` ([プロンプト集](../../templates/ai-prompts.md) - 特に「要件定義フェーズ」セクション参照)
    -   `docs/PROMPT_ENGINEERING_STRATEGY.md` ([戦略ガイド](../../docs/PROMPT_ENGINEERING_STRATEGY.md))
-   **成果物チェックリスト（簡易版）**:
    -   `requirements-definition.md` Issue が作成され、主要な項目が記載されている。
    -   `docs/PROJECT_CONTEXT.md` が最新の状態に更新されている。
    -   `docs/AI_INTERACTION_LOG.md` にAIとの主要なやり取りが記録されている。
-   **進め方**:
    1.  ビジネス課題、ユーザーストーリーを整理します ([`docs/PROJECT_CONTEXT.md`](../../docs/PROJECT_CONTEXT.md) を更新)。
    2.  AIを活用して解決可能な機能要件、非機能要件を洗い出します。推奨プロンプト:
        -   `templates/ai-prompts.md` の「プロジェクト概要からの要件洗い出し」プロンプト
        -   `templates/ai-prompts.md` の「特定ユーザーストーリーの深掘り」プロンプト
    3.  AIとの議論ログを `docs/AI_INTERACTION_LOG.md` に記録します。
    4.  ステークホルダーレビューと承認を得ます。
-   **関連スクリプト**:
    -   `npm run setup` または `npm run configure`: (未実施の場合) プロジェクト初期設定を行い、`docs/PROJECT_CONTEXT.md` 等を生成。
    -   `npm run ai-context -- complete --phase=requirements` (または `npm run context-bridge`): フェーズ完了時に文脈情報を記録。

## Phase 2: PoC開発

-   **目的**: 主要機能の技術的実現可能性を検証し、リスクを早期に特定します。
-   **担当**: AIエンジニア、開発者
-   **使用AI**: Windsurf, GitHub Copilotなど
-   **関連Issueテンプレート**:
    -   `poc-results.md` ([テンプレート](../../.github/ISSUE_TEMPLATE/poc-results.md))
-   **主要参照ドキュメント**:
    -   `requirements-definition.md` Issue (Phase 1の成果物)
    -   `docs/PROJECT_CONTEXT.md` ([内容はこちら](../../docs/PROJECT_CONTEXT.md))
    -   `docs/AI_INTERACTION_LOG.md` ([内容はこちら](../../docs/AI_INTERACTION_LOG.md))
    -   `templates/ai-prompts.md` ([プロンプト集](../../templates/ai-prompts.md) - 特に「設計フェーズ」セクション参照)
    -   `docs/PROMPT_ENGINEERING_STRATEGY.md` ([戦略ガイド](../../docs/PROMPT_ENGINEERING_STRATEGY.md) - 特に「PoC設計プロンプト」参照)
-   **成果物チェックリスト（簡易版）**:
    -   `poc-results.md` Issue が作成され、検証結果が記載されている。
    -   PoCコード (リポジトリ内の適切な場所、またはIssueに添付)。
    -   `docs/ARCHITECTURE.md` に初期アーキテクチャ案が記載されている ([内容はこちら](../../docs/ARCHITECTURE.md))。
    -   `docs/AI_INTERACTION_LOG.md` にPoC開発中のAIとの主要なやり取りが記録されている。
-   **進め方**:
    1.  要件定義Issueに基づき、検証スコープを決定します。
    2.  選択したAIツールや技術スタックでプロトタイプを開発します。推奨プロンプト:
        -   `templates/ai-prompts.md` の「基本的なCRUD処理の実装支援」プロンプト
        -   `templates/ai-prompts.md` の「特定技術に関する情報収集」プロンプト
    3.  検証結果、発見事項、推奨アーキテクチャをIssueにまとめます。
    4.  移行判断チェックリストに基づき、次フェーズへの移行を決定します。
-   **関連スクリプト**:
    -   `npm run ai-context -- start --phase=poc`: PoCフェーズ開始時に文脈情報スナップショットを作成。
    -   `npm run ai-context -- complete --phase=poc`: PoCフェーズ完了時に文脈情報を記録。

## Phase 3: 実装

-   **目的**: PoCの結果と設計に基づき、本番品質のコードを開発します。
-   **担当**: 開発者、AIエンジニア
-   **使用AI**: GitHub Copilot, Cursorなど
-   **関連Issueテンプレート**:
    -   `implementation-task.md` ([テンプレート](../../.github/ISSUE_TEMPLATE/implementation-task.md))
-   **主要参照ドキュメント**:
    -   `poc-results.md` Issue (Phase 2の成果物)
    -   `docs/ARCHITECTURE.md` ([内容はこちら](../../docs/ARCHITECTURE.md))
    -   `docs/CODING_STANDARDS.md` (存在する場合)
    -   `templates/ai-prompts.md` ([プロンプト集](../../templates/ai-prompts.md) - 特に「実装フェーズ」セクション参照)
    -   `docs/PROMPT_ENGINEERING_STRATEGY.md` ([戦略ガイド](../../docs/PROMPT_ENGINEERING_STRATEGY.md) - 特に「コード生成プロンプト」参照)
-   **成果物チェックリスト（簡易版）**:
    -   `implementation-task.md` Issue が各タスクに対して作成されている。
    -   実装コード (リポジトリにコミット済み)。
    -   単体/統合テストコード (リポジトリにコミット済み、カバレッジ目標達成)。
    -   `docs/ARCHITECTURE.md` が最新の状態に更新されている。
    -   `docs/AI_INTERACTION_LOG.md` に実装中のAIとの主要なやり取りが記録されている。
-   **進め方**:
    1.  PoCで確立されたアーキテクチャと実装ガイドラインに従います。
    2.  機能ごとにタスクIssueを作成し、実装を進めます。推奨プロンプト:
        -   `templates/ai-prompts.md` の「既存コードの理解とリファクタリング支援」プロンプト
        -   `templates/ai-prompts.md` の「エラー解決とデバッグ支援」プロンプト
        -   `templates/ai-prompts.md` の「テストコード生成支援」プロンプト
    3.  コーディング標準、セキュリティ要件を遵守します。
    4.  単体テスト、統合テストを実装し、カバレッジを確保します。
-   **関連スクリプト**:
    -   `npm run ai-context -- start --phase=implementation`: 実装フェーズ開始時に文脈情報スナップショットを作成。
    -   `npm run ai-context -- complete --phase=implementation`: 実装フェーズ完了時に文脈情報を記録。
    -   `npm run lint` および `npm run test`: コード品質とテストカバレッジを確認。

## Phase 4: レビュー

-   **目的**: 実装されたコードの品質、設計の妥当性、要件充足度を確認します。
-   **担当**: 開発チーム、GitHub Copilot Agent
-   **使用AI**: GitHub Copilot Agent
-   **関連Issueテンプレート**:
    -   Pull Request (PR) を使用 ([PRテンプレート](../../.github/pull_request_template.md))
-   **主要参照ドキュメント**:
    -   `implementation-task.md` Issue (Phase 3の成果物)
    -   `docs/ARCHITECTURE.md` ([内容はこちら](../../docs/ARCHITECTURE.md))
    -   `docs/CODING_STANDARDS.md` (存在する場合)
    -   `templates/ai-prompts.md` ([プロンプト集](../../templates/ai-prompts.md) - 特に「テスト・レビューフェーズ」セクション参照)
    -   `docs/PROMPT_ENGINEERING_STRATEGY.md` ([戦略ガイド](../../docs/PROMPT_ENGINEERING_STRATEGY.md) - 特に「コードレビュープロンプト」参照)
-   **成果物チェックリスト（簡易版）**:
    -   Pull Request が作成され、レビューが行われている。
    -   レビューコメントに基づきコードが修正されている。
    -   自動テスト (CI) が成功している。
    -   `docs/AI_INTERACTION_LOG.md` にレビュー支援AIとの主要なやり取りが記録されている。
-   **進め方**:
    1.  Pull Requestを作成し、[PRテンプレート](../../.github/pull_request_template.md) に従って情報を記載します。
    2.  GitHub Copilot Agentをレビュアーに追加し、自動レビューを依頼します。推奨プロンプト:
        -   `templates/ai-prompts.md` の「Pull Request内容の要約とレビュー観点提示」プロンプト
    3.  人間のレビュアーは、ビジネスロジックや設計の妥当性を中心に確認します。
    4.  フィードバックに基づきコードを修正し、承認を得ます。
-   **関連スクリプト**:
    -   `npm run ai-context -- start --phase=review`: レビューフェーズ開始時に文脈情報スナップショットを作成。
    -   `npm run ai-context -- complete --phase=review`: レビューフェーズ完了時に文脈情報を記録。
    -   `npm run quality-check -- --phase=implementation` (または関連するフェーズ名): 実装物の品質をチェック。

## Phase 5: テストとデプロイ

-   **目的**: システム全体の動作を検証し、本番環境へリリースします。
-   **担当**: QAエンジニア、開発者、運用担当
-   **使用AI**: GitHub Copilot, テスト自動化支援AIツールなど
-   **主要参照ドキュメント**:
    -   `requirements-definition.md` Issue (Phase 1の成果物)
    -   `docs/ARCHITECTURE.md` ([内容はこちら](../../docs/ARCHITECTURE.md))
    -   `docs/DEPLOYMENT_GUIDE.md` (存在する場合)
    -   `templates/ai-prompts.md` ([プロンプト集](../../templates/ai-prompts.md) - 特に「テスト・レビューフェーズ」セクション参照)
    -   `docs/PROMPT_ENGINEERING_STRATEGY.md` ([戦略ガイド](../../docs/PROMPT_ENGINEERING_STRATEGY.md) - 特に「テスト戦略プロンプト」参照)
-   **成果物チェックリスト（簡易版）**:
    -   テスト計画書・テスト報告書が作成されている。
    -   E2Eテスト、パフォーマンステスト、UATが完了し、承認されている。
    -   アプリケーションが本番環境にリリースされている。
    -   `docs/PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md` 等の関連ドキュメントが最終化されている。
    -   `docs/AI_INTERACTION_LOG.md` にテスト・デプロイ中のAIとの主要なやり取りが記録されている。
-   **進め方**:
    1.  **AIを活用したテスト**:
        -   **テストケース生成**: 要件定義や仕様書に基づき、AIにテストケース（正常系、異常系、境界値）の草案を生成させます。推奨プロンプト: `templates/ai-prompts.md` の「テストケース生成支援」プロンプト
        -   **テストデータ生成**: AIに多様な入力パターンや大量のテストデータを生成させます。機密データはマスキング処理やダミーデータ生成をAIに依頼します。
        -   **テストコード生成支援**: AIにテストフレームワークに基づいたテストコードの雛形やスニペットを生成させ、開発の効率を上げます。
        -   **テスト結果分析**: 大量のテストログをAIに分析させ、エラー傾向の特定やバグ予測に役立てます。
        -   **探索的テスト支援**: AIにアプリケーションを操作させ、人間が見落としがちな問題を発見させます。
    2.  E2Eテスト、パフォーマンステスト、受け入れテストを実施します。
    3.  デプロイ手順に従い、各環境へリリースします。
    4.  リリース後の動作監視と、必要に応じた対応を行います。
-   **関連スクリプト**:
    -   `npm run ai-context -- start --phase=testing`: テストフェーズ開始時に文脈情報スナップショットを作成。
    -   `npm run ai-context -- complete --phase=testing`: テストフェーズ完了時に文脈情報を記録。
    -   `npm run quality-check -- --phase=review` (または関連するフェーズ名): レビュー済みコードの品質を最終チェック。
    -   `npm run deploy` (存在する場合): デプロイを実行。
