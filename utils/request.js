var config = require('../config.js')
var extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
var app = getApp()
class Request {

  constructor() {

  }
  /*
  * 无token请求
   * @param {* 请求方式} requesttype
  * @param {* 请求地址} url
  * @param {* 请求数据} dataobj
  * @param {* 回调函数} cb
  */
  ExcuteRequest(requesttype, url, obj, cb) {
    wx.request({
      method: requesttype,
      url: url,
      data: obj,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        if(res){
          try {
            let dataobj = res.data;
            if (dataobj.resultCode == "40102" || dataobj.resultCode == 1305) {
              wx.showLoading({
                title: '请捆绑手机号',
                duration: 1000
              })
            }
            else if (dataobj.newToken != null && dataobj.newToken != "") {
              wx.setStorageSync("usertoken", dataobj.newToken);
              cb(dataobj);
            }
            else {
              cb(dataobj);
            }
          } catch (ex) {
            cb(ex);
          }
        }else{
          console.info("token 已失效");
        }
      },
      fail: (err) => {
        // wx.showModal({
        //   title: '请求错误，请重试',
        //   content: err.errMsg,
        // })
        // wx.showLoading({
        //   title: err.errMsg,
        // })
        // setTimeout(() => {
        //   wx.hideLoading()
        // }, 2000)
      }
    });
  };
  /*
  * 带token请求
   * @param {* 请求方式} requesttype
  * @param {* 请求地址} url
  * @param {* 请求数据} dataobj
  * @param {* 回调函数} cb
  */
  ExcuteRequestToken(requesttype, url, token, obj, cb) {
    wx.request({
      method: requesttype,
      url: url,
      data: obj,
      header: {
        'Authorization': token,
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        if (res) {
          try {
            let dataobj = res.data;
            if (dataobj.resultCode == "40102" || dataobj.resultCode == 1305) {
              wx.showLoading({
                title: '请捆绑手机号',
                duration: 2000
              })
            }
            else if (dataobj.newToken != null && dataobj.newToken != "") {
              wx.setStorageSync("usertoken", dataobj.newToken);
              cb(dataobj);
            }
            else {
              cb(dataobj);
            }
          } catch (ex) {
            cb(ex);
          }
        } else {
          console.info("token 已失效");
        }
      },
      fail: (err) => {
        // wx.showLoading({
        //   title: err.errMsg,
        // })
        // setTimeout(() => {
        //   wx.hideLoading()
        // }, 2000)
      }
    });
  };

  /*
 * 带token，无参数请求
  * @param {* 请求方式} requesttype
 * @param {* 请求地址} url
 * @param {* 请求数据} dataobj
 * @param {* 回调函数} cb
 */
  getNolyToken(requesttype, url, token, cb) {
    wx.request({
      method: requesttype,
      url: url,
      header: {
        'Authorization': token,
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        if (res) {
          try {
            let dataobj = res.data;
            if (dataobj.resultCode == "40102" || dataobj.resultCode == 1305) {
              wx.showLoading({
                title: '请捆绑手机号',
                duration: 2000
              })
            }
            else if (dataobj.newToken != null && dataobj.newToken != "") {
              wx.setStorageSync("usertoken", dataobj.newToken);
              cb(dataobj);
            }
            else {
              cb(dataobj);
            }
          } catch (ex) {
            cb(ex);
          }
        } else {
          console.info("token 已失效");
        }
      },
      fail: (err) => {
        // wx.showLoading({
        //   title: err,
        // })
        // setTimeout(() => {
        //   wx.hideLoading()
        // }, 2000)
      }
    });
  };


  
 
}


export { Request }