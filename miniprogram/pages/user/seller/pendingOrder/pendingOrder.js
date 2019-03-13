var db = require('../../../../utils/db.js');
var base = getApp();
Page({
  data: {
    news: []
  },
  onShow: function () {//加载过又不关闭的话，onLoad不会再执行
    var _this = this;
    var where = {};
    where.receiver = base.openId;
    where.newsType = 'order';//订单
    where.status = 0;
    db.where('news', where, ["goodId","asc","createTime", "asc"],).then(function (news) {
      _this.setData({ news: news});
    });
  },
  doit:function(e){
    var _this = this;
    var id = e.currentTarget.dataset.id;
    var oid = e.currentTarget.dataset.oid;
    var orderId = e.currentTarget.dataset.orderid;
    var gid = e.currentTarget.dataset.gid;
    var how = e.currentTarget.dataset.how;
    var sellers = e.currentTarget.dataset.sellers;
    var where = {};
    where.status = 1;
    db.update('news',id,where).then(
      function(){//更改订单状态
        where = {};
        where.id = orderId;
        //自增什么的太坑了，直接拿整个订单下来更新
        db.whereSingle('orders',where).then(function(order){
          if (how == '0') {//配送
            order.takeOut.goods[gid].status = order.takeOut.goods[gid].status + 1;
          } else {
            order.sellers[sellers].goods[gid].status = order.sellers[sellers].goods[gid].status + 1;
          }
          db.update('orders', oid,order).then(function(){
            _this.onShow();
          },function(){});
        });
        },function(){}
    );
  }
})