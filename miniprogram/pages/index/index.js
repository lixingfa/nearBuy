//index.js
//获取应用实例
var base = getApp();
Page({
  data: {
    path:base.path.res+"smallexe/index/",
    motto: '你好、贝思客1！',
    userInfo: {},
    array: ['上海', '北京', '杭州', '宁波'],
    index: 0,


    typeList: [
      {
        id: "1",
        pic: "",
        name: "附近热卖",//指短时间内很多人买的
        goods: [
          {
            id: "1",
            title: "手工红薯粉",
            inAWord: "堂哥自种红薯手工制作，无添加纯红薯粉，保证健康",
            pic: "../../image/goods/hongshufen.jpg",
            price: 16,
            unit: "斤",
            total: 200,
            surplus: 0,
            lineOrder: true,//广告用户可以看到访问者清单
            promulgator: "利利",//大家熟知的称呼，如发哥、二嫂
            promulgatorId: "lili",//
            distance: "498米"//点击可以看发布者填写的地址
          }, {
            id: "2",
            title: "包点拼团，奶黄、紫薯、粗粮、麦香包15元/20个",
            inAWord: "番禺大石朋友新开的食品厂，外贸品质，有兴趣的邻居一起拼团",
            pic: "../../image/goods/zishu.jpg",
            price: 15,
            unit: "份",
            total: 100,
            surplus: 36,
            lineOrder: true,//线上下单/预订
            promulgator: "小青",
            promulgatorId: "xiaoqing",//
            distance: "123米"
          }, {
            id: "3",
            title: "包点拼团，馒头、奶油、花卷10元/20个",
            inAWord: "番禺大石朋友新开的食品厂，外贸品质，有兴趣的邻居一起拼团",
            pic: "../../image/goods/mantou.jpg",
            price: 10,
            unit: "份",
            total: 100,
            surplus: 48,
            lineOrder: true,
            promulgator: "小青",
            promulgatorId: "xiaoqing",//
            distance: "123米"
          }, {
            id: "5",
            title: "农家土鸡蛋",
            inAWord: "自家走地鸡产的鸡蛋，朱村黄麻鸡，位于鸭埔村三巷5号，可送到中铁与西福蓝湾路口",//对订单的群体通知功能
            pic: "../../image/goods/tujidan.jpg",
            price: 1,
            unit: "个",
            total: 78,
            surplus: 56,
            lineOrder: false,
            promulgator: "张二嫂",
            promulgatorId: "zhangersao",//
            distance: "475米"
          }
        ]
      }, {//最新发布
        id: "2",
        pic: "",
        name: "最新发布",
        goods: [
          {
            id: "4",
            title: "招牌鱼头粉",
            inAWord: "祖传底料，新鲜活鱼、现摘葱花和香菜15分钟特色炉火熬制而成，请到店品尝。",
            pic: "../../image/goods/yutoufen.jpg",
            price: 20,
            unit: "份",
            total: -1,//页面的处理应尽量简单
            surplus: -1,
            lineOrder: false,
            promulgator: "招牌鱼头粉",
            promulgatorId: "yutoufen",//雇佣关系的店最好用非个人微信
            distance: "243米"
          },
        ]
      }

    ]
  },
  goCake: function (e) {
    var brand = e.currentTarget.dataset.brand;
    if(brand&&brand==1){
      base.cake.tab=1;
    }
    wx.switchTab({ url: '../cake/cake' });
  },
  goDetail: function (e) {
    var nm = e.currentTarget.dataset.pname;
    var b = e.currentTarget.dataset.brand;
    wx.navigateTo({
      url: '../goodDetail/goodDetail?pname=' + nm+"&brand="+(b||0)
    })
  },
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  //事件处理函数
  bindViewTap: function () {
    wx.showActionSheet({
      itemList: ['A', 'B', 'C'],
      success: function (res) {
        if (!res.cancel) {
          console.log(res.tapIndex)
        }
      }
    })

    //wx.navigateTo({
    //url: '../socket/socket'
    //})
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    //app.getUserInfo(function (userInfo) {
    //更新数据
    //that.setData({
    //userInfo: userInfo
    //})
    //})

  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  onShareAppMessage: function () {
    return {
      title: '贝思客（体验版）',
      desc: '',
      path: '/pages/index/index?id=123'
    }
  }
})
