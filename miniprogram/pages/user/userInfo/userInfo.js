var db = require('../../../../utils/db.js');
var base = getApp();
Page({
  data: {
    items: [{ name: '正常营业', value: '1' }, { name: '放假休息', value: '0' }],
    arrTime:['选择时间', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
    user:null
  },
  onShow: function () {//加载过又不关闭的话，onLoad不会再执行
    var user = db.doc(table, base.user.openId);
    this.setData({user:user});
  },
  input: function (e) {
    var param = e.currentTarget.dataset.param;
    this.setData({ [param]: e.detail.value });//变量key
  },
  getUserInfo:function(){
    var _this = this;
    //获取个人信息
    wx.getUserInfo({
      success(res) {
        var userInfo = res.userInfo;
        _this.setData({ "user.nickName": userInfo.nickName, "user.avatarUrl": userInfo.avatarUrl});
      }
    });
  },
  submit:function(){
    db.update("user", this.data.user.openId, this.data.user);
  }
})