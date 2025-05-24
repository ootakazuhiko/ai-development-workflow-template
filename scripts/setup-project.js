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
