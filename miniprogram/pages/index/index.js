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
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  //事件处理函数
  bindViewTap: function () {
    wx.showActionSheet({
      itemList: ['A', 'B', 'C'],
      success: function (res) {
        if (!res.cancel) {
          console.log(res.tapIndex)
        }
      }
    })

    //wx.navigateTo({
    //url: '../socket/socket'
    //})
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    //app.getUserInfo(function (userInfo) {
    //更新数据
    //that.setData({
    //userInfo: userInfo
    //})
    //})

  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  onShareAppMessage: function () {
    return {
      title: '贝思客（体验版）',
      desc: '',
      path: '/pages/index/index?id=123'
    }
  }
})
