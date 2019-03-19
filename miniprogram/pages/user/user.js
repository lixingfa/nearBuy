var user = require('../../utils/user.js');
var db = require('../../utils/db.js');
var util = require('../../utils/util.js');
var base = getApp();
Page({
    data:{
      user:null,
      pendingOrderTotal:0,
      pastDateGood:0,
      sellAll:0,
      isAdmin:false//是否管理人员
    },
    onLoad: function () {
      var _this = this;
      user.getUser(base.openId, function(u){
        _this.setData({user:u});
      });
      //待处理订单
      var where = {};
      where.receiver = base.openId;
      where.newsType = 'order';//订单
      where.status = 0;
      db.count('news',where).then(function(res){
        _this.setData({ pendingOrderTotal: res.total });
      });
      //卖完
      where = {};
      where.surplus = 0;
      where.promulgatorId = base.openId;
      db.count('goods', where).then(function (res) {
        _this.setData({ sellAll: res.total });
      });
      //商品过期
      where = {};
      var _ = wx.cloud.database().command;
      where.validTimeTrue = _.lte(util.formatTime(new Date()));
      where.promulgatorId = base.openId;
      db.count('goods', where).then(function (res) {
        _this.setData({ pastDateGood: res.total });
      });
      //是否管理员
      
    },
    onTabItemTap(item) {
      wx.hideTabBarRedDot({ index: 3 });
    }
});