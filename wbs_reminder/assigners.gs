/**
 * 担当者とslackメンション先のマッピング
 * 
 * @param {String} sheetName
 * @return {Array{String, String}}
 */
function getAssignerMentionMapping(sheetName) {
  // スプレッドシートからマッピングを連想配列で取得する
  const input = getDataBySheetName(sheetName);

  // 担当者列とslackメンション列が何番目なのか取得する
  const {assignerColumn, slackMentionColumn} = getHeaderColumnNumber(input[0]);

  let ret = new Map();
  for (let i=1; i<input.length; i++) {
    let assigner = input[i][assignerColumn];
    let slackMention = input[i][slackMentionColumn];

    if(!assigner || !slackMention) {
      continue;
    }
    ret.set(assigner, slackMention);
  }
  return ret;
}

/**
 * 担当者からslackメンション先を返す
 * 担当者からslackを引けなかった場合は、nullを返す
 * 
 * @param {Array{String}} header
 * @return {String}}
 */
function getMention(assigner) {
    let mention = assignerMentionMapping.get(assigner);
    return mention ? `<${mention}>` : `${assigner}　${adminMessage}`;
}

/**
 * 担当者、slackの情報を何列目が保持してるのか特定して返す
 *
 * @param {Array{String}} header
 * @return {Object{String, String}}
 */
function getHeaderColumnNumber(header) {
  let assignerColumn = null;
  let slackMentionColumn = null;
  for (let i=0; i < header.length; i++) {
    switch (header[i]) {
      case "担当者":
        assignerColumn = i;
        break;
      case "slack":
        slackMentionColumn = i;
        break;
      default:
        break;
    }
  }

  if (assignerColumn == null) {
      throw new ReferenceError("担当者列がありません");
  }

  if (slackMentionColumn == null) {
      throw new ReferenceError("slackメンション列がありません");
  }

  return {assignerColumn, slackMentionColumn};
}

