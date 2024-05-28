/**
 * WBSの行を生成する関数
 * 
 * @param {Array{Array}}
 * @return {Array{Task}}
 */
function getTasks (sheetName) {
  const data = getDataBySheetName(sheetName);

  // タスク名や完了予定日が何列目にあるのか特定する
  // ヘッダーカラムクラスに保持させておく
  let headerColumn = new HeaderColumn(data[0]);

  // タスク名や完了予定日をプロパティとしてWBSクラスのリストを作成する
  var ret = [];
  for (let i = 1; i <= data.length; i++) {
    // 何故か最終行にundefinedがはいるっぽい？ので外す
    if (data[i] == null) {
      continue;
    }

    ret.push(new Task(headerColumn, data[i]));
  }

  return ret;
}

// タスクの情報を保持するクラス
class Task {
  constructor(headerColumn, data) {
    this.row = data[headerColumn.row];
    this.name = data[headerColumn.name];
    this.assigner = data[headerColumn.assigner];
    this.status = new TaskStatus(data[headerColumn.status]);
    this.completeDate = data[headerColumn.completeDate];
    this.slackMention = getMention(this.assigner);
  }

  /**
   * 進捗が遅れているかを判定する
   * 
   * @param {null}
   * @return {Boolean}
   */
  isDelay() {
    // 完了日がもう過ぎており、ステータスが完了でないタスクは遅延とみなす
    return new Date(this.completeDate) < new Date() && this.status.isNotCompleted();
  }

  /**
   * 進捗遅れの日数を計算する
   * 
   * @param {null}
   * @return {String|Number}
   */
  diffDelayDays() {
    if (!this.isDelay()) {
      return "遅れはありません。"
    }

    // 日付の差を計算
    const today = new Date();
    const diffTime = today.getTime() - this.completeDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return diffDays;
  }
}

// タスクの進捗ステータスの値クラス
class TaskStatus {
  constructor(input) {
    this.value = input;
  }

  isNotCompleted() {
    return this.value != "完了";
  }
}

// タスク名や完了予定日が何列目にあるのか特定して保持するクラス
class HeaderColumn {
  constructor(input) {
    for (let i = 0; i < input.length; i++) {
      switch (input[i]) {
        case ("#"):
          this.row = i;
          break;
        case ("タスク"):
          this.name = i;
          break;
        case ("担当者"):
          this.assigner = i;
          break;
        case ("ステータス"):
          this.status = i;
          break;
        case ("完了予定日"):
          this.completeDate = i;
          break;
        default:
          break;
      }
    }

    if (this.row == null) {
      throw new ReferenceError("#列がありません");
    }

    if (this.name == null) {
      throw new ReferenceError("タスク列がありません");
    }

    if (this.assigner == null) {
      throw new ReferenceError("担当者列がありません");
    }

    if (this.status == null) {
      throw new ReferenceError("ステータス列がありません");
    }

    if (this.completeDate == null) {
      throw new ReferenceError("完了予定日列がありません");
    }
  }
}