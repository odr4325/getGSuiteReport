//https://support.google.com/a/answer/1279090?hl=ja
// 試験運用開始日を指定する
var startDate = new Date("2017/4/1");
 
// 試験運用終了日を指定する
var endDate = new Date("2017/5/23");
 
// 日付の計算
function addDays_(date, days) {
  var newdate = new Date(date);
  newdate.setDate(newdate.getDate() + days);
  return newdate;
}
 
function getHangoutData() {
  // 要求された API フィールドの説明と名前
  var parameters = [
      ['Num calls: ','gplus:num_video_calls'],
      ['Call minutes: ','gplus:total_video_call_minutes'],
      ['Num conferences: ','gplus:num_video_conferences'],
      ['Seven day active CfM: ','gplus:num_7day_active_cfm_devices']
    ];
  var requestData = [];
  parameters.forEach( function(parameter) {
    requestData.push(parameter[1]);
  });
  var pageToken, page;
  while (startDate < endDate) {
    do {
      var dateString = startDate.toISOString().slice(0, 10);
      page = AdminReports.CustomerUsageReports.get(dateString, {
        parameters: requestData.join(','),
        maxResults: 500,
        pageToken: pageToken
      });
      pageToken = page.nextPageToken;
      var reports = page.usageReports;
      if (!reports) {
        return null;
      }
      reports.forEach(function(report) {
        var parameterValues = getParameterValues(report.parameters); 
        if (!parameterValues){
          return null;
        }
        var daySummary = '';
        parameters.forEach(function(parameter) {
          if (parameterValues[parameter[1]]) {
            daySummary = daySummary + parameter[0] + ': ' + parameterValues[parameter[1]] +
              '. ';
          }
        });
        Logger.log(daySummary);
      });
    } while (pageToken);
  startDate = addDays_(startDate,1);
  }
}
 
//*********
/**
 * パラメータ名と値のマッピングをパラメータ オブジェクト配列から取得する。
 * @param {Array} パラメータ: パラメータ オブジェクトの配列。
 * @return {Object}: パラメータ名とその値のマッピング。
 */
function getParameterValues(parameters) {
  if(!parameters) {
    return null;
  }
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