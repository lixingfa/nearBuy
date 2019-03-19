var base = getApp();
var news = require('../../../utils/news.js');
Page({
  data: {
    content:null
  },
  input: function (e) {
    var param = e.currentTarget.dataset.param;
    this.setData({ [param]: e.detail.value });//变量key
  },
  submit:function(){
    var n = {};
    n.newsType = 'complaints';//审核不通过
    n.quizzer = base.openId;
    n.content = this.data.content;
    news.add(n);
    wx.showModal({
      showCancel: false,
      content: '我们已收到您的信息，将会尽快处理。',
    });
  }
})