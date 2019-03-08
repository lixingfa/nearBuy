//返回时间
function formatTime(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

//返回前缀+时间+毫秒+随机数组成的UUID
function getUUID(prefix){
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  var milliseconds = date.getMilliseconds();
  var random = parseInt(Math.random() * 10000);
  return prefix + year + month + day + hour + minute + second + milliseconds + random;
}
//获取日期格式的路径
function getDatePath() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  return [year, month, day].map(formatNumber).join('/');
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//获取GPS坐标
function getGPS(){
  return new Promise(function (resolve, reject) {
    wx.getLocation({
      type: 'wgs84',//wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      //altitude: 'true',//返回高度信息，需要较高精确度，会减慢接口返回速度
      success(res) {
        resolve(res);
      },
      fail(res) {
        console.log(res);
        wx.showModal({
          showCancel: false,
          title: '',
          content: "获取当前位置失败，将无法展示周边信息，请退出小程序后重新进入，并同意获取位置信息。"
        });
        reject(false);
      }
    });
  });
}

//获取当前用户的唯一标识
function getOpenId(){
  return new Promise(function (resolve, reject) {
    wx.cloud.callFunction({
      name: 'login',// 云函数名称
      data: {},// 传给云函数的参数
      success(res) {
        resolve(res.result.openid);
      },
      fail(res){
        console.log(res);
        reject(false);
      }
    });
  });
}

module.exports = {
  formatTime: formatTime,
  getUUID: getUUID,
  getDatePath: getDatePath,
  getGPS: getGPS,
  getOpenId: getOpenId
}