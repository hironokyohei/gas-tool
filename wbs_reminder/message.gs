// メッセージ
const adminMessage = "to:WBS管理者 <@hironokyohei> <@hironokyohei> 担当者欄の更新および手動リマインドをお願いします。";

/**
 * メッセージを生成する関数
 * 生成メッセージを配列で返しているのは、担当者へのメンション単位でslackに投稿させることが目的
 * そうすることで、担当者との遅延の議論のスレッドをわけることができる
 * 
 * @param {Object} delayTasks
 * @return {Array{String}}
 */
function generateMessageList(delayTasks) {
  let ret = [];
  ret.push(["遅延しているタスクをご確認お願いします🙇‍♂️",
    "遅延タスクの判定条件： 完了予定日がすでに過ぎており、ステータスが完了以外のタスクです。",
    "===================================="].join("\n"));

  // 担当者に向けた遅延アラートを作成
  for (let [assigner, tasks] of Object.entries(delayTasks)) {
    let assinerAlert = [];
    assinerAlert.push(`${assigner}`)

    // 遅延しているタスクの一覧
    for (task of tasks) {
      assinerAlert.push([
        `● ステータス:\`${task.status.value}\``,
        `タスク:\`${task.name}\``,
        `遅延日数:\`${task.diffDelayDays()}\``]
        .join("\t"));
    }
    ret.push(assinerAlert.join("\n"));
  }

  ret.push(["====================================",
    `${Utilities.formatDate(new Date, 'JST', 'yyyy-MM-dd')}のリマインドは以上です。`,
    `WBSはこちら:https://docs.google.com/spreadsheets/d/${spreadsheetId}`].join("\n"));

  return ret;
}