/*
#####################################################
# NAME           :
# @Author        :Kawagoe
# @Version       :0.1(beta)
# @Create        :0.1
# @Update        :1.0
# @Etc           :
#  Menu          :use：
#  Trigger       :none：
#  WebApp        :none：
#  Button        :none：
# @Reference     :
*/
function generateDriveActivityReport() {
  var propMail = PropertiesService.getScriptProperties().getProperty("propmail");
  var now = new Date();
  var oneWeekAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  var startTime = oneWeekAgo.toISOString();
  var endTime = now.toISOString();

  var before = 0;
  var after = 0;
  var old_d
  var rows = [];
  var pageToken, page;
  do {
    page = AdminReports.Activities.list(propMail, 'drive', {
      startTime: startTime,
      endTime: endTime,
      maxResults: 500,
      pageToken: pageToken
    });
    var items = page.items;
    if (items) {
      var od = "";
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        
        var time = new Date(item.id.time)
        time.setHours(time.getHours() + 9)
        var m = new Date(item.id.time).getMonth() + 1;
        var viewD = Utilities.formatDate(time, "Tokyo", 'yyyy/MM/dd');
        var viewT = Utilities.formatDate(time, "Tokyo", 'HH:mm');
        var d = new Date(item.id.time).getDate();
//        if ( d != old_d) {
//          old_d = d;
//          before = 0;
//          after = 0;
//        }
        var t = new Date(item.id.time).getHours();
        if ( (0 <= t && t < 7)) {
          continue
        }
        
//        if ( (before == 0 && after == 0) || (before == 1 && after == 0)){
          var row = [
            new Date(item.id.time),
            m,
            viewD,
            viewT,
            item.actor.email,
            item.events[0].name,
            item.events[0].parameters[3].value
          ];
          rows.push(row);
          if ( 7 <= t && t <= 11) {
            before = 1;
          }
          if ( (0 <= t && t <= 5 )|| (18 <= t && t <= 23)) {
            after = 1;
          }
//        }else{
//          continue
//        }
        
        
      }
    }

    pageToken = page.nextPageToken;
    Logger.log("pagetoken: " + pageToken)
  } while (pageToken);
  if (rows.length > 0) {
    //    var spreadsheet = SpreadsheetApp.create('Google Apps Login Report');
    //    var sheet = spreadsheet.getActiveSheet();
    var spreadsheet = SpreadsheetApp.getActive();
    var sheet = spreadsheet.getSheetByName("Report-Drive");
    sheet.getRange("A:F").clear();


    // Append the headers.
    var headers = ['rawDate', 'Month', 'Date', 'Time', 'user', 'edit', 'file'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
//    sheet.appendRow(headers);

    // Append the results.
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);

    Logger.log('Report spreadsheet created: %s', spreadsheet.getUrl());
  } else {
    Logger.log('No results returned.');
  }
}