//app.js
App({
    distan:3000,//与默认地址距离多少米就认为是新的地址
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
      latitude: 0,//经度
      longitude: 0//维度
    },
    user: {
        userid: 0,//用户ID
        sessionid: "",//秘钥
        jzb: 0,
        exp: 0,
        phone: "",
        levels: 0,
        headimg: "",
        islogin: function (tp) {
            var re = false;
            if (this.userid > 0) {
                re = true;
            } else {
                if (tp == true) {
                    wx.navigateTo({
                        url: '../phone/phone'
                    })
                }
            }
            return re;
        },
        key: "userkey",
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
    city: {

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
        exist: function (sno) {
            var re = false;
            var dic = wx.getStorageSync(this.key) || {};
            if (sno in dic) {
                re = true;
            }
            return re;
        },
        remove: function (sno) {
            var dic = wx.getStorageSync(this.key) || {};
            if (sno in dic) {
                delete dic[sno];
                wx.setStorageSync(this.key, dic);
            }
        },
        getNum: function () {
            var n = 0;
            var dic = wx.getStorageSync(this.key) || {}
            for (var i in dic) {
                n += dic[i].num;
            }
            return n;
        },
        num: function (sno, n) {
            var dic = wx.getStorageSync(this.key) || {};
            if (sno in dic) {
                if (n > 0) {
                    dic[sno].num = n;
                } else {
                    delete dic[sno];
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
    cake: {
        tab: null,
        key: "cake",
        setCache: function (obj) {
            wx.setStorageSync(this.key, obj);
            var vs = getApp().version;
            wx.setStorageSync(vs.key, vs.current);//设置当前版本号
        },
        getCache: function () {
            return wx.getStorageSync(this.key);
        },
        getByName: function (nm) {
            var p = null;
            var dic = wx.getStorageSync(this.key) || {};
            if (nm in dic) {
                p = dic[nm];
            }
            return p;
        }
    },
    onLaunch: function () {
        //调用API从本地缓存中获取数据     
        var _this = this;
        //用户
        var user = _this.user.getCache("userkey");
        if (user != null) {
          _this.user.userid = user.userid;
          _this.user.sessionid = user.sessionid;
          _this.user.jzb = user.jzb;
          _this.user.exp = user.exp;
          _this.user.phone = user.phone;
          _this.user.levels = user.levels;
          _this.user.headimg = user.headimg;
        }
        //位置，每次打开都获取
        var location = _this.user.getCache("location");
        wx.getLocation({
          type: 'wgs84',//wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
          altitude: 'true',//返回高度信息，需要较高精确度，会减慢接口返回速度
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
        })
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