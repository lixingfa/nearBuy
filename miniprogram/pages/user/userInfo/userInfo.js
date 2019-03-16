var db = require('../../../utils/db.js');
var user = require('../../../utils/user.js');
var base = getApp();
Page({
  data: {
    items: [{ name: '正常营业', value: '1' }, { name: '放假休息', value: '0' }],
    user:null,
    isNew:false,
    arrTime: base.arrTime
  },
  onLoad:function(){
    user.getUser(base.openId,this.setUser);
  },
  setUser:function(user){
    if(user){
      this.setData({ user: user });
      base.setCache('user',user);
    }else{
      var user = {};
      user.id = base.openId;
      user.status = '1';
      user.workTimeStart = this.data.arrTime[3];
      user.workTimeEnd = this.data.arrTime[13];
      user.distan = 3000;
      user.addr = base.location.address;
      user.nickName = '';
      user.phone = '';
      this.setData({ user: user,isNew:true });
    }
  },
  input: function (e) {
    var param = e.currentTarget.dataset.param;
    this.setData({ [param]: e.detail.value });//变量key
    if(param == 'arrTimeStartIndex'){
      this.setData({ 'user.workTimeStart': this.data.arrTime[e.detail.value] });
    } else if (param == 'arrTimeEndIndex'){
      this.setData({ 'user.workTimeEnd': this.data.arrTime[e.detail.value] });
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
    if (this.data.user.nickName == ''){
      wx.showModal({
        showCancel: false,
        title: '',
        content: "请获取昵称和头像。"
      });
      //wx.vibrateShort({});//短震动
      return;
    }
    if (this.data.user.phone == '') {
      wx.showModal({
        showCancel: false,
        title: '',
        content: "请填写联系电话，只有在下单后对方才能看到。"
      });
      //wx.vibrateShort({});//短震动
      return;
    }
    if(this.data.isNew){
      db.add("user", this.data.user).then(this.updateUser, this.updateUser);
    }else{
      db.update("user", this.data.user._id, this.data.user)
        .then(this.updateUser, this.updateUser);
    }
  }
})