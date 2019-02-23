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
    console.log(base.user.nickName);
    this.setData({
      myOrder: base.myOrder.getList()
    });
  },
  pay:function(e){
    var oid = e.currentTarget.dataset.oid; 
    var id = e.currentTarget.dataset.id;
    var qrcode = e.currentTarget.dataset.qrcode;
    var promulgator = e.currentTarget.dataset.promulgator;
    var price = e.currentTarget.dataset.price;
    var num = e.currentTarget.dataset.num;
    price = parseFloat(price) * parseInt(num);
    this.setData({ qrcodeShow: true, goodId: id, orderId: oid, qrcode: qrcode, promulgator: promulgator, price: price});
  },
  cancel:function(){
    this.setData({ qrcodeShow: false});
  },
  hasPay:function(){
    base.myOrder.changeGood(this.data.goodId,this.data.orderId);
    this.setData({ qrcodeShow: false, myOrder: base.myOrder.getList()});
  }
})