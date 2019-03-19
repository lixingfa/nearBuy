var base = getApp();
var db = require('../../../../utils/db.js');

Page({
  data: {
    index:0,
    news:[]
  },
  onShow: function () {
    var _this = this;
    var where = {};
    where.newsType = 'complaints';//投诉咨询
    where.status = 0;//未读消息
    db.where('news', where, ["createTime", "desc"], this.data.index).then(function (news) {
      if (_this.data.index == 0) {
        _this.setData({ news: news });
      } else {
        _this.setData({ news: _this.data.news.concat(news) });
      }
    });
  },
  onPullDownRefresh: function () {
    // 从头开始
    this.setData({ index: 0 });
    this.show();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    // 页数+1
    this.setData({ index: this.data.news.length });
    this.show();
  }
})