var db = require('db.js');
var util = require('util.js');

//获取最新添加的商品
function getNewGoods(fn){
  var where = {};
  //在有效期内
  where.validTimeTrue = wx.cloud.database().command.gte(util.formatTime(new Date()));
  where.status = 'true';//上架
  db.where('goods', where, 'createTime', 'desc').then(fn);
}

//获取人发布的商品
function getGoodsByUser(openId,fn){
  var where = {};
  where.promulgatorId = openId;
  db.where('goods', where, 'createTime', 'desc').then(fn);
}

//获取单个商品信息
function getGood(id,fn){
  return new Promise(function (resolve) {
    var good = wx.getStorageSync('goods' + id);
    if (good == '') {
      var where = {};
      where.id = id;
      db.whereSingle('goods', where).then(fn, fn);
    } else {
      fn(good);
    }
    resolve(id);
  });
}

//获取商品的问答信息
function getGoodAnswers(goodId, all,openId,fn){
  var where = {};
  //对于非所有者，只能看到公开的和自己的
  if (!all){
    var _ = wx.cloud.database().command;
    where = _.or([{ show: true }, { quizzerId:openId}]);
  }
  where.goodId = goodId;//这个商品下的咨询
  db.where('answers', where, 'createTime', 'desc').then(fn, fn);
}

module.exports = {
  getNewGoods: getNewGoods,
  getGood: getGood,
  getGoodAnswers: getGoodAnswers,
  getGoodsByUser: getGoodsByUser
}