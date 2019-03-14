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

module.exports = {
  count: count
}