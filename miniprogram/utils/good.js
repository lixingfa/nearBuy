var db = require('db.js');
var util = require('util.js');

//获取最新添加的商品
function getNewGoods(index,fn){
  var where = {};
  //在有效期内
  var _ = wx.cloud.database().command;
  where.validTimeTrue = _.gte(util.formatTime(new Date()));
  where.surplus = _.gt(0);//有库存的
  where.status = '2';//上架，拉黑某人时，将其商品全部下架，非关系型数据库的限制 0待审核，1审核中，2上架
  db.where('goods', where, ['updateTime', 'desc'], index).then(fn);
}

//获取人发布的商品
function getGoodsByUser(openId,index,fn){
  var where = {};
  where.promulgatorId = openId;
  db.where('goods', where, ['validTimeTrue', 'asc', 'surplus', 'asc', 'status', 'asc','updateTime', 'desc'],index).then(fn);
}

//获取要审核的商品
function getGoodsAudit(index, fn) {
  var where = {};
  where.status = '1';//提交审核，所有的
  db.where('goods', where, ['status','asc','updateTime', 'asc'], index).then(fn);
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
function getGoodAnswers(goodId, all,openId,index,fn){
  var where = {};
  //对于非所有者，只能看到公开的和自己的
  if (all){
    where.goodId = goodId;
  }else{
    var _ = wx.cloud.database().command;
    where = _.or([{ show: true }, { quizzerId: openId }]).and({ goodId: goodId});
  }
  db.where('answers', where, ['createTime', 'asc'], index).then(fn, fn);//'show','desc',
}
//获取商品问答总数
function getGoodAnswersCount(goodId, all, openId, fn) {
  var where = {};
  //对于非所有者，只能看到公开的和自己的
  if (all) {
    where.goodId = goodId;
  } else {
    var _ = wx.cloud.database().command;
    where = _.or([{ show: true }, { quizzerId: openId }]).and({ goodId: goodId });
  }
  db.count('answers', where).then(fn);
}

//检查订单商品信息
function checkOrderGoods(goods){
  return new Promise(function (resolve) {
    var goodIds = [];
    for(var i in goods){
      goodIds.push(goods[i].id);
    }
    var _ = wx.cloud.database().command;
    var where = {id:_.in(goodIds)};
    db.whereOnly('goods', where).then(function(data){
      var goOrder = true;
      for(var i in data){
        var now = data[i];
        var o = goods[now.id];
        if (now.status != '2') {
          wx.showModal({
            showCancel: false,
            title: '',
            content: now.title + "已经下架了，请不要勾选它。"
          });
          goOrder = false;
        }else if (parseInt(now.surplus) >= o.num){
          continue;
        }else{
          wx.showModal({
            showCancel: false,
            title: '',
            content: now.title + "只剩" + now.surplus + now.unit + "了，请修改购买量。"
          });
          goOrder = false;
        }
      }
      resolve(goOrder);
    }, function(res){});//查询出错
  });
}

module.exports = {
  getNewGoods: getNewGoods,
  getGood: getGood,
  getGoodAnswers: getGoodAnswers,
  getGoodAnswersCount: getGoodAnswersCount,
  getGoodsByUser: getGoodsByUser,
  checkOrderGoods: checkOrderGoods,
  getGoodsAudit: getGoodsAudit
}