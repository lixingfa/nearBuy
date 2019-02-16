var base = getApp();
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
    onShow: function () {
      this.setData({ cartNum: base.cart.getNum(this.data.id)});
    },
    addCart: function () {
        //商品缓存数量减一
        base.changeGoodNum(this.data.id,-1);
        //直接整个对象放进去
        base.cart.add(this.data.good);
        //购物车数量减一，有可能是从购物车减到0又跳出来的
        base.cart.surplus(this.data.id, -1);//改变购物车中的数量
        //先改变数量，因为购物车那个列表是取购物车的，要保持购物车、缓存数据一致
        var good = base.getGoodById(this.data.id);
        //更新数据
        this.setData({cartNum: base.cart.getNum(this.data.id), good: good});
    }
});