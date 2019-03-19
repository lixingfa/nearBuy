var util = require('../../utils/util.js');
var good = require('../../utils/good.js');
var user = require('../../utils/user.js');
var db = require('../../utils/db.js');
var base = getApp();
Page({
    data: {
        good:null,
        openId: null,
        change:false,
        answerShow:false,
        answers:[],//该商品的所有问答信息
        answer:{},//本次提交的问答内容
        answerIndex:0,
        answersTotal:0,
        newUser: false,
        all:false,
        distance:0
    },
    onLoad: function (e) {
      var id = e && e.id ? e.id : 0;
      var g = base.cart.getGood(id);
      if (g != null) {//购物车里存在，则拿购物车的，可以简化很多操作
        var all = false;
        if (g.promulgatorId == base.openId) {
          all = true;//商品所有者
        }
        good.getGoodAnswersCount(g.id, all, base.openId, function(res){
          this.setData({ good: g, answersTotal: res.total, all: all});
        });
      } else {//初始化
        wx.showLoading({
          title: '商品信息加载中，请稍后',
        });
        good.getGood(id, this.initGood);//从数据库拿
      }
      this.setData({ id: id, openId: base.openId, newUser: base.newUser, distance: e.distance ? e.distance:null});      
    },
  initGood:function(g){
    var _this = this;
      if (g){//购物车里存在，则拿购物车的，可以简化很多操作
        var arrTimeT = new Array();
        if (g.chooseTime == 'true'){//允许选择送货/取货时间
          var date = new Date();
          var start = g.workTimeStart;//可选择的时间，是根据店铺的营业时间，或者个人提供服务的时间确定的
          start = start.substring(0,start.indexOf(":"));
          var end = g.workTimeEnd;
          end = end.substring(0,end.indexOf(":"));
          for (var t = parseInt(start); t < parseInt(end); t++){//每次增加1小时
            arrTimeT.push(t + ":00-" + (t + 1) + ":00");
          }
          g.arrTime = arrTimeT;
          g.arrTimeIndex = 0;
          var nextHour = date.getHours();
          if (nextHour + 1 > end){//大于工作时间，选后一天，不选时间
            date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); //后一天
            g.deliveryTime = '';
          }else{
            if (nextHour < start){
              g.deliveryTime = arrTimeT[0];
            }else{
              g.deliveryTime = nextHour + ":00-" + (nextHour + 1) + ":00";
            }
          }
          g.deliveryDate = util.formatTime(date);
          g.deliveryDate = g.deliveryDate.substring(0, g.deliveryDate.indexOf(' '));
        }else{
          g.deliveryTime = '';
        }
        g.num = 0;
        
        var all = false;
        if (g.promulgatorId == base.openId) {
          all = true;//商品所有者
        }
        good.getGoodAnswersCount(g.id, all, base.openId, function (res) {
          _this.setData({ good: g, answersTotal: res.total, all: all });
        });
      }else{//没找到这个商品

      }
      // 隐藏加载框
      wx.hideLoading();
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
      }else {
        this.setData({ "good.status": 2 });//直接收货，没有价格就没有确认契约
      }
      base.cart.updateGood(this.data.good);//加入购物车按钮会消失，或者是留言后就去购物车。
      if (this.data.newUser) {
        user.addNewUser(function(user){
          if(user){
            wx.switchTab({url: '../cart/cart'});
          }else{
            wx.showModal({
              showCancel: false,
              title: '创建用户失败，无法进行商品咨询，可到“我的-个人信息”中完善信息后再试。',
            });
          }
        });
      }else{
        wx.switchTab({//wx.navigateTo和wx.redirectTo,不能跳转tabBar里的页面
          url: '../cart/cart'
        });
      }
    },
  input: function (e) {
    var param = e.currentTarget.dataset.param;
    this.setData({ [param]: e.detail.value });//变量key
    if (param == 'deliveryTime') {
      this.setData({ 'good.deliveryTime': this.data.good.arrTime[e.detail.value] });
    }
  },
  answerCancel:function(){
    this.setData({ answerShow:false});
  },
  answerShow:function(){
    var _this = this;
    good.getGoodAnswers(_this.data.good.id, _this.data.all, base.openId, _this.data.answerIndex,
      function (answers) {
        _this.setData({ answers: _this.data.answers.concat(answers),
          answerShow: true,
          answerIndex: _this.data.answers.length + answers.length});
    });
  },
  quiz:function(){
    if (!this.data.answer.content){
      return;
    }
    if (this.data.newUser) {
      user.addNewUser(this.sumbit);
    }else{
      this.sumbit(true);
    }
  },
  sumbit:function(id){
    var _this = this;
    if(id){
      var answer = this.data.answer;
      answer.goodId = this.data.good.id;
      answer.id = util.getUUID('answer');
      answer.ownerId = this.data.good.promulgatorId;//商品所有者
      answer.quizzerId = base.openId;
      answer.show = false;
      user.getUser(base.openId,function(u){
        answer.quizzer = u.nickName;//当前用户的昵称
        _this.setData({ answer: answer, change:false,newUser:false});
        base.newUser = false;
        db.add('answers', answer).then(_this.updateAnswers, _this.updateAnswers);
      });
    }else{
      wx.showModal({
        showCancel: false,
        content: '创建用户失败，无法进行商品咨询，可到“我的-个人信息”中完善信息后再试。',
      });
    }
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
        this.answerShow();
        wx.showModal({
          showCancel: false,
          content: '添加成功。',
        });
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
  },
  goBack:function(){
    wx.navigateBack({
      delta: 1
    })
  },
  mapShow:function(){
    var _this = this;
    var latitude = _this.data.good.latitude;
    var longitude = _this.data.good.longitude;
    wx.openLocation({
      latitude,
      longitude,
      scale: 18
    });
  }
});