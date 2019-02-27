//查询一条记录
function doc(table,id){
  return new Promise(function (resolve, reject) {
    var db = wx.cloud.database();//默认环境的数据库引用
    var table = db.collection(table);
    table.doc(id).get({
      success(res) {
        // res.data 包含该记录的数据
        resolve(res.data); //引用的时候调用then方法，then接收一个参数，是函数，并且会拿到这里放入的参数
      },
      fail(res) {
        console.log(res);
        reject(id);//then函数的第二个参数执行
      }
    });
  });
}
//条件查询,where是一个JSON，每次最多取20，需要根据API重写
function where(table,where){
  return new Promise(function (resolve, reject) {
    var db = wx.cloud.database();//默认环境的数据库引用
    db.collection(table).where(where)
      .get({
        success(res) {
          if(res.length > 0){
            resolve(res.data);// res.data 是包含以上定义的两条记录的数组
          }else{
            reject(false);
          }
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
      },
      fail(res){
        console.log(res);
        reject(false);//then函数的第二个参数执行
      }
    });
  });
}

//更新，整个对象更新，如果需更新子对象，需要用set，具体查看API
function update(table,id,data){
  var db = wx.cloud.database();
  db.collection(table).doc(id).update({
    // data 传入需要局部更新的数据
    data: data,
    success(res) {
      console.log(res.data);
    },
    fail(res) {
      console.log(res);
    },
    complete(res) {
      
    }
  })
}
//不提供删除，一切数据都逻辑删，为后面积累数据和找回。提供历史商品、历史订单的功能
  //function remove()

module.exports = {
  doc: doc,
  where: where,
  add: add,
  update: update
}
/*Node应用由模块组成，采用CommonJS模块规范。
根据这个规范，每个文件就是一个模块，有自己的作用域。在一个文件里面定义的变量、函数、类，都是私有的，对其他文件不可见。所以需要加上exports*/