var db = require('db.js');
var util = require('util.js');
var base = getApp();

//获取总数
function count() {
  var where = {};
  where.receiver = base.openId;
  where.status = 0;
  return wx.cloud.database().collection('news').where(where).count();
}

//添加消息
function add(n){
  n.id = util.getUUID('news');
  n.status = 0;//未处理
  db.add('news', n);
}

function setTabBarBadge(){
  count().then(function (res) {
    if (res.total != 0) {
      //显示消息数量
      wx.setTabBarBadge({ index: 2, text: res.total + "" });
      //显示红点
      wx.showTabBarRedDot({ index: 3 });
    }
  });
}

module.exports = {
  count: count,
  add:add,
  setTabBarBadge: setTabBarBadge
}