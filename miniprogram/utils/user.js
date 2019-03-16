var db = require('db.js');
var base = getApp();

function getUser(openId, fn) {
  var where = {};
  where.id = openId;
  db.whereSingle('user', where).then(fn, fn);
}

function addNewUser(fn){
  // 查看是否授权
  wx.getSetting({
    success(res) {
      if (res.authSetting['scope.userInfo']) {
        var user = {};
        user.id = base.openId;
        user.status = '1';
        user.workTimeStart = base.arrTime[3];
        user.workTimeEnd = base.arrTime[13];
        user.distan = 3000;
        //获取个人信息
        wx.getUserInfo({
          success(res) {
            var userInfo = res.userInfo;
            user.nickName = userInfo.nickName;
            user.avatarUrl = userInfo.avatarUrl;
            user.phone = null;
            user.addr = null;
            db.add("user", user).then(fn,fn);
          },
          fail(res){
            console.log(res);
            wx.showModal({
              content: '新增用户失败，将跳转到个人信息中完善。',
              success: function (res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../../pages/user/userInfo/userInfo'
                  });
                }
              }
            });
          }
        });
      }else{
        wx.showModal({
          showCancel: false,
          content: '未授权使用用户信息，该功能需要用户昵称。请到“我的-个人信息”完善信息后重试。',
        });
      }
    }
  });
}

module.exports = {
  getUser: getUser,
  addNewUser: addNewUser
}