// pages/InvitationCode/InvitationCode.js
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

  /**
   * 页面的初始数据
   */
  data: {
    showHide:false,
    integral: '0',
    renshu: '0',
    invitationCodeNum: '',
    commission: '0',
    ipage: '0',
    detailItems: null
  },

  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function () {
    var that = this;
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

    // 获取我的邀请码
    this.GetInvitateCode();
    // 获取积分数据
    this.getCredits();
    // 获取邀请人数量
    this.GetInvitaoinscount();
    // 邀请码提成
    this.Getcommission();
    // 邀请记录
    this.GetDataBypage(false);
  },
  // 上拉加载更多
  lower: function (e) {
    let ipage = this.data.ipage++;
    this.setData({ipage:ipage});
    this.GetDataBypage(true)
  },
  // 获取我的邀请码
  GetInvitateCode: function(){
    let that = this;
    let url = baseurl.controllers.userCenterUrl+'/v1/usercenter/invitationcode';
    let token = wx.getStorageSync('usertoken');
    http.getNolyToken('get', url, token, res => {
      if (res && res.resultJsonStr){
        that.setData({ invitationCodeNum:res.resultJsonStr})
      }
    })
  },
  // 获取积分数据
  getCredits: function () {
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
          integral: '暂无'
        })
      }
    })
  },
  // 获取邀请人数量
  GetInvitaoinscount: function(){
    let that = this;
    let url = baseurl.controllers.userCenterUrl+'/v1/usercenter/user/invitations/count';
    let token = wx.getStorageSync('usertoken');
    http.getNolyToken('get', url, token, (res) => {
      let obj = JSON.parse(res.resultJsonStr)
      if(obj){
        that.setData({renshu: obj})
      }
    })
  },
  // 邀请码提成
  Getcommission: function(){
    let that = this;
    let url = baseurl.controllers.userCenterUrl + '/v1/usercenter/user/invitation/commission';
    let token = wx.getStorageSync('usertoken');
    http.getNolyToken('get', url, token, (res) => {
      let obj = JSON.parse(res.resultJsonStr)
      if (obj) {
        that.setData({ commission: Number(obj)*100 })
      }
    })
  },
  // 邀请记录
  GetDataBypage: function (beal) {
    let that = this;
    let url = baseurl.controllers.userCenterUrl + '/v1/usercenter/user/invitations';
    let token = wx.getStorageSync('usertoken');
    let dataobj = {page:that.data.ipage};
    http.ExcuteRequestToken('get', url, token, dataobj, (res) => {
      let obj = JSON.parse(res.resultJsonStr);
      let dataDetail = [];
      if(obj && obj.length>0){
        for (let i = 0; i < obj.length; i++) {
          dataDetail.push({
            "detailTime": common.timestampToTimes(obj[i].createtime),
            "detailType": obj[i].fullname,
            "detailNum": obj[i].integral
          })
        }
        that.setData({detailItems: dataDetail})
      }else if(beal){
        wx.showLoading({
          title: '我也是有底线的',
        });
        setTimeout(function () {
          wx.hideLoading()
        }, 1500)
      }
    })
  },

  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  /*显示*/
  personNum:function(e){
    if (!this.data.detailItems){
      wx.showModal({
        title: '提示',
        content: '快去邀请小伙伴吧',
        showCancel: false,
      })
    }else{
      this.setData({
        showHide: true,
      })
    }
     
  },
  /*隐藏*/
  closeHide:function(e){
    this.setData({
      showHide: false,
    })
  },
  godocument: function(){
    wx.navigateTo({
      url: '../document/document',
    })
  }



})