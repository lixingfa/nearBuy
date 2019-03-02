var base = getApp();
var db = require('db.js');
//拿到当前用户，或者false
function getThisUser(openId,fn){
  var user = wx.getStorageSync('user');
  if (user == '') {
    var where = {};
    where.id = openId;//微信的openId就是本程序中的id
    db.whereSingle('user', where,'id','desc').then(fn, fn);
  } else {
    fn(user);
  }
}

module.exports = {
  getThisUser: getThisUser
}