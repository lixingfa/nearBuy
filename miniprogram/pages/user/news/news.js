var db = require('../../../utils/db.js');
var base = getApp();
Page({
  data: {
    news: [],
    index: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var _this = this;
    var where = {};
    where.receiver = base.openId;
    where.status = 0;//未读消息
    db.where('news', where, ["createTime", "desc"], this.data.index).then(function (news) {
      if (_this.data.index == 0) {
        _this.setData({ news: news });
      } else {
        _this.setData({ news: _this.data.news.concat(news) });
      }
    });
    //显示导航
    wx.showTabBar();
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 从头开始
    this.setData({ index: 0 });
    this.onLoad();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    // 页数+1
    this.setData({ index: this.data.news.length });
    this.onLoad();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //移除提示
  onTabItemTap(item) {
    wx.removeTabBarBadge(item);
  },
  read:function(e){
    wx.showLoading({
      title: '已读，数据更新中',
    });
    var _this = this;
    var _id = e.currentTarget.dataset.id;
    var newsType = e.currentTarget.dataset.newstype;
    var data = {};
    data.status = 1;//已读
    db.update('news', _id, data);
    if (newsType == 'order'){//下单
      wx.navigateTo({
        url: '../seller/pendingOrder/pendingOrder'
      });
    } else if (newsType == 'takeOut'){//备货、送货
      wx.navigateTo({
        url: '../myorder/myorder'
      });
    } else if (newsType == 'getGood') {//收货
      // 隐藏加载框
      wx.hideLoading();
      _this.onPullDownRefresh();//刷新
    }
  }
})