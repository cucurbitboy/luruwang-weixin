//index.js
//获取应用实例
const app = getApp();
let baseurl = require('../../config.js');
let getAjax = require('../../utils/common.js');
import { Common } from '../../utils/common.js';
let common = new Common;
import {
  Request
} from '../../utils/request.js';
var http = new Request();


Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    integral: '暂无数据',
    indexSkillState: '未解锁',
    taskState: '空',
    showLock: true,
    integralState: '打卡成功',
    dayIntegrationNum: '+5积分',
    signInShow: false,
  },



  onLoad: function() {
    let that = this;
    // this.getCredits();
    this.getLevelSkill();
    this.GetTaskTotal();

    

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
  onShow: function() {
    // this.getCredits();
    this.getLevelSkill();
    this.GetTaskTotal();
    console.log(this.route)
  },

  // 获取积分数据
  getCredits: function() {
    let that = this;
    let url = baseurl.controllers.MoneyMangeUrl + '/v1/finalCenter/user/bonuspoints';
    let token = wx.getStorageSync('usertoken');
    http.getNolyToken('get', url, token, (res) => {
      let obj = JSON.parse(res.resultJsonStr)
      if (obj && obj.validintegral) {
        that.setData({
          integral: obj.validintegral
        })
      } else {
        that.setData({
          integral: '暂无数据'
        })
      }
    })
  },
  // 获取练习技能等级
  getLevelSkill: function(){
    let that = this;
    let url = baseurl.controllers.userCenterUrl +'/v1/usercenter/user/skillall'
    let token = wx.getStorageSync('usertoken')
    http.getNolyToken('get', url, token, res => {
      if(res && res.resultJsonStr){
        let newjson = JSON.parse(res.resultJsonStr)
        // 只取录入练习
        let skillName = [];
        for (let i = 0; i < newjson.length; i++){
          let type = newjson[i].type;
          if(type == '04'){
            skillName.push(newjson[i]);
            type = '';
          }
        }
        // 获取录入练习最高等级
        let max = skillName[0].level;
        for(let i = 1; i<skillName.length-1; i++){
          if(skillName[i].level > max){
            max = skillName[i].level;
          }
        }
        let indexSkillState = common.toChinese(max);
        that.setData({
          indexSkillState
        })
      }else{
        that.setData({indexSkillState: '未解锁'})
      }
    })
  },
  //  获取任务量
  GetTaskTotal: function(){
    let that = this;
    let token = wx.getStorageSync('usertoken');
    let dataobj = {timestamp: new Date().getTime()}
    http.ExcuteRequestToken('get', baseurl.gettaskcountsUrl, token, dataobj, (obj) => {
      if (obj && obj.resultJsonStr) {
          that.setData({ taskState: obj.resultJsonStr, showLock: false})
      }else{
        that.setData({ taskState: '空', showLock: true})
      }
    })
  },

  // 赚取积分到做任务页
  goTaskPage: function() {
    let token = wx.getStorageSync('usertoken');
    if (!this.data.showLock && token) {
      wx.navigateTo({
        url: '../goTest/goTest',
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '暂无权限或未捆绑手机号',
        showCancel: false,
      })
    }
  },


  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  showSignIn: function(e) {
    var that = this;
    that.setData({
      signInShow: true,
    })
  },
  hideSignIn: function(e) {
    var that = this;
    that.setData({
      signInShow: false,
    })
  },

  /*
   *积分明细
   **/
  goIntegralDetail: function(e) {
    // wx.navigateTo({
    //   url: '../integralDetail/integralDetail',
    // })
  },
  
  


  /*
   *提现
   **/
  withdrawDeposit: function(e) {
    wx.navigateTo({
      url: '../withdrawDeposit/withdrawDeposit',
      success: function(res) {

      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },


  /*
   * 个人中心
   **/
  personalCenter: function(e) {
    wx.navigateTo({
      url: '../personalCenter/personalCenter',
    })
  },
  /*
   *技能修炼
   **/
  goSkillP: function(e) {
    let token = wx.getStorageSync('usertoken')
    if (this.data.indexSkillState !='未解锁' && token){
      wx.navigateTo({
        url: '../skillPractice/skillPractice',
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '暂无权限或未捆绑手机号',
        showCancel: false,
      })
    }
  },
})