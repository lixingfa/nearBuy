//index.js
//获取应用实例
var base = getApp();
var good = require('../../../../utils/good.js');
Page({
  data: {
    goods: []
  },
  goDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../goodEdit/goodEdit?id=' + id
    })
  },
  onLoad: function () {
    var _this = this;
    good.getGoodsByUser(base.openId,function (goods) {
      _this.setData({ goods: goods });
    });
  }
})
