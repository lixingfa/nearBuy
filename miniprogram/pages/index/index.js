//index.js
//获取应用实例
var base = getApp();
var good = require('../../utils/good.js');
var user = require('../../utils/user.js');
var util = require('../../utils/util.js');
var db = require('../../utils/db.js');
var news = require('../../utils/news.js');
var colors = ['#EFCEE8', '#F3D7B5', '#FDFFDF', '#DAF9CA', '#C7B3E5', '#4CB4E7','#FFC09F','#FFEE93','#9DD3FA'];
Page({
  data: {
    goods:[],
    index:0,
    goodTypes: null,
    typeId:null,
    typeName:null,
    typeShow:false,
    keyword:null,
    swiper:[],
    merchant:null
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
          base.openId = results[1];//'oOlK15NZ7PUwXOshxdxmM0HEkI9U';//
          news.setTabBarBadge();
          //更新用户信息
          user.getUser(results[1], function (user) {//再获取用户信息
            if (user) {//老用户
              base.distan = user.distan;//更新搜索范围
              //获取经纬变化范围
              base.getDistanceArea(results[0].latitude, base.distan);
              //最近的商品
              _this.getNewGoods();
              //更新地址
              var where = {};
              where.userId = user.id;
              db.whereOnly('address', where).then(base.updataLocation, base.updataLocation);
            } else {
              base.newUser = true;//新用户
              //获取经纬变化范围
              base.getDistanceArea(results[0].latitude, base.distan);
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
    good.getNewGoods(_this.data.index, _this.data.keyword, _this.data.typeId, _this.data.merchant,
    function(goods){
      for(var i in goods){
        var distance = base.getDistance(base.location.latitude, base.location.longitude, goods[i].latitude, goods[i].longitude);
       // if (distance <= base.distan){}//转成如何计算正方形四个点经纬度，然后直接查数据库
        if (distance >= 1000){
          goods[i].distance = (distance / 1000).toFixed(1) + '公里';
        }else{
          goods[i].distance = distance + '米';
        }
        goods[i].color = colors[i % colors.length];
        //查询的
        if ((_this.data.keyword || _this.data.typeName)
        && goods[i].promulgatorId != base.openId) {
          var vestige = {};
          vestige.goodId = goods[i].id;
          vestige.promulgatorId = goods[i].promulgatorId;
          vestige.visiter = base.openId;
          vestige.type = 'search';
          db.add('vestige', vestige);
        }
      }
      if (_this.data.index > 0){
        _this.setData({ goods: _this.data.goods.concat(goods)});
      }else{
        _this.setData({ goods: goods});
      }
    });
    // 隐藏加载框
    wx.hideLoading();
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
    this.setData({ index: 0, typeName: null, typeId: null});
    this.getNewGoods();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var _this = this;
    db.where('goodType', {}, ['order', 'desc'], 0).then(function (goodTypes){
      _this.setData({ goodTypes: goodTypes});
    });
    db.where('ad', {}, [], 0).then(function (swiper) {
      _this.setData({ swiper: swiper });
    });
  },
  input: function (e) {
    var param = e.currentTarget.dataset.param;
    this.setData({ [param]: e.detail.value, typeShow:true});//变量key
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
  search:function(){
    this.setData({ index: 0, typeShow:false });
    this.getNewGoods();
  },
  select: function (e) {
    var typeId = e.currentTarget.dataset.id;
    var typeName = e.currentTarget.dataset.name;
    this.setData({ typeId: typeId, typeName: typeName});
  },
  merchant:function(e){
    var merchant = e.currentTarget.dataset.merchant;
    this.setData({ merchant: merchant});
    this.getNewGoods();
  }
})
