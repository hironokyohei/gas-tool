## README

### 概要

このGoogle Apps Script (GAS) は、Slackのイベントを受信し、特定の条件に基づいてGoogleスプレッドシートにログを記録するスクリプトです。主に、メッセージ、メンション、リアクションを検知し、それらの情報をスプレッドシートに保存します。

### 必要な設定

1. **スプレッドシートの準備**
	- スプレッドシートを作成し、そのIDを取得します。
	- スプレッドシート内に以下のシートを作成します：
		- メインのログシート（例：「Logs」）
		- 検知条件シート（例：「Detection」）
		- デバッグ用シート（例：「DEBUG」）

2. **スクリプトプロパティの設定**
	- `spreadsheetId`：スプレッドシートのID
	- `sheetName`：メインのログシートの名前
	- `detectSheetName`：検知条件シートの名前
	- `workspaceName`：Slackワークスペースの名前
	- `slackToken`：Slack APIトークン

### Slackアプリの設定

1. **Slack APIの設定**
	- [Slack API](https://api.slack.com/)にアクセスし、Slackワークスペースにログインします。
	- 「Create New App」をクリックし、「From scratch」を選択します。
	- アプリ名を入力し、対象のワークスペースを選択して「Create App」をクリックします。

2. **OAuth & Permissionsの設定**
	- 「OAuth & Permissions」を選択し、「OAuth Tokens for Your Workspace」で「Install App to Workspace」をクリックします。
	- 権限を確認し、「Allow」をクリックしてアプリをインストールします。
	- 発行されたOAuthトークンをコピーし、スクリプトプロパティの`slackToken`に設定します。

3. **イベントの設定**
	- 「Event Subscriptions」を選択し、「Enable Events」をオンにします。
	- 「Request URL」に、Google Apps ScriptのウェブアプリURLを入力します。これはGASのスクリプトエディタで「デプロイ」>「ウェブアプリとして導入」から取得できます。
	- 「Subscribe to bot events」で以下のイベントを追加します：
		- `message.channels`
		- `reaction_added`

4. **アプリの権限設定**
	- 「OAuth & Permissions」内の「Scopes」で、以下のBot Token Scopesを追加します：
		- `channels:history`
		- `channels:read`
		- `chat:write`
		- `reactions:read`
		- `users:read`
	- 必要に応じて追加の権限を設定します。

5. **アプリのインストール**
	- 設定が完了したら、「Install App to Workspace」ボタンをクリックしてアプリをワークスペースにインストールします。

### 関数の説明

#### `doPost(e)`
SlackからのPOSTリクエストを受け取り、JSONデータをパースしてメイン処理関数`main`に渡します。

#### `main(json)`
受信したSlackイベントを処理し、スプレッドシートにログを記録します。以下のステップで実行されます：
1. 確認リクエストに対応。
2. デバッグシートにログを書き込み。
3. スクリプトプロパティの取得。
4. スプレッドシートとシートの取得。
5. ヘッダー行の設定。
6. イベント情報の取得。
7. 重複リクエストの防止。
8. 検知条件の取得。
9. 検知条件のチェックとログの記録。

#### `getUserName(userId)`
Slack APIを使って、ユーザIDからユーザ名を取得します。

#### `getChannelName(channelId)`
Slack APIを使って、チャンネルIDからチャンネル名を取得します。

#### `getReactionedMessage(channel, messageTs)`
Slack APIを使って、特定のメッセージに対するリアクションの内容を取得します。

#### `getDebugSheet()`
デバッグ用のシートを作成または取得します。

#### `logToDebugSheet(sheet, json)`
デバッグシートに受信したイベントデータを記録します。

#### `isCached(userId, channelId, messageTs)`
キャッシュを利用して、同じタイミングでの重複リクエストを防ぎます。

#### `isMessageDuplicated(sheet, userId, channelId, message)`
スプレッドシート内のメッセージの重複をチェックします。

### スプレッドシートの構成

- **メインログシート**
	- 検知時刻、検知タイプ、検知内容、ユーザ情報、メッセージ内容などを記録します。

- **検知条件シート**
	- 検知タイプ（ワード、メンション、リアクション）とその内容を記載します。

- **デバッグシート**
	- デバッグ用のログを記録します。

### Slackとの連携

- Slack APIトークンを使って、ユーザ情報やチャンネル情報、メッセージ内容を取得します。
- SlackイベントAPIを使って、メッセージやリアクションのイベントを受信します。

### 注意事項

- スクリプトプロパティやSlack APIトークンの設定は適切に行ってください。
- 重複リクエストの防止やメッセージの重複チェックを行っています。
