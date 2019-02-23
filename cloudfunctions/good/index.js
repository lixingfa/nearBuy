// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

//根据id获取商品
function getGoodById(id){
  //构造查询语句
  // collection 方法获取一个集合的引用
  // where 方法传入一个对象，数据库返回集合中字段等于指定值的 JSON 文档。API 也支持高级的查询条件（比如大于、小于、in 等），具体见文档查看支持列表
  // get 方法会触发网络请求，往数据库取数据
  db.collection('goods').where({
    _id: id
  }).get({
    success(res) {
      console.log(res)
    }
  })
}