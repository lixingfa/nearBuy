//index.js
//获取应用实例
var base = getApp();
var good = require('../../utils/good.js');
var user = require('../../utils/user.js');
var util = require('../../utils/util.js');
var db = require('../../utils/db.js');
var news = require('../../utils/news.js');
Page({
  data: {
    goods:[],
    index:0
  },
  goDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    var distance = e.currentTarget.dataset.distance;
    wx.navigateTo({
      url: '../goodDetail/goodDetail?id=' + id + '&distance=' + distance
    })
  },
  onLoad: function () {
    var _this = this;
    if (base.location.latitude == 0){//坐标没更新
      wx.showLoading({
        title: '正在准备数据',
      });
      //获取openId、GPS坐标
      Promise.all([util.getGPS(), util.getOpenId()])
        .then(function (results) {
          //坐标
          base.location.latitude = results[0].latitude;
          base.location.longitude = results[0].longitude;
          //用户
          base.openId = 'oOlK15NZ7PUwXOshxdxmM0HEkI9U';//results[1];//
          news.setTabBarBadge();
          //更新用户信息
          user.getUser(results[1], function (user) {//再获取用户信息
            if (user) {//老用户
              base.distan = user.distan;//更新搜索范围
              //最近的商品
              _this.getNewGoods();
              //更新地址
              var where = {};
              where.userId = user.id;
              db.whereOnly('address', where).then(base.updataLocation, base.updataLocation);
            } else {
              base.newUser = true;//新用户
              //最近的商品
              _this.getNewGoods();
              base.updataLocation(false);
            }
          },function(){//获取用户失败
            wx.hideLoading();
            wx.showModal({
              showCancel: false,
              content: '网络不佳，获取用户信息失败，请退出小程序后重新进入。',
            });
          });
        },function(){
          wx.hideLoading();
          wx.showModal({
            showCancel: false,
            content: '网络不佳，请退出小程序后重新进入。',
          });
        });
    }else{
      _this.getNewGoods();
      news.setTabBarBadge();
    }
    this.startReportHeart();//定时消息任务
  },
  getNewGoods:function(){
    wx.showLoading({
      title: '加载商品信息',
    });
    var _this = this;
    //获取最新商品信息
    good.getNewGoods(_this.data.index,function(goods){
      for(var i in goods){
        var distance = base.getDistance(base.location.latitude, base.location.longitude, goods[i].latitude, goods[i].longitude);
       // if (distance <= base.distan){}
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
    this.getNewGoods();
  },
  //下拉更新
  onPullDownRefresh:function(){
    // 从头开始
    this.setData({ index: 0 });
    this.getNewGoods();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  startReportHeart() {
    var _this = this;
    var timerTem = setTimeout(function () {
      news.setTabBarBadge();//刷新消息
      _this.startReportHeart();//调用自身，规定时间后又执行一次
    }, 60000);//1分钟执行一次
    // 保存定时器name,取消的时候需要用这个名字，clearTimeOut(timerName)
    /*that.setData({
      timer: timerTem
    });*/
  },
})
