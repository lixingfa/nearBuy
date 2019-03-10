var db = require('../../../utils/db.js');
var user = require('../../../utils/user.js');
var base = getApp();
Page({
  data: {
    myOrder: [],
    qrcode:"",
    goodId:-1,
    orderId:-1,
    oid:-1,
    qrcodeShow:false,
    sellers:''
  },
  onShow: function () {//加载过又不关闭的话，onLoad不会再执行
    var _this = this;
    var where = {};
    where.owner = base.openId;//按时间倒序
    db.where('orders', where,"createTime","desc").then(function(orders){
      _this.setData({ myOrder: orders, qrcodeShow: false});
    });
  },
  pay:function(e){
    var oid = e.currentTarget.dataset.oid; 
    var id = e.currentTarget.dataset.id;
    var orderid = e.currentTarget.dataset.orderid;
    var sellers = e.currentTarget.dataset.sellers;
    this.setData({ qrcodeShow: true, goodId: id, orderId: oid, oid: orderid, sellers: sellers});
  },
  cancel:function(){
    this.setData({ qrcodeShow: false});
  },
  hasPay:function(){
    var _this = this;
    var where = {};
    where.id = this.data.oid;
    //自增什么的太坑了，直接拿整个订单下来更新
    db.whereSingle('orders', where).then(function (order) {
      if (_this.data.sellers == 'takeOut') {//配送
        order.takeOut.goods[_this.data.goodId].status = order.takeOut.goods[_this.data.goodId].status + 1;
      } else {
        order.sellers[_this.data.sellers].goods[_this.data.goodId].status = order.sellers[_this.data.sellers].goods[_this.data.goodId].status + 1;
      }
      db.update('orders', _this.data.orderId, order).then(function () {
        _this.onShow();
      }, function () { });
    });
  },
  getAddr:function(e){
    var _this = this;
    var promulgatorId = e.currentTarget.dataset.promulgatorid;
    var index = e.currentTarget.dataset.index;
    user.getUser(promulgatorId,function(u){
      if(u){
        _this.data.myOrder[index].sellers[promulgatorId].addr = u.addr + ' ' + u.phone;
        _this.setData({ myOrder: _this.data.myOrder});
      }
    });
  }
})