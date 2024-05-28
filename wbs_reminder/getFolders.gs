function listFoldersInFolder(folder, sheet, parentFolderName = "", parentFolderUrl = "") {
  const subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    const subFolder = subFolders.next();
    const folderUrl = "https://drive.google.com/drive/folders/" + subFolder.getId();
    sheet.appendRow([parentFolderName + folder.getName() + "/" + subFolder.getName(), folderUrl]);
    listFoldersInFolder(subFolder, sheet, parentFolderName + folder.getName() + "/", folderUrl);
  }
}

function listAllFoldersInFolder() {
  const folderId = "1r6mYd_16MriVxScXadOzZH-x6a7TRlJJ";
  const sheetName = "マイナビバイト_フォルダ一覧";
  const folder = DriveApp.getFolderById(folderId);

  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = activeSpreadsheet.getSheetByName(sheetName);
  sheet.clear();

  sheet.appendRow(["フォルダパス", "フォルダURL"]);

  listFoldersInFolder(folder, sheet);
}