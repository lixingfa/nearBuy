var base = getApp();
var common=require('../../utils/common.js');
Page({
    data: {
      addr: "",
      addresslist: [],
      addrShow: false,
    },
    addrEdit: function () {//触摸管理这个地址
        this.setData({ addrShow: true });
    },
    myaddrCancel: function () {//点击地址簿中取消按钮
        this.setData({ addrShow: false });
    },
    closeaddr:function(){//触摸遮罩层关闭地址选项
          this.setData({ addrShow: false });
    },
    onLoad: function (e) {
      this.setData({ addr: base.location.address});
    },
    getAddressList: function () {
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
    },
    onShow: function (e) {

    },
    getTotalPrice: function () {//应付金额
        var _this = this;
        var pl = _this.data.plist;//name: p.name, price: p.price, size: p.size, num: p.num, brand: p.brand,supplyno
        var alltotal = 0;
        for (var i = 0; i < pl.length; i++) {
            if (!isNaN(pl[i].price)) {
                alltotal += parseFloat(pl[i].price);
            }
        }
        this.setData({
            "oinfo.TotalPrice": alltotal
        });
    },
    getProductList: function () {
        var _this = this;
        var arr_pro = [];
        var pl = _this.data.plist;//name: p.name, price: p.price, size: p.size, num: p.num, brand: p.brand,supplyno
        for (var i = 0; i < pl.length; i++) {
            arr_pro.push({
                ProductName: pl[i].name,
                Price: pl[i].price,
                Size: pl[i].size,
                Num: pl[i].num,
                CakeNo: 0,
                OType: 0,
                IType: 0,
                SupplyNo: pl[i].supplyno,
                //生日内容
                IsCutting: 0,
                CutNum: 0,
                BrandCandleType: 0,
                Remarks: '',
                Premark: null,//生产备注
            });
        }
        return arr_pro;
    },
    valid: function () {
        var _this = this;
        var err = "";
        if (!_this.data.oinfo.Consignee) {
            err = "请选择收货人信息！";
            wx.showModal({
                showCancel: false,
                title: '',
                content: err
            })
            return false;
        }
        if (!_this.data.oinfo.DeliveryDate) {
            err = "请选择配送日期！";
            wx.showModal({
                showCancel: false,
                title: '',
                content: err
            })
            return false;
        }
        if (!_this.data.oinfo.DeliveryTime) {
            err = "请选择配送时间段！";
            wx.showModal({
                showCancel: false,
                title: '',
                content: err
            })
            return false;
        }
        return true;
    },
    submit: function () {
      base.cart.clear();
      wx.redirectTo({
        url: "../user/myorder"
      })
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
            //个人信息
          wx.getUserInfo({
            success(res) {
              var user = {};
              var userInfo = res.userInfo
              user.nickName = userInfo.nickName
              user.avatarUrl = userInfo.avatarUrl
              //user.gender = userInfo.gender // 性别 0：未知、1：男、2：女
              //user.province = userInfo.province
              //user.city = userInfo.city
              //user.country = userInfo.country
              //encryptedData openId//即微信号需要另外处理
              _this.user.setCache(user);
            }
          });
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