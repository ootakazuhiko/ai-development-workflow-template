# AI文脈継承ブリッジ戦略

## 🤖 フェーズ間AI文脈継承の仕組み

### 目的
各開発フェーズで使用するAIツールが、前フェーズの知識・決定事項・学習内容を効率的に引き継げるようにする。

## 📋 継承メカニズム

### 1. 構造化文脈情報
各フェーズ完了時に、以下の形式で構造化された情報を記録：

```yaml
# ai-context-[phase-name].yml
phase: "requirements-definition"
completion_date: "2025-05-25"
ai_tools_used:
  - claude-3.5-sonnet
  - github-copilot
key_decisions:
  - decision: "技術スタックにNext.js + TypeScript採用"
    reasoning: "チーム経験、型安全性、パフォーマンス"
    impact: "実装フェーズ全体"
critical_constraints:
  - type: "security"
    description: "金融データ取り扱いのため高セキュリティ要件"
  - type: "performance"  
    description: "レスポンス時間100ms以内"
learned_patterns:
  - pattern: "ユーザーは複数デバイス対応を重視"
    evidence: "インタビュー結果、競合分析"
next_phase_focus:
  - "認証機能のPoC優先"
  - "パフォーマンス計測の仕組み"
```

### 2. AI-to-AI引き継ぎプロンプト
フェーズ開始時に新しいAIに文脈を効率的に伝達するためのテンプレート：

```text
# AI文脈継承プロンプト（PoC開始時）
あなたは[プロジェクト名]のPoCフェーズを担当するAIです。
前フェーズ（要件定義）で以下が決定されました：

## 重要決定事項
[ai-context-requirements.yml の key_decisions をここに転記]

## 制約条件
[ai-context-requirements.yml の critical_constraints をここに転記]

## 学習パターン
[ai-context-requirements.yml の learned_patterns をここに転記]

## あなたの今フェーズの責務
- 技術実現可能性の検証
- アーキテクチャ選択肢の提示
- リスクの早期発見

これらの文脈を踏まえて、PoCフェーズを開始してください。
不明点があれば質問してください。
```

### 3. 継承品質チェック
```markdown
## 文脈継承品質チェックリスト
- [ ] 前フェーズの重要決定事項を理解している
- [ ] 制約条件を把握している
- [ ] 学習パターンを認識している
- [ ] 引き継ぎ漏れがない
- [ ] 新フェーズの責務を理解している
```

## 🔄 実装方法

### 1. GitHub Actions による自動化
フェーズ完了時に構造化文脈情報を自動生成・保存

### 2. スクリプト支援
`scripts/ai-context-bridge.js` で文脈継承を支援

### 3. テンプレート統合
各IssueテンプレートにAI文脈継承セクションを追加

## 📊 効果測定

### メトリクス
- 文脈継承の完了率
- フェーズ開始時の準備時間短縮
- 決定事項の一貫性スコア
- 手戻り率の削減

### 継続改善
月次で文脈継承の品質を振り返り、プロセス改善を実施

---

この仕組みにより、AIチーム間での知識・文脈の継承が格段に改善され、各フェーズでの生産性向上と品質確保を実現します。
