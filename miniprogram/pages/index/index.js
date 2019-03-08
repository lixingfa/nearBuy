//index.js
//获取应用实例
var base = getApp();
var good = require('../../utils/good.js');
Page({
  data: {
    goods:[]
  },
  goDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../goodDetail/goodDetail?id=' + id
    })
  },
  onLoad: function () {
    var _this = this;
    good.getNewGoods(function(goods){
      for(var i in goods){
        var distance = base.getDistance(base.location.latitude, base.location.longitude, goods[i].latitude, goods[i].longitude);
        goods[i].distance = distance;
      }
      _this.setData({goods:goods});
    });
  }
})
