/*
#####################################################
# ログ
# format: timestamp , priority , message
#####################################################
 */
function LogSheet(priority,message,flag) { //LOG関数
  log_(priority, message,flag);
}

function LogSheetdebug(message,flag) {
  log_('debug', message,flag);
}

function LogSheetinfo(message,flag) {
  log_('info', message,flag);
}

function LogSheetwarn(message,flag) {
  log_('warn', message,flag);
}

function LogSheeterror(message,flag) {
  log_('error', message,flag);
}

function LogSheetfatal(message,flag) {
  log_('fatal', message,flag);
}

function testlog(){
  LogSheet("INFO","testmessage");
}

function log_(priority, message, flag) {
  var sh = log_makesheet_();
  var now = Utilities.formatDate(new Date(), 'Asia/Tokyo', "yyyy/MM/dd HH:mm:ss.SSS");
  var last_row = sh.getLastRow();
  sh.insertRowAfter(last_row).getRange(last_row+1, 1, 1, 3).setValues([[now, priority, message]]);
//  Browser.msgBox(sh);
  switch (flag){
    case 1:
      Logger.log("LogSheet: " + priority + ": " + message);
  }
  return sh;
}

function log_makesheet_() {
  var sheet_name = "LOG";
//  var ss = SpreadsheetApp.openById(Cfg.sheetID);
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(sheet_name);
  
  if (sh == null) {
    var active_sh = ss.getActiveSheet(); // memorize current active sheet;
    var sheet_num = ss.getSheets().length;
    sh = ss.insertSheet(sheet_name, sheet_num);
    sh.getRange('A1:C1').setValues([['Timestamp', 'priority', 'Message']]).setBackground('#cfe2f3').setFontWeight('bold');
    sh.getRange('A2:C2').setValues([[Utilities.formatDate(new Date(), 'Asia/Tokyo', "yyyy/MM/dd HH:mm:ss.SSS"), 'INFO', sheet_name + ' has been created.']]).clearFormat();

    // .insertSheet()を呼ぶと"log"シートがアクティブになるので、元々アクティブだったシートにフォーカスを戻す
    ss.setActiveSheet(active_sh);
  }
  return sh;
}

function LogSheetClear() { //LOGイニシャライズ
  var baseRows = 6000;  //100rows/1weekとし、2ヵ月程分を想定
  var leaveRows =3600;  //100rows/1weekとし、2週間程で1度削除、最低でも1ヵ月保持を想定
  var sheet_name = ['LOG'];
  
  for ( var i in sheet_name ) {
//    var ss = SpreadsheetApp.openById(Cfg.sheetID);
    var ss = SpreadsheetApp.getActive();
//    var sh = ss.getSheetByName(sheet_name[i]);
    
    if (sh != null) {
      var lastR = sh.getLastRow();
//      LogSheet("DEBUG",baseRows + " <= " + lastR); //debug
      if ( baseRows <= lastR ) {
        sh.deleteRows(2, lastR - leaveRows);//　leave rows
        Logger.log("logClear")
      }
    }
  }
//  if (sh != null) {
//    sh = ss.deleteSheet(sh);
//  }
  return sh;
}
