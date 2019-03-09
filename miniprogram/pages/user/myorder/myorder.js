var db = require('../../../utils/db.js');
var base = getApp();
Page({
  data: {
    myOrder: [],
    qrcode:"",
    goodId:-1,
    orderId:-1,
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
    var sellers = e.currentTarget.dataset.sellers;
    this.setData({ qrcodeShow: true, goodId: id, orderId: oid, sellers: sellers});
  },
  cancel:function(){
    this.setData({ qrcodeShow: false});
  },
  hasPay:function(){
    var _this = this;
    var data = {};
    if (this.data.sellers == 'takeOut'){
      data.takeOut = {};
      data.takeOut.goods = {};
      data.takeOut.goods[this.data.goodId] = {};
      data.takeOut.goods[this.data.goodId].needPay = false;
    }else{
      data.sellers = {};
      data.sellers[this.data.sellers] = {};
      data.sellers[this.data.sellers].goods = {};
      data.sellers[this.data.sellers].goods[this.data.goodId] = {};
      data.sellers[this.data.sellers].goods[this.data.goodId].needPay = false;
    }
    db.update('orders', this.data.orderId,data).then(function(d){
      _this.onShow();
    },function(d){

    });
  }
})