var base = getApp();
var util = require('../../utils/util.js');
var db = require('../../utils/db.js');
var user = require('../../utils/user.js');
var good = require('../../utils/good.js');
Page({
    data: {
      //下单数据
      addr: null,
      phone:null,
      plist: [],
      totalPrice:0,      
      myAddress: [],//辅助数据
      addrShow: false,
      longitude:"0",
      latitude:"0",
      selectedID: -1,
      user:null
    },
    onLoad: function (e) {
      var _this = this;
      user.getThisUser(base.openId,function(u){
        var totalPrice = e && e.totalPrice ? e.totalPrice : 0;
        _this.setData({ plist: base.cart.getList(), totalPrice: totalPrice,user:u,phone:u.phone});
      });
    },
    addrSelect: function () {//选择地址
      var _this = this;
      if (_this.data.myAddress.length == 0){
        var where = {};
        where.user = base.openId;
        db.where('address', where, 'createTime', 'desc').then(this.initAddress, this.initAddress);
      }else{
        _this.setData({ addrShow: true });//选地址
      }
    },
    myaddrCancel: function () {//点击地址簿中取消按钮
        this.setData({ addrShow: false });
    },
    closeaddr:function(){//触摸遮罩层关闭地址选项
          this.setData({ addrShow: false });
    },
    initAddress: function (myAddress){
      if (myAddress){
        if (myAddress.length == 0){//数据库里也没有
          this.chooseAddrInMap();//都没有地址，就在地图上选
        }else{
          this.setData({ myAddress: myAddress, addrShow: true});
        }
      }
    },
    chooseAddrInMap:function(){
      var _this = this;
      wx.chooseLocation({
        success: function (res) {
          var latitude = res.latitude;
          var longitude = res.longitude;
          var distan = base.getDistance(base.location.latitude, base.location.longitude, latitude, longitude);
          var address = res.address + ' ' + res.name;
          if (distan > base.distan){
            wx.showModal({
              title: '距离提示',
              content: '您选择的 “' + address + '” 与所购商品的平均距离大于' + base.distan + '米（实际相距' + distan + '米），可能会给双方带来不便。您可在“我的-个人信息”中对搜索距离进行调整。\n继续使用该地址？',
              success: function (res) {
                if (res.confirm) {
                  base.location.longitude = longitude;
                  base.location.latitude = latitude;
                  _this.setData({
                    addr: address,
                    longitude: longitude,
                    latitude: latitude,
                    selectedID:-1,
                    addrShow: false,
                  });
                }
              }
            });
          }else{
            base.location.longitude = longitude;
            base.location.latitude = latitude;
            _this.setData({
              addr: address,
              longitude: longitude,
              latitude: latitude,
              selectedID: -1,
              addrShow: false,
            });
          }
        },
        fail: function (err) {
          console.log(err)
        }
      });
    },
    valid: function () {
        var _this = this;
        var err = "";
        if (!_this.data.addr) {
              wx.showModal({
                  showCancel: false,
                  title: '',
                content: "您还没完善收件地址，请点击顶部的选择按钮进行完善。"
              })
              return false;
          }
          if (!_this.data.phone) {
            wx.showModal({
              showCancel: false,
              title: '',
              content: "请填写您的联系电话。"
            })
            return false;
          }
        return true;
    },
    submit: function (e) {
      var _this = this;
      if (!_this.valid()) {
        return;
      }
      //检查库存
      good.checkOrderGoods(_this.data.plist).then(function (goOrder) {
        if (goOrder) {
          _this.creatOrder();
        }
      });
    },
    creatOrder:function(){
      var _this = this;
      if (_this.data.selectedID == -1) {//不是从列表里选的地址
        var addr = {};
        addr.addr = _this.data.addr;
        addr.phone = _this.data.phone;
        addr.longitude = _this.data.longitude;
        addr.latitude = _this.data.latitude;
        addr.id = util.getUUID('addr');
        addr.createTime = util.formatTime(new Date());
        addr.user = this.data.user.id;
        db.add('address', addr);
      }
      var order = {};
      order.id = util.getUUID('order');
      order.status = 0;//未支付
      order.user = {};
      order.user.nickName = this.data.user.nickName;
      order.user.id = this.data.user.id;
      order.user.addr = _this.data.addr;
      order.user.phone = _this.data.phone;
      var _ids = [];
      for (var i in _this.data.plist) {//去除关键字
        _ids.push(_this.data.plist[i]._id);
        delete _this.data.plist[i]._id;
        delete _this.data.plist[i]._openid;//待处理订单要嵌套查询了
        if (_this.data.plist[i].select){
          //从购物车中删除成功下单的
          base.cart.remove(_this.data.plist[i].id);
        }
      }
      order.plist = _this.data.plist;
      order.totalPrice = _this.data.totalPrice;
      order.createTime = util.formatTime(new Date());
      db.add('orders', order).then(function(d){
        //更新库存
        for (var i in _this.data.plist){
          var good = {};
          good.surplus = _this.data.plist[i].surplus;
          db.update('goods',_ids[i],good);
        }
        wx.redirectTo({//不允许退回下单页
          url: "../success/success"
        });
      },function(d){
        wx.showModal({
          showCancel: false,
          title: '',
          content: "下单时出现错误。"
        });
      });
    },
    bindAddrBlur: function (e) {
        this.setData({
          addr: e.detail.value
        });
      },
    bindPhoneBlur: function (e) {
      this.setData({
        phone: e.detail.value
      });
    },
    toSelect: function (e) {//选中地址
      var _this = this;
      var id = e.currentTarget.dataset.id;
      _this.setData({ selectedID: id });
      for (var i = 0; i < _this.data.myAddress.length; i++) {
        if (_this.data.myAddress[i].id == id) {
          _this.setData({
            phone: _this.data.myAddress[i].phone,
            addr: _this.data.myAddress[i].addr,
            //addrShow: false
          });
          break;
        }
      }
    },
    toDeleteAddr:function(e){
      var _this = this;
      var id = e.currentTarget.dataset.id;
      wx.showModal({
        title: '地址删除提示',
        content: '确认删除该地址？',
        success: function (res) {
          if (res.confirm) {
            for (var i = 0; i < _this.data.myAddress.length; i++) {
              if (_this.data.myAddress[i].id == id) {
                db.remove('address', _this.data.myAddress[i]._id);
                _this.data.myAddress.splice(i, 1);
                _this.setData({
                  myAddress: _this.data.myAddress
                });
                if (_this.data.selectedID == id){//之前选了这个地址
                  _this.setData({
                    phone: null,
                    addr: null,
                  });
                }
                break;
              }
            }
          }
        }
      });
    }
})
