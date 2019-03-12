//index.js
//获取应用实例
var base = getApp();
var good = require('../../utils/good.js');
var user = require('../../utils/user.js');
var util = require('../../utils/util.js');
var db = require('../../utils/db.js');
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
    if (base.location.latitude == 0){//坐标没更新
      //获取openId、GPS坐标
      Promise.all([util.getGPS(), util.getOpenId()])
        .then(function (results) {
          base.location.latitude = results[0].latitude;
          base.location.longitude = results[0].longitude;
          base.openId = results[1];
          _this.getNewGoods();

          user.getThisUser(results[1], function (user) {//再获取用户信息
            if (user) {//老用户
              var where = {};
              where.userId = user.id;
              base.distan = user.distan;//更新搜索范围
              db.whereOnly('address', where).then(base.updataLocation, base.updataLocation);
            } else {//新用户

            }
          });
        });
    }else{
      _this.getNewGoods();
    }

  },
  getNewGoods:function(){
    wx.showLoading({
      title: '加载中，请稍后。',
    })
    var _this = this;
    //获取最新商品信息
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
    // 页数+1
    this.setData({ index: this.data.goods.length});
    this.onLoad();
  },
  //下拉更新
  onPullDownRefresh:function(){
    // 从头开始
    this.setData({ index: 0 });
    this.onLoad();
  }
})
