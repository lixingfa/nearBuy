var base = getApp();
var preview=require('../../utils/preview.js');
Page({
    data: {
        plist: [],
        total: 0,
        his: ""
    },
    onLoad: function (e) {

    },
    onShow: function (e) {
        if (base.cart.ref) {
            this.setData({ his: base.cart.ref });
            base.cart.ref = "";
        }
        var l = base.cart.getList();//获取购物车列表里的
        for (var i = 0; i < l.length; i++) {
            //l[i].img = base.path.res + 'images/ksk/item/w_127/' + l[i].name + '.jpg';
            l[i].index = i;
        }
        this.setData({ plist: l });
        this.changeTotal();
    },
    goBack: function () {
        var _this = this;
        wx.navigateTo({
            url: _this.data.his
        })
    },
    previewImg: function (e) {
        preview.show(e.currentTarget.dataset.name,e.currentTarget.dataset.brand,e.currentTarget.dataset.index)
    },
    changeTotal: function () {
        var l = this.data.plist;
        var t = 0;
        for (var i = 0; i < l.length; i++) {
            if (!l[i].del) {//排除删除选项
                t += l[i].price * l[i].num;
            }
        }
        this.setData({ total: t });
    },
    changeNum: function (e) {
        var index = e.currentTarget.dataset.index;
        var t = e.currentTarget.dataset.type;//这次的数值
        var surplus = this.data.plist[index].surplus;//剩余
        t = parseInt(t);
        var re = this.data.plist[index].num + t;

        if ((surplus > 0 && t == 1) || (t == -1 && re >= 0)) {
            var id = this.data.plist[index].id;
            var key = "plist[" + index + "].num";
            var obj = {}; obj[key] = re;
            base.cart.num(id, obj[key]);//id,num
            this.setData(obj);
            this.changeTotal();
            //局部更新就用这个？
            key = "plist[" + index + "].surplus";
            obj[key] = this.data.plist[index].surplus + -t;
            this.setData(obj);
        }
    },
    del: function (e) {
        var index = e.currentTarget.dataset.index;
        var id = this.data.plist[index].id;
        var key1 = "plist[" + index + "].del";
        var obj = {};
        obj[key1] = true;
        this.setData(obj);
        this.changeTotal();
        base.cart.remove(id);
    },
    clearCart: function () {
        var _this = this;
        if (this.data.total > 0) {
            base.modal({
                title: "确认清空所有商品？", confirmText: "清空", success: function (res) {
                    if (res.confirm) {
                        _this.setData({plist:[], total:0});
                        base.cart.clear();
                    }
                }
            })
        }
    },
    goOrder: function () {
        if (this.data.plist.length > 0 && this.data.total > 0) {
            wx.navigateTo({//保留当前页面，到新页面，可以返回
              url: '../order/order?totalPrice=' + this.data.total
            })
        } else {
            base.modal({
                title: '购物车无商品',
                showCancel: false
            })
        }
    }, 
    goDetail: function (e) {
      var id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '../goodDetail/goodDetail?id=' + id
      })
    },
    p: {
        currentIndex: -1,
        eventOk: true,
        eventStartOk: true,
        aniOk: true,
        len: 0,//当前位置
        ani: wx.createAnimation(),
        // _ani: wx.createAnimation({
        //     duration: 200,
        //     timingFunction: 'ease-out'//
        // }),
        max: 80,
        size: 40
    },
    moveTo: function (index, x) {
        this.p.eventOk = false;//停止事件
        if (x == 0) {
            this.p.currentIndex = -1;
            if (this.p.len > 0 - this.p.max / 2) {
                if (this.p.len > 0) {
                    this.p.ani.translateX(this.p.size).step({
                        duration: 100,
                        timingFunction: 'ease-out'
                    });

                }
                this.p.ani.translateX(0 - this.p.size).step({
                    duration: 200,
                    timingFunction: 'ease'
                });
            }
        }
        if (x == 0 - this.p.max) {
            this.p.currentIndex = index;
            this.p.ani.translateX(x - this.p.size).step({
                duration: 200,
                timingFunction: 'ease'
            });
        }
        this.p.ani.translateX(x).step({
            duration: 200,
            timingFunction: 'ease-out'
        });
        var obj = {};
        var key = "plist[" + index + "].ani";
        obj[key] = this.p.ani.export();
        this.setData(obj);
    },
    ptouchsatrt: function (e) {

        var index = e.currentTarget.dataset.index;
        if (this.p.currentIndex >= 0) {
            this.moveTo(this.p.currentIndex, 0);
            return;
        }
        if (this.p.eventStartOk) {
            this.p.eventOk = true;
            this.p.len = 0;
            var pt = e.changedTouches[0];
            pt.aaaaaaa = 11111;
            this.p.x = pt.pageX;
            this.p.y = pt.pageY;
            console.log("start")
        }
    },
    ptouchend: function (e) {
        if (this.p.eventOk) {
            var pt = e.changedTouches[0];
            var len = pt.pageX - this.p.x;//预计目标位置
            var ht = pt.pageY - this.p.y;
            if (len != 0 && Math.abs(ht) / Math.abs(len) < 0.3) {//滑动倾斜度限制
                this.p.len = len;
                var index = e.currentTarget.dataset.index;
                if (len > 0 - this.p.max / 2) {
                    this.moveTo(index, 0);
                } else {
                    this.moveTo(index, 0 - this.p.max);
                }
            }
        }
        this.p.eventOk = false;
        this.p.eventStartOk = false;
        var _this = this;
        if (this.p.tm) {
            clearTimeout(this.p.tm);
        }
        this.p.tm = setTimeout(function () {
            _this.p.eventStartOk = true;
        }, 300);
    }
});