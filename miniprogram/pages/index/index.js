//index.js
//获取应用实例
var base = getApp();
var good = require('../../utils/good.js');
Page({
  data: {
    goods:[],
    index:0
  },
  goDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../goodDetail/goodDetail?id=' + id
    })
  },
  onLoad: function () {
    var _this = this;
    good.getNewGoods(_this.data.index,function(goods){
      for(var i in goods){
        var distance = base.getDistance(base.location.latitude, base.location.longitude, goods[i].latitude, goods[i].longitude);
        goods[i].distance = distance;
      }
      if (_this.data.index > 0){
        _this.setData({ goods: _this.data.goods.concat(goods)});
      }else{
        _this.setData({ goods: goods});
      }
      // 隐藏加载框
      wx.hideLoading();
    });
  },
  //上拉加载更多
  onReachBottom: function () {
    var that = this;
    // 显示加载图标
    wx.showLoading({
      title: '加载中，请稍后。',
    })
    // 页数+1
    this.setData({ index: this.data.goods.length});
    this.onLoad();
  },
  //下拉更新
  onPullDownRefresh:function(){
    // 显示加载图标
    wx.showLoading({
      title: '刷新中，请稍后。',
    })
    // 从头开始
    this.setData({ index: 0 });
    this.onLoad();
  }
})
