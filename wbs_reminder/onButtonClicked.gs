function onButtonClicked() {
  // メッセージを表示させるかどうかの確認ダイアログを表示
  var shouldExecute = Browser.msgBox("実行確認", "この処理を実行しますか？", Browser.Buttons.YES_NO);

  if (shouldExecute == "yes") {
    remindWBS();
  }
}
