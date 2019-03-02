// 引入SDK核心类
var QQMapWX = require('/libs/qqmap-wx-jssdk.js');
var qqmapsdk;
var util = require('/utils/util.js');
var user = require('/utils/user.js');
var db = require('/utils/db.js');
App({
  distan: 3000,//与默认地址距离多少米就认为是新的地址
  openId : '',
  arrTime: ['选择时间', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
  location: {
    latitude: 23.26093,//经度，中铁，电脑上获取的坐标
    longitude: 113.8109,//维度
    address: null,//地址
    phone:null,
    id:-1
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
    var _this = this;
    //云开发初始化
    wx.cloud.init({
      env: 'nearbuy-test',
      traceUser: true
    });
    
    //获取openId、GPS坐标
    Promise.all([util.getGPS(), util.getOpenId()])
      .then(function (results) {
        _this.location.latitude = results[0].latitude;
        _this.location.longitude = results[0].longitude;
        _this.openId = results[1];
        user.getThisUser(results[1],function (user) {//再获取用户信息
          if(user){//老用户
            var where = {};
            where.userId = user.id;
            _this.distan = user.distan;//更新搜索范围
            db.where('address', where).then(_this.updataLocation, _this.updataLocation);
          }else{//新用户

          }
        });
    });
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
      fail() {
        wx.showModal({
          showCancel: false,
          title: '',
          content: "获取你的位置失败，将无法准确展示您周边的信息。可以退出小程序，重新进入获取位置信息。"
        })
      }
    });
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
          _this.getNewAddressByGPS(_this.location.latitude, _this.location.longitude);
        }
      } else {//与上次的距离在设定的距离之内
        _this.location = locationTEMP;
      }
    } else {//没获取到缓存的地址
      var nowAddress = _this.getAddressByGPS(_this.location.latitude, _this.location.longitude, address);
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
          qrcode: "../../../image/user/qrcode.png",
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
          qrcode: "../../../image/user/qrcode.png",
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
          qrcode: "../../../image/user/qrcode.png",
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
          qrcode: "../../../image/user/qrcode.png",
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
          total: 0,//页面的处理应尽量简单
          surplus: 0,
          lineOrder: false,
          takeOut: false,
          promulgator: "招牌鱼头粉",
          promulgatorId: "yutoufen",//雇佣关系的店最好用非个人微信
          qrcode: "../../../image/user/qrcode.png",
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
          qrcode: "../../../image/user/qrcode.png",
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
          qrcode:"../../../image/user/qrcode.png",
          distance: "361米",
          indate: "0000-00-00 18:30",
          chooseTime:false,
          workTimeStart:"",
          workTimeEnd:""
        }, {
          id: "9",
          title: "亲子活动",
          inAWord: "本周六上午九点在朱村文化广场举办‘美好生活’画画涂鸦亲子活动，欢迎各位家长携4-6岁的小朋友参加。本次活动由朱村街道办举办，增城蓝淋画室承办。",
          pic: "../../image/goods/qinzi.jpg",
          price: 0,
          unit: "位",
          total: 20,
          surplus: 14,
          lineOrder: true,
          takeOut: false,
          promulgator: "蓝淋画室",
          promulgatorId: "lanling",
          qrcode: "",
          distance: "1361米",
          indate: "0000-00-00 18:30",
          chooseTime: false,
          workTimeStart: "",
          workTimeEnd: ""
        }
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
  myOrder:{
    key: "order",
    ref: "",
    add: function (p) {//加入购物车
        var dic = wx.getStorageSync(this.key) || {};
        dic[p.id] = p;
        wx.setStorageSync(this.key, dic);
    },
    getList: function () {//获取购物车中的商品列表
      var list = [];
      var dic = wx.getStorageSync(this.key);
      for (var p in dic) {
        list.push(dic[p]);
      }
      return list;
    },
    changeGood: function (id,oid) {//获取购物车中的数量
      var dic = wx.getStorageSync(this.key) || {};
      if (oid in dic) {
        var plist = dic[oid].plist;
        for(var p in plist){
          if(plist[p].id == id){
            var good = plist[p];
            good.needPay = false;
            plist[p] = good;
            dic[oid].plist = plist;

            wx.setStorageSync(this.key, dic);
            break;
          }
        }
      }

    }
  },
  goodTypes:[{//分类，每个商品必须只能属于一个分类，最多两层？可以有三个标签
    id: '0', name: '房屋租售', sub: [{ id: '00', name: '出租' }, { id: '01', name: '出售' }]
  },{
    id: '1', name: '食品生鲜', sub: [{ id: '10', name: '蔬菜蛋品' }, { id: '11', name: '水果' }, { id: '12', name: '特产' }, { id: '13', name: '冷饮冻食' }, { id: '14', name: '肉类' }, { id: '15', name: '海鲜水产' }, { id: '16', name: '粮油调味' }, { id: '12', name: '零食' }]
  }, {
      id: '2', name: '生活服务', sub: [{ id: '20', name: '家政' }, { id: '21', name: '家教' }, { id: '21', name: '活动公益' }]
    }, {
      id: '3', name: '二手闲置', sub: [{ id: '30', name: '数码家电' }, { id: '31', name: '儿童玩具' }, { id: '32', name: '书籍杂物' }]
    }]
});