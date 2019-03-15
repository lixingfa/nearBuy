var base = getApp();
var util = require('../../utils/util.js');
var db = require('../../utils/db.js');
var user = require('../../utils/user.js');
var good = require('../../utils/good.js');
var newsUtil = require('../../utils/news.js');
Page({
    data: {
      //下单数据
      addr: null,
      phone:null,
      plist: [],
      totalPrice:0,      
      myAddress: [],//辅助数据
      addrShow: false,
      longitude:"0",
      latitude:"0",
      selectedID: -1,
      user:null,
      hasTakeOut:false
    },
    onLoad: function (e) {
      var _this = this;
      user.getThisUser(base.openId,function(u){
        var totalPrice = e && e.totalPrice ? e.totalPrice : 0;
        _this.setData({ plist: base.cart.getList(), totalPrice: totalPrice, user: u, phone: u.phone, hasTakeOut: base.cart.hasTakeOut});
      });
    },
    addrSelect: function () {//选择地址
      var _this = this;
      if (_this.data.myAddress.length == 0){
        var where = {};
        where.user = base.openId;
        db.where('address', where, ['createTime', 'desc'],0).then(this.initAddress, this.initAddress);
      }else{
        _this.setData({ addrShow: true });//选地址
      }
    },
    myaddrCancel: function () {//点击地址簿中取消按钮
        this.setData({ addrShow: false });
    },
    closeaddr:function(){//触摸遮罩层关闭地址选项
          this.setData({ addrShow: false });
    },
    initAddress: function (myAddress){
      if (myAddress){
        if (myAddress.length == 0){//数据库里也没有
          this.chooseAddrInMap();//都没有地址，就在地图上选
        }else{
          this.setData({ myAddress: myAddress, addrShow: true});
        }
      }
    },
    chooseAddrInMap:function(){
      var _this = this;
      wx.chooseLocation({
        success: function (res) {
          var latitude = res.latitude;
          var longitude = res.longitude;
          var distan = base.getDistance(base.location.latitude, base.location.longitude, latitude, longitude);
          var address = res.address + ' ' + res.name;
          if (distan > base.distan){
            wx.showModal({
              title: '距离提示',
              content: '您选择的 “' + address + '” 与所购商品的平均距离大于' + base.distan + '米（实际相距' + distan + '米），可能会给双方带来不便。您可在“我的-个人信息”中对搜索距离进行调整。\n继续使用该地址？',
              success: function (res) {
                if (res.confirm) {
                  base.location.longitude = longitude;
                  base.location.latitude = latitude;
                  _this.setData({
                    addr: address,
                    longitude: longitude,
                    latitude: latitude,
                    selectedID:-1,
                    addrShow: false,
                  });
                }
              }
            });
          }else{
            base.location.longitude = longitude;
            base.location.latitude = latitude;
            _this.setData({
              addr: address,
              longitude: longitude,
              latitude: latitude,
              selectedID: -1,
              addrShow: false,
            });
          }
        },
        fail: function (err) {
          console.log(err)
        }
      });
    },
    valid: function () {
        if (this.data.hasTakeOut && !this.data.addr) {
              wx.showModal({
                  showCancel: false,
                  title: '',
                content: "您还没完善收件地址，请点击顶部的选择按钮进行完善。"
              })
              return false;
          }
          if (!this.data.phone) {
            wx.showModal({
              showCancel: false,
              title: '',
              content: "请填写您的联系电话。"
            })
            return false;
          }
        return true;
    },
    submit: function (e) {
      var _this = this;
      if (!_this.valid()) {
        return;
      }
      //检查库存
      good.checkOrderGoods(_this.data.plist).then(function (goOrder) {
        if (goOrder) {
          _this.creatOrder();
        }
      });
    },
    creatOrder:function(){
      wx.showLoading({
        title: '下单中，请稍后。',
      });
      var _this = this;
      if (_this.data.selectedID == -1) {//不是从列表里选的地址，并且需要地址
        if (_this.data.hasTakeOut){
          var addr = {};
          addr.addr = _this.data.addr;
          addr.phone = _this.data.phone;
          addr.longitude = _this.data.longitude;
          addr.latitude = _this.data.latitude;
          addr.id = util.getUUID('addr');
          addr.user = this.data.user.id;
          db.add('address', addr);
        }
        if (_this.data.user.phone == null || _this.data.user.addr == null){
          var u = {};
          u.phone = _this.data.phone;
          if (_this.data.hasTakeOut) {
            u.addr = _this.data.addr;
          }
          db.update('user', base.openId,u);
        }
      }
      var order = {};
      order.id = util.getUUID('order');
      order.status = 0;//未完成
      order.owner = this.data.user.id;
      order.takeOut = {};//卖家配送
      order.takeOut.goods = {};//对象好操作，知道key就好，数组难办
      order.sellers = {};//自取

      var _ids = [];
      var news = [];//数据库无法联查，只能另辟蹊径了，搞死个人
      for (var i in _this.data.plist) {//去除关键字和辅助数据，只保留有显示和分析价值的数据
        if (_this.data.plist[i].select){
          //商品放入订单清单
          var g = {};
          g.id = _this.data.plist[i].id;
          g.title = _this.data.plist[i].title;
          g.status = _this.data.plist[i].status;
          g.num = _this.data.plist[i].num;
          g.price = _this.data.plist[i].price;
          g.promulgator = _this.data.plist[i].promulgator;
          g.promulgatorId = _this.data.plist[i].promulgatorId;
          g.surplus = _this.data.plist[i].surplus;
          g.remarks = _this.data.plist[i].remarks;

          g.time = '';
          if (_this.data.plist[i].chooseTime == 'true'){
            g.time = _this.data.plist[i].deliveryDate;
            if(_this.data.plist[i].deliveryTime != ''){
              g.time = g.time + ' ' + _this.data.plist[i].deliveryTime;
            }
          }
          g.how = '0';//能够在线下单，都是配送或自取之一，默认配送
          if (_this.data.plist[i].takeOut == 'false'){//卖家不配送，那就是自取
            g.how = '1';
          }
          if (g.how == '1'){//自取
            if (!(g.promulgatorId in order.sellers)){//取货的放在一起
              order.sellers[g.promulgatorId] = {};
              order.sellers[g.promulgatorId].goods = {};//对象好操作，知道key就好，数组难办
              order.sellers[g.promulgatorId].promulgatorId = g.promulgatorId;//卖家id,地址和电话通过这个查
              order.sellers[g.promulgatorId].promulgator = g.promulgator;
            }
            order.sellers[g.promulgatorId].goods[g.id] = g;
          }else{
            order.takeOut.goods[g.id] = g;
          }
          //构建消息通知卖家
          var n = {};
          n.receiver = g.promulgatorId;//卖家
          n.newsType = 'order';//下单
          n.buyer = this.data.user.id;
          n.orderId = order.id;
          n.goodId = g.id;
          n.how = g.how;
          n.content = this.data.user.nickName + ' 购买了 ' + g.title + ' ，数量' + g.num + '。';
          if (g.time != ''){
            n.content = n.content + '希望' + g.time + (g.how == '0'?'配送':'取货') + '。';
          }
          if (g.how == '0'){//配送
            n.content = n.content + '送到：' + this.data.addr + ' ' + this.data.phone + '。';
          } else if (g.time == ''){
            n.content = n.content + '自取，电话：' + this.data.phone;
          }
          if (g.remarks && g.remarks != ''){
            n.content = n.content + '留言：' + g.remarks;
          }
          news.push(n);
          //构建消息通知买家
          //放入更新库存列表
          _ids.push(_this.data.plist[i]._id);
          //从购物车中删除成功下单的
          base.cart.remove(_this.data.plist[i].id);
        }
        /*delete _this.data.plist[i]._id;
        delete _this.data.plist[i]._openid;//关键字
        delete _this.data.plist[i].arrTime;//送货/取货时间
        delete _this.data.plist[i].arrTimeIndex;
        delete _this.data.plist[i].editTotal;
        delete _this.data.plist[i].indate;//有效期
        delete _this.data.plist[i].validTime;
        delete _this.data.plist[i].latitude;//以最新的为准即可
        delete _this.data.plist[i].longitude;
        delete _this.data.plist[i].fileID;
        delete _this.data.plist[i].inAWord;
        delete _this.data.plist[i].select;//是否在购物车里被选择了，肯定是被选才进订单的
        delete _this.data.plist[i].status;//商品状态，肯定是上架了的
        delete _this.data.plist[i].total;//商品生成时就定死了，即使能改，利用价值也不大
        delete _this.data.plist[i].typeId;
        delete _this.data.plist[i].typeName;//用来检索的，一般不会变，后期分析以最新的为准
        delete _this.data.plist[i].unit;
        delete _this.data.plist[i].workTimeEnd;
        delete _this.data.plist[i].workTimeStart;//虽然可以分析出卖家的营业时间变化，但价值不大*/
      }
      if (JSON.stringify(order.takeOut.goods) != "{}"){//有外送的商品
        order.takeOut.user = {};
        order.takeOut.user.nickName = this.data.user.nickName;
        order.takeOut.user.id = this.data.user.id;
        order.takeOut.user.addr = _this.data.addr;
        order.takeOut.user.phone = _this.data.phone;
      }
      order.totalPrice = _this.data.totalPrice;
      db.add('orders', order).then(function(d){
        //更新库存
        var j = 0;
        for (var i in _this.data.plist){
          var good = {};
          good.surplus = _this.data.plist[i].surplus;
          db.update('goods',_ids[j],good);
          j++;
        }
        //增加消息
        for (var i in news){
          news[i].oid = d;//订单_id
          newsUtil.add(news[i]);
        }

        wx.redirectTo({//不允许退回下单页
          url: "../success/success"
        });
      },function(d){
        wx.showModal({
          showCancel: false,
          title: '',
          content: "下单时出现错误。"
        });
      });
    },
    bindAddrBlur: function (e) {
        this.setData({
          addr: e.detail.value
        });
      },
    bindPhoneBlur: function (e) {
      this.setData({
        phone: e.detail.value
      });
    },
    toSelect: function (e) {//选中地址
      var _this = this;
      var id = e.currentTarget.dataset.id;
      _this.setData({ selectedID: id });
      for (var i = 0; i < _this.data.myAddress.length; i++) {
        if (_this.data.myAddress[i].id == id) {
          _this.setData({
            phone: _this.data.myAddress[i].phone,
            addr: _this.data.myAddress[i].addr,
            //addrShow: false
          });
          break;
        }
      }
    },
    toDeleteAddr:function(e){
      var _this = this;
      var id = e.currentTarget.dataset.id;
      wx.showModal({
        title: '地址删除提示',
        content: '确认删除该地址？',
        success: function (res) {
          if (res.confirm) {
            for (var i = 0; i < _this.data.myAddress.length; i++) {
              if (_this.data.myAddress[i].id == id) {
                db.remove('address', _this.data.myAddress[i]._id);
                _this.data.myAddress.splice(i, 1);
                _this.setData({
                  myAddress: _this.data.myAddress
                });
                if (_this.data.selectedID == id){//之前选了这个地址
                  _this.setData({
                    phone: null,
                    addr: null,
                  });
                }
                break;
              }
            }
          }
        }
      });
    }
})
