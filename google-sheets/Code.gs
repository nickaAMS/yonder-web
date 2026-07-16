// Paste this into Extensions → Apps Script from the Google Sheet that will hold preview requests.
// Set WEBHOOK_TOKEN to a long random value, then deploy as a Web App that executes as you.
const WEBHOOK_TOKEN = 'replace-with-a-long-random-secret';
const SHEET_NAME = 'Preview requests';

function doPost(e) {
  if (e.parameter.token !== WEBHOOK_TOKEN) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = JSON.parse(e.postData.contents || '{}');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Email', 'Platform', 'How they heard about Yonder', 'Source']);
    sheet.getRange('A1:E1').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([new Date(), data.email || '', data.platform || '', data.referral || '', data.source || '']);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
