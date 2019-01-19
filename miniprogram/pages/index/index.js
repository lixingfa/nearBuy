//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    // input默认是0  
    num: 0,
    // 使用data数据对象设置样式名  
    minusStatus: 'disabled' ,

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
            pic: "../../image/hongshufen.jpg",
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
            pic: "../../image/zishu.jpg",
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
            pic: "../../image/mantou.jpg",
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
            pic: "../../image/tujidan.jpg",
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
            pic: "../../image/yutoufen.jpg",
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
  onLoad: function () {
    console.log('onLoad')

  },
  onShareAppMessage: function (e) {
    return {
      title: "邻里小卖",
      desc: "专注您身边触手可及的市场"
    }
  },
  navigateToShop: function (e) {
    /*var id = e.currentTarget.dataset.id;
    console.log("navigateToShop--> ID:", id)
    wx.navigateTo({
      url: './good/good?typeId=' + id
    })*/
  },
  navigateToGood: function (e) {
    /*var id = e.currentTarget.dataset.id;
    console.log("navigateToGood--> ID:", id)
    wx.navigateTo({
      //url: './good/detail/detail?id=' + id
    })*/
  },

  /* 点击减号 */
  bindMinus: function () {
    var num = this.data.num;
    // 如果大于0时，才可以减  
    if (num > 0) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minusStatus = num <= 0 ? 'disabled' : 'normal';
    // 将数值与状态写回  
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  /* 点击加号 */
  bindPlus: function () {
    var num = this.data.num;
    // 不作过多考虑自增1  
    num++;
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    // 将数值与状态写回  
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  /* 输入框事件 */
  bindManual: function (e) {
    var num = e.detail.value;
    // 将数值与状态写回  
    this.setData({
      num: num
    });
  }
})
