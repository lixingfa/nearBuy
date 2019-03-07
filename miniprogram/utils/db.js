var base = getApp();

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
      }
    });
  });
}
//条件查询,where是一个JSON，每次最多取20，需要根据API重写
function where(table,where,orderBy,order){
  return new Promise(function (resolve, reject) {
    var db = wx.cloud.database();//默认环境的数据库引用
    var query = db.collection(table).where(where);
      if(orderBy != null){
        query.orderBy(orderBy, order);
      }
      query.get({
        success(res) {
          resolve(res.data);// res.data 是包含以上定义的两条记录的数组
          for (var i in res.data){
            var d = res.data[i];
            base.setCache(table + d.id, d);
          }
        },
        fail(res) {
          console.log(res);
          reject(false);
        }
      })
  });
}
function whereOnly(table, whereData){
  return where(table, whereData,null,null);
}

//只取一条数据
function whereSingle(table, where) {
  return new Promise(function (resolve, reject) {
    var db = wx.cloud.database();//默认环境的数据库引用
    db.collection(table).where(where)
      .get({
        success(res) {
          resolve(res.data[0]);// res.data 是包含以上定义的两条记录的数组
          base.setCache(table + res.data[0]._id, res.data[0]);
        },
        fail(res) {
          console.log(res);
          reject(false);
        }
      })

  });
}

//新增一条记录
function add(table,data){
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
  return new Promise(function (resolve, reject) {
    var db = wx.cloud.database();
    db.collection(table).doc(_id).update({
      // data 传入需要局部更新的数据
      data: data,
      success(res) {
        resolve(_id);
        base.clear(table + data.id);//删掉缓存，重新获取
      },
      fail(res) {
        console.log(res);
        reject(false);
      }
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

module.exports = {
  doc: doc,
  where: where,
  add: add,
  update: update,
  whereSingle: whereSingle,
  remove: remove,
  whereOnly: whereOnly
}
/*Node应用由模块组成，采用CommonJS模块规范。
根据这个规范，每个文件就是一个模块，有自己的作用域。在一个文件里面定义的变量、函数、类，都是私有的，对其他文件不可见。所以需要加上exports*/