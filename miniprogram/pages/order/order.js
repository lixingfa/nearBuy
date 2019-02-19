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
    },
    addrEdit: function () {//触摸管理这个地址
      var _this = this;
      if (_this.data.myAddress.length > 0){
        _this.setData({ addrShow: true });//选地址

      }else{
        wx.chooseLocation({
          success: function (res) {
            //console.log(res.name);
            _this.setData({
              addr: res.address + ' ' + res.name
            });
          },
          fail: function (err) {
            console.log(err)
          }
        });
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
      this.setData({ addr: base.location.address, phone: base.location.phone, plist: base.cart.getList(), totalPrice: totalPrice, myAddress: base.myAddress});
      if (!this.data.addr || !this.data.phone){
        this.setData({ longitude: base.location.longitude, latitude: base.location.latitude});
      }
    },
    /*getAddressList: function () {
        var _this = this;
        base.get({ c: "UserCenter", m: "GetAllAddress" }, function (d) {
            var dt = d.data;
            if (dt.Status == "ok") {
                var arr = [];
                for (var i = 0; i < dt.Tag.length; i++) {
                    var obj = dt.Tag[i];
                    if (i == 0) {
                        obj.isDefault = true;
                    }
                    arr.push(obj);

                }
                _this.setData({
                    addresslist: arr
                })

            }
        })
    },*/
    valid: function () {
        var _this = this;
        var err = "";
        if (!_this.data.addr || !_this.data.phone) {
              err = "您还没完善收件地址，请点击顶部的收货地址进行完善。";
              wx.showModal({
                  showCancel: false,
                  title: '',
                  content: err
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
      /*base.cart.clear();
      wx.redirectTo({
        url: "../user/myorder"
      })*/
      /*
        var _this = this;
        if (_this.valid()) {
            _this.getTotalPrice();
            var obj = {};
            obj.UserName = base.user.phone;
            obj.UserPhone = base.user.phone;
            obj.OrderSource = _this.data.oinfo.OrderSource;
            obj.Consignee = _this.data.oinfo.Consignee;//地址
            obj.Cellphone = _this.data.oinfo.Cellphone;
            obj.City = _this.data.oinfo.City;
            obj.District = _this.data.oinfo.District;
            obj.Address = _this.data.oinfo.Address;
            obj.DeliveryDate = _this.data.oinfo.DeliveryDate;
            obj.DeliveryTime = _this.data.oinfo.DeliveryTime;
            obj.Payment = _this.data.oinfo.Payment;
            obj.Uid = base.user.userid;
            obj.Remarks = _this.data.oinfo.Remarks;
            obj.TotalPrice = _this.data.oinfo.TotalPrice;
            obj.TotalPrice = obj.TotalPrice < 0 ? 0 : obj.TotalPrice;
            var oplArr = _this.getProductList();
            var oal = [];
            base.post({
                c: "OrderCenter", m: "AddOrder", p: JSON.stringify(obj), proInfo: JSON.stringify(oplArr), oalInfo: JSON.stringify(oal)
            }, function (d) {
                console.log(d)
                var dt = d.data;
                if (dt.Status == "ok") {
                    base.cart.clear();
                    wx.redirectTo({
                        url: "../payment/payment?oid=" + dt.Tag
                    })
                }

            })

        }*/
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
    }
})

/*
//用户
        var user = _this.user.getCache();
        if (user != null && user != "") {
          _this.user.openId = user.openId,//微信号
          _this.user.nickName = user.nickName,//昵称
          _this.user.avatarUrl = user.avatarUrl,//头像地址
          _this.user.address = user.address
        }else{
            
        }
        */
        /*wx.openLocation({
                latitude: base.location.latitude,
                longitude: base.location.longitude,
                success:function(res){//成功打开地图
                  wx.chooseLocation({
                    success: function(res) {
                      consoe.log(res);
                      wx.showModal({
                        title: '地址',
                        content: res,
                      })
                    },
                  })
                }
              });*/