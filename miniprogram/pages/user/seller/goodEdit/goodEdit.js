var db = require('../../../../utils/db.js');
var util = require('../../../../utils/util.js');
var user = require('../../../../utils/user.js');
var base = getApp();
Page({
    data: {
      good:null,
      hasAdd:false,
      arrTime: base.arrTime,
      items: [{ name: '是', value: 'true' }, { name: '否', value: 'false'}]//数据变更函数取值是字符串，需要对应
    },
    onLoad: function (e) {
        var id = e && e.id ? e.id : 0;
        if(id == 0){
          var good = {};
          good.title = '';//已经有的属性才可以setData局部改变
          good.inAWord = '';
          good.unit = '';
          good.chooseTime = 'false';
          good.workTimeStart = '10:00';
          good.workTimeEnd = '18:00';
          good.validTime = '23:00';
          good.lineOrder = 'true';
          good.takeOut = 'true';
          good.status = 'true';//商品有效
          good.editTotal = true;
          var time = util.formatTime(new Date());//返回当前日期和时间，使日期默认显示在今天
          //初始化数值
          this.setData({good: good});
          //获取用户
          user.getThisUser(base.openId,this.getUser);
        }else{
          var good = db.doc('goods',id);
          good.editTotal = false;
          this.setData({good:good});
        }
    },
    getUser:function(user){
      if(user){
        this.setData({"good.promulgator": user.nickName,
          'good.workTimeStart': user.workTimeStart,
          'good.workTimeEnd': user.workTimeEnd
        });
      }else{
        wx.showModal({
          title: '提示',
          content: '请先完善个人信息。',
          showCancel: false,
          success: function (res) {
            wx.redirectTo({url:'../../userInfo/userInfo'});
          }
        });
      }
    },
    chooseGoodPic:function(){
      var _this = this;
      //选择图片
      wx.chooseImage({
        count: 1,//只能选一张图片
        sizeType: ['compressed'],//只允许上传缩略图'original', 
        sourceType: ['album', 'camera'],
        success(res) {
          // tempFilePath可以作为img标签的src属性显示图片
          const tempFilePath = res.tempFilePaths[0];//只选一张
          var id = _this.data.good.id;
          if(id == null){
            id = util.getUUID('good');
          }
          var geshi = tempFilePath.substring(tempFilePath.lastIndexOf("."));
          var cloudPath = 'good_pic/' + util.getDatePath() + '/' + id + geshi;//路径相同则是覆盖写，可以确保一商品一图片
          //上传图片，
          wx.cloud.uploadFile({
            cloudPath: cloudPath, // 上传至云端的路径
            filePath: tempFilePath, // 小程序临时文件路径
            success: res => {
              // 返回文件 ID
              var fileID = res.fileID;
              _this.setData({ "good.fileID": fileID, "good.pic": tempFilePath, "good.id": id});
            },
            fail: console.error
          });
        }
      });
    },
  input:function(e){
    var param = e.currentTarget.dataset.param;
    this.setData({[param]: e.detail.value });//变量key
    if (param == 'arrTimeStartIndex') {
      this.setData({ 'good.workTimeStart': this.data.arrTime[e.detail.value] });
    } else if (param == 'arrTimeEndIndex') {
      this.setData({ 'good.workTimeEnd': this.data.arrTime[e.detail.value] });
    } else if (param == 'validTimeIndex') {
      this.setData({ 'good.validTime': this.data.arrTime[e.detail.value] });
    }
  },
  valid: function () {
    var _this = this;
    if (!_this.data.good.title) {
      wx.showModal({
        showCancel: false,
        title: '',
        content: "您还没填写商品标题。。"
      })
      return false;
    }
    if (!_this.data.good.fileID) {
      wx.showModal({
        showCancel: false,
        title: '',
        content: "请上传一张商品图片。"
      })
      return false;
    }
    if (!_this.data.good.price) {
      wx.showModal({
        showCancel: false,
        title: '',
        content: "请填写商品价格。"
      })
      return false;
    }
    if (!_this.data.good.total) {
      wx.showModal({
        showCancel: false,
        title: '',
        content: "请填写商品总数。"
      })
      return false;
    }
    return true;
  },
  addGood:function(){
    if (!this.valid()) {
      return;
    }
    this.setData({
      "good.promulgatorId": base.openId,
      "good.latitude": base.location.latitude,
      "good.longitude": base.location.longitude,
      "good.surplus":this.data.good.total
      });
    db.add('goods', this.data.good).then(this.addGoodNext, this.addGoodNext);

  },
  addGoodNext:function(_id){
    if(_id){
      wx.showModal({
        showCancel: false,
        title: '',
        content: "新增商品成功。"
      });
      this.setData({ hasAdd:true});
    }
  }
});