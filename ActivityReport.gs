function jsonttest(){
  var ret = "";
  var json = {
    "title" : "name",
    "map" : {
      "mtitle1" : "mval1",
      "mtitle2" : "mval2"
    },
    "mid title" : "mvalue",
    "array" : [
      {"atitle1": "aval1", "atitle2": "aval2"},
      {"btitle1": "bval1", "btitle2": "bval2"}
    ],
    "end title" : "evalue"
  } 
  var ret = arrayFrom(json)  
  Logger.log(ret);
}

function parse_object(obj, path) {
    if (path == undefined)
        path = "";

    var type = $.type(obj);
    var scalar = (type == "number" || type == "string" || type == "boolean" || type == "null");

    if (type == "array" || type == "object") {
        var d = {};
        for (var i in obj) {

            var newD = parse_object(obj[i], path + i + "/");
            $.extend(d, newD);
        }

        return d;
    }

    else if (scalar) {
        var d = {};
        var endPath = path.substr(0, path.length-1);
        d[endPath] = obj;
        return d;
    }

    // ?
    else return {};
}


// otherwise, just find the first one
function arrayFrom(json) {
  var queue = [], next = json;
  while (next !== undefined) {
    if (Object.prototype.toString.call(next) === '[object Array]') {
      
      // but don't if it's just empty, or an array of scalars
      if (next.length > 0) {
        
        var type = Object.prototype.toString.call(next[0]);
        Logger.log(type)
        var scalar = (type == "[object Number]" || type == "[object String]" || type == "[object Boolean]" || "[object Null]");
        
        if (!scalar)
          return next;
      }
    } else {
      for (var key in next)
        queue.push(next[key]);

    }
    next = queue.shift();
  }
  // none found, consider the whole object a row
  return [json];
}


function removeTrailingComma(input) {
  if (input.slice(-1) == ",")
    return input.slice(0,-1);
  else
    return input;
}

// Rudimentary, imperfect detection of JSON Lines (http://jsonlines.org):
//
// Is there a closing brace and an opening brace with only whitespace between?
function isJSONLines(string) {
 return !!(string.match(/\}\s+\{/))
}

// To convert JSON Lines to JSON:
// * Add a comma between spaced braces
// * Surround with array brackets
function linesToJSON(string) {
  return "[" + string.replace(/\}\s+\{/g, "}, {") + "]";
}
/*
Activity Report API
  
*/
function generateLoginActivityReport() {
  var spreadsheet = SpreadsheetApp.getActive();
  var sheet = spreadsheet.getSheetByName("Report-login");
  
  var now = new Date();
  var oneWeekAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  var startTime = oneWeekAgo.toISOString();
  var endTime = now.toISOString();
  
  var rows = [];
  var pageToken, page;
  do {
    page = AdminReports.Activities.list('all', 'login', {
      startTime: startTime,
      endTime: endTime,
      maxResults: 500,
      pageToken: pageToken
    });
    var items = page.items;
    
//    debugger
//    Logger.log(JSON.stringify(items));
//    return
    //
    
    if (items) {
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var row = [
          new Date(item.id.time),
          item.actor.email,
          item.events[0].name,
          item.ipAddress
        ];
        rows.push(row);
      }
    }
    
    pageToken = page.nextPageToken;
    Logger.log("pagetoken: " + pageToken)
  } while (pageToken);
  if (rows.length > 0) {
    sheet.getRange("A:E").clear();
    
    
    // Append the headers.
    var headers = ['Time', 'User', 'Login Result', 'IP Address'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    //    sheet.appendRow(headers);
    
    // Append the results.
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    
    Logger.log('Report spreadsheet created: %s', spreadsheet.getUrl());
  } else {
    Logger.log('No results returned.');
  }
}

function json2csv(json) {
  //  var header = Object.keys(json[0]).join(',') + "\n";
  
  var body = json.map(function(d){
    return Object.keys(d).map(function(key) {
      return d[key];
    }).join(',');
  }).join("\n");
  
  //    return header + body;
  return body;
}


function generateAccountsActivityReport() {
  var spreadsheet = SpreadsheetApp.getActive();
  var sheet = spreadsheet.getSheetByName("Report-accounts");
  
  var now = new Date();
  var oneWeekAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  var startTime = oneWeekAgo.toISOString();
  var endTime = now.toISOString();
  
  var rows = [];
  var pageToken, page;
  do {
    page = AdminReports.Activities.list('all', 'user_accounts', {
      startTime: startTime,
      endTime: endTime,
      maxResults: 500,
      pageToken: pageToken
    });
    var items = page.items;
    
    
//    debugger
    var json = JSON.stringify(items);
//    Logger.log(json);
    Logger.log(json2csv(items));
    return
    
    //
    if (items) {
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var row = [
          new Date(item.id.time),
          item.actor.email,
          item.events[0].name,
          item.ipAddress
        ];
        rows.push(row);
      }
    }
    
    pageToken = page.nextPageToken;
    Logger.log("pagetoken: " + pageToken)
  } while (pageToken);
  if (rows.length > 0) {
    sheet.getRange("A:D").clear();
    
    
    // Append the headers.
    var headers = ['Time', 'User', 'Login Result', 'IP Address'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    //    sheet.appendRow(headers);
    
    // Append the results.
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    
    Logger.log('Report spreadsheet created: %s', spreadsheet.getUrl());
  } else {
    Logger.log('No results returned.');
  }
}






//under const

function appReport_admin(){
  //admin,calendar,drive,groups,gplus,login,mobile,rules,token,user_accounts
  var appName = "admin";
  generateActivityReport_(appName);
}
function appReport_calendar(){
  //admin,calendar,drive,groups,gplus,login,mobile,rules,token,user_accounts
  var appName = "calendar";
  generateActivityReport_(appName);
}
function appReport_drive(){
  //admin,calendar,drive,groups,gplus,login,mobile,rules,token,user_accounts
  var appName = "drive";
  generateActivityReport_(appName);
}
function appReport_groups(){
  //admin,calendar,drive,groups,gplus,login,mobile,rules,token,user_accounts
  var appName = "groups";
  generateActivityReport_(appName);
}
function appReport_gplus(){
  //admin,calendar,drive,groups,gplus,login,mobile,rules,token,user_accounts
  var appName = "gplus";
  generateActivityReport_(appName);
}
function appReport_login(){
  //admin,calendar,drive,groups,gplus,login,mobile,rules,token,user_accounts
  var appName = "login";
  generateActivityReport_(appName);
}
function appReport_mobile(){
  //admin,calendar,drive,groups,gplus,login,mobile,rules,token,user_accounts
  var appName = "mobile";
  generateActivityReport_(appName);
}
function appReport_rules(){
  //admin,calendar,drive,groups,gplus,login,mobile,rules,token,user_accounts
  var appName = "rules";
  generateActivityReport_(appName);
}
function appReport_token(){
  //admin,calendar,drive,groups,gplus,login,mobile,rules,token,user_accounts
  var appName = "token";
  generateActivityReport_(appName);
}
function appReport_user_accounts(){
  //admin,calendar,drive,groups,gplus,login,mobile,rules,token,user_accounts
  var appName = "user_accounts";
  generateActivityReport_(appName);
}

/*
  SAMPLE
*/
function generateActivityReport_(appName) {
  var now = new Date();
  var oneWeekAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  var startTime = oneWeekAgo.toISOString();
  var endTime = now.toISOString();
  
  var rows = [];
  var pageToken, page;
  do {
    page = AdminReports.Activities.list('all', appName, {
      startTime: startTime,
      endTime: endTime,
      maxResults: 5,
      pageToken: pageToken
    });
    var items = page.items;
    if (items) {
      
      var json = JSON.stringify(items)
      Logger.log(json)
//      Logger.log(json2csv(json));
//      var arr = JSON.parse(json);
//      Logger.log(arr)
      return;                          //DEBUG
      
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        switch(appName){
          case 'admin':
            break;
          case 'calendar':
            break;
          case 'drive':
            break;
          case 'groups':
            break;
          case 'gplus':
            break;
          case 'login':
            // Append the headers.
            var headers = ['Time', 'User', 'IP Address', 'Login Result', 'Login type'];
            if ( item.events[0].parameters.length == 2 ){
              var eventVal = item.events[0].parameters[0].value + ", " + item.events[0].parameters[1].value;
            }else{
              var eventVal = item.events[0].parameters[0].value;
            }
            var row = [
              new Date(item.id.time),
              item.actor.email,
              item.ipAddress,
              item.events[0].name,
              eventVal
            ];            
            break;
          case 'mobile':
            break;
          case 'rules':
            break;
          case 'token':
            break;
          case 'user_accounts':
            break;
        }
        rows.push(row);
      } //for i
      
      //ヘッダー配列数調整
      for ( var j = items[i].length; j < width; j++){
        headers.push("");
      }
    } // if
    
    
    pageToken = page.nextPageToken;
    Logger.log("pagetoken: " + pageToken)
  } while (pageToken);
  if (rows.length > 0) {
    //    var spreadsheet = SpreadsheetApp.create('Google Apps Login Report');
    //    var sheet = spreadsheet.getActiveSheet();
    var spreadsheet = SpreadsheetApp.getActive();
    var sheet = spreadsheet.getSheetByName("Report-" + appName);
    sheet.getRange(1, 1, rows.length, headers.length).clear();
    
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    //    sheet.appendRow(headers);
    
    // Append the results.
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    
    Logger.log('Report spreadsheet created: %s', spreadsheet.getUrl());
  } else {
    Logger.log('No results returned.');
  }
}


