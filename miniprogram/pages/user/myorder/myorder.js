var base = getApp();
Page({
  data: {
    myOrder: []
  },
  onLoad: function () {
    console.log(base.user.nickName);
    this.setData({
      myOrder: base.myOrder.getList()
    });
  }
})