// pages/personalCenter/personalCenter.js
const app = getApp()
let baseurl = require('../../config.js')
let getAjax = require('../../utils/common.js')
import {
  Request
} from '../../utils/request.js';
let http = new Request();
let interval = null //倒计时函数
Page({

  /**
   * 页面的初始数据
   */
  data: {
    telphone: "",
    telcode: "",
    telnewphone: "",
    yzcode :"",
    isgonext: true,
    isgonextwo: true,
    fun_id: 2,
    showPhone: false,
    showMort: false,
    time: '获取', //倒计时 
    currentTime: 60,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    var that = this;
    let telphone = wx.getStorageSync("telphone");
    this.setData({
      telphone: telphone
    });
    this.GetMonitorGroupList();
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      // wx.getUserInfo({
      //   success: res => {
      //     app.globalData.userInfo = res.userInfo
      //     this.setData({
      //       userInfo: res.userInfo,
      //       hasUserInfo: true
      //     })
      //   }
      // })
    }

  },
  onShow: function(){
    let telphone = wx.getStorageSync("telphone");
    this.setData({
      telphone: telphone
    });
  },




  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 拿到手机号
  getPhone: function(e) {
    this.setData({
      telphone: e.detail.value
    });
  },
  // 新手机号
  getnewPhone(e){
    this.setData({
      telnewphone: e.detail.value
    });
  },
  // 验证码
  yzcode(e){
    this.setData({
      yzcode: e.detail.value
    });
  },
  // 拿到密码
  fillCode: function(e) {
    this.setData({
      telcode: e.detail.value
    });
  },
  // 手机格式验证
  verifyPhone: function() {
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
    } else if (!that.data.telcode) {
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
    } else{
      that.setData({
        isgonext: true
      })
    }
  },
  // 更换手机号
  verifyPhonetwo(){
    let that = this;
    let reg = /^1[34578]\d{9}$/;
    if (that.data.telnewphone =='') {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 1000,
      })
      that.setData({
        isgonextwo: false
      })
    } else if (that.data.yzcode == '') {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        duration: 1000,
      })
      that.setData({
        isgonextwo: false
      })
    } else if (!reg.test(that.data.telphone)) {
      wx.showToast({
        title: '请输入正确手机号',
        icon: 'none',
        duration: 1000
      })
      that.setData({
        isgonextwo: false
      })
    } else {
      that.setData({
        isgonextwo: true
      })
    }
  },
  // 提交登陆
  submitbtn: function() {
    let that = this;
    let username = that.data.telphone;
    let password = that.data.telcode;
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
      data: { username: that.data.telphone, },
      header: { 'content-type': 'application/json' },
      success: function (resa) {
        if (resa.data.resultJsonStr == "账号不存在") {
          wx.showToast({
            title: '用户不存在,请先注册',
            icon: 'none',
            duration: 1500
          })
          return;
        } else {
          wx.request({
            url: baseurl.getbases + '/v1/usercenter/sessions',
            method: 'post',
            data: { username, password, clienttype: 4, loginsign: uuid },
            header: { 'content-type': 'application/json' },
            success: function (resb) {
              if (resb.data.resultCode == "1101") {
                wx.setStorageSync('usertoken', resb.data.resultJsonStr.split("||")[0]);
                wx.setStorageSync('isin', resb.data.resultJsonStr.split("||")[1]);
                wx.setStorageSync('userId', resb.data.resultJsonStr.split("||")[2]);
                wx.setStorageSync('telphone', that.data.telphone);
                wx.redirectTo({
                  url: '../index/index',
                })
              } else {
                wx.showToast({
                  title: '登陆失败',
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
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
  },

  // 获取监控组
  GetMonitorGroupList: function () {
    let that = this;
    let userId = wx.getStorageSync('userId');
    let objdata = { pageNum: "1", pageSize: '10', monitorGroupTitle: "", userId };
    let urla = baseurl.getmonitor + '/v1/monitorControl/GetMonitorGroupListWeChat';
    http.ExcuteRequest('post', urla, objdata, data => {
      console.log(data);
      if (data && data.monitorGroupList !="") {
        that.setData({ showMort: true})
      } else {
        that.setData({ showMort: false })
      }
    })
  },




  /**
   * 弹窗显示
   */
  ModShow: function(e) {
    this.setData({
      modelShow: true,
    })
  },
  ModShowtwo: function(e){
    this.setData({
      modelShowtwo: true,
    })
  },

  /**
   * 弹窗隐藏
   */
  modelHide: function(e) {
    let telphone = wx.getStorageSync("telphone");
    let that = this;
    that.setData({
      modelShow: false,
      modelShowtwo: false,
      telphone: telphone
    });
  },


  /*排名*/
  goRank: function(e) {
    wx.navigateTo({
      url: '../goRank/goRank',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  InvitationCode: function(e) {
    wx.navigateTo({
      url: '../InvitationCode/InvitationCode',
    })
  },
  goMonitor: function(e) {
    wx.navigateTo({
      url: '../monitor/monitor',
    })
  },



  getVerificationCode() {
    if (this.data.telnewphone == '') {
      return
    }
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
    // 判断是否注册过
    wx.request({
      url: baseurl.controllers.userCenterUrl + '/v1/usercenter/getuserid',
      method: 'post',
      data: { username: that.data.telnewphone, },
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
              phoneNumber: that.data.telnewphone
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
  // 修改手机号
  removeipone(){
      let that = this;
      this.verifyPhonetwo();
      if (!that.data.isgonextwo) {
        return
      }

      // 验证验证码
      wx.request({
        url: baseurl.controllers.userCenterUrl + '/v1/weChatLoginIsCorrectPhoneNumber',
        method: 'get',
        data: {
          phoneNumber: that.data.telnewphone,
          code: that.data.yzcode,
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log(res.data);
          if (res.data) {
            wx.request({
              url: baseurl.controllers.userCenterUrl + '/v1/usercenter/user',
              method: 'PUT',
              data: {
                token: wx.getStorageSync('usertoken'),
                phonenumber: that.data.telnewphone,
                username: that.data.telnewphone,
              },
              header: {
                'content-type': 'application/json', // 默认值
                'Authorization': wx.getStorageSync('usertoken')
              },
              success(sres) {
                console.log(sres.data);
                if (sres.data.resultCode == 1101) {
                  wx.setStorageSync('userId', sres.data.resultJsonStr);
                  wx.setStorageSync('telphone', that.data.telnewphone);
                  that.setData({ telphone: that.data.telnewphone });
                  wx.showToast({
                    title: '修改成功！！！',
                    icon: 'none',
                    duration: 1500,
                  })
                  wx.redirectTo({
                    url: '../index/index',
                  })
                } else if (sres.data.resultCode == 1201) {
                  wx.showToast({
                    title: '手机号已存在！',
                    icon: 'none',
                    duration: 1500,
                  })
                  wx.redirectTo({
                    url: '../index/index',
                  })
                } else {
                  layer.msg("保存失败", { icon: 2 });
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