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
    db.where('news', where, "createTime", "asc").then(function (news) {
      _this.setData({ news: news});
    });
  },
  doit:function(e){
    var _this = this;
    var id = e.currentTarget.dataset.id;
    var oid = e.currentTarget.dataset.oid;
    var gid = e.currentTarget.dataset.gid;
    var how = e.currentTarget.dataset.how;
    var sellers = e.currentTarget.dataset.sellers;
    var where = {};
    where.status = 1;
    db.update('news',id,where).then(
      function(){
        var data = {};
        var _ = wx.cloud.database().command;
        if (how == '0') {//配送
          data.takeOut = {};
          data.takeOut.goods = {};
          data.takeOut.goods[gid] = {};
          data.takeOut.goods[gid].status = _.inc(1);//自增1
        } else {
          data.sellers = {};
          data.sellers[sellers] = {};
          data.sellers[sellers].goods = {};
          data.sellers[sellers].goods[gid] = {};
          data.sellers[sellers].goods[gid].status = _.inc(1);//自增1
        }
        db.update('orders', oid, data);
        _this.onShow();
      },function(){}
    );
  }
})