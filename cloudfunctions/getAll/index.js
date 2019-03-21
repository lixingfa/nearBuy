const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const MAX_LIMIT = 100
exports.main = async (event, context) => {
  var where = event.where;
  var table = event.table;
  var field = event.field;//指定特定的字段
  // 先取出集合记录总数
  const countResult = await db.collection(table).where(where).count();
  const total = countResult.total;
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100);
  // 承载所有读操作的 promise 的数组
  const tasks = [];
  for (let i = 0; i < batchTimes; i++) {
    const query = db.collection(table).where(where).skip(i * MAX_LIMIT).limit(MAX_LIMIT);
    /*if(field != null){
      query = query.field(field);
    }*/
    tasks.push(query.get());
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => ({
    data: acc.data.concat(cur.data),
    errMsg: acc.errMsg,
  }))
}