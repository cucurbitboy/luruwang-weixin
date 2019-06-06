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
    background: ['../images/indexbg_1.jpg', '../images/indexbg_2.jpg', '../images/indexbg_3.jpg'],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    circular: true,
    interval: 2000,
    duration: 500,
    previousMargin: 0,
    nextMargin: 0,
    showImage: 'scaleToFill',
  },
   onLoad: function () {
    let that = this;
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }
  },
})
