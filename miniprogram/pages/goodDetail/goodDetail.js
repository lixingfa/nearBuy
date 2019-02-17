var base = getApp();
Page({
    data: {
        id: 0,
        cartNum: 0,
        good:null,
      arrTime: ['选择配送时间', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'],
      objectArrTime: [
        { id: 0, name: '选择配送时间' },
        { id: 1, name: '10:00-11:00' },
        { id: 2, name: '11:00-12:00' },
        { id: 3, name: '12:00-13:00' },
        { id: 4, name: '13:00-14:00' },
        { id: 5, name: '14:00-15:00' },
        { id: 6, name: '15:00-16:00' },
        { id: 7, name: '16:00-17:00' },
        { id: 8, name: '17:00-18:00' }],
        arrTimeIndex: 0,
        scrollTop: 100,
        selectedID: -1,
        oinfo: {
          OrderSource: "all|web",
          Consignee: "",
          Cellphone: "",
          City: "",
          District: "",
          Address: "",
          DeliveryDate: "",
          DeliveryTime: "",
          Payment: "",
          Remarks: "",
          TotalPrice: 0
        },
      dateStart: "2017-01-01",
      dateEnd: "2017-01-01"
    },
    onLoad: function (e) {
      var id = e && e.id ? e.id : 0;
      var good = base.getGoodById(id);
      this.setData({ id: id, good: good});
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
    },
    bindTimeChange: function (e) {
      var _this = this;
      if (e.detail.value > 0) {
        _this.setData({
          arrTimeIndex: e.detail.value,
          "oinfo.DeliveryTime": _this.data.arrTime[e.detail.value]
        });
      }
    },
    bindDateChange: function (e) {
      this.setData({
        "oinfo.DeliveryDate": e.detail.value
      })
    },
});