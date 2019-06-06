// pages/skillPractice/skillPractice.js
const app = getApp();
let baseurl = require('../../config.js');

import {
  Common
} from '../../utils/common.js';
import {
  Request
} from '../../utils/request.js';
let common = new Common;
let http = new Request();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    redLock: true,
    yellowLock: true,
    yellowStatus: '1',
    skillRank: null,
    percentnumber: 25,
    willRank: null,
    childItem: [{
      skillNum: "简单勾选",
    }],
    lianxiSlider: null,
    kaoheSlider: null,
  },
  onLoad() {
    // 获取用户技能等级
    this.GetuserSkillLevel();
    this.GetuserTride();
  },
  onUnload: function(){
    // wx.navigateBack({
    //   delta: 1
    // })
  },
  onShow: function(){
    this.GetuserSkillLevel();
    this.GetuserTride()
  },
  goTest: function(e) {
    wx.navigateTo({
      url: '../goExercises/goExercises',
    })
  },
  webTip() {
    wx.showModal({
      title: '温馨提示',
      content: '想了解更多，请移步网站 \r\n https://www.palayun.com',
      showCancel: false,
    })
  },
  // 获取用户技能等级
  GetuserSkillLevel() {
    let that = this;
    let token = wx.getStorageSync('usertoken');
    let url = baseurl.controllers.userCenterUrl + '/v1/usercenter/user/skillall'
    http.getNolyToken('get', url, token, res => {
      console.log('获取用户技能等级:');
      console.log(res);
      let data = JSON.parse(res.resultJsonStr);
      let lianxiSlider = new Array();
      let levelvalue = new Array();
      let status = '';
      for (let i = 0; i < data.length; i++) {
        if (data[i].type == '04') {
          lianxiSlider.push(data[i]);
          levelvalue.push(data[i].level);
        }
      }
      this.setData({ lianxiSlider});
      if (levelvalue.indexOf('4') > -1){
        this.setData({
          skillRank: ['入门', '初级', '中级', '高级'],
          willRank: ['无'],
          percentnumber: 100
        })
      } else if (levelvalue.indexOf('3') > -1) {
        this.setData({
          skillRank: ['入门', '初级', '中级'],
          willRank: ['高级'],
          percentnumber: 75
        })
      } else if (levelvalue.indexOf('2') > -1) {
        this.setData({
          skillRank: ['入门', '初级'],
          willRank: [ '中级', '高级'],
          percentnumber: 50
        })
      } else if (levelvalue.indexOf('1') > -1) {
        this.setData({
          skillRank: ['入门'],
          willRank: ['初级', '中级', '高级'],
          percentnumber: 25
        })
      }
    })
  },

  // 获取考核技能权限
  GetuserTride() {
    let that = this;
    let token = wx.getStorageSync('usertoken');
    let url = baseurl.controllers.userCenterUrl + '/v1/usercenter/user/skills';
    let dataobj = {
      type: '04'
    };
    http.ExcuteRequestToken('get', url, token, dataobj, res => {
      console.log('获取考核技能权限:')
      console.log(res);
      let data = JSON.parse(res.resultJsonStr);
      let status = '';
      let kaoheSlider = new Array();
      for (let i = 0; i < data.length; i++) {
        if (data[i].type == '04') {
          kaoheSlider.push(data[i])
        }
      }
      this.setData({ kaoheSlider })
    })
  },
  goRedTride(e) {
    app.globalData.istest = true;
    console.log(e);
    if (e.currentTarget.dataset.status == '1') {
      wx.showModal({
        title: '温馨提示',
        content: '您暂无权限或未登陆',
        showCancel: false,
      })
    } else {
      if (e.currentTarget.dataset.skillid){
        app.globalData.overSkillid = e.currentTarget.dataset.skillid;
        wx.navigateTo({
          url: '../goExercises/goExercises',
        })
      }
    }
  },
  goYellowTride(e) {
    app.globalData.istest = false;
    if (e.currentTarget.dataset.status == '4') {
        wx.showModal({
          title: '温馨提示',
          content: '您已经通过考核',
          showCancel: false,
        })
    } else if (e.currentTarget.dataset.status == '1' || e.currentTarget.dataset.status == '2') {
      wx.showModal({
        title: '温馨提示',
        content: '您暂无权限或未登陆',
        showCancel: false,
      })
    } else if(e.currentTarget.dataset.status == '3') { 
      if (e.currentTarget.dataset.skillid) {
        app.globalData.overSkillid = e.currentTarget.dataset.skillid;
        wx.navigateTo({
          url: '../goExercises/goExercises',
          })
      }
    }
  }
})