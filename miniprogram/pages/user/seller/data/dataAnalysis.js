var wxCharts = require('../../../../libs/wxcharts.js');
var db = require('../../../../utils/db.js');
var util = require('../../../../utils/util.js');
var base = getApp();
var lineChart = null;
Page({
  data: {
    name:'您的商品',
    how:10
  },
  touchHandler: function (e) {
    console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      // background: '#7cb5ec',
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },
  updateData: function () {
    this.onLoad();
  },
  onLoad: function (e) {
    var _this = this;
    var id = e && e.id ? e.id : 0;
    var whereData = {};
    if(id == 0){
      whereData.promulgatorId = base.openId;
    }else{
      var name = e.name;
      this.setData({ name: name});
      whereData.goodId = id;
    }
    var date = null;
    if(this.data.how != 0){
      date = new Date();
      date.setDate(date.getDate() - this.data.how);
      date = util.formatTime(date);
    }

    var orderBy = ['createTime','asc'];
    var categories = [];
    var series = [];
    db.getAll('vestige', whereData, date).then(function (vestiges){
      wx.showLoading({
        title: '努力分析数据中……',
      });
      var unit = '号';
      if(_this.data.how > 30){
        unit = '月';
      }
      var flat = null;var index = -1;
      var search = {}; search.name = '搜索'; search.color = '#DA70D6'; search.data=[];
      var goodDetail = {}; goodDetail.name = '浏览'; goodDetail.color = '#4682B4'; goodDetail.data=[];
      var addCart = {}; addCart.name = '购买'; addCart.color = '#FFD700'; addCart.data=[];
      var order = {}; order.name = '下单'; order.color = '#32CD32'; order.data=[];
      var orderCancel = {}; orderCancel.name = '退单'; orderCancel.color = '#8B4513'; orderCancel.data=[];
      for (var i in vestiges){
        var time = new Date(vestiges[i].createTime);
        if(_this.data.how > 30){
          time = time.getMonth() + 1;
        }else{
          time = time.getDate();
        }
        if (time != flat){//新点
          categories.push(time + unit);
          flat = time;
          index++;
        }
        switch (vestiges[i].type) {
          case 'search': _this.categoriesPush(index, search.data);break;
          case 'goodDetail': _this.categoriesPush(index, goodDetail.data); break;
          case 'addCart': _this.categoriesPush(index, addCart.data); break;
          case 'order': _this.categoriesPush(index, order.data); break;
          case 'orderCancel': _this.categoriesPush(index, orderCancel.data); break;
        }
      }
      //避免都没有的情况，会导致点击显示出错
      _this.categoriesPush(index, search.data);
      _this.categoriesPush(index, goodDetail.data);
      _this.categoriesPush(index, addCart.data);
      _this.categoriesPush(index, order.data); 
      _this.categoriesPush(index, orderCancel.data);

      series.push(search);
      series.push(goodDetail);
      series.push(addCart);
      series.push(order);
      series.push(orderCancel);
      // 隐藏加载框
      wx.hideLoading();
      
      var windowWidth = 320;
      try {
        var res = wx.getSystemInfoSync();
        windowWidth = res.windowWidth;
      } catch (e) {
        console.error('getSystemInfoSync failed!');
      }
      lineChart = new wxCharts({
        canvasId: 'lineCanvas',
        type: 'line',
        categories: categories,
        animation: true,
        // background: '#f5f5f5',
        series: series,
        xAxis: {
          disableGrid: true
        },
        /*yAxis: {
          title: '数量',
          format: function (val) {
            return val.toFixed(2);
          },
          min: 0
      },*/
        width: windowWidth,
        height: 150,
        dataLabel: false,
        dataPointShape: true,
        extra: {
          lineStyle: 'curve'
        }
      });
      
    },function(){
      wx.showModal({
        showCancel: false,
        content: '未获取到数据'
      });
    });
  },
  input: function (e) {
    var param = e.currentTarget.dataset.param;
    this.setData({ [param]: parseInt(e.detail.value) });//变量key
  },
  categoriesPush: function (index, data){
    for (var i = data.length; i < index;i++){
      data.push(0);
    }
    if (data.length == index) {
      data.push(1);
    } else { 
      data[index]++ 
    }
  }
});