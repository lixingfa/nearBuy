//index.js
//获取应用实例
var base = getApp();
var good = require('../../../../utils/good.js');
Page({
  data: {
    goods: [],
    index: 0
  },
  goDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../goodEdit/goodEdit?id=' + id
    })
  },
  onLoad: function () {
    var _this = this;
    good.getGoodsByUser(base.openId,this.data.index,function (goods) {
      _this.setData({ goods: _this.data.goods.concat(goods) });
    });
  },
  //上拉加载更多
  onReachBottom: function () {
    var that = this;
    // 页数+1
    this.setData({ index: this.data.goods.length });
    this.onLoad();
  },
  //下拉更新
  onPullDownRefresh: function () {
    // 从头开始
    this.setData({ index: 0 });
    this.onLoad();
  }
})
