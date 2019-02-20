var base = getApp();
var util = require('../../utils/util.js');
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
    },
    addrSelect: function () {//选择地址
      var _this = this;
      if (_this.data.myAddress.length > 0){
        _this.setData({ addrShow: true });//选地址
      }else{
        _this.chooseAddrInMap();//都没有地址，就在地图上选
      }
    },
    myaddrCancel: function () {//点击地址簿中取消按钮
        this.setData({ addrShow: false });
    },
    closeaddr:function(){//触摸遮罩层关闭地址选项
          this.setData({ addrShow: false });
    },
    onLoad: function (e) {
      var totalPrice = e && e.totalPrice ? e.totalPrice : 0;
      this.setData({ plist: base.cart.getList(), totalPrice: totalPrice, myAddress: base.myAddress});
      if (!this.data.addr || !this.data.phone){//为空表示没有地址（操作地址时，电话是必须的），可能需要选取地址
        this.setData({ addr: base.location.address, phone: base.location.phone,longitude: base.location.longitude, latitude: base.location.latitude});
      }
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
      if (base.user.nickName == null){
        //获取个人信息
        wx.getUserInfo({
          success(res) {
            var userInfo = res.userInfo
            base.user.nickName = userInfo.nickName
            base.user.avatarUrl = userInfo.avatarUrl
            //user.gender = userInfo.gender // 性别 0：未知、1：男、2：女
            //user.province = userInfo.province //省
            //user.city = userInfo.city //市
            //user.country = userInfo.country //国家
            //encryptedData openId//即微信号需要另外处理
          }
        });
      }      
      if (_this.data.selectedID == -1){//不是从列表里选的地址
        var addr = {};
        addr.addr = _this.data.addr;
        addr.phone = _this.data.phone;
        addr.longitude = _this.data.longitude;
        addr.latitude = _this.data.latitude;
        addr.id = Math.random() * 10000 + '';
        base.myAddress.push(addr);
      }
      var order = {};

      /*base.cart.clear();
      wx.redirectTo({
        url: "../user/myorder"
      });*/
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
            addr: _this.data.myAddress[i].address,
            //addrShow: false
          });
          break;
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
