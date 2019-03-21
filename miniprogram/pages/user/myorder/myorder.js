var db = require('../../../utils/db.js');
var user = require('../../../utils/user.js');
var news = require('../../../utils/news.js');
var goodUtil = require('../../../utils/good.js');
var base = getApp();
Page({
  data: {
    myOrder: [],
    qrcode:"",
    goodId:-1,
    orderId:-1,
    oid:-1,
    qrcodeShow:false,
    sellers:'',
    index: 0,
    orderCancle:false
  },
  onShow: function () {//加载过又不关闭的话，onLoad不会再执行
    wx.showLoading({
      title: '订单加载中，请稍后。',
    });
    var _this = this;
    var where = {};
    where.owner = base.openId;//按时间倒序
    db.where('orders', where, ["status", "asc","createTime","desc"],this.data.index).then(function(orders){
      if(_this.data.index == 0){
        _this.setData({ myOrder:orders});
      }else{
        _this.setData({ myOrder: _this.data.myOrder.concat(orders)});
      }
      // 隐藏加载框
      wx.hideLoading();
    });
  },
  pay:function(e){
    var oid = e.currentTarget.dataset.oid; 
    var id = e.currentTarget.dataset.id;
    var orderid = e.currentTarget.dataset.orderid;
    var sellers = e.currentTarget.dataset.sellers;
    var orderCancle = e.currentTarget.dataset.cancel;
    orderCancle = orderCancle == 'true'?true:false;
    this.setData({ qrcodeShow: true, goodId: id, orderId: oid, oid: orderid, sellers: sellers, orderCancle: orderCancle});
  },
  cancel:function(){
    this.setData({ qrcodeShow: false});
  },
  hasPay:function(){
    wx.showLoading({
      title: '处理中，请稍后。',
    });
    var _this = this;
    var where = {};
    where.id = this.data.oid;
    //自增什么的太坑了，直接拿整个订单下来更新
    db.whereSingle('orders', where).then(function (order) {
      if (_this.data.orderCancle){//退单
        var num = 0;
        if (_this.data.sellers == 'takeOut') {//配送
          order.takeOut.goods[_this.data.goodId].status = 3;
          num = order.takeOut.goods[_this.data.goodId].num;
        } else {
          order.sellers[_this.data.sellers].goods[_this.data.goodId].status = 3;
          num = order.sellers[_this.data.sellers].goods[_this.data.goodId].num;
        }
        //库存恢复
        goodUtil.updateGoodSurplus(_this.data.goodId,num);
      }else{//正常购买
        if (_this.data.sellers == 'takeOut') {//配送
          order.takeOut.goods[_this.data.goodId].status = order.takeOut.goods[_this.data.goodId].status + 1;
        } else {
          order.sellers[_this.data.sellers].goods[_this.data.goodId].status = order.sellers[_this.data.sellers].goods[_this.data.goodId].status + 1;
        }
      }
      var bt = true;
      var bs = true;
        //检查配送的是否都完成了
        for (var i in order.takeOut.goods){
          if (order.takeOut.goods[i].status < 2){
            bt = false;
            break;
          }
        }
        //检查自取的是否都完成了
        for (var i in order.sellers) {
          for (var j in order.sellers[i].goods){
            if (order.sellers[i].goods[j].status < 2) {
              bs = false;
              break;
            }
          }
          if(!bs){
            break;
          }
        }
      if(bt && bs){
        order.status = 1;//订单完成
      }
      db.update('orders', _this.data.orderId, order).then(function () {
        // 隐藏加载框
        wx.hideLoading();
        _this.setData({ index: 0, qrcodeShow: false });//更新
        _this.onShow();
        //发一条消息
        var n = {};
        var goodName = '';
        if (_this.data.sellers == 'takeOut') {//配送
          n.receiver = order.takeOut.goods[_this.data.goodId].promulgatorId;//商品发布者
          goodName = order.takeOut.goods[_this.data.goodId].title;
        }else{
          n.receiver = _this.data.sellers;//卖家
          goodName = order.sellers[_this.data.sellers].goods[_this.data.goodId].title;
        }
        if (_this.data.orderCancle) {//退单
          n.newsType = 'orderCancel';
          n.content = goodName + "(订单" + _this.data.oid + ")买家退单。";
          //增加退单日志
          var vestige = {};
          vestige.goodId = _this.data.goodId;
          vestige.promulgatorId = n.receiver;
          vestige.visiter = base.openId;
          vestige.type = 'orderCancel';
          db.add('vestige', vestige);
        }else{
          n.newsType = 'getGood';//收货
          n.content = goodName + "(订单" + _this.data.oid + ")买家确认收货。";
        }
        news.add(n);
      }, function () { });
    });
  },
  getAddr:function(e){
    var _this = this;
    var promulgatorId = e.currentTarget.dataset.promulgatorid;
    var index = e.currentTarget.dataset.index;
    user.getUser(promulgatorId,function(u){
      if(u){
        _this.data.myOrder[index].sellers[promulgatorId].addr = u.addr;
        _this.data.myOrder[index].sellers[promulgatorId].phone = u.phone;
        _this.setData({ myOrder: _this.data.myOrder});
      }
    });
  },
  //上拉加载更多
  onReachBottom: function () {
    var that = this;
    // 页数+1
    this.setData({ index: this.data.myOrder.length });
    this.onLoad();
  },
  //下拉更新
  onPullDownRefresh: function () {
    // 从头开始
    this.setData({ index: 0 });
    this.onLoad();
  },
  callPhone:function(e){
    var phoneNumber = e.currentTarget.dataset.phone;
    wx.makePhoneCall({ phoneNumber: phoneNumber});
  },
  mapShow: function () {
    /*var _this = this;
    var latitude = _this.data.good.latitude;
    var longitude = _this.data.good.longitude;
    wx.openLocation({
      latitude,
      longitude,
      scale: 18
    });*/
    wx.showModal({
      showCancel: false,
      content: "请点击商品标题进入详情页查看商品位置。"
    });
  },
  goDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../../goodDetail/goodDetail?id=' + id
    })
  },
})