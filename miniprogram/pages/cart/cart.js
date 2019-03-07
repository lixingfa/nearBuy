var base = getApp();
var good=require('../../utils/good.js');
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
        var list = base.cart.getList();//获取购物车列表里的
        for(var l in list){
          if (typeof (list[l].select) == "undefined"){
            list[l].select = true;
          }
        }
        this.setData({ plist: list });
        this.changeTotal();
    },
    goBack: function () {
        var _this = this;
        wx.navigateTo({
            url: _this.data.his
        })
    },
    changeTotal: function () {
        var list = this.data.plist;
        var t = 0;
        for (var l in list) {
          if (!list[l].del && list[l].select) {//排除删除选项
            t += list[l].price * list[l].num;
          }
        }
        this.setData({ total: t });
    },
    changeNum: function (e) {
      var id = e.currentTarget.dataset.id;
      var t = e.currentTarget.dataset.type;//这次的数值
      t = parseInt(t);
      this.data.plist[id].num = this.data.plist[id].num + t;
      this.data.plist[id].surplus = this.data.plist[id].surplus - t;
      if (this.data.plist[id].surplus >= 0) {
        this.changeTotal();
        this.setData({plist: this.data.plist});
      }
    },
    select:function(e){
      var id = e.currentTarget.dataset.id;
      if (this.data.plist[id].select){
        this.data.plist[id].select = false;
      }else{
        this.data.plist[id].select = true;
      }
      this.setData({ plist: this.data.plist });
      this.changeTotal();
    },
    del: function (e) {
      var id = e.currentTarget.dataset.id;
      this.data.plist[id].del = true;
      this.setData({ plist: this.data.plist });
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
        if (this.data.total > 0) {
          var _this = this;
            //检查库存
          good.checkOrderGoods(this.data.plist).then(function(goOrder){
              if(goOrder){
                base.setCache('cart', _this.data.plist);
                wx.navigateTo({//保留当前页面，到新页面，可以返回
                  url: '../order/order?totalPrice=' + _this.data.total
                });
              }
            });
        } else {
          wx.showModal({
            showCancel: false,
            title: '',
            content: "购物车无商品。"
          });
        }
    }, 
    goDetail: function (e) {
      var id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '../goodDetail/goodDetail?id=' + id
      })
    },
    p: {
        currentid: -1,
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
    moveTo: function (id, x) {
        this.p.eventOk = false;//停止事件
        if (x == 0) {
            this.p.currentid = -1;
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
            this.p.currentid = id;
            this.p.ani.translateX(x - this.p.size).step({
                duration: 200,
                timingFunction: 'ease'
            });
        }
        this.p.ani.translateX(x).step({
            duration: 200,
            timingFunction: 'ease-out'
        });
      this.data.plist[id].ani = this.p.ani.export();
      this.setData({ plist: this.data.plist });
    },
    ptouchsatrt: function (e) {

        var id = e.currentTarget.dataset.id;
        if (this.p.currentid >= 0) {
            this.moveTo(this.p.currentid, 0);
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
                var id = e.currentTarget.dataset.id;
                if (len > 0 - this.p.max / 2) {
                    this.moveTo(id, 0);
                } else {
                    this.moveTo(id, 0 - this.p.max);
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