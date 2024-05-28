function listFilesInFolder(folder, sheet, parentFolderName = "") {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    sheet.appendRow([parentFolderName + folder.getName() + "/" + file.getName(), file.getUrl()]);
  }

  const subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    const subFolder = subFolders.next();
    listFilesInFolder(subFolder, sheet, parentFolderName + folder.getName() + "/");
  }
}

function listAllFilesInFolder() {
  const folderId = "1r6mYd_16MriVxScXadOzZH-x6a7TRlJJ";
  const sheetName = "マイナビバイト_ファイル一覧"

  const folder = DriveApp.getFolderById(folderId);

  const sheet = activeSpreadsheet.getSheetByName(sheetName);
  sheet.clear();

  sheet.appendRow(["ファイルパス", "URL"]);

  listFilesInFolder(folder, sheet);
}
