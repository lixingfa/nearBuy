var util = require('../../utils/util.js');
var good = require('../../utils/good.js');
var base = getApp();
Page({
    data: {
        good:null,
        dateStart: "",
        dateEnd: "",
    },
    onLoad: function (e) {
      var id = e && e.id ? e.id : 0;
      good.getGood(id,this.initGood);
    },
  initGood:function(good){
      if (good){//购物车里存在，则拿购物车的，可以简化很多操作
        this.setData({good:good});
      }else{//初始化
        good = base.getGoodById(id);
        var time = null;
        var arrTimeT = new Array("请选择时间");
        if (good.chooseTime){//允许选择送货/取货时间
          time = util.formatTime(new Date());//返回当前日期和时间，使日期默认显示在今天
          var start = good.workTimeStart;//可选择的时间，是根据店铺的营业时间，或者个人提供服务的时间确定的
          start = start.substring(0,start.indexOf(":"));
          var end = good.workTimeEnd;
          end = end.substring(0,end.indexOf(":"));
          for (var t = parseInt(start); t < parseInt(end); t++){//每次增加1小时
            arrTimeT.push(t + ":00-" + (t + 1) + ":00");
          }
        }
        //初始化数值
        this.setData({good: good, dateStart: time, "good.arrTime": arrTimeT,"good.arrTimeIndex":0,"good.num":0});
      }
  },
    onShow: function () {
    },
    addCart: function () {
        if (this.data.good.price > 0){
          this.setData({"good.needPay":true});
        }
        base.cart.add(this.data.good);//直接整个对象放进去，并做一些操作
        var good = base.cart.getGood(this.data.id);        
        this.setData({good: good });//更新数据
    },
    bindTimeChange: function (e) {
      var _this = this;
      if (e.detail.value > 0) {
        _this.setData({
          "good.arrTimeIndex": e.detail.value,
          "good.deliveryTime": _this.data.good.arrTime[e.detail.value]
        });
      }
    },
    bindDateChange: function (e) {
      this.setData({
        "good.deliveryDate": e.detail.value
      })
    }, 
    bindTextAreaBlur: function (e) {
      this.setData({
        "good.remarks": e.detail.value
      });
    },
    goCart: function (e) {
      if (this.data.good.price > 0) {
        this.setData({ "good.needPay": true });
      }
      base.cart.updateGood(this.data.good);//加入购物车按钮会消失，或者是留言后就去购物车。
      wx.switchTab({//wx.navigateTo和wx.redirectTo,不能跳转tabBar里的页面
        url: '../cart/cart'
      })
    },
});