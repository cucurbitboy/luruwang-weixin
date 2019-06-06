// pages/personalCenter/personalCenter.js
const app = getApp()
let baseurl = require('../../config.js')
let getAjax = require('../../utils/common.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    telphone: "",
    telPassword: "",
    isgonext: true,
    fun_id: 2,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

  },
  overstep: function(){
    wx.redirectTo({
      url: '../index/index',
    })
  },




  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 拿到手机号
  getPhone: function (e) {
    this.setData({
      telphone: e.detail.value
    });
  },
  // 拿到密码
  fillCode: function (e) {
    this.setData({
      telPassword: e.detail.value
    });
  },
  // 手机格式验证
  verifyPhone: function () {
    let that = this;
    let reg = /^1[34578]\d{9}$/;
    if (!that.data.telphone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 1000,
      })
      that.setData({
        isgonext: false
      })
    } else if (!that.data.telPassword) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none',
        duration: 1000,
      })
      that.setData({
        isgonext: false
      })
    } else if (!reg.test(that.data.telphone)) {
      wx.showToast({
        title: '请输入正确手机号',
        icon: 'none',
        duration: 1000
      })
      that.setData({
        isgonext: false
      })
    } else {
      that.setData({
        isgonext: true
      })
    }
  },

  // 提交登陆
  submitbtn: function () {
    let that = this;
    let username = that.data.telphone;
    let password = that.data.telPassword;
    let operid = wx.getStorageSync('openid');
    let uuid = this.uuid();
    this.verifyPhone();
    if (!that.data.isgonext) {
      return
    }
    // 判断是否注册过
    wx.request({
      url: baseurl.controllers.userCenterUrl + '/v1/usercenter/getuserid',
      method: 'post',
      data: {username: that.data.telphone},
      header: { 'content-type': 'application/json' },
      success: function (resa) {
        if (resa.data.resultJsonStr == "账号不存在") {
          wx.showToast({
            title: '用户不存在,请先注册',
            icon: 'none',
            duration: 1500
          })
          return;
        }else{
          wx.request({
            url: baseurl.getbases + '/v1/usercenter/sessions',
            method: 'post',
            data: {username, password, clienttype: 4, loginsign: uuid},
            header: { 'content-type': 'application/json' },
            success: function(resb){
              if (resb.data.resultCode == "1101") {
                wx.setStorageSync('usertoken', resb.data.resultJsonStr.split("||")[0]);
                wx.setStorageSync('isin', resb.data.resultJsonStr.split("||")[1]);
                wx.setStorageSync('userId', resb.data.resultJsonStr.split("||")[2]);
                wx.setStorageSync('telphone', that.data.telphone);
                wx.redirectTo({
                  url: '../index/index',
                })
              }else{
                wx.showToast({
                  title: resb.data.message,
                  icon: 'none',
                  duration: 1500
                })
              }
            }
          })
        }
      }
    })
  },

  //生成GUID
  uuid: function () {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for(var i = 0; i< 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
  }




})