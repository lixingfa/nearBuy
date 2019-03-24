var base = getApp();
var util = require('util.js');
//查询一条记录
function doc(table,id){
  return new Promise(function (resolve, reject) {
    var db = wx.cloud.database();//默认环境的数据库引用
    var table = db.collection(table);
    table.doc(id).get({
      success(res) {
        // res.data 包含该记录的数据
        resolve(res.data); //引用的时候调用then方法，then接收一个参数，是函数，并且会拿到这里放入的参数
        base.setCache(table + id,res.data);
      },
      fail(res) {
        console.log(res);
        reject(id);//then函数的第二个参数执行
        wx.showModal({
          showCancel: false,
          content: "查询超时，请稍后重试。"
        });
      }
    });
  });
}
//条件查询,where是一个JSON，每次最多取20，需要根据API重写
function where(table, where, orderBy, index){
  return new Promise(function (resolve, reject) {
    var db = wx.cloud.database();//默认环境的数据库引用
    var query = db.collection(table).where(where);
      for(var i = 0;i < orderBy.length;i= i + 2 ){
        query = query.orderBy(orderBy[i], orderBy[i + 1]);//注意
      }
      if(index != 0){
        query = query.skip(index);
      }
      query.get({
        success(res) {
          resolve(res.data);// res.data 是包含以上定义的两条记录的数组
        },
        fail(res) {
          console.log(res);
          reject(false);
          wx.showModal({
            showCancel: false,
            content: "查询超时，请稍后重试。"
          });
        }
      })
  });
}
function whereOnly(table, whereData){
  return where(table, whereData,[],0);
}
//只取一条数据
function whereSingle(table, where) {
  return new Promise(function (resolve, reject) {
    var db = wx.cloud.database();//默认环境的数据库引用
    db.collection(table).where(where)
      .get({
        success(res) {
          if (res.data.length != 0){
            resolve(res.data[0]);// res.data 是包含以上定义的两条记录的数组
            base.setCache(table + res.data[0]._id, res.data[0]);
          }else{
            reject(false);
          }
        },
        fail(res) {
          console.log(res);
          reject(false);
          wx.showModal({
            showCancel: false,
            content: "查询超时，请稍后重试。"
          });
        }
      })

  });
}

//获取总数
function count(table, where) {
  return wx.cloud.database().collection(table).where(where).count();
}

//新增一条记录
function add(table,data){
  data.createTime = util.formatTime(new Date());
  data.updateTime = data.createTime;//避免数据残缺
  return new Promise(function (resolve, reject) {
    var db = wx.cloud.database();//默认环境的数据库引用
    db.collection(table).add({
      data: data,// data 字段表示需新增的 JSON 数据
      success(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        resolve(res._id);
        base.setCache(table + res.id, data);//不一定能知道_id
      },
      fail(res){
        console.log(res);
        reject(false);//then函数的第二个参数执行
      }
    });
  });
}

//更新，整个对象更新，如果需更新子对象，需要用set，具体查看API
function update(table,_id,data){
  delete data._openid;//否则会更新失败
  delete data._id;//否则会更新失败
  data.updateTime = util.formatTime(new Date());
  return new Promise(function (resolve, reject) {
    wx.cloud.callFunction({
      name: 'update',
      data:{table:table,_id:_id,data:data},
      success(res) {
        resolve(_id);
      },
      fail(res) {
        console.log(res);
        reject(false);
      }, 
      complete: res => {
        //console.log('callFunction test result: ', res);
      },
    });
  });
}

function updateWhere(table, where, data) {
  delete data._openid;//否则会更新失败
  delete data._id;//否则会更新失败
  data.updateTime = util.formatTime(new Date());
  return new Promise(function (resolve, reject) {
    wx.cloud.callFunction({
      name: 'updateWhere',
      data: { table: table, where: where, data: data },
      success(res) {
        resolve(res.total);//更新了多少
      },
      fail(res) {
        console.log(res);
        reject(false);
      },
      complete: res => {
        //console.log('callFunction test result: ', res);
      },
    });
  });
}

//复杂业务不应物理删，为后面积累数据和找回。提供历史商品、历史订单的功能
function remove(table,_id){
  var db = wx.cloud.database();
  db.collection(table).doc(_id).remove({
    success: console.log,
    fail: console.error
  });
}

function getAll(table, where, beginTime){
  return new Promise(function (resolve, reject) {
    wx.cloud.callFunction({
      name: 'getAll',
      data: { table: table, where: where, beginTime: beginTime},
      success(res) {
        resolve(res.result.data);//更新了多少
      },
      fail(res) {
        console.log(res);
        reject(false);
        wx.showModal({
          showCancel: false,
          content: "查询超时，请稍后重试。"
        });
      },
      complete: res => {
        //console.log('callFunction test result: ', res);
      },
    });
  });
}

module.exports = {
  doc: doc,
  where: where,
  add: add,
  update: update,
  updateWhere: updateWhere,
  whereSingle: whereSingle,
  remove: remove,
  whereOnly: whereOnly,
  count: count,
  getAll: getAll
}
/*Node应用由模块组成，采用CommonJS模块规范。
根据这个规范，每个文件就是一个模块，有自己的作用域。在一个文件里面定义的变量、函数、类，都是私有的，对其他文件不可见。所以需要加上exports*/