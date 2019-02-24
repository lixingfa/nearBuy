var db = require('../../../../utils/db.js');
var util = require('../../../../utils/util.js');
var base = getApp();
Page({
    data: {
      id:0,
      good:null,
      items: [{ name: '是', value: true }, { name: '否', value: false}]
    },
    onLoad: function (e) {
        var id = e && e.id ? e.id : 0;
        if(id == 0){
          var good = {};
          good.chooseTime = false;
          good.arrTime = ['选择时间', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
          good.arrTimeIndex = 0;
          good.lineOrder = true;
          good.takeOut = true;
          good.status = true;//商品有效
          var time = util.formatTime(new Date());//返回当前日期和时间，使日期默认显示在今天
          //初始化数值
          this.setData({id: id, good: good, dateStart: time});
        }else{
          var good = db.doc('goods',id);
          this.setData({good:good});
        }
    },
    chooseGoodPic(){
      wx.chooseImage({
        count: 1,//只能选一张图片
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
          // tempFilePath可以作为img标签的src属性显示图片
          const tempFilePaths = res.tempFilePaths;
          /*wx.cloud.uploadFile({
            cloudPath: 'example.png', // 上传至云端的路径
            filePath: tempFilePaths.path, // 小程序临时文件路径
            success: res => {
              // 返回文件 ID
              console.log(res.fileID);//把这个存起来，因为下载也是根据这个来的
            },
            fail: console.error
          });*/
        }
      });
    },
  radioChange:function(e){
    var param = e.currentTarget.dataset.param;
    this.setData({ param: e.detail.value });
  }
});