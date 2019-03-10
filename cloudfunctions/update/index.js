// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    var data = event.data;
    var table = event.table;
    var _id = event._id;
    return await cloud.database().collection(table).doc(_id).update({
      // data 传入需要局部更新的数据
      data: data
    });
  } catch (e) {
    console.error(e)
  }
}