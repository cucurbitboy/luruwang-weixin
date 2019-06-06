// pages/goTest/goTest.js
const app = getApp();
let baseurl = require('../../config.js');

import {
  Common
} from '../../utils/common.js';
import {
  Request
} from '../../utils/request.js'
import {
  DoTask
} from '../goTest/dotasking.js';
let common = new Common;
let http = new Request();
let DoingTask = new DoTask();


let currenttask = null; //当前任务
let currentTasks = null; //接受到的报文
var imgbox = [];
var temp = true;
let isubmit = false;
// 全局变量/
var FieldsBoxAll = [];
let iscutImg = ''

let FieldsBox = [];
let dictionaries = [];

let currentTime = 0;   //当前任务时间
let thisIndex = 0;     //当前字段
let thiskey = null;
let showTaskTime = null;  //任务显示时间
let endpoints = 0;        //默认节点
let timerId = 0;           //倒计时定时器id
let RollCount = 2;        //回退失败次数   
let uconut = 0;   
let submitReport = new Number();  //今日提交量  
let inputelmpt = '';
let ajaxcount = 0;  //取任务数


Page({
  data: {
    arrowRight: 'scaleToFill',
    showImage: 'aspectFit',
    submitReport: '0',
    testTips: '根据图片显示内容录入',
    submitTest: '提交',
    totalNum: '0',
    currentNum: '0',
    imgDate: '',
    tasklist: null,
    timer: '0',
    isnext: false, //是否显示下一页
    thiskey: null,
    isred: false,
    show: false,
    isinput: false,    //是录入格式
    focus: true,
    inputvalues: '',    //输入框值
    inputype: 'text'     //输入框类型
  },
  onLoad: function(options) {
    let that = this;
    // let pages = getCurrentPages();
    // let prevpage = pages[pages.length - 2];
    // if (prevpage.route == 'pages/index/index'){
    //   that.setData({dotasktype: 0}) //做任务
    // }else{
    //   that.setData({ dotasktype: 1}) //做练习
    // }
    
    // 获取今日提交量
    this.SetReportCount();
    this.Gettask();
    if (that.data.dotasktype == '0') {
      that.setData({
        submitTest: '提交'
      })
    } else if (that.data.dotasktype == '1') {
      that.setData({
        submitTest: '下一题'
      })
    }



  },
  // 手机软盘
  inputChange(e) {
    console.log(e.detail);
    inputelmpt += e.detail;
    this.setData({ inputvalues: inputelmpt })
  },
  inputdelete(e) {
    if (inputelmpt.length > 0) {
      inputelmpt = inputelmpt.substr(0, inputelmpt.length - 1)
    }
    this.setData({ inputvalues: inputelmpt })
  },
  inputOk(e) {
    this.SubmitTrainingtests()
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // console.log(global.DoingTask.currentTasks)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(timerId);
    if (currenttask) {
      this.RollBackTaks()
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(timerId);
    if (currenttask){
      this.RollBackTaks()
    }
    // wx.navigateBack({
    //   delta: 1
    // })
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  //获取今日提交量
  SetReportCount() {
    let that = this;
    let token = wx.getStorageSync('usertoken');
    wx.request({
      method: 'get',
      url: baseurl.getreportcountURL,
      header: {
        'Authorization': token,
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        console.log(res.data);
        if (res && res.data) {
          if (res.data.newToken != null && res.data.newToken != "") {
            wx.setStorageSync("usertoken", res.data.newToken)
          }
          if (res.data.resultJsonStr) {
            submitReport = Math.floor(Number(res.data.resultJsonStr));
            that.setData({
              submitReport
            })
          }
        }
      }
    })
  },
  // 回退任务
  RollBackTaks(){
    clearInterval(timerId);
    let token = wx.getStorageSync('usertoken');
    let url = baseurl.rollbacktaskserviceURL;
    let _this = this;
    let sdataobj = {
      workID: currenttask.WorkID,
      status: "B",
      endpoint: currenttask.Endpoint,
      operid: currenttask.OperID
    };
    http.ExcuteRequestToken('get', url, token, sdataobj, obj => {
      if (obj) {
        console.log(obj)
        if (obj.resultCode == '1') {
          uconut = 0;
          currenttask = null;
          currentTasks.splice(0, currentTasks.length);
          _this.initPge();
          console.info("回退成功");
        }else{
          uconut++;
          if (uconut< RollCount){
            _this.RollBackTaks();
          }
         
        }
      }else{
        console.log('回退失败')
      }
    })
  },

  //获取任务
  Gettask() {
    let that = this;
    let token = wx.getStorageSync('usertoken');
    wx.request({
      method: 'get',
      url: baseurl.gettaskURL + "?nowtime= " + new Date().getTime(),
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        timeSpan: 10,
        token: token,
        failedendpoint: endpoints,
      },
      success: (objstr) => {
        console.log(objstr)
        // wx.setStorageSync('cucurtent', objstr.data);
        if (objstr && objstr.data) {
          try {
            let resultobj = JSON.parse(JSON.stringify(objstr.data));
            if (!resultobj.resultJsonStr || resultobj.resultJsonStr == "错误页面" || resultobj.resultJsonStr ==""){
              if(ajaxcount <5){
                ajaxcount++;
                that.Gettask();
              }else{
                wx.showModal({
                  title: '温馨提示',
                  content: '当前无任务，继续加载？',
                  success(sobj) {
                    if (sobj.confirm) {
                      ajaxcount = 0;
                      that.Gettask();
                    } else if (sobj.cancel) {
                      wx.redirectTo({
                        url: '../index/index'
                      })
                    }
                  }
                })
              }
            }else{
              if (resultobj.resultCode == 1) { //表示成功
                currentTasks = null;
                //token更新
                if (resultobj.newToken != null && resultobj.newToken != "") {
                  wx.setStorageSync("usertoken", resultobj.newToken);
                }
                currentTasks = JSON.parse(resultobj.resultJsonStr);
                if (currentTasks.length > 0) {
                  that.showDocument(thisIndex);
                } else {  //取到空数组，排除当前节点
                  wx.showModal({
                    title: '温馨提示',
                    content: '当前无任务，继续加载？',
                    success(vobj) {
                      if (vobj.confirm) {
                        endpoints = resultobj.failedPoint;
                        that.Gettask();
                      } else if (vobj.cancel) {
                        wx.navigateBack({
                          delta: 1
                        })
                      }
                    }
                  })
                }
              } else if (resultobj.resultCode == 40102) { //登陆过期
                wx.showModal({
                  title: '温馨提示',
                  content: '用户登陆过期或在其它地方登陆，请重新登陆',
                  showCancel: false,
                  success(tobj) {
                    if (tobj.confirm){
                      wx.navigateBack({
                        delta: 1
                      })
                    }
                  }
                })
              }
            }
          } catch (Exception) {
            console.info("任务接口返回错误");
            console.error(Exception);
          }
        } else {
          wx.showModal({
            title: '温馨提示',
            content: '当前无任务，继续加载？',
            success(sobj) {
              if (sobj.confirm) {
                that.Gettask();
              } else if (sobj.cancel) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        }
      }
    })
  },
  showDocument(thisIndex) {
    let that = this;
    currenttask = null;
    if (currentTasks.length != '0') {
      currenttask = currentTasks[0];
      // 一次去一个任务的第一个任务
      console.log(currenttask);
      if (currenttask.WorkItemType != '录入任务') return;
      imgbox = currenttask.Images; //获取图片数据
      //获取Fields数据
      FieldsBoxAll = currenttask.Fields;
      for (var i = 0; i < FieldsBoxAll.length; i++) {
        if (!FieldsBoxAll[i].Credible) {
          let blank_ = common.attributeExt(FieldsBoxAll[i]).blank;
          if (2 == blank_){
            continue;
          }
          FieldsBox.push(FieldsBoxAll[i]);
        }
      }
      // if(FieldsBox.length>1){
      //   that.setData({isnext:true})
      // }else{
      //   that.setData({isnext:false})
      // }
      console.log('过滤后的字段数组:')
      console.log(FieldsBox);
      for (let i = 0; i < FieldsBox.length; i++) {
        let imageIndex = FieldsBox[i].ImageIndex; //字段里面的imageIndex
        if (!FieldsBox[i].ImageUrl)
          if (imageIndex > 0) {
            FieldsBox[i].ImageUrl = imgbox[imageIndex - 1].ImageUrl; //imgbox URL赋值给给字段里面的URL
          } else {
            FieldsBox[i].ImageUrl = imgbox[imageIndex].ImageUrl; //imgbox URL赋值给给字段里面的URL
          }
      }
      this.showPage(thisIndex); // 显示影像初始化
      let DID = FieldsBox[thisIndex].DID;
      showTaskTime = new Date().getTime();
      currentTime = currenttask.WorkTime;  //任务显示时间
      that.setData({ timer: currentTime});
      // 开始倒计时
      that.SetworkTime()
      that.showfield(thisIndex, DID);
    }
  },
  // 显示字段
  showfield(thisIndex, DID) {
    let that = this;
    if (FieldsBox[thisIndex].CtrlType.indexOf('|') != -1) {
      var ctrlType = FieldsBox[thisIndex].CtrlType.split('|')[0].toLowerCase();//控件类型
    } else {
      var ctrlType = FieldsBox[thisIndex].CtrlType.split(':')[0].toLowerCase();//控件类型
    }
    if (ctrlType && ctrlType == 'combobox' && DID != '' && DID != '0') {   //如果是下拉，并且有did
      that.getLocDic(DID);
      that.setData({
        isinput: false
      });
    } else if (ctrlType && (ctrlType == 'textbox' || ctrlType == 'combotextbox')) {
      if (DID && DID != '0' && DID != '') {   //如果文本类型有字典显示数字软盘
        that.getLocDic(DID);
        that.setData({
          isinput: true,
          inputype: 'number'
        });
      } else {
        that.setData({
          isinput: true,
          inputype: 'text'
        });
      }
      that.getfillinfo(thisIndex);
    }
  },
  // 开始倒计时
  SetworkTime(){
    let that = this;
      timerId = setInterval(function(){
        currentTime--;
        if (currentTime>0){
          that.setData({ timer: currentTime})
          if (currentTime > 10) {
            that.setData({ isred: false })
          } else {
            that.setData({ isred: true })
          }
        }else{
          currentTime = 0;
          clearInterval(timerId);
          that.RollBackTaks()
          wx.showModal({
            title: '温馨提示',
            content: '任务超时',
            showCancel: false,
            success(res){
              if(res.confirm){
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          });
        }
      },1000)
  },



  // 切换右侧影像
  showPage(ImgIdx) {
    this.setData({
      imgDate: FieldsBox[ImgIdx].ImageUrl
    })
  },

  //获取本地或者服务器字典判断
  getLocDic(DID) {
    let that = this;
    let url = baseurl.didurl;
    let token = wx.getStorageSync('usertoken');
    let dataobj = {
      did: DID
    };
    let didsendtimes = 0;
    wx.request({
      url: url,
      method: 'get',
      header: {
        'Authorization': token,
        'content-type': 'application/json' // 默认值
      },
      data: dataobj,
      success: res => {
        if (res && res.data) {
          if (res.data.newToken != null && res.data.newToken != "") {
            wx.setStorageSync("usertoken", res.data.newToken);
          }
          dictionaries = JSON.parse(res.data.resultJsonStr);
          try {
            dictionaries.push({
              "": ""
            });
            dictionaries.push({
              "?": "?"
            });
            if (dictionaries != null) {
              console.log('数据库获取字典值：', dictionaries);
              for(let i=0; i<dictionaries.length; i++){
                if(dictionaries[i] == dictionaries[i+1]){
                    dictionaries.splice(i,1)
                }
              }
              didsendtimes = 0;
              let tasklist = [];
              for (let i = 0; i < dictionaries.length; i++) {
                for (let j in dictionaries[i]) {
                  tasklist.push({
                    'key': j,
                    'value': dictionaries[i][j].split("|")[0]
                  })
                }
              }
              let result = [];
              let objj = {};
              for (let i = 0; i < tasklist.length; i++) {
                if (!objj[tasklist[i].key]) {
                  result.push(tasklist[i]);
                  objj[tasklist[i].key] = true;
                }
              }
              that.setData({
                tasklist
              })
            }
          } catch (e) {

          }
        }
      }
    })
  },
  // 点击选择答案
  choseValue(e) {
    let that = this;
    console.log(e);
    thiskey = e.currentTarget.dataset.key
    this.setData({
      thiskey: e.currentTarget.dataset.key
    });
    if(thisIndex == FieldsBox.length -1){
      FieldsBox[thisIndex].FieldValue = that.isExitBlurred(e.currentTarget.dataset.key);
      this.submittask();
    }else{
      this.goNext();
    }
  },
  isExitBlurred(txt) {
    var reg = /[※?？]/g;
    let userId = wx.getStorageSync('userId');
    if (reg.test(txt)) {
      return txt.replace(reg, "¤" + userId + "¤");
    }
    return txt;
  },

  // 显示录入界面
  getfillinfo(thisIndex) {
    let inputTitle = FieldsBox[thisIndex].FieldName
    this.setData({ inputTitle })
  },

  // 点击input框
  getuserWrite(e) {
    let inputvalues = this.isExitBlurred(e.detail.value);
    this.setData({ focus: true, inputvalues})
  },
  // 失去焦点或者点击确定提交
  writevalue(e) {
    this.setData({ focus: true})
    // let inputvalues = this.isExitBlurred(e.detail.value);
    // this.setData({ inputvalues})
    
  },

  SubmitTrainingtests(){
    let that = this;
    FieldsBox[thisIndex].FieldValue = that.isExitBlurred(that.data.inputvalues);
    if (thisIndex == FieldsBox.length - 1) {
      that.submittask();
    } else if (thisIndex < FieldsBox.length - 1) {
      that.goNext();
    } else if (thisIndex > FieldsBox.length - 1){
      clearInterval(timerId);
      this.RollBackTaks();
      this.initPge();
      this.Gettask();
    }
  },

  // 提交任务
  submittask(e) {
    let that = this;
    clearInterval(timerId);
      if(thisIndex == FieldsBox.length-1){
        let submitTimes = new Date().getTime();
        currenttask.TimeConsuming = submitTimes - showTaskTime;
        let token = wx.getStorageSync('usertoken');
        let url = baseurl.submitURL + currenttask.Endpoint;
        let dataobj = {
          workID: currenttask.WorkID,
          taskResultObj: currenttask,
          endpoint: currenttask.Endpoint
        };
        http.ExcuteRequestToken('post', url, token, dataobj, res => {
          if (res && res.isSuccess){
            console.log('workid:' + JSON.parse(res.resultJsonStr).WorkID + '提交成功');
            submitReport++;
            that.setData({
              submitReport
            });
            that.initPge()
            that.Gettask();
          }else{
            wx.showModal({
              title: '温馨提示',
              content: res.message,
              showCancel: false,
            })
          }
        })
      }else{
        wx.showModal({
          title: '温馨提示',
          content: '请点击下一个字段',
          showCancel: false,
          success(sobj) {
            if (sobj.confirm) {
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })
      }
  },


  // 下一页
  goNext(){
    let that = this;
    if (thisIndex<FieldsBox.length-1){
      inputelmpt='';
      this.initLastPage();
      thisIndex++;
      if(thisIndex == FieldsBox.length-1){
        this.setData({isnext:false})
      }
      this.showPage(thisIndex);
      let DID = FieldsBox[thisIndex].DID;
      that.showfield(thisIndex, DID);
    }
  },
  // 初始化下一页界面
  initLastPage(){
    thiskey = null;
    dictionaries.splice(0, dictionaries.length);
    this.setData({ thiskey: null, imgDate: '', isred: false, tasklist: null, inputvalues:''});
  },
  // 初始化下一个任务
  initPge(){
    currenttask = null;
    thiskey = null;
    inputelmpt='';
    currentTime = 0;   //当前任务时间
    thisIndex = 0;     //当前字段
    showTaskTime = null;  //任务显示时间
    FieldsBox.splice(0, FieldsBox.length);
    dictionaries.splice(0, dictionaries.length);
    this.setData({ thiskey: null, imgDate: '', isred: false, tasklist: null, isnext: false, timer: 0, inputvalues:''});
  },
  // 切换数字
  buttonone(e) {
    this.setData({ inputype: 'number' })
  },
  // 切换文字
  buttontow(e) {
    this.setData({ inputype: 'text' })
  }
})