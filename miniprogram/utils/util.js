// 引入SDK核心类
var QQMapWX = require('../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
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

function formatDate(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  return [year, month, day].map(formatNumber).join('-');
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
          content: "获取当前位置失败，将无法展示周边信息，请退出小程序后重新进入，并同意获取位置信息。",
          success: function (res) {
            if (res.confirm) {
              wx.clearStorageSync();//清除缓存
            }
          }
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

//获取地址
function getAddressByGPS(latitude, longitude) {
  return new Promise(function (resolve) {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'YCWBZ-64T6K-TJAJU-AM4GX-LZSMQ-GFF4N'
    });
    //根据坐标获取当前位置名称，显示在顶部: 腾讯地图逆地址解析
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude:longitude
      },
      success: function (addressRes) {
        var address = addressRes.result.formatted_addresses.recommend;
        resolve(address);
      },
      fail() {
        wx.showModal({
          showCancel: false,
          content: "根据GPS坐标获取地址名称失败，请稍后重试。"
        });
      }
    });
  });
}

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  getUUID: getUUID,
  getDatePath: getDatePath,
  getGPS: getGPS,
  getOpenId: getOpenId,
  getAddressByGPS: getAddressByGPS
}