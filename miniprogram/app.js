App({
  https:'https://6e65-nearbuy-test-1258692926.tcb.qcloud.la/',
  distan: 3000,//与默认地址距离多少米就认为是新的地址
  openId : '',
  dLongitude:0,
  dLatitude:0,
  newUser:false,
  arrTime: ['选择时间', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
  location: {
    latitude: 0,//经度
    longitude: 0,//维度
    address: null,//地址
  },
  version: {
    key: "version",
    current: "1.0.0",
    getValue: function () {
      return wx.getStorageSync(this.key);
    }
  }, 
  //缓存相关
  getCache:function(key){
    return wx.getStorageSync(key);
  },
  setCache: function (key,obj) {
    wx.setStorageSync(key, obj);
  },
  clear: function (key) {
    wx.removeStorageSync(key);
  },
  onLaunch: function () {
    //云开发初始化
    wx.cloud.init({
      env: 'nearbuy-test',
      traceUser: true
    });

    var updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    });

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败，不用提示，下次会更新成功
    });
  },
  cart: {
    key: "cart",
    ref: "",
    hasTakeOut:false,
    add: function (p) {//加入购物车
      if (p.id) {
        var dic = wx.getStorageSync(this.key) || {};
        if (p.id in dic) {
          dic[p.id].num += 1;//数量
          dic[p.id].arrTime = p.arrTime;//允许选择的时间
          dic[p.id].arrTimeIndex = p.arrTimeIndex;//选择的时间索引
          dic[p.id].deliveryTime = p.deliveryTime;//最终选择的时间
          dic[p.id].deliveryDate = p.deliveryDate;//防止选了这些内容，加购物车，又通过返回按钮出去
          dic[p.id].remarks = p.remarks;
        } else {
          dic[p.id] = p;
          dic[p.id].num = 1;//初始化，否则会出问题
        }
        dic[p.id].surplus = parseInt(dic[p.id].surplus) - 1;//剩余数量-1
        wx.setStorageSync(this.key, dic);
      }
    },
    getGood: function (id) {//是否存在
      var re = null;
      var dic = wx.getStorageSync(this.key) || {};
      if (id in dic) {
        re = dic[id];
      }
      return re;
    },
    remove: function (id) {//从购物车移除
      var dic = wx.getStorageSync(this.key) || {};
      if (id in dic) {
        delete dic[id];
        wx.setStorageSync(this.key, dic);
      }
    },
    getNum: function (id) {//获取购物车中的数量
      var n = 0;
      var dic = wx.getStorageSync(this.key) || {}
      if (id != 0) {
        if (id in dic) {
          n = dic[id].num;
        } else {
          n = 0;
        }
      } else {
        for (var i in dic) {
          n += dic[i].num;
        }
      }
      return n;
    },
    num: function (id, n) {//改变购物车中的数量
      var dic = wx.getStorageSync(this.key) || {};
      if (id in dic) {
        var num = dic[id].num;//原来的数量
        num = n - num;//差值
        dic[id].num = n;
        dic[id].surplus = parseInt(dic[id].surplus) - num;//剩余相应地变化
        //delete dic[id];//n=0就删掉是不合适的，因为可能在购物车减到0了，又想加回来
        wx.setStorageSync(this.key, dic);
      }
    },
    getList: function () {//获取购物车中的商品列表
      var dic = wx.getStorageSync(this.key);
      this.hasTakeOut = false;
      for (var p in dic) {
        if (dic[p].num == 0) {//过滤掉在购物车里弄成0，又出去的，否则感觉上会很奇怪
          delete dic[p];
        }else if (dic[p].takeOut == 'true'){
          this.hasTakeOut = true;
        }
      }
      wx.setStorageSync(this.key, dic);
      return dic;
    },
    clear: function () {//清除购物车
      wx.removeStorageSync(this.key);
    },
    updateGood:function(p){
      var dic = wx.getStorageSync(this.key) || {};
      if (p.id in dic) {
        dic[p.id] = p;
      }
      wx.setStorageSync(this.key, dic);
    }
  },
  //获取两个GPS坐标间的距离，单位米
  getDistance: function (lat1, lng1, lat2, lng2) {
    lat1 = lat1 || 0;
    lng1 = lng1 || 0;
    lat2 = lat2 || 0;
    lng2 = lng2 || 0;
    //可以优化
    var rad1 = lat1 * Math.PI / 180.0;
    var rad2 = lat2 * Math.PI / 180.0;
    var a = rad1 - rad2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var r = 6378137;
    return (r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)))).toFixed(0)
  },
  //根据坐标，获取最接近，并且小于规定范围的已有地址
  getAddressByGPS: function (latitude, longitude, myAddress) {
    var min = 1000000;
    var addr = null;
    if (myAddress){
      for (var a in myAddress) {//地址可能为空
        var la = myAddress[a].latitude - latitude;
        var lo = myAddress[a].longitude - longitude;
        la = Math.abs(la + lo);
        if (la < min) {
          min = la;
          addr = myAddress[a];
        }
      }
      if (addr != null) {
        var distance = this.getDistance(latitude, longitude, addr.latitude, addr.longitude);
        if (addr != null && distance > this.distan) {
          return null;//最近的地址也超出了业务范围
        }
      }
    }
    return addr;
  },
  //更新位置信息
  updataLocation: function (address) {
    var _this = this;
    var locationTEMP = wx.getStorageSync("location");
    if (locationTEMP != "") {//缓存了上次的地址坐标
      var distan = _this.getDistance(_this.location.latitude, _this.location.longitude, locationTEMP.latitude, locationTEMP.longitude);
      if (distan >= _this.distan) {//与上次的距离超过设定的距离
        //与已有地址进行比较
        var nowAddress = _this.getAddressByGPS(_this.location.latitude, _this.location.longitude,address);
        if (nowAddress != null) {//与现有地址接近
          wx.showModal({
            title: '地址变更提示',
            //口不再显示
            content: '您当前位于' + nowAddress.address + '附近，是否切换到当前位置？切换位置将显示附近'+ base.distan +'米的信息，不切换则继续显示' + locationTEMP.address + '周边的信息，您可以点击顶部的地址来进行切换。',
            success: function (res) {
              if (res.confirm) {
                _this.location = nowAddress;//有问题就分别赋值
              } else {
                _this.location = locationTEMP;
              }
            }
          });
        } else {//没有距离当前最近的地址
          //_this.getNewAddressByGPS(_this.location.latitude, _this.location.longitude);
        }
      } else {//与上次的距离在设定的距离之内
        _this.location = locationTEMP;
      }
    } else {//没获取到缓存的地址
      var nowAddress = _this.getAddressByGPS(_this.location.latitude, _this.location.longitude, address);
      if (nowAddress != null) {
        _this.location = nowAddress;//以距离当前最近的地址为准
      } else {//没有距离当前最近的地址
        //_this.getNewAddressByGPS(_this.location.latitude, _this.location.longitude);
      }
    }
    //地址放入缓存
    wx.setStorageSync("location", _this.location);
  },
  getDistanceArea: function (latitude,distance){
    //弧度 = 角度 * Math.PI / 180
    //角度 = 弧度 * 180 / Math.PI
    // 计算经度弧度,从弧度转换为角度
    var dLongitude = 2 * (Math.asin(Math.sin(distance / (2 * 6378137)) / Math.cos(latitude * Math.PI / 180)));//
    dLongitude = dLongitude * 180 / Math.PI;
    // 计算纬度角度
    var dLatitude = distance / 6378137;
    dLatitude = dLatitude * 180 / Math.PI;
    this.dLongitude = dLongitude;
    this.dLatitude = dLatitude;
  }
});