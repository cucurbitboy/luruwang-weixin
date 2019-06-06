// pages/personalCenter/personalCenter.js
const app = getApp()
let baseurl = require('../../config.js')
let getAjax = require('../../utils/common.js')
let interval = null //倒计时函数
Page({

  /**
   * 页面的初始数据
   */
  data: {
    telphone: "",
    telcode: "",
    passwordOne: "",
    passwordTow: "",
    invitationcode: "",
    isgonext: true,
    fun_id: 2,
    time: '获取', //倒计时 
    currentTime: 60,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let token = wx.getStorageSync("usertoken");
    let telphone = wx.getStorageSync("telphone");
    let isin = wx.getStorageSync("isin");
    console.log(token)
    if (token != '' && telphone != "" && isin != '') {
      wx.redirectTo({
        url: '../index/index',
      })
    }
  },
  overstep: function () {
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
  // 拿到验证码
  fillCode: function (e) {
    this.setData({
      telcode: e.detail.value
    });
  },
  // 取密码
  getPassword: function(e){
    this.setData({
      passwordOne: e.detail.value
    });
  },
  // 重复密码
  getPasswordTow: function (e) {
    this.setData({
      passwordTow: e.detail.value
    });
  },
  // 邀请码
  getinvitationcode: function(e){
    this.setData({
      invitationcode: e.detail.value
    });
  },
  

  // 验证码倒计时
  getCode: function (options) {
    let that = this;
    let currentTime = that.data.currentTime
    interval = setInterval(function () {
      currentTime--;
      that.setData({
        time: currentTime + '秒'
      })
      if (currentTime <= 0) {
        clearInterval(interval)
        that.setData({
          time: '重新获取',
          currentTime: 60,
          disabled: false
        })
      }
    }, 1000)
  },
  // 表单格式验证
  verifyPhone: function () {
    let that = this;
    let reg = /^1[34578]\d{9}$/;
    let regtwo = new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).*$/);
    let isgonext = true;
    if (that.data.telphone=='' || that.data.telcode=='' || that.data.passwordOne=='' || that.data.passwordTow==''){
      wx.showToast({
        title: '请输入必填项',
        icon: 'none',
        duration: 1500,
      })
      isgonext = false;
    }
    if (!reg.test(that.data.telphone)) {
      wx.showToast({
        title: '请输入正确手机号',
        icon: 'none',
        duration: 1000
      })
      isgonext = false;
    }
    if (that.data.passwordOne.length < 8) {
      wx.showToast({
        title: '密码不能低于八位',
        icon: 'none',
        duration: 1500,
      })
      isgonext = false
    } else if (!regtwo.test(that.data.passwordOne)) {
      wx.showToast({
        title: '密码必须包括小写、大写字母和数字',
        icon: 'none',
        duration: 1500,
      })
      isgonext = false
    }
    if (that.data.passwordOne != that.data.passwordTow) {
      wx.showToast({
        title: '两次输入密码不一致',
        icon: 'none',
        duration: 1000,
      })
      isgonext = false;
    }
    return isgonext;
  },
  // 跳转协议
  godocument: function(){
    wx.navigateTo({
      url: '../document/document',
    })
  },

  getVerificationCode() {
    this.getCodeAjax();
    this.getCode();
    let that = this
    that.setData({
      disabled: true
    })
  },
  // 获取验证码
  getCodeAjax: function () {
    let that = this;
    console.log(that.data.telphone);
    // 判断是否注册过
    wx.request({
      url: baseurl.controllers.userCenterUrl + '/v1/usercenter/getuserid',
      method: 'post',
      data: { username: that.data.telphone, },
      header: { 'content-type': 'application/json' },
      success: function (resa) {
        if (resa.data.resultJsonStr != "账号不存在") {
          wx.showToast({
            title: '用户已存在,请去登陆',
            icon: 'none',
            duration: 1500
          })
          return;
        } else {
          wx.request({
            url: baseurl.controllers.userCenterUrl + '/v1/weChatLogin',
            method: 'get',
            data: {
              phoneNumber: that.data.telphone
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              console.log('获取验证码中……' + res.data);
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
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
  },
  // 提交注册
  submitbtn: function () {
    let that = this;
    let phonenumber = that.data.telphone;
    let invitationcode = that.data.invitationcode;
    let password = that.data.passwordOne;
    let operid = wx.getStorageSync('openid');
    let uuid = this.uuid();
    let isgonexts = this.verifyPhone();
    if (!isgonexts) {
      return
    }

    // 验证验证码
    wx.request({
      url: baseurl.controllers.userCenterUrl + '/v1/weChatLoginIsCorrectPhoneNumber',
      method: 'get',
      data: {
        phoneNumber: that.data.telphone,
        code: that.data.telcode,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        if (res.data) {
          wx.request({
            url: baseurl.controllers.userCenterUrl + '/v1/usercenter/users',
            method: 'post',
            data: {
              phonenumber: phonenumber,
              invitationcode,
              password,
              type: '2',
              operid: operid,
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success(sres) {
              console.log(sres.data);
              if (sres.data.isSuccess) {
                // wx.setStorageSync('usertoken', sres.data.resultJsonStr.split("||")[0]);
                // wx.setStorageSync('isin', sres.data.resultJsonStr.split("||")[1]);
                // wx.setStorageSync('userId', sres.data.resultJsonStr.split("||")[2]);
                // wx.setStorageSync('telphone', phonenumber);
                // wx.hideLoading();
                // wx.redirectTo({
                //   url: '../index/index',
                // })
                wx.request({
                  url: baseurl.getbases + '/v1/usercenter/sessions',
                  method: 'post',
                  data: { username: phonenumber, password, clienttype: 4, loginsign: uuid },
                  header: { 'content-type': 'application/json' },
                  success: function (resb) {
                    if (resb.data.resultCode == "1101") {
                      wx.setStorageSync('usertoken', resb.data.resultJsonStr.split("||")[0]);
                      wx.setStorageSync('isin', resb.data.resultJsonStr.split("||")[1]);
                      wx.setStorageSync('userId', resb.data.resultJsonStr.split("||")[2]);
                      wx.setStorageSync('telphone', that.data.telphone);
                      wx.navigateTo({
                        url: '../index/index',
                      })
                    } else {
                      wx.showToast({
                        title: resb.data.message,
                        icon: 'none',
                        duration: 1500
                      })
                    }
                  }
                })
              } else {
                wx.showToast({
                  title: sres.data.message || '注册失败！！！',
                  icon: 'none',
                  duration: 1500,
                })
                wx.setStorageSync('usertoken', sres.data.resultJsonStr)
              }
            }
          })
        } else {
          wx.showToast({
            title: '验证码错误',
            icon: 'none',
            duration: 1000
          })
          return
        }
      }
    })
  }




})