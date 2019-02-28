var db = require('../../../utils/db.js');
var user = require('../../../utils/user.js');
var base = getApp();
Page({
  data: {
    items: [{ name: '正常营业', value: '1' }, { name: '放假休息', value: '0' }],
    arrTime:['选择时间', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
    user:null,
    isNew:false
  },
  onLoad:function(){
    user.getThisUser(this.setUser);
  },
  setUser:function(user){
    if(user){
      this.setData({ user: user });
      base.setCache('user',user);
    }else{
      var user = {};
      user.id = base.user.openId;
      user.status = '1';
      user.arrTimeStartIndex = '3';
      user.arrTimeEndIndex = '13';
      user.distan = 3000;
      this.setData({ user: user,isNew:true });
    }
  },
  input: function (e) {
    var param = e.currentTarget.dataset.param;
    this.setData({ [param]: e.detail.value });//变量key
    if(param == 'user.arrTimeStartIndex'){
      this.setData({ 'user.workTimeStart': arrTime[e.detail.value] });
    } else if (param == 'user.arrTimeEndIndex'){
      this.setData({ 'user.workTimeEnd': arrTime[e.detail.value] });
    }
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
  updateUser:function(res){
    if(res){
      wx.showModal({
        showCancel: false,
        title: '',
        content: "修改用户信息成功！"
      });
      base.setCache('user', this.data.user);
    }else{
      wx.showModal({
        showCancel: false,
        title: '',
        content: "修改用户信息失败，请稍后再试或联系客服。"
      });
    }
  },
  submit:function(){
    if(this.data.isNew){
      db.add("user", this.data.user).then(this.updateUser, this.updateUser);
    }else{
      db.update("user", this.data.user.openId, this.data.user)
        .then(this.updateUser, this.updateUser);
    }
  }
})