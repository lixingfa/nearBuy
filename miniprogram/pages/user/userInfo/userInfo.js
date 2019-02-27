var db = require('../../../utils/db.js');
var base = getApp();
Page({
  data: {
    items: [{ name: '正常营业', value: '1' }, { name: '放假休息', value: '0' }],
    arrTime:['选择时间', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
    user:null
  },
  onShow: function () {//加载过又不关闭的话，onLoad不会再执行
  },
  doc:function(){
    return new Promise(function (resolve) {
      //做一些异步操作
      setTimeout(function () {
        console.log('执行完成');
        resolve('随便什么数据');
        //reject('reject');
      }, 2000);
    });
  },
  onLoad:function(){
    var _this = this;
    this.doc('user', base.user.openId)
      .then(
        new function (data) {//then的参数是一个函数，其参数就是doc里resolve放入的
        //_this.setData({ user: user });
        console.log(data);
      }
    );

/*
    var user = base.getCache('user');
    if(user == ''){
      var table = wx.cloud.database().collection('user');
      table.doc(base.user.openId).get({
        success(res) {
          // res.data 包含该记录的数据
          console.log(res.data);
        },
        fail(res) {
          console.log(res);
        },
        complete() {
          user._id = base.user.openId;
          this.setData({ user: user });
        }
      });
    }else{
      this.setData({user:user});
    }*/
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