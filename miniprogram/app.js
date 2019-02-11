//app.js
App({
    distan:3000,//与默认地址距离多少米就认为是新的地址
  address: '广州市增城区朱村大道西145号中国铁建国际花园4栋',//地址
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
          promulgator: "利利",//大家熟知的称呼，如发哥、二嫂
          promulgatorId: "lili",//
          distance: "498米"//点击可以看发布者填写的地址
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
          promulgator: "小青",
          promulgatorId: "xiaoqing",//
          distance: "123米"
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
          promulgator: "小青",
          promulgatorId: "xiaoqing",//
          distance: "123米"
        }, {
          id: "5",
          title: "农家土鸡蛋",
          inAWord: "自家走地鸡产的鸡蛋，朱村黄麻鸡，位于鸭埔村三巷5号，可送到中铁与西福蓝湾路口",//对订单的群体通知功能
          pic: "../../image/goods/tujidan.jpg",
          price: 1,
          unit: "个",
          total: 78,
          surplus: 56,
          lineOrder: false,
          promulgator: "张二嫂",
          promulgatorId: "zhangersao",//
          distance: "475米"
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
          promulgator: "招牌鱼头粉",
          promulgatorId: "yutoufen",//雇佣关系的店最好用非个人微信
          distance: "243米"
        },
      ]
    }

  ],
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
        www:"http://localhost:9419/"
    },
    location: {
      latitude: 23.26093,//经度，中铁，电脑上获取的坐标
      longitude: 113.8109//维度
    },
    user: {
        key: "userkey",
        openId:'',//微信号
        nickName: '',//昵称
        avatarUrl: '',//头像地址
        address: '广州市增城区朱村大道西145号中国铁建国际花园4栋',//地址
        islogin: function (tp) {
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
        }
    },
    cart: {
        key: "cart",
        ref: "",
        add: function (p) {
            var re = false;
            if (p.id && p.price) {
                var dic = wx.getStorageSync(this.key) || {};
                if (p.id in dic) {
                    dic[p.id].num += 1;
                } else {
                    //dic[p.supplyno] = { name: p.name, price: p.price, size: p.size, num: p.num, brand: p.brand }
                    dic[p.id] = p;
                    dic[p.id].num = 1;//初始化，否则会出问题
                }
                wx.setStorageSync(this.key, dic);
                re = true;
            }
            return re;
        },
        exist: function (id) {
            var re = false;
            var dic = wx.getStorageSync(this.key) || {};
            if (id in dic) {
                re = true;
            }
            return re;
        },
        remove: function (id) {
            var dic = wx.getStorageSync(this.key) || {};
            if (id in dic) {
                delete dic[id];
                wx.setStorageSync(this.key, dic);
            }
        },
        getNum: function (id) {
            var n = 0;
            var dic = wx.getStorageSync(this.key) || {}
            if(id != 0){
              if(id in dic){
                n = dic[id].num;
              }else{
                n = 0;
              }
            }else{
              for (var i in dic) {
                  n += dic[i].num;
              }
            }
            return n;
        },
        num: function (id, n) {
            var dic = wx.getStorageSync(this.key) || {};
            if (id in dic) {
                if (n > 0) {
                    dic[id].num = n;
                } else {
                    delete dic[id];
                }
                wx.setStorageSync(this.key, dic);
            }
        },
        getList: function () {
            var list = [];
            var dic = wx.getStorageSync(this.key);
            for (var p in dic) {
                list.push(dic[p]);
            }
            return list;
        },
        clear: function () {
            wx.removeStorageSync(this.key);
        }
    },
        setGoodCache: function (obj) {
            wx.setStorageSync('good', obj);
            var vs = getApp().version;
            wx.setStorageSync(vs.key, vs.current);//设置当前版本号
        },
        getGoodCache: function () {
            return wx.getStorageSync('good');
        },
        getGoodById: function (id) {
            var p = null;
            //从缓存找，可以减轻通讯，加快小程序的速度
            var dic = wx.getStorageSync('good') || {};//注意this的指代
            if (id in dic) {
                p = dic[id];
            }
            //获取不到再请求
            if(p == null){
              for (var type in this.typeList){//再包一层this就指本对象的了
                var goods = this.typeList[type].goods;
                for (var g in goods){
                  g = goods[g];
                  if (g.id == id){
                    this.setGoodCache(g);
                    return g;
                  }
                }
              }
            }
            return p;
        },
    changeGoodNum:function(id,num){
      var good = this.getGoodById(id);
      good.surplus = good.surplus + num;
      this.setGoodCache(good);
    },
    onLaunch: function () {
        //调用API从本地缓存中获取数据     
        var _this = this;
        //用户
        var user = _this.user.getCache("userkey");
        if (user != null) {
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
        //位置，每次打开都获取
        var location = _this.user.getCache("location");
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
          }
        });
    },
    onShow: function () {
        var rrr = 1;
    },
    onHide: function () {
        var rrr = 1;
    },
    getUserInfo: function (cb) {
        var that = this
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            wx.login({
                success: function () {
                    wx.getUserInfo({
                        success: function (res) {
                            that.globalData.userInfo = res.userInfo
                            typeof cb == "function" && cb(that.globalData.userInfo)
                        }
                    })
                }
            })
        }
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
    }
});