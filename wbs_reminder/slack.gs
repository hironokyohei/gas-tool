/**
 * slackへの投稿
 *
 * @param {Array{String}} messageList
 * @return {null}
 */
function SlackPostMessage(messageList) {
  // slack投稿は担当者単位とする
  for (message of messageList) {
    UrlFetchApp.fetch(slackWebhookUrl, {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify({
        "type": "mrkdwn",
        "text": message
      })
    });
  }
}