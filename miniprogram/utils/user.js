var db = require('db.js');
//拿到当前用户，或者false
function getThisUser(openId,fn){
  var user = wx.getStorageSync('user');
  if (user == '') {
    getUser(openId, fn);
  } else {
    fn(user);
  }
}

function getUser(openId, fn) {
    var where = {};
    where.id = openId;
    db.whereSingle('user', where).then(fn, fn);
}

module.exports = {
  getThisUser: getThisUser,
  getUser: getUser
}