var wxCharts = require('../../../../libs/wxcharts.js');
var db = require('../../../../utils/db.js');
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
    var categories = [];
    var series = [];
    lineChart.updateData({
      categories: categories,
      series: series
    });
  },
  onLoad: function (e) {
    /*var id = e && e.id ? e.id : 0;
    var whereData = {};
    if(id == 0){
      whereData.promulgatorId = base.openId;
    }else{
      var name = e.name;
      this.setData({ name: name});
      whereData.goodId = id;
    }
    var date = new Date();
    if(this.data.how != 0){
      var time = date.setDate(date.getDay - this.data.how);
      var _ = wx.cloud.database().command;
      where.createTime = _.gte(util.formatTime(time));
    }

    var orderBy = ['createTime','asc'];

    var categories = [];
    var series = [];*先获取总数，再取尽
    db.where('vestige', whereData,orderBy,0).then(function (vestiges){

    });*/
    var vestiges = [
      { 'createTime': '2019-03-20 20:55:14', 'type': 'search' },
      { 'createTime': '2019-03-20 20:55:14', 'type': 'goodDetail' },
      { 'createTime': '2019-03-20 20:55:14', 'type':'addCart'},
      { 'createTime': '2019-03-20 20:55:14', 'type': 'order' },
      { 'createTime': '2019-03-20 20:55:14', 'type': 'orderCancel' },

      { 'createTime': '2019-03-19 20:55:14', 'type': 'goodDetail' },
      { 'createTime': '2019-03-19 20:55:14', 'type': 'goodDetail' },
      { 'createTime': '2019-03-19 20:55:14', 'type': 'addCart' },
      { 'createTime': '2019-03-19 20:55:14', 'type': 'order' },
      { 'createTime': '2019-03-19 20:55:14', 'type': 'goodDetail' },

      { 'createTime': '2019-03-18 20:55:14', 'type': 'search' },
      { 'createTime': '2019-03-18 20:55:14', 'type': 'goodDetail' },
      { 'createTime': '2019-03-18 20:55:14', 'type': 'addCart' },

      { 'createTime': '2019-03-17 20:55:14', 'type': 'goodDetail' },
      { 'createTime': '2019-03-17 20:55:14', 'type': 'goodDetail' },
      { 'createTime': '2019-03-17 20:55:14', 'type': 'addCart' },
      { 'createTime': '2019-03-17 20:55:14', 'type': 'goodDetail' },
      { 'createTime': '2019-03-17 20:55:14', 'type': 'goodDetail' },

      { 'createTime': '2019-03-16 20:55:14', 'type': 'search' },
      { 'createTime': '2019-03-16 20:55:14', 'type': 'goodDetail' },
      { 'createTime': '2019-03-16 20:55:14', 'type': 'addCart' },
      { 'createTime': '2019-03-16 20:55:14', 'type': 'goodDetail' },
      { 'createTime': '2019-03-16 20:55:14', 'type': 'addCart' },

      { 'createTime': '2019-03-15 20:55:14', 'type': 'search' },
      { 'createTime': '2019-03-15 20:55:14', 'type': 'goodDetail' },
      { 'createTime': '2019-03-15 20:55:14', 'type': 'addCart' },

    
      { 'createTime': '2019-03-14 20:55:14', 'type': 'goodDetail' },

      { 'createTime': '2019-03-13 20:55:14', 'type': 'search' },
      

      { 'createTime': '2019-03-12 20:55:14', 'type': 'search' },
      { 'createTime': '2019-03-12 20:55:14', 'type': 'goodDetail' },
      { 'createTime': '2019-03-12 20:55:14', 'type': 'addCart' },
      { 'createTime': '2019-03-12 20:55:14', 'type': 'order' },
      { 'createTime': '2019-03-12 20:55:14', 'type': 'orderCancel' },

      { 'createTime': '2019-03-11 20:55:14', 'type': 'search' },
      { 'createTime': '2019-03-11 20:55:14', 'type': 'goodDetail' },
      

      { 'createTime': '2019-03-10 20:55:14', 'type': 'search' },
      { 'createTime': '2019-03-10 20:55:14', 'type': 'goodDetail' },
      { 'createTime': '2019-03-10 20:55:14', 'type': 'addCart' },
      { 'createTime': '2019-03-10 20:55:14', 'type': 'order' },
      { 'createTime': '2019-03-10 20:55:14', 'type': 'orderCancel' }
    ];
    var categories = [];
    var series = [];
    var unit = '号';
    if(this.data.how > 30){
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
      if(this.data.how > 30){
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
          case 'search': this.categoriesPush(index, search.data);break;
          case 'goodDetail': this.categoriesPush(index, goodDetail.data); break;
          case 'addCart': this.categoriesPush(index, addCart.data); break;
          case 'order': this.categoriesPush(index, order.data); break;
          case 'orderCancel': this.categoriesPush(index, orderCancel.data); break;
        }
    }
    series.push(search);
    series.push(goodDetail);
    series.push(addCart);
    series.push(order);
    series.push(orderCancel);

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