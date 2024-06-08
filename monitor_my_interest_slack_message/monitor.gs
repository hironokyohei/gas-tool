function doPost(e) {
  var json = JSON.parse(e.postData.contents);
  var response = main(json)
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function main(json) {


  console.log(json);

  try {
    // Slackの確認リクエストに対応する
    if (json.type === 'url_verification') {
      return response = {
        "statusCode": 200,
        "message": "Received message successfully",
        "receivedData": json
      };
    }

    // DEBUGシートの作成または取得
    var debugSheet = getDebugSheet();

    // DEBUGシートにeの内容を追記
    logToDebugSheet(debugSheet, json);

    // プロパティサービスからスプレッドシートID、シート名、検知変数のシート名、およびワークスペース名を取得
    var scriptProperties = PropertiesService.getScriptProperties();
    var spreadsheetId = scriptProperties.getProperty('spreadsheetId');
    var sheetName = scriptProperties.getProperty('sheetName');
    var detectSheetName = scriptProperties.getProperty('detectSheetName');
    var workspaceName = scriptProperties.getProperty('workspaceName');

    // スプレッドシートのIDとシート名を指定
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
    var detectSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(detectSheetName);

    // ヘッダー行の設定
    var headers = ["検知タイプ", "検知内容", "投稿ユーザID", "投稿ユーザ名", "投稿チャンネルID", "投稿チャンネル名", "投稿メッセージ", "slackURL", "チェックボックス", "messageTs"];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setBackground('#D3D3D3'); // ヘッダー行の背景色を設定
      sheet.getRange(1, 1, 1, 2).setBackground('#FFA500'); // 検知タイプと検知内容の背景色をオレンジ色に設定
    }

    // イベント情報の取得
    var event = json.event;
    var eventTimestamp = json.event.ts || json.event.event_ts;
    var userId = event.user;
    var userName = getUserName(userId);
    var channelId = event.channel || (event.item && event.item.channel);
    var channelName = getChannelName(channelId);
    var messageTs = event.ts || (event.item && event.item.ts);

    // 同じタイミングで同リクエストがくる場合への考慮
    // 同じメッセージが蓄積されてこないように防御
    if (isDuplicate(sheet, userId, channelId, messageTs)) {
      return response = {
        "statusCode": 200,
        "message": "Duplicate message detected"
      };
    }

    // 検知変数のシートから検知条件を取得
    var detectData = detectSheet.getRange(2, 1, detectSheet.getLastRow() - 1, 3).getValues();
    var wordsToDetect = [];
    var mentionsToDetect = [];
    var reactionsToDetect = [];

    detectData.forEach(function(row) {
      var detectionType = row[0];
      var detectionContent = row[1];
      var detectionRemarks = row[2];

      if (detectionType === "ワード") {
        // wordsToDetect.push(detectionContent);
        wordsToDetect.push({
          content: detectionContent,
          remarks: detectionRemarks
        });
      } else if (detectionType === "メンション") {
        // mentionsToDetect.push(detectionContent);
        mentionsToDetect.push({
          content: detectionContent,
          remarks: detectionRemarks
        });
      } else if (detectionType === "リアクション") {
        // reactionsToDetect.push(detectionContent);
        reactionsToDetect.push({
          content: detectionContent,
          remarks: detectionRemarks
        });
      }
    });

    // メッセージの検知条件をチェック
    var conditionMet = false;
    var triggerType = "";
    var triggerContent = "";
    var message = event.text || (event.message && event.message.text);
    var slackUrl = "";

    // ワードの検知
    if (event.type === 'message') {
      wordsToDetect.forEach(function(wordObj) {
        var word = wordObj.content;
        if (message.includes(word)) {
          conditionMet = true;
          triggerType = "ワード検知";
          triggerContent = word;
          slackUrl = `https://${workspaceName}.slack.com/archives/${channelId}/p${messageTs}`;
        }
      });

      // メンションの検知
      mentionsToDetect.forEach(function(mentionObj) {
        var mention = mentionObj.content;
        var remarks = mentionObj.remarks;
        if (message.includes(mention)) {
          conditionMet = true;
          triggerType = "メンション";
          triggerContent = remarks; // シートに通知先をいれておく
              message = message.replace(new RegExp(`@${mention}`, 'g'), `${remarks}`);
          slackUrl = `https://${workspaceName}.slack.com/archives/${channelId}/p${messageTs}`;
        }
      });
    }

    // リアクションイベントの処理
    if (event.type === 'reaction_added') {
      var reaction = event.reaction;
      var messageResponse = getReactionedMessage(channelId, messageTs);
      reactionsToDetect.forEach(function(reactionToDetectObj) {
        var reactionToDetect = reactionToDetectObj.content;
        if (reaction.includes(reactionToDetect)) {
          conditionMet = true;
          triggerType = "リアクション";
          triggerContent = reaction;
          message = messageResponse;
          slackUrl = `https://${workspaceName}.slack.com/archives/${channelId}/p${messageTs}`;
        }
      });
    }

    // 検知条件を満たした場合にスプレッドシートに書き込み
    if (conditionMet) {
      var rowData = [
        triggerType,
        triggerContent,
        userId,
        userName,
        channelId,
        channelName,
        message,
        slackUrl,
        '',
        eventTimestamp
      ];
      sheet.appendRow(rowData);
    }

    return response = {
      "statusCode": 200,
      "message": "Received message successfully",
      "receivedData": json
    };

  } catch (error) {
    return response = {
      "statusCode": 500,
      "message": "Error: " + error.message
    };
  }
}

// メンバーIDから実際のユーザ名を取得する関数
function getUserName(userId) {
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    var slackToken = scriptProperties.getProperty('slackToken');
    var url = `https://slack.com/api/users.info?user=${userId}`;
    var options = {
      headers: {
        'Authorization': 'Bearer ' + slackToken,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());
    if (data.ok) {
      var userName = data.user.profile.real_name;
      return userName;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// チャンネルIDからチャンネル名を取得する関数
function getChannelName(channelId) {
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    var slackToken = scriptProperties.getProperty('slackToken');
    var url = `https://slack.com/api/conversations.info?channel=${channelId}`;
    var options = {
      headers: {
        'Authorization': 'Bearer ' + slackToken,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());
    if (data.ok) {
      var channelName = data.channel.name;
      return channelName;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 指定したチャンネルとタイムスタンプのメッセージを取得する関数
function getReactionedMessage(channel, messageTs) {
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    var slackToken = scriptProperties.getProperty('slackToken');
    var url = `https://slack.com/api/conversations.replies?channel=${channel}&ts=${messageTs}&limit=1&inclusive=true`;
    var options = {
      headers: {
        'Authorization': 'Bearer ' + slackToken,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());
    if (data.ok && data.messages.length > 0) {
      var messageResponse = data.messages[0].text;
      return messageResponse;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// DEBUGシートの作成または取得
function getDebugSheet() {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty('spreadsheetId');
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var debugSheet = spreadsheet.getSheetByName('DEBUG');
  if (!debugSheet) {
    debugSheet = spreadsheet.insertSheet('DEBUG');
    debugSheet.appendRow(['Timestamp', 'Content']);
  }
  return debugSheet;
}

// DEBUGシートにログを追記
function logToDebugSheet(sheet, json) {
  var timestamp = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  // シートの最初の行がヘッダーかどうかをチェック
  if (sheet.getLastRow() === 0) {
    // ヘッダー行を設定
    var headers = ["Timestamp", "Event Type", "Text", "Reaction", "json"];
    sheet.appendRow(headers);
  }

  // イベントデータを取得
  var eventType = json.event.type || "";
  var eventText = json.event.text || "";
  var eventReaction = json.event.reaction || "";

  // データ行を追加
  sheet.appendRow([timestamp, eventType, eventText, eventReaction, json]);
}

// キャッシュの重複チェック
// 同タイミングのリクエストはシートのキャッシュによって防ぐ
// メッセージの重複チェックを行う
function isDuplicate(sheet, userId, channelId, messageTs) {
    var cache = CacheService.getScriptCache();
    var cacheKey = `${userId}-${channelId}-${messageTs}`;
    var cached = cache.get(cacheKey);
    if (cached) {
      console.log("キャシュがすでに存在していました。");
      return true;
    }

    // Cacheにキーをセット（5分間有効）
    // チェックなのにストアするのは禁じ手だけどまあよい
    cache.put(cacheKey, 'processed', 5);

    var data = sheet.getDataRange().getValues();
    var isDuplicate = data.some(function(row) {
      return row[2] === userId && row[4] === channelId && row[9] === messageTs; // userId、channelId、messageTsが一致するか確認
    });

    if (isDuplicate) {
      console.log("同じメッセージがすでに存在していました。");
      return true;
    }

    return false;
}


function isCached(cacheKey) {
    var cache = CacheService.getScriptCache();
    var cached = cache.get(cacheKey);
    if (cached) {
      console.log("キャシュがすでに存在していました。");
      return true;
    }
    return false;
}
