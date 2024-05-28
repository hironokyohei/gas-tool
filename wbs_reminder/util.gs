function getDataBySheetName(sheetName) {
  return SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName).getDataRange().getValues()
}
