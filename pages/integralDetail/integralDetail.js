// pages/integralDetail/integralDetail.js
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
    dataList:null,
    ipage: '0',
    income: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.GetDataBypage();
  },
  // 积分明细
  GetDataBypage: function () {
    let that = this;
    let token = wx.getStorageSync('usertoken');
    let url = baseurl.controllers.MoneyMangeUrl + '/v1/finalCenter/user/bonuspoints/histories';
    let endtime = common.timestampToTimes((new Date()).getTime());
    let page = that.data.ipage;
    let objdata = { starttime: "2000-01-01 00:00:00", endtime, page };
    http.ExcuteRequestToken('get', url, token, objdata, res => {
      let data = JSON.parse(res.resultJsonStr);
      if(data && data.length>0){
        if (that.data.dataList){
          let listArr = that.data.dataList;
          listArr.splice(0, listArr.length);
          for(let i=0; i<data.length; i++){
            listArr.push(data[i])
          }
          that.setData({dataList:listArr})
        }else{
          that.setData({dataList: data})
        }
      }else{
        wx.showModal({
          title: '信息',
          content: '暂无积分，快去做任务吧！',
          showCancel: false,
        })
      }
    })
  },
  // 上拉加载更多
  lower: function (e) {
    let that = this;
    let ipage = this.data.ipage;
    ipage++;
    this.setData({ipage});
    wx.showLoading({
      title: '加载中……',
    });
    setTimeout(function () {
      wx.hideLoading({
        success: function () {
          that.GetDataBypage();
        }
      })
    }, 1000)
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