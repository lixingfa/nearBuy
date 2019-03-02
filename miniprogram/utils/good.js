var db = require('db.js');
var util = require('util.js');

//获取最新添加的商品
function getNewGoods(fn){
  var formatTime = util.formatTime(new Date());
  formatTime = formatTime.split(' ');
  var where = {};
  where.indate = wx.cloud.database().command.gte(formatTime[0]);
  where.validTime = wx.cloud.database().command.gte(formatTime[1]);

  db.where('goods', where,'createTime','desc').then(fn);
}

function getGood(id,fn){
  var good = wx.getStorageSync('goods' + id);
  if (good == '') {
    var where = {};
    where.id = id;//微信的openId就是本程序中的id
    db.whereSingle('goods', where).then(fn, fn);
  } else {
    fn(good);
  }
}

module.exports = {
  getNewGoods: getNewGoods,
  getGood: getGood
}