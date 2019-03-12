var util = require('../../utils/util.js');
var good = require('../../utils/good.js');
var user = require('../../utils/user.js');
var db = require('../../utils/db.js');
var base = getApp();
Page({
    data: {
        good:null,
        //dateStart: "",
        //dateEnd: "",
        openId: null,
        change:false,
        answerShow:false,
        answers:[],//该商品的所有问答信息
        answer:{},//本次提交的问答内容
        answerIndex:0,
      answersTotal:0
    },
    onLoad: function (e) {
      var id = e && e.id ? e.id : 0;
      var _this = this;
      var g = base.cart.getGood(id);
      if (g != null) {//购物车里存在，则拿购物车的，可以简化很多操作
        this.setData({good: g });
      } else {//初始化
        good.getGood(id, this.initGood);//从数据库拿
      }
      if (this.data.answersTotal == 0){
        _this.answerShow(false);
      }
      _this.setData({ id: id,openId: base.openId })
    },
  initGood:function(good){
      if (good){//购物车里存在，则拿购物车的，可以简化很多操作
        var arrTimeT = new Array();
        if (good.chooseTime == 'true'){//允许选择送货/取货时间
          var date = new Date();
          var start = good.workTimeStart;//可选择的时间，是根据店铺的营业时间，或者个人提供服务的时间确定的
          start = start.substring(0,start.indexOf(":"));
          var end = good.workTimeEnd;
          end = end.substring(0,end.indexOf(":"));
          for (var t = parseInt(start); t < parseInt(end); t++){//每次增加1小时
            arrTimeT.push(t + ":00-" + (t + 1) + ":00");
          }
          good.arrTime = arrTimeT;
          good.arrTimeIndex = 0;
          var nextHour = date.getHours();
          if (nextHour + 1 > end){//大于工作时间，选后一天，不选时间
            date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); //后一天
            good.deliveryTime = '';
          }else{
            if (nextHour < start){
              good.deliveryTime = arrTimeT[0];
            }else{
              good.deliveryTime = nextHour + ":00-" + (nextHour + 1) + ":00";
            }
          }
          good.deliveryDate = util.formatTime(date);
          good.deliveryDate = good.deliveryDate.substring(0, good.deliveryDate.indexOf(' '));
        }else{
          good.deliveryTime = '';
        }
        good.num = 0;
        this.setData({good: good});
      }else{//没找到这个商品

      }
  },
    onShow: function () {
    },
    addCart: function () {
        if (this.data.good.price > 0){
          this.setData({"good.status":0});
        }
        else{
          this.setData({ "good.status": 2 });//直接收货，没有价格就没有确认契约
        }
        base.cart.add(this.data.good);//直接整个对象放进去，并做一些操作
        var good = base.cart.getGood(this.data.id);        
        this.setData({good: good });//更新数据
    },
    goCart: function (e) {
      if (this.data.good.price > 0) {
        this.setData({ "good.status": 0 });
      }
      else {
        this.setData({ "good.status": 2 });//直接收货，没有价格就没有确认契约
      }
      base.cart.updateGood(this.data.good);//加入购物车按钮会消失，或者是留言后就去购物车。
      wx.switchTab({//wx.navigateTo和wx.redirectTo,不能跳转tabBar里的页面
        url: '../cart/cart'
      })
    },
  input: function (e) {
    var param = e.currentTarget.dataset.param;
    this.setData({ [param]: e.detail.value });//变量key
  },
  answerCancel:function(){
    this.setData({ answerShow:false});
  },
  answerShow:function(show){
    if (typeof (show) == 'undefined'){
      show = true;
    }
    var _this = this;
    var all = false;
    if (_this.data.good.promulgatorId == base.openId) {
      all = true;//商品所有者
    }
    good.getGoodAnswers(_this.data.good.id, all, base.openId, _this.data.answerIndex,
      function (answers) {
        _this.setData({ answers: _this.data.answers.concat(answers),
          answerShow: show,
          answerIndex: _this.data.answers.length + answers.length});
    });
  },
  quiz:function(){
    var _this = this;
    var answer = this.data.answer;
    answer.goodId = this.data.good.id;
    answer.id = util.getUUID('answer');
    answer.ownerId = this.data.good.promulgatorId;//商品所有者
    answer.quizzerId = base.openId;
    answer.show = false;
    user.getThisUser(base.openId,function(data){
      if(data){
        answer.quizzer = data.nickName;//当前用户的昵称
      }else{
        answer.quizzer = '游客';//获取不到用户信息
      }
      _this.setData({ answer: answer, change:false});
      db.add('answers', answer).then(_this.updateAnswers, _this.updateAnswers);
    });
  },
  updateAnswers:function(_id){
    if(_id){
      if (this.data.change){
        for (var i in this.data.answers){
          if (this.data.answers[i]._id == _id){
            if(this.data.answers[i].show){
              this.data.answers[i].show = false;
            }else{
              this.data.answers[i].show = true;
            }
            break;
          }
        }
        this.setData({ answers: this.data.answers});
      }else{//添加
        this.setData({ 'answer.content': '' });
        this.answerShow(true);
      }
    }
  },
  chang:function(e){
    var id = e.currentTarget.dataset.id;
    var show = e.currentTarget.dataset.show;
    var answer = {};
    if(show == 'true'){
      answer.shwo = false;
    }else{
      answer.show = true;
    }
    this.setData({change: true});
    db.update('answers', id, answer).then(this.updateAnswers, this.updateAnswers);
  }
});