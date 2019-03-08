var db = require('../../../utils/db.js');
var base = getApp();
Page({
  data: {
    myOrder: [],
    qrcode:"",
    goodId:-1,
    orderId:-1,
    qrcodeShow:false,
    promulgator:"",
    price:""
  },
  onShow: function () {//加载过又不关闭的话，onLoad不会再执行
    var _this = this;
    var where = {};
    where.user = {};
    where.user.id = base.openId;//按时间倒序
    db.where('orders', where,"createTime","desc").then(function(orders){
      _this.setData({ myOrder: orders, qrcodeShow: false});
    });
  },
  pay:function(e){
    var oid = e.currentTarget.dataset.oid; 
    var id = e.currentTarget.dataset.id;
    var promulgator = e.currentTarget.dataset.promulgator;
    var price = e.currentTarget.dataset.price;
    var num = e.currentTarget.dataset.num;
    price = parseFloat(price) * parseInt(num);
    this.setData({ qrcodeShow: true, goodId: id, orderId: oid, promulgator: promulgator, price: price});
  },
  cancel:function(){
    this.setData({ qrcodeShow: false});
  },
  hasPay:function(){
    var _this = this;
    var data = {};
    data.plist = {};//也是一个对象
    var good = {};
    good.needPay = false;
    data.plist[this.data.goodId] = good;
    db.update('orders', this.data.orderId,data).then(function(d){
      _this.onShow();
    },function(d){

    });
  }
})