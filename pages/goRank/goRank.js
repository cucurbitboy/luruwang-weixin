// pages/goRank/goRank.js
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

  /**
   * 页面的初始数据
   */
  data: {
    selected: true,
    selected1: false,
    todayRank: '暂无排名',
    monthRank: '暂无排名',
    monthItems: null,
    todayItems: null,
  },

  selected: function (e) {
      this.setData({
      selected1: false,
      selected: true
    })
  },
  selected1: function (e) {
    this.setData({
      selected: false,
      selected1: true
    });
    this.getMonthList();
  },
  // 获取用户上月排名
  getTodayRank: function(token){
    let that = this;
    let url = baseurl.controllers.MoneyMangeUrl +'/v1/finalCenter/user/mothonrank';
    http.getNolyToken('get', url, token, res => {
      console.log(res);
      let data = JSON.parse(res.resultJsonStr);
      if(data){
        that.setData({monthRank: data.rank})
      }
    })
  },
  // 获取用户昨日排名
  getMonthRank: function(token){
    let that = this;
    let url = baseurl.controllers.MoneyMangeUrl +'/v1/finalCenter/user/rank';
    http.getNolyToken('get', url, token, res => {
      console.log(res)
      let data = JSON.parse(res.resultJsonStr);
      if(data){
        that.setData({todayRank: data.rank})
      }
    })
  },

  // 获取昨日排名
  getTodayList: function(){
    let token = wx.getStorageSync('usertoken');
    let url = baseurl.controllers.MoneyMangeUrl +'/v1/finalCenter/ranks';
    let dataobj = {count: 8};
    http.ExcuteRequestToken('get', url, token, dataobj, res => {
      let todayItems = JSON.parse(res.resultJsonStr);
      console.log(todayItems)
      if (todayItems && todayItems.length>0) {
        that.setData({ todayItems })
      } else {
        wx.showLoading({
          title: '暂无排名',
        });
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      }
    })
  },
  getMonthList: function(){
    let that = this;
    let token = wx.getStorageSync('usertoken');
    let url = baseurl.controllers.MoneyMangeUrl + '/v1/finalCenter/mothonranks';
    let dataobj = { count: 8 };
    http.ExcuteRequestToken('get', url, token, dataobj, res => {
      let monthItems = JSON.parse(res.resultJsonStr);
      if (monthItems && monthItems.length>0){
        that.setData({monthItems})
      }else{
        wx.showLoading({
          title: '暂无排名',
        });
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let token = wx.getStorageSync('usertoken');
    this.getTodayRank(token);
    this.getMonthRank(token);
    // 获取列表排序
    this.getTodayList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})