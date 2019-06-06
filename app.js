//app.js

var OPEN_ID = ''//储存获取到openid  
var SESSION_KEY = ''//储存获取到session_key  

App({
  data:{
    modelShow: false,
  },
  globalData: {
    userInfo: null,
    currentTasks: null,
    istest: true,   //是练习
    overSkillid: null,    //技能
  },

  //小程序初始化
  onLaunch: function () {
    // wx.setStorageSync('usertoken', 'eyJhbGciOiJIUzUxMiJ9.eyJjbGllbnR0eXBlIjoiNCIsImV4cCI6MTU0ODI5MzEwMDgxOCwidXNlcmlkIjoiMTAwMTg2MiIsImlhdCI6MTU0ODI5MjUwMDgxOH0.pNh3K0stbyMu7sjZAvJPNJY_Z0UI55uEfjrcOIgA_t25N-hM5xl8KF9XR2fQgY4v5mLZchuIKvKrfJL2m1AULQ');
    //调用API从本地缓存中获取数据
    var that = this;
    //获取屏幕高度
    let screenHeight = wx.getStorageSync('screenHeight')
    if (!screenHeight) {
      wx.getSystemInfo({
        success: (res) => {
          wx.setStorageSync("screenHeight", res.screenHeight)
        }
      })
    }

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
    this.globalData.currentTasks = '';

    // 登录
    wx.login({
      success: function (res) {
        if (res.code) {
           wx.request({
             url: 'https://api.weixin.qq.com/sns/jscode2session',
             data: {
               appid: 'wx706bb2275b0ce05c',
               secret: '611bf03b0bcbd7ebfb4a71fba1433c7a',
               js_code: res.code,
               grant_type: 'authorization_code'  
             },
             header: {},
             method: 'GET',
             dataType: 'json',
             responseType: 'text',
             success: function(res) {
              //  console.log(res.data);
               OPEN_ID = res.data.openid;//获取到的openid  
               SESSION_KEY = res.data.session_key;//获取到session_key 
               wx.setStorageSync('openid', OPEN_ID); 
               wx.setStorageSync('session_key', SESSION_KEY);
              //  console.log(OPEN_ID);
              //  console.log(SESSION_KEY);
             },
             fail: function(res) {},
             complete: function(res) {},
           })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          // wx.getUserInfo({
          //   success: res => {
          //     // 可以将 res 发送给后台解码出 unionId
          //     this.globalData.userInfo = res.userInfo
          //     // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          //     // 所以此处加入 callback 以防止这种情况
          //     if (this.userInfoReadyCallback) {
          //       this.userInfoReadyCallback(res)
          //     }
          //   }
          // })
        }
      }
    })
  },

})