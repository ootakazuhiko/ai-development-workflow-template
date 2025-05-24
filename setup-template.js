// setup-template.js - Windows Git Bash対応版
const fs = require('fs');
const path = require('path');

console.log('🤖 AI Development Workflow Template Repository Setup');
console.log('==================================================');

// ディレクトリ構造作成
const directories = [
  '.github/ISSUE_TEMPLATE',
  '.github/workflows', 
  'docs',
  'scripts',
  'templates',
  'examples/sample-project'
];

console.log('📁 ディレクトリ構造作成中...');
directories.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`✅ ${dir}`);
});

// ファイル作成関数
function createFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath} 作成完了`);
  } catch (error) {
    console.error(`❌ ${filePath} 作成失敗:`, error.message);
  }
}

// README.md（テスト用）
createFile('README.md', `# 🤖 AI Development Workflow Template

GitHub中心の自動運転開発ワークフローを即座にセットアップできるテンプレートです。

## 🚀 クイックスタート

### 1. このテンプレートからリポジトリ作成
\`\`\`bash
gh repo create my-project --template your-username/ai-development-workflow-template
\`\`\`

### 2. 自動セットアップ実行
\`\`\`bash
git clone https://github.com/your-username/my-project.git
cd my-project
npm install
npm run configure
\`\`\`

## 📋 前提条件

### 必須
- [ ] GitHub Business アカウント
- [ ] GitHub Copilot Business ライセンス
- [ ] Node.js 18+

### 推奨AI Tools
- [ ] Claude/ChatGPT アカウント（要件定義用）
- [ ] Windsurf ライセンス（PoC・テスト用）
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
`);

console.log('\n✅ 基本ファイルが作成されました！');
console.log('\n📋 次のステップ:');
console.log('1. ls -la で作成確認');
console.log('2. より詳細なファイルを作成する場合は追加スクリプト実行');
