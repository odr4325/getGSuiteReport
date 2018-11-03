/*
Admin SDK Reports Service
https://developers.google.com/apps-script/advanced/admin-sdk-reports
Google+パラメータ
https://developers.google.com/admin-sdk/reports/v1/reference/usage-ref-appendix-a/customers-meet?hl=ja
*/

function generateCustomerUsageReport_meet() {
  var reportRows = [];
  var reportData = [];
  var today = new Date();
  var n = 4;  // 4日前からの情報を取得、3日前だとエラーになる場合がある
  var kikan = 90 + n;
//  var timezone = Session.getTimeZone();
  var fourDaysAgo = new Date(today.getTime() - n * 24 * 60 * 60 * 1000);
  for (n; n <= kikan; n++) {
    var nDaysAgo = new Date(today.getTime() - n * 24 * 60 * 60 * 1000);
    var date = Utilities.formatDate(nDaysAgo, 'Tokyo', 'yyyy-MM-dd');
    var reportRows = getReport(date);
    if (reportRows.length > 0) {
      for (var i = 0; i < reportRows.length; i++) {
        reportData.push(reportRows[i]);
      }
    }
  }

  if (reportRows.length > 0) {
    var startDate = Utilities.formatDate(fourDaysAgo, 'Tokyo', 'yyyy-MM-dd');
    var spreadsheet = SpreadsheetApp.getActive();
    var sheet = spreadsheet.getSheetByName("Report-meet");
    sheet.clear();
    
    // Append the headers.
    var headers = ['日付(PST)',
                   'ビデオハングアウト開催数',
                   '参加者数合計',
                   '参加者数平均',
                   '会議時間合計(分)',
                   '会議時間平均(分)',
                   'G+:1日のアクティブユーザー数',
                   'G+:7日間のアクティブユーザー数',
                   'G+:30日間のアクティブユーザー数'
                  ];
    sheet.appendRow(headers);

    // Append the results.
    sheet.getRange(2, 1, reportData.length, headers.length).setValues(reportData);
    sheet.setColumnWidth(1, 80);
    sheet.setColumnWidth(2, 90);
    sheet.setColumnWidth(3, 90);
    sheet.setColumnWidth(4, 90);
    sheet.setColumnWidth(5, 90);
    sheet.setColumnWidth(6, 90);
    sheet.setColumnWidth(7, 90);
    sheet.setColumnWidth(8, 90);
    sheet.setColumnWidth(9, 90);
    sheet.getRange('A1:I1').setFontWeight('bold').setBackground('#ddddee').setVerticalAlignment('top');
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(1);

    Logger.log('Report spreadsheet created: %s', spreadsheet.getUrl());
  } else {
    Logger.log('No results returned.');
  }
}

//https://developers.google.com/admin-sdk/reports/v1/reference/customerUsageReports/get?hl=ja
//https://developers.google.com/admin-sdk/reports/v1/reference/usage-ref-appendix-a/customers-meet?hl=ja
function getReport(date) {
  var parameters = "";
//  var parameters = [
//    'meet:num_calls',
//    'meet:num_calls_by_internal_users',
//    'meet:num_calls_by_external_users',
//    'meet:num_calls_by_pstn_in_users',
//    'meet:num_calls_by_pstn_out_users',
//    'meet:total_call_minutes',
//    'meet:total_call_minutes_by_internal_users',
//    'meet:total_call_minutes_by_external_users',
//    'meet:total_call_minutes_by_pstn_in_users',
//    'meet:total_call_minutes_by_pstn_out_users',
//    'meet:num_calls_CLIENTTYPE',
//    'meet:total_call_minutes_CLIENTTYPE	',
//    'meet:num_1day_active_users',
//    'meet:num_7day_active_users',
//    'meet:num_30day_active_users'
//
//  ];
  var rows = [];
  var pageToken, page;
  do {
    page = AdminReports.CustomerUsageReports.get(date, {
      maxResults: 500,
      pageToken: pageToken
    });
    var reports = page.usageReports;
    if (reports) {
      for (var i = 0; i < reports.length; i++) {
        var report = reports[i];
        var parameterValues = getParameterValues(report);
        Logger.log(JSON.stringify(report))
        return;
        var row = [report.date];
        if (isFinite(parameterValues['meet:num_video_conferences'])) {
          row.push(parameterValues['meet:num_video_conferences']);
          row.push(parameterValues['meet:num_video_calls']);
          row.push(Math.ceil(parameterValues['meet:num_video_calls'] / parameterValues['meet:num_video_conferences']));
          row.push(parameterValues['meet:total_video_call_minutes']);
          row.push(Math.ceil(parameterValues['meet:total_video_call_minutes'] / parameterValues['meet:num_video_calls']));
        } else {
          row.push(null);
          row.push(null);
          row.push(null);
          row.push(null);
          row.push(null);
        }
        if (isFinite(parameterValues['meet:num_1day_active_users'])) {
          row.push(parameterValues['meet:num_1day_active_users']);
        } else {
          row.push(null);
        }
        if (isFinite(parameterValues['meet:num_7day_active_users'])) {
          row.push(parameterValues['meet:num_7day_active_users']);
        } else {
          row.push(null);
        }
        if (isFinite(parameterValues['meet:num_30day_active_users'])) {
          row.push(parameterValues['meet:num_30day_active_users']);
        } else {
          row.push(null);
        }
        
        rows.push(row);
      }
    } else {
      rows.push([date,null,null,null,null,null,null,null,null]);
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

  return rows; 
}

/**
 * Gets a map of parameter names to values from an array of parameter objects.
 * @param {Array} parameters An array of parameter objects.
 * @return {Object} A map from parameter names to their values.
 */
function getParameterValues(parameters) {
  return parameters.reduce(function(result, parameter) {
    var name = parameter.name;
    var value;
    if (parameter.intValue !== undefined) {
      value = parameter.intValue;
    } else if (parameter.stringValue !== undefined) {
      value = parameter.stringValue;
    } else if (parameter.datetimeValue !== undefined) {
      value = new Date(parameter.datetimeValue);
    } else if (parameter.boolValue !== undefined) {
      value = parameter.boolValue;
    }
    result[name] = value;
    return result;
  }, {});
}