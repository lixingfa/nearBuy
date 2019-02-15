//index.js
//获取应用实例
var base = getApp();
Page({
  data: {
    typeList:base.typeList
  },
  goDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../goodDetail/goodDetail?id=' + id
    })
  },
  onLoad: function () {
  }
})
