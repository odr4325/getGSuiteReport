/*
#####################################################
# NAME           :User Usage and Customers Usage API
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

/*
#####################################################
# OPEN：メニュー呼び出し
#####################################################
*/
function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('【カスタムメニュー】')
  .addItem('✔ログインアクティビティレポート',　  　'generateLoginActivityReport')
  .addItem('✔ユーザ使用レポート',　　         'userUsageReport')
  .addItem('✔カスタマユーザ使用レポート',　   　'customerUsageReport')
  .addItem('ハングアウトレポート',　　          'generateCustomerUsageReport_Gplus')
  .addItem('ハングアウト使用状況（1279090）',　　'getHangoutData')
  .addSeparator()
  .addToUi();
}

function headResurt(){
  var propMail = PropertiesService.getScriptProperties().getProperty("propmail");
  var date = new Date()
  var d1= new Date(date.getTime() - 3 * 24 * 60 * 60 * 1000);
  var d2 = Utilities.formatDate(d1, "Tokyo/Asia", 'yyyy-MM-dd');
  var page1 = AdminReports.CustomerUsageReports.get(d2);
  var page2 = AdminReports.UserUsageReport.get(propMail,d2);
  var param1 = page1.usageReports[0].parameters;
  var param2 = page2.usageReports[0].parameters;

  var arr1 = new Array();
  param1.forEach(function(v,i){
    arr1.push(v.name);
  });
  Logger.log(arr1.length);

  var arr2 = new Array();
  param2.forEach(function(v,i){
    arr2.push(v.name);
  });
  Logger.log(arr2.length);
    
  var message = arr1 + "\n\n---------------------------\n\n" + arr2
  GmailApp.sendEmail(propMail, "[GAS] " +  "[CustomerUsage]:" + arr1.length + ", [UserUsage]:" + arr2.length + " getGSuiteReport information", message);
}

