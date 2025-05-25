const { program } = require('commander');
const https = require('https');
const fs = require('fs');
const yaml = require('js-yaml');

program
  .option('--webhook-url <url>', 'Slack Webhook URL')
  .option('--teams-webhook <url>', 'Teams Webhook URL')
  .option('--phase <phase>', '完了フェーズ')
  .option('--issue-url <url>', 'GitHub Issue URL')
  .option('--repository <repo>', 'リポジトリ名')
  .option('--quality-score <score>', '品質スコア', '0')
  .parse();

const options = program.opts();

/**
 * チーム通知を送信
 */
async function sendTeamNotifications() {
  try {
    // 文脈データを読み込み
    const contextFile = `docs/ai-context/ai-context-${options.phase}.yml`;
    let contextData = {};
    
    if (fs.existsSync(contextFile)) {
      contextData = yaml.load(fs.readFileSync(contextFile, 'utf8'));
    }
    
    // 進捗データを読み込み
    let progressData = {};
    if (fs.existsSync('docs/ai-context/progress-dashboard.yml')) {
      progressData = yaml.load(fs.readFileSync('docs/ai-context/progress-dashboard.yml', 'utf8'));
    }
    
    // Slack通知
    if (options.webhookUrl) {
      await sendSlackNotification(contextData, progressData);
    }
    
    // Teams通知
    if (options.teamsWebhook) {
      await sendTeamsNotification(contextData, progressData);
    }
    
    console.log('✅ チーム通知送信完了');
    
  } catch (error) {
    console.error('通知送信エラー:', error);
    process.exit(1);
  }
}

/**
 * Slack通知を送信
 */
async function sendSlackNotification(contextData, progressData) {
  const qualityEmoji = getQualityEmoji(parseInt(options.qualityScore));
  const phaseEmoji = getPhaseEmoji(options.phase);
  
  const slackMessage = {
    text: `${phaseEmoji} ${options.phase}フェーズ完了`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${phaseEmoji} ${options.phase}フェーズ完了 - ${options.repository}`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*プロジェクト:* ${options.repository}`
          },
          {
            type: "mrkdwn",
            text: `*完了フェーズ:* ${options.phase}`
          },
          {
            type: "mrkdwn",
            text: `*品質スコア:* ${qualityEmoji} ${options.qualityScore}/100`
          },
          {
            type: "mrkdwn",
            text: `*全体進捗:* ${progressData.overall_progress?.completion_rate || 0}%`
          }
        ]
      }
    ]
  };
  
  // 重要決定事項があれば追加
  if (contextData.key_decisions && contextData.key_decisions.length > 0) {
    slackMessage.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*🎯 重要決定事項:*\n${contextData.key_decisions.slice(0, 3).map(d => `• ${d.decision}`).join('\n')}`
      }
    });
  }
  
  // 次フェーズ重点項目があれば追加
  if (contextData.next_phase_focus && contextData.next_phase_focus.length > 0) {
    slackMessage.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*📋 次フェーズ重点項目:*\n${contextData.next_phase_focus.slice(0, 3).map(item => `• ${item}`).join('\n')}`
      }
    });
  }
  
  // アクションボタン
  slackMessage.blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "📄 Issue詳細"
        },
        url: options.issueUrl,
        action_id: "view_issue"
      },
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "📊 進捗ダッシュボード"
        },
        url: `https://github.com/${options.repository}/tree/main/docs/ai-context`,
        action_id: "view_progress"
      }
    ]
  });
  
  await sendWebhookMessage(options.webhookUrl, slackMessage);
  console.log('✅ Slack通知送信完了');
}

/**
 * Teams通知を送信
 */
async function sendTeamsNotification(contextData, progressData) {
  const qualityEmoji = getQualityEmoji(parseInt(options.qualityScore));
  const phaseEmoji = getPhaseEmoji(options.phase);
  
  const teamsMessage = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "themeColor": getThemeColor(parseInt(options.qualityScore)),
    "summary": `${options.phase}フェーズ完了 - ${options.repository}`,
    "sections": [
      {
        "activityTitle": `${phaseEmoji} ${options.phase}フェーズ完了`,
        "activitySubtitle": `プロジェクト: ${options.repository}`,
        "facts": [
          {
            "name": "完了フェーズ",
            "value": options.phase
          },
          {
            "name": "品質スコア",
            "value": `${qualityEmoji} ${options.qualityScore}/100`
          },
          {
            "name": "全体進捗",
            "value": `${progressData.overall_progress?.completion_rate || 0}%`
          }
        ],
        "markdown": true
      }
    ],
    "potentialAction": [
      {
        "@type": "OpenUri",
        "name": "Issue詳細を確認",
        "targets": [
          {
            "os": "default",
            "uri": options.issueUrl
          }
        ]
      },
      {
        "@type": "OpenUri",
        "name": "進捗ダッシュボード",
        "targets": [
          {
            "os": "default",
            "uri": `https://github.com/${options.repository}/tree/main/docs/ai-context`
          }
        ]
      }
    ]
  };
  
  // 重要決定事項がある場合
  if (contextData.key_decisions && contextData.key_decisions.length > 0) {
    teamsMessage.sections.push({
      "activityTitle": "🎯 重要決定事項",
      "text": contextData.key_decisions.slice(0, 3).map(d => `• ${d.decision}`).join('\n\n'),
      "markdown": true
    });
  }
  
  // 次フェーズ重点項目がある場合
  if (contextData.next_phase_focus && contextData.next_phase_focus.length > 0) {
    teamsMessage.sections.push({
      "activityTitle": "📋 次フェーズ重点項目",
      "text": contextData.next_phase_focus.slice(0, 3).map(item => `• ${item}`).join('\n\n'),
      "markdown": true
    });
  }
  
  await sendWebhookMessage(options.teamsWebhook, teamsMessage);
  console.log('✅ Teams通知送信完了');
}

/**
 * Webhook経由でメッセージを送信
 */
function sendWebhookMessage(webhookUrl, message) {
  return new Promise((resolve, reject) => {
    const url = new URL(webhookUrl);
    const data = JSON.stringify(message);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

/**
 * 品質スコアに基づくEmoji取得
 */
function getQualityEmoji(score) {
  if (score >= 90) return '🏆';
  if (score >= 80) return '⭐';
  if (score >= 70) return '✅';
  if (score >= 60) return '⚠️';
  return '🔴';
}

/**
 * フェーズに基づくEmoji取得
 */
function getPhaseEmoji(phase) {
  const emojis = {
    'requirements': '📋',
    'poc': '🧪',
    'implementation': '⚡',
    'review': '👀',
    'testing': '🚀'
  };
  return emojis[phase] || '✨';
}

/**
 * テーマカラー取得（Teams用）
 */
function getThemeColor(score) {
  if (score >= 80) return '28a745'; // 緑
  if (score >= 70) return 'ffc107'; // 黄
  if (score >= 60) return 'fd7e14'; // オレンジ
  return 'dc3545'; // 赤
}

if (require.main === module) {
  sendTeamNotifications();
}

module.exports = {
  sendTeamNotifications,
  sendSlackNotification,
  sendTeamsNotification
};
