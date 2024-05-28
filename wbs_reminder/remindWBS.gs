// 変数定義
const slackWebhookUrl = "incoming-webhookのURLをいれる";
const spreadsheetId = "スプレッドシートのIDをいれる";
const wbsSheetName = "WBS";
const assignerSheetName = "担当者";

// グローバル変数
// 担当者とslackメンションのマッピングを取得する
const assignerMentionMapping = getAssignerMentionMapping(assignerSheetName);

// 実行関数
function remindWBS() {
  // WBSシート内のタスク状況を取得する
  const tasks = getTasks(wbsSheetName);

  // 担当者毎遅延タスクを抽出する
  let delayTasks = {};
  for (let task of tasks) {
    // 遅延していないものは抽出対象外
    if (!task.isDelay()) {
      continue;
    }

    // 担当者のキーがなければ新規作成して初期化しておく
    if (!delayTasks[task.slackMention]) {
      delayTasks[task.slackMention] = [];
    }

    delayTasks[task.slackMention].push(task);
  }

  // Slackに送信するメッセージを作成
  const messageList = generateMessageList(delayTasks);

  // slackにメッセージを投稿する
  SlackPostMessage(messageList);
}

