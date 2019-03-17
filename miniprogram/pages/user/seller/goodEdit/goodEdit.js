var db = require('../../../../utils/db.js');
var util = require('../../../../utils/util.js');
var user = require('../../../../utils/user.js');
var goodutil = require('../../../../utils/good.js');
var base = getApp();
Page({
    data: {
      good:null,
      hasAdd:false,
      eidt:false,
      typeName:'',
      typeShow:false,
      arrTime: base.arrTime,
      items: [{ name: '是', value: 'true' }, { name: '否', value: 'false'}],//数据变更函数取值是字符串，需要对应
      goodTypes:base.goodTypes
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
          good.inAWord = '';
          good.lineOrder = 'true';
          good.takeOut = 'true';
          good.status = 'true';//商品有效
          good.editTotal = true;
          var time = util.formatTime(new Date());//返回当前日期和时间，使日期默认显示在今天
          //初始化数值
          this.setData({ good: good, hasAdd: false});
          //获取用户
          user.getUser(base.openId,this.getUser);
        }else{
          var _this = this;
          goodutil.getGood(id,function(good){
            if(good){
              good.editTotal = false;
              if (good.surplus == 0){
                good.editTotal = true;
              }
              _this.setData({ good: good, eidt: true});
            }
          });
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
              _this.setData({ "good.fileID": fileID, "good.pic": base.https + cloudPath, "good.id": id});
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
    /*if (!_this.data.good.typeId) {//当前类别不全，不应该强制
      wx.showModal({
        showCancel: false,
        title: '',
        content: "请选择商品类别"
      })
      return false;
    }*/
    return true;
  },
  typeShow:function(){
    this.setData({ typeShow:true});
  },
  typeCancel:function(){
    this.setData({ typeShow: false });
  },
  select:function(e){
    var typeId = e.currentTarget.dataset.id;
    this.setData({ 'good.typeId': typeId, 'good.typeName': e.currentTarget.dataset.name});
  },
  addGood:function(){
    if (!this.valid()) {
      return;
    }
    this.setData({
      "good.promulgatorId": base.openId,
      "good.latitude": base.location.latitude,
      "good.longitude": base.location.longitude,
      "good.validTimeTrue": this.data.good.indate + ' ' +this.data.good.validTime
      });
    if (this.data.eidt){
      if (this.data.good.editTotal){
        this.setData({
          "good.surplus": parseInt(this.data.good.total)
        });
      }
      db.update('goods', this.data.good._id, this.data.good).then(this.addGoodNext, this.addGoodNext);
    }else{
      db.add('goods', this.data.good).then(this.addGoodNext, this.addGoodNext);
    }
  },
  addGoodNext:function(_id){
    if(_id){
      wx.showModal({
        showCancel: false,
        title: '',
        content: "商品编辑成功。"
      });
      this.setData({ hasAdd:true});
    }
  }
});