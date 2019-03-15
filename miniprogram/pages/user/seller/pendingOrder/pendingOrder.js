var db = require('../../../../utils/db.js');
var news = require('../../../../utils/news.js');
var base = getApp();
Page({
  data: {
    news: [],
    index: 0
  },
  onShow: function () {//加载过又不关闭的话，onLoad不会再执行
    var _this = this;
    var where = {};
    where.receiver = base.openId;
    where.newsType = 'order';//订单
    where.status = 0;
    db.where('news', where, ["goodId","asc","createTime", "asc"],this.data.index).then(function (news) {
      if(_this.data.index == 0){
        _this.setData({ news: news});      
      }else{
        _this.setData({ news: _this.data.news.concat(news)});
      }
    });
  },
  doit:function(e){
    wx.showLoading({
      title: '处理中，请稍后。',
    })
    var _this = this;
    var id = e.currentTarget.dataset.id;
    var oid = e.currentTarget.dataset.oid;
    var orderId = e.currentTarget.dataset.orderid;
    var gid = e.currentTarget.dataset.gid;
    var how = e.currentTarget.dataset.how;
    var sellers = e.currentTarget.dataset.sellers;
    var buyer = e.currentTarget.dataset.buyer;
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
            wx.hideLoading();// 隐藏提示框
            _this.setData({ index: 0 });//更新
            _this.onShow();
            //发一条消息
            var n = {};
            n.receiver = buyer;
            n.newsType = 'takeOut';//送货/备货
            n.content = "订单" + orderId + "卖家";
            if (how == '0') {//配送
              n.content = n.content + "准备送货，请留意电话或信息。";
            }else{
              n.content = n.content + "已经准备好商品，请及时取货。";
            }
            news.add(n);
          },function(){});
        });
        },function(){}
    );
  },
  //上拉加载更多
  onReachBottom: function () {
    var that = this;
    // 页数+1
    this.setData({ index: this.data.news.length });
    this.onLoad();
  },
  //下拉更新
  onPullDownRefresh: function () {
    // 从头开始
    this.setData({ index: 0 });
    this.onLoad();
  }
})