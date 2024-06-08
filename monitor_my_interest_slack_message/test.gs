function testAllConditions() {
  // URL Verificationイベント
  var urlVerificationData = {
    "type": "url_verification",
    "challenge": "challenge_code"
  };

  // メッセージイベント
  var messageEventData = {
    "context_enterprise_id": null,
    "token": "9EA6G3gFvelwjgp0j6FgJ67w",
    "api_app_id": "A0765DEQ926",
    "type": "event_callback",
    "event": {
      "channel": "C0766AGS328",
      "channel_type": "group",
      "client_msg_id": "0497852b-a2eb-4ad9-a5ae-1feb383e9990",
      "ts": 1717837433.816759,
      "blocks": "[Ljava.lang.Object;@a2e2337",
      "team": "T03LGKPCJ",
      "text": "廣野",
      "type": "message",
      "event_ts": 1717837433.816759,
      "user": "USA2F25K2"
    },
    "event_id": "Ev077438BQFP",
    "event_context": "4-eyJldCI6Im1lc3NhZ2UiLCJ0aWQiOiJUMDNMR0tQQ0oiLCJhaWQiOiJBMDc2NURFUTkyNiIsImNpZCI6IkMwNzY2QUdTMzI4In0",
    "is_ext_shared_channel": false,
    "event_time": 1717837433.0,
    "authorizations": "[Ljava.lang.Object;@51c7c6f0",
    "context_team_id": "T03LGKPCJ",
    "team_id": "T03LGKPCJ"
  };

  // メンションイベント
  var mentionEventData = {
    "context_team_id": "T03LGKPCJ",
    "event_id": "Ev07743Y4XC5",
    "token": "9EA6G3gFvelwjgp0j6FgJ67w",
    "event_time": 1717838515.0,
    "api_app_id": "A0765DEQ926",
    "event": {
      "text": "<@USA2F25K2> あっほ",
      "team": "T03LGKPCJ",
      "channel": "C0766AGS328",
      "ts": 1717838515.978129,
      "client_msg_id": "e6de87f8-ef21-4de2-9456-1c7f4d3e7fe5",
      "channel_type": "group",
      "user": "USA2F25K2",
      "type": "message",
      "blocks": "[Ljava.lang.Object;@46624867",
      "event_ts": 1717838515.978129
    },
    "event_context": "4-eyJldCI6Im1lc3NhZ2UiLCJ0aWQiOiJUMDNMR0tQQ0oiLCJhaWQiOiJBMDc2NURFUTkyNiIsImNpZCI6IkMwNzY2QUdTMzI4In0",
    "is_ext_shared_channel": false,
    "context_enterprise_id": null,
    "authorizations": "[Ljava.lang.Object;@4975d7eb",
    "type": "event_callback",
    "team_id": "T03LGKPCJ"
  };


  // リアクション追加イベント
  var reactionEventData = {
    "event_context": "4-eyJldCI6InJlYWN0aW9uX2FkZGVkIiwidGlkIjoiVDAzTEdLUENKIiwiYWlkIjoiQTA3NjVERVE5MjYiLCJjaWQiOiJDMDc2NkFHUzMyOCJ9",
    "event": {
      "item_user": "USA2F25K2",
      "reaction": "yamashita_miduki_山下_美月_nogizaka_乃木坂",
      "user": "USA2F25K2",
      "item": {
        "channel": "C0766AGS328",
        "type": "message",
        "ts": 1717838618.372369
      },
      "type": "reaction_added",
      "event_ts": 1717838636.0001
    },
    "authorizations": "[Ljava.lang.Object;@6638eeba",
    "is_ext_shared_channel": false,
    "api_app_id": "A0765DEQ926",
    "event_time": 1717838636.0,
    "event_id": "Ev0770BYT5QE",
    "type": "event_callback",
    "context_enterprise_id": null,
    "context_team_id": "T03LGKPCJ",
    "team_id": "T03LGKPCJ",
    "token": "9EA6G3gFvelwjgp0j6FgJ67w"
  };

  // 各テストイベントを実行
  console.log("urlVerificationTest:START");
  console.log(executeTestEvent(urlVerificationData));
  console.log("urlVerificationTest:END");

  console.log("messageEventData:START");
  console.log(executeTestEvent(messageEventData));
  console.log("messageEventData:END");

  console.log("mentionEventData:START");
  console.log(executeTestEvent(mentionEventData));
  console.log("mentionEventData:END");

  console.log("reactionEventData:START");
  console.log(executeTestEvent(reactionEventData));
  console.log("reactionEventData:END");
}

// テストイベントを実行する関数
function executeTestEvent(testData) {

  // mainを実行
  var response = main(testData);

  // レスポンスをログに出力
  return response;
}
