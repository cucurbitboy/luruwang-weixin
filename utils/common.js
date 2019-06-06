var config = require('../config.js')
var app = getApp()
var extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
import { Request } from './request.js';
var http = new Request()
class Common {

  constructor() {

  }
  //  等级转化
  toChinese(num){
    let level = '';
    switch (num) {
      case '1':
        return level = '入门级别';
        break;
      case '2':
        return level = '初级级别';
        break;
      case '3':
        return level = '中级级别';
        break;
      case '4':
        return level = '高级级别';
        break;
      default:
        break
    }
  }

  // 13位时间戳转时间
  timestampToTime(timestamp) {
    let date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = date.getDate();
    return Y + M + D;
  }
  // 13位时间戳转时间带分秒
  timestampToTimes(timestamp) {
    let date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '/';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/';
    let D = date.getDate() < 10 ? '0'+date.getDate() : date.getDate() + ' ';
    let h = date.getHours() < 10 ? '0'+date.getHours() : date.getHours() + ':';
    let m = date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes() + ':';
    let s = date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds();
    return Y + M + D + h + m + s;
  }

  //重新定义并获取数据里的attributeExt
  attributeExt(fieldsBoxObj) {
    let AttributeExtObj = {};
    for (let i_ = 0; i_ < fieldsBoxObj.AttributeExt.length; i_++) {
      AttributeExtObj[fieldsBoxObj.AttributeExt[i_].Key] = fieldsBoxObj.AttributeExt[i_].Value;
    }
    return AttributeExtObj;
  }

  sendRequest(methodtype, url, token, params) {
    let promisevariable = new Promise(function (resolve, reject) {
      wx.request({
        url: url,
        data: params,
        method: methodtype,
        header: {
          'Authorization': token,
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          resolve(res);
        }
      });
    });
    return promisevariable;
  }
}


export { Common }