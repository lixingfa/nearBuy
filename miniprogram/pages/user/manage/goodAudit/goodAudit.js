var good = require('../../../../utils/good.js');
var db = require('../../../../utils/db.js');
var news = require('../../../../utils/news.js');
Page({
  data: {
    goods: [],
    index: 0
  },
  goDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../../../goodDetail/goodDetail?id=' + id
    })
  },
  onLoad: function () {
    var _this = this;
    good.getGoodsAudit(this.data.index, function (goods) {
      for(var i in goods){
        goods[i].select = true;
      }
      if (_this.data.index == 0) {
        _this.setData({ goods: goods });
      } else {
        _this.setData({ goods: _this.data.goods.concat(goods) });
      }
    });
  },
  select: function (e) {
    var id = e.currentTarget.dataset.id;
    for (var i in this.data.goods){
      if (this.data.goods[i].id == id){
        if (this.data.goods[i].select) {
          this.data.goods[i].select = false;
        } else {
          this.data.goods[i].select = true;
        }
        this.setData({ goods: this.data.goods});
        break;
      }
    }
  },
  check:function(e){
    var status = e.currentTarget.dataset.status;
    var c = '确定通过审核？';
    if(status == '0'){
      c = '不通过？';
    }
    var data = {};
    data.status = status;
    var _this = this;
    wx.showModal({
      content: c,
      success(res) {
        if (res.confirm) {
          for (var i in _this.data.goods) {
            if (_this.data.goods[i].select) {
              db.update('goods', _this.data.goods[i]._id, data).then(function(_id){
                if(status == '0'){//发信息告诉发布人
                  var n = {};
                  n.newsType = 'goodCheckFail';//审核不通过
                  n.receiver = _this.data.goods[i].promulgatorId;//卖家
                  n.content = '您的商品 ' + _this.data.goods[i].title + ' 审核不通过，请在商品管理中重新编辑。';
                  n.goodId = _this.data.goods[i].id;
                  news.add(n);
                }
              });
            }
          }
          wx.showModal({
            showCancel: false,
            content: "处理结果已提交，请手动下拉更新。"
          });
        }
      }
    });

  },
  //上拉加载更多
  onReachBottom: function () {
    // 页数+1
    this.setData({ index: this.data.goods.length });
    this.onLoad();
  },
  //下拉更新
  onPullDownRefresh: function () {
    // 从头开始
    this.setData({ index: 0 });
    this.onLoad();
  }
})
