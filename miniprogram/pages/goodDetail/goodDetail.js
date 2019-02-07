var base = getApp();
var preview=require('../../utils/preview.js');
Page({
    data: {
        id: 0,
        loaded: false,
        cartNum: 0,
        good:null
    },
    onLoad: function (e) {
      var id = e && e.id ? e.id : 0;
      var good = base.getGoodById(id);
      this.setData({ id: id, loaded: true, good: good});
    },
    onShow: function (e) {
        this.setData({ cartNum: base.cart.getNum() });
    },
    addCart: function () {
        //直接整个对象放进去
        base.cart.add(this.data.good);
        //数量减一
        base.changeGoodNum(this.data.id,-1);
        //更新数据
        this.setData({ cartNum: base.cart.getNum(), good: base.getGoodById(this.data.id)});
        /*
        var _this = this;
        if (base.cart.add({
            supplyno: this.data.current.supplyno,//
            name: this.data.name,//名称
            size: this.data.current.size,//尺寸
            price: this.data.current.price,//价格
            num: this.data.num,//数量
            brand:this.data.brand
        })) {
            this.setData({ cartNum: base.cart.getNum() })
            base.modal({
                title: '加入成功！',
                content: "跳转到购物车或留在当前页",
                showCancel: true,
                cancelText: "留在此页",
                confirmText: "去购物车",
                success: function (res) {
                    if (res.confirm) {
                        _this.goc();
                    }
                }
            })
            // base.toast({
            //     title: '加入成功',
            //     icon: 'success',
            //     duration: 1500
            // })
        }*/
    },
    goCart: function () {
        if (!base.cart.exist(this.data.current.supplyno)) {
            base.cart.add({
                supplyno: this.data.current.supplyno,
                name: this.data.name,
                size: this.data.current.size,
                price: this.data.current.price,
                num: this.data.num
            })
        }
        this.goc();
    },
    goc: function () {
        var _this = this;
        base.cart.ref = "../cakeDetail/cakeDetail?pname=" + _this.data.name + "&brand=" + _this.data.brand;
        wx.switchTab({
            url: "../cart/cart"
        })
    },
    _go: function () {
        var _this = this;
        wx.navigateTo({
            url: "../buy/buy?type="+_this.data.brand+"&price=" + _this.data.current.price
        })
    }
});