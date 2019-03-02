var db = require('db.js');
var util = require('util.js');
var base = getApp();
//获取最新添加的商品
function getNewGoods(fn){
  var where = {};
  where.validTimeTrue = wx.cloud.database().command.gte(util.formatTime(new Date()));
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
function getGoodAnswers(goodId,fn){
  var where = {};
  var _ = wx.cloud.database().command;
  //where = _.or([{ show: true }, { ownerId: base.openId}]);
  where.goodId = goodId;
  db.where('answers', where, 'createTime', 'desc').then(fn, fn);
}

module.exports = {
  getNewGoods: getNewGoods,
  getGood: getGood,
  getGoodAnswers: getGoodAnswers
}