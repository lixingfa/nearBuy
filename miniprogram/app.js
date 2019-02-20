//app.js
// 引入SDK核心类
var QQMapWX = require('/libs/qqmap-wx-jssdk.js');
var qqmapsdk;
App({
  distan: 3000,//与默认地址距离多少米就认为是新的地址
  version: {
    key: "version",
    current: "1.0.0",
    getValue: function () {
      return wx.getStorageSync(this.key);
    }
  },
  path: {
    res: "https://res.bestcake.com/",
    //www: "https://mcstj.bestcake.com/"
    www: "http://localhost:9419/"
  },
  location: {
    latitude: 23.26093,//经度，中铁，电脑上获取的坐标
    longitude: 113.8109,//维度
    address: null,//地址
    phone:null
  },
  user: {//用户信息，主要用于下单时显示
    key: "userkey",
    openId: '',//微信号
    nickName: null,//昵称
    avatarUrl: '',//头像地址
    /*islogin: function (tp) {
      var re = false;
      if (this.openId != null) {
        re = true;
      } else {
        wx.navigateTo({
          url: '../phone/phone'
        })
      }
      return re;
    },
    setCache: function (obj) {
      wx.setStorageSync(this.key, obj);
    },
    getCache: function () {
      return wx.getStorageSync(this.key);
    },
    clear: function () {
      wx.removeStorageSync(this.key);
    }*/
  },
  cart: {
    key: "cart",
    ref: "",
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
        dic[p.id].surplus = dic[p.id].surplus - 1;//剩余数量-1
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
        dic[id].surplus = dic[id].surplus - num;//剩余相应地变化
        //delete dic[id];//n=0就删掉是不合适的，因为可能在购物车减到0了，又想加回来
        wx.setStorageSync(this.key, dic);
      }
    },
    getList: function () {//获取购物车中的商品列表
      var list = [];
      var dic = wx.getStorageSync(this.key);
      for (var p in dic) {
        if (dic[p].num != 0) {//过滤掉在购物车里弄成0，又出去的，否则感觉上会很奇怪
          list.push(dic[p]);
        } else {
          delete dic[p];
        }
      }
      return list;
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
  },//应注意参考购物车的写法
  setGoodCache: function (good) {
    wx.setStorageSync('good' + good.id, good);
    //var vs = this.version;
    //wx.setStorageSync(vs.key, vs.current);//设置当前版本号
  },
  getGoodCache: function (id) {
    return wx.getStorageSync('good' + id);
  },
  getGoodById: function (id) {
    //从缓存找，可以减轻通讯，加快小程序的速度
    var p = this.getGoodCache(id);//注意this的指代
    //获取不到再请求
    if (p == "") {
      for (var type in this.typeList) {//再包一层this就指本对象的了
        var goods = this.typeList[type].goods;
        for (var g in goods) {
          g = goods[g];
          if (g.id == id) {
            this.setGoodCache(g);
            return g;
          }
        }
      }
    }
    return p;
  },
  onLaunch: function () {
    //调用API从本地缓存中获取数据     
    var _this = this;
    //位置
    var nowAddress = null;
    //每次打开都获取当前位置
    wx.getLocation({
      type: 'wgs84',//wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      //altitude: 'true',//返回高度信息，需要较高精确度，会减慢接口返回速度
      success(res) {
        //const 用于声明常量，也具有块级作用域，即局部的 const PI=3.14;
        const latitude = res.latitude;//纬度，范围为 -90~90，负数表示南纬
        const longitude = res.longitude;//经度，范围为 -180~180，负数表示西经
        const speed = res.speed;//速度，单位 m/s
        const accuracy = res.accuracy//位置精度
        const altitude = res.altitude;//高度
        const verticalAccuracy = res.verticalAccuracy;//垂直精度，安卓直接返回0
        const horizontalAccuracy = res.horizontalAccuracy;//水平精度

        _this.location.latitude = latitude;
        _this.location.longitude = longitude;
        _this.updataLocation();
      }
    });
  },
  globalData: {
    userInfo: null
  },
  current: function () {
    var list = getCurrentPages();
    return list[list.length - 1];
  },
  load: function (p) {
    p = p ? p : {};
    var _obj = {//标准化
      data: {
      },
    };
    var base = { "onLoad": function () { }, "onReady": function () { }, "onShow": function () { }, "onHide": function () { }, "onUnload": function () { } };
    for (var i in base) {
      _obj[i] = (function (etype) {
        var _etype = "_" + etype;
        if (etype in p) {
          _obj[_etype] = p[i];//重写局部定义
        };
        return function (e) {
          base[etype]();//执行 global
          _obj[_etype] && _obj[_etype](e);
        }
      })(i)
    };
    for (var o in p) {
      if (!(o in base)) {
        if (o == "data") {
          for (var d in p[o]) {
            _obj.data[d] = p[o][d];
          }
        } else {
          _obj[o] = p[o];
        }
      }
    };
    Page(_obj);
  },
  modal: function (p) {
    wx.showModal(p);
  },
  toast: function (p) {
    wx.showToast(p);
  },
  loading: (function () {
    return {
      show: function (p) {
        p = p ? p : {};
        wx.showToast({
          title: p.title || '加载中',
          icon: 'loading',
          duration: p.duration || 10000
        })
      },
      hide: function () {
        wx.hideToast();
      }
    }
  })(),
  get: function (p, suc, tit) {
    var _this = this;
    //var loaded = false;//请求状态
    _this.loading.show({ title: tit });
    // setTimeout(function () {
    //     if (!loaded) {
    //         _this.loading.show();
    //     }
    // }, 500);
    if (_this.user.islogin()) {
      p.userid = _this.user.userid;
      p.sessionid = _this.user.sessionid;
    }
    wx.request({
      url: this.path.www + 'client.ashx?v=' + Math.random(),
      data: p,
      header: {
        'Content-Type': 'application/json'
      },
      method: "GET",
      success: function (res) {
        suc(res);
      },
      fail: function (e) {
        _this.toast({ title: "请求出错！" })
      },
      complete: function () {
        //loaded = true;//完成
        _this.loading.hide();
      }
    })
  },
  post: function (p, suc) {
    var _this = this;
    var loaded = false;//请求状态
    setTimeout(function () {
      if (!loaded) {
        _this.loading.show();
      }
    }, 500);
    if (_this.user.islogin()) {
      p.userid = _this.user.userid;
      p.sessionid = _this.user.sessionid;
    }
    wx.request({
      url: this.path.www + 'client.ashx',
      data: _this.json2Form(p),
      header: {
        // 'Content-Type': 'application/json'
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      success: function (res) {
        suc(res);
      },
      fail: function (e) {
        _this.toast({ title: "请求出错！" })
      },
      complete: function () {
        loaded = true;//完成
        _this.loading.hide();
      }
    })
  },
  json2Form: function (json) {
    var str = [];
    for (var p in json) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
    }
    return str.join("&");
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
  getAddressByGPS: function (latitude, longitude) {
    var min = 1000000;
    var addr = null;
    for (var a in this.myAddress) {//地址可能为空
      var la = this.myAddress[a].latitude - latitude;
      var lo = this.myAddress[a].longitude - longitude;
      la = Math.abs(la + lo);
      if (la < min) {
        min = la;
        addr = this.myAddress[a];
      }
    }
    if (addr != null) {
      var distance = this.getDistance(latitude, longitude, addr.latitude, addr.longitude);
      if (addr != null && distance > this.distan) {
        return null;//最近的地址也超出了业务范围
      }
    }
    return addr;
  },
  //获取新地址
  getNewAddressByGPS: function (latitude, longitude) {
    var _this = this;
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'YCWBZ-64T6K-TJAJU-AM4GX-LZSMQ-GFF4N'
    });
    //根据坐标获取当前位置名称，显示在顶部: 腾讯地图逆地址解析
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: _this.location.latitude,
        longitude: _this.location.longitude
      },
      success: function (addressRes) {
        var address = addressRes.result.formatted_addresses.recommend;
        _this.location.address = address;
        //地址放入缓存，补刀，否则地址都没更新，外面就已经放入缓存了
        wx.setStorageSync("location", _this.location);
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  //更新位置信息
  updataLocation: function () {
    var _this = this;
    var locationTEMP = wx.getStorageSync("location");
    if (locationTEMP != "") {//缓存了上次的地址坐标
      var distan = _this.getDistance(_this.location.latitude, _this.location.longitude, locationTEMP.latitude, locationTEMP.longitude);
      if (distan >= _this.distan) {//与上次的距离超过设定的距离
        //与已有地址进行比较
        var nowAddress = _this.getAddressByGPS(_this.location.latitude, _this.location.longitude);
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
          _this.getNewAddressByGPS(_this.location.latitude, _this.location.longitude);
        }
      } else {//与上次的距离在设定的距离之内
        _this.location = locationTEMP;
      }
    } else {//没获取到缓存的地址
      var nowAddress = _this.getAddressByGPS(_this.location.latitude, _this.location.longitude);
      if (nowAddress != null) {
        _this.location = nowAddress;//以距离当前最近的地址为准
      } else {//没有距离当前最近的地址
        _this.getNewAddressByGPS(_this.location.latitude, _this.location.longitude);
      }
    }
    //地址放入缓存
    wx.setStorageSync("location", _this.location);
  },
  //商品数据
  typeList: [
    {
      id: "1",
      pic: "",
      name: "附近热卖",//指短时间内很多人买的
      goods: [
        {
          id: "1",
          title: "手工红薯粉",
          inAWord: "堂哥自种红薯手工制作，无添加纯红薯粉，保证健康",
          pic: "../../image/goods/hongshufen.jpg",
          price: 16,
          unit: "斤",
          total: 200,
          surplus: 1,//没有了也显示，继续预订?
          lineOrder: true,//广告用户可以看到访问者清单
          takeOut: true,
          promulgator: "利利",//大家熟知的称呼，如发哥、二嫂
          promulgatorId: "lili",//
          distance: "498米",//点击可以看发布者填写的地址
          latitude: 23.26090,//经度
          longitude: 113.8108,//维度
          indate: "2019-05-01 18:30",
          chooseTime: true,
          workTimeStart: "8:00",//可以送货的时间，或者营业时间
          workTimeEnd: "20:00"
        }, {
          id: "2",
          title: "包点拼团，奶黄、紫薯、粗粮、麦香包15元/20个",
          inAWord: "番禺大石朋友新开的食品厂，外贸品质，有兴趣的邻居一起拼团",
          pic: "../../image/goods/zishu.jpg",
          price: 15,
          unit: "份",
          total: 100,
          surplus: 36,
          lineOrder: true,//线上下单/预订
          takeOut: true,//外送
          promulgator: "小青",
          promulgatorId: "xiaoqing",
          distance: "123米",
          latitude: 23.26091,
          longitude: 113.8108,
          indate: "2019-05-01 18:30",
          chooseTime: true,
          workTimeStart: "8:00",
          workTimeEnd: "20:00"
        }, {
          id: "3",
          title: "包点拼团，馒头、奶油、花卷10元/20个",
          inAWord: "番禺大石朋友新开的食品厂，外贸品质，有兴趣的邻居一起拼团",
          pic: "../../image/goods/mantou.jpg",
          price: 10,
          unit: "份",
          total: 100,
          surplus: 48,
          lineOrder: true,
          takeOut: true,
          promulgator: "小青",
          promulgatorId: "xiaoqing",
          distance: "123米",
          latitude: 23.26091,
          longitude: 113.8108,
          indate: "2019-05-01 18:30",
          chooseTime: true,
          workTimeStart: "8:00",
          workTimeEnd: "20:00"
        }, {
          id: "5",
          title: "农家土鸡蛋",
          inAWord: "自家走地鸡产的鸡蛋，朱村黄麻鸡，位于鸭埔村三巷5号，可送到中铁与西福蓝湾路口，顾客自行挑选",//对订单的群体通知功能
          pic: "../../image/goods/tujidan.jpg",
          price: 1,
          unit: "个",
          total: 78,
          surplus: 56,
          lineOrder: true,
          takeOut: false,
          promulgator: "张二嫂",
          promulgatorId: "zhangersao",
          distance: "475米",
          latitude: 23.26092,
          longitude: 113.8107,
          indate: "2019-05-01 18:30",
          chooseTime: true,//可以送到路口
          workTimeStart: "18:00",//傍晚送货，其他时候要干农活
          workTimeEnd: "20:00"
        }
      ]
    }, {//最新发布
      id: "2",
      pic: "",
      name: "最新发布",
      goods: [
        {
          id: "4",
          title: "招牌鱼头粉",
          inAWord: "祖传底料，新鲜活鱼、现摘葱花和香菜15分钟特色炉火熬制而成，请到店品尝。",
          pic: "../../image/goods/yutoufen.jpg",
          price: 20,
          unit: "份",
          total: -1,//页面的处理应尽量简单
          surplus: -1,
          lineOrder: false,
          takeOut: false,
          promulgator: "招牌鱼头粉",
          promulgatorId: "yutoufen",//雇佣关系的店最好用非个人微信
          distance: "243米",
          indate: "0000-00-00 18:30",
          chooseTime: false,//不允许在线下单，就不允许选择时间了，没有支付就没有约束
          workTimeStart: "",
          workTimeEnd: ""
        },
      ]
    }, {//生活服务
      id: "3",
      pic: "",
      name: "生活服务",
      goods: [
        {
          id: "7",
          title: "顺风车接送（中铁-黄陂）",
          inAWord: "早上7：30金城路美宜佳上车。车牌粤AC5564，程师傅13558888888。下单前请先咨询，以免耽误行程。",
          pic: "../../image/goods/shunfengcar.jpg",
          price: 15,
          unit: "位",
          total: 4,
          surplus: 4,
          lineOrder: true,
          promulgator: "顺风车-程",
          promulgatorId: "shunfengcar",
          distance: "361米",
          indate: "0000-00-00 18:30",//有效期，过了之后就会看不到，0000-00-00表示每天循环，如当天不提供服务，则需手动下架。系统自动判断节假日有点麻烦
          chooseTime: false,//上下班类顺风车不允许选择时间
          workTimeStart: "",
          workTimeEnd: ""
        }, {
          id: "8",
          title: "顺风车接送（黄陂-中铁）",
          inAWord: "下午6：30黄陂B口公车站前的卡口处上车。车牌粤AC5564，程师傅13558888888。下单前请先咨询，以免耽误行程。",
          pic: "../../image/goods/shunfengcar.jpg",
          price: 15,
          unit: "位",
          total: 4,
          surplus: 4,
          lineOrder: true,
          takeOut:false,
          promulgator: "顺风车-程",
          promulgatorId: "shunfengcar",
          distance: "361米",
          indate: "0000-00-00 18:30",
          chooseTime:false,
          workTimeStart:"",
          workTimeEnd:""
        },
      ]
    }
  ],
  //地址数据
  myAddress: [
    {
      id: "1",
      latitude: 23.26093,//经度，中铁，电脑上获取的坐标
      longitude: 113.8109,//维度
      address: '广州市增城区朱村大道西145号中国铁建国际花园4栋',
      phone:'18664900467'
    }, {
      id: "2",
      latitude: 23.12463,
      longitude: 113.36199,
      address: '广州市天河区天源路白沙水路89号明动软件',
      phone: '18664900467'
    }
  ],
  myOrder:[]
});