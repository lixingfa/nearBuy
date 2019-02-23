var db = require('../../../../utils/db.js');
var base = getApp();
Page({
    data: {
        good:null
    },
    onLoad: function (e) {
        var that = this;
        var id = e && e.id ? e.id : 0;
        var good = db.doc('goods',id);
        if(good != null){

        }
    }
});