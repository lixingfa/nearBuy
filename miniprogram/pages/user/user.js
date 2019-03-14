var base = getApp();
Page({
    onLoad: function () {
    },
    onTabItemTap(item) {
      wx.hideTabBarRedDot({ index: 3 });
    }
});