// pages/goTest/goTest.js
const app = getApp();
let baseurl = require('../../config.js');

import {
  Common
} from '../../utils/common.js';
import {
  Request
} from '../../utils/request.js';
import {
  DoTask
} from '../goTest/dotasking.js';
let common = new Common;
let http = new Request();
let DoingTask = new DoTask();


let currenttask = null;
let currenttest = null;
let currentTasks = [];

let gettasktimes = 0;
let isgettask = false;
let lastpagetype = "";
let TempBrowserTasks = [];
let Gettingtaskcount = 0;
let isshowconfirm = false;
let inputelmpt = '';


var imgbox = [];
var temp = true;
let isubmit = false;
// 全局变量/
var Rect = ''; //坐标字符串
var ArrayRect = [];
var FieldsBoxAll = [];
let iscutImg = ''

let FieldsBox = [];
let dictionaries = [];

let skillid = '041001';
let skillId = '041001';
let skilltype = '04';
let isin = '';
let currentTime = ''; //当前任务时间
let thisIndex = 0; //当前字段
let thiskey = null;
let showTaskTime = null; //任务显示时间
let correctcount = 0; //正确的数量
let currentprocess = 0; //当前过程
let acc = 0;
let isPositive = '';
let userFieldval =[];   //用户选的值
let showReal = [];      //显示的正确答案
let timerId = 0;    //倒计时定时器
let errorcount = 0;     //错误字段数


Page({
  data: {
    arrowRight: 'scaleToFill',
    showImage: 'aspectFit',
    accuracy: '0',
    nowMum: '0',
    totalMum: '0',
    testTips: '根据图片显示内容录入',
    totalNum: '0',
    currentNum: '0',
    imgDate: '',
    tasklist: null,
    timer: '',
    islast: false,  //是否显示上一个字段
    isnext: false, //是否显示下一个字段
    thiskey: null,
    isred: false,
    realAnswer: null,  //正确答案
    isshowReal: false,
    isNexttest: false, //是否显示下一题按钮
    isinput: false,    //是录入格式
    focus: true,
    inputvalues: '',    //输入框值
    inputype: 'text',     //输入框类型
  },
  onLoad: function(options) {
    isin = wx.getStorageSync('isin');
    currentprocess = 0;
    correctcount = 0;
    let that = this;
    let pages = getCurrentPages();
    let prevpage = pages[pages.length - 2];

    // 获取今日提交量
    // this.SetReportCount();
    this.Getexercises(true);
    this.ExercisesUIShow();
  },

  // 手机软盘
  
  inputChange(e) {
    console.log(e.detail);
    inputelmpt += e.detail;
    this.setData({ inputvalues: inputelmpt })
  },
  inputdelete(e) {
    if (inputelmpt.length>0){
      inputelmpt = inputelmpt.substr(0, inputelmpt.length - 1)
    }
    this.setData({ inputvalues: inputelmpt})
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
    // wx.navigateBack({
    //   delta: 1
    // })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(timerId);
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
      success(res) {
        console.log(res.data);
        if (res && res.data) {
          if (res.data.newToken != null && res.data.newToken != "") {
            wx.setStorageSync("usertoken", res.data.newToken)
          }
          if (res.data.resultJsonStr) {
            let submitReport = Math.floor(Number(res.data.resultJsonStr));
            that.setData({submitReport})
          }
        }
      }
    })
  },

  //获取试题
  Getexercises(isfirsttime) {
    this.setData({ inputvalues: '' });
    let that = this;
    this.initPge();
    let token = wx.getStorageSync('usertoken');
    wx.request({
      method: 'get',
      url: baseurl.controllers.exercisesCenterUrl + "/v1/usercenter/skills/trainings?nowtime= " + new Date().getTime(),
      header: {
        Authorization: token,
        'content-type': 'application/json' // 默认值
      },
      data: {
        token,
        skilltype: '04',
        skillid: app.globalData.overSkillid,
        count: '1',
        istest: app.globalData.istest,
        isfirsttime: isfirsttime,
        isin
      },
      success(objstr) {
        console.log('获取试题：');
        console.log(objstr.data);
        if (objstr && objstr.data.resultJsonStr) {
          try {
            let resultobj = JSON.parse(JSON.stringify(objstr.data));
            if (resultobj.resultCode == 1101) { //表示成功
              //token更新
              if (resultobj.newToken != null && resultobj.newToken != "") {
                wx.setStorageSync("usertoken", resultobj.newToken);
              }
              let tests = JSON.parse(resultobj.resultJsonStr);
              if (tests && tests.length > 0) {
                tests.forEach(m => {
                  let task = JSON.parse(m.testMessage);
                  currenttest = m;
                  currentTasks.push(task);
                  let idtasks = m.id;
                  let status = JSON.parse(m.status);
                  wx.setStorageSync('statusid', status);
                  wx.setStorageSync('idtasks', idtasks);
                })
              } else {
                wx.showModal({
                  title: '温馨提示',
                  content: '暂无试题，请稍后重试！',
                  showCancel: false,
                  success(sobj){
                    if(sobj.confirm){
                      wx.navigateBack({
                        delta: 1
                      })
                    }
                  }
                })
              }
              console.log('取到的试题报文，总')
              console.log(currentTasks)
              that.showDocument(thisIndex);
            }
            //登陆过期
            else if (resultobj.resultCode == 40102) {
              if (!isshowconfirm) {
                isshowconfirm = true;
                wx.showModal({
                  title: '温馨提示',
                  content: '用户登陆过期或在其它地方登陆，请重新登陆！',
                  showCancel: false,
                })
              }
            } else if (resultobj.resultCode == 1998) {
              if (!isshowconfirm) {
                isshowconfirm = true;
                wx.showModal({
                  title: '温馨提示',
                  content: '题量不足！！！！',
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
            }
          } catch (Exception) {
            console.info("任务接口返回错误");
            console.error(Exception);
          }
        } else {
          wx.showModal({
            title: '温馨提示',
            content: '题量不足！！！！',
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
      }
    })
  },
  // 渲染试题报文
  showDocument(thisIndex) {
    let that = this;
    if (currentTasks.length != '0') {
      // 防止一次性传两个，取第一个
      currenttask = currentTasks[0];
      console.log('当前任务：')
      console.log(currenttask);
      if (currenttask.WorkItemType != '录入任务') return;
      imgbox = currenttask.Images; //获取图片数据
      //获取Fields数据
      FieldsBoxAll = currenttask.Fields;
      for (let i = 0; i < FieldsBoxAll.length; i++) {
        if (!FieldsBoxAll[i].Credible) {
          let blank_ = common.attributeExt(FieldsBoxAll[i]).blank;
          if (2 == blank_){
            continue;
          }
          FieldsBox.push(FieldsBoxAll[i]);
        }
      }
      if (FieldsBox.length > 1) {
        that.setData({
          isnext: true
        })
      } else {
        that.setData({
          isnext: false
        })
      }
      console.log('过滤后的字段数组：')
      console.log(FieldsBox);
      for (let i = 0; i < FieldsBox.length; i++) {
        let imageIndex = FieldsBox[i].ImageIndex; //字段里面的imageIndex
        if (!FieldsBox[i].ImageUrl){
          if (imageIndex > 0) {
            FieldsBox[i].ImageUrl = imgbox[imageIndex - 1].ImageUrl; //imgbox URL赋值给给字段里面的URL
          } else {
            FieldsBox[i].ImageUrl = imgbox[imageIndex].ImageUrl; //imgbox URL赋值给给字段里面的URL
          }
        }
      }
      that.showPage(thisIndex); // 显示影像初始化
      let DID = FieldsBox[thisIndex].DID;
      showTaskTime = new Date().getTime();
      currentTime = currenttask.WorkTime; //任务显示时间
      that.setData({ timer: currentTime})
      // 开始倒计时
      that.SetworkTime()
      that.showfield(thisIndex, DID); //显示第一个字段
    }
  },
  // 开始倒计时
  SetworkTime() {
    let that = this;
    timerId = setInterval(function () {
      currentTime--;
      if (currentTime > 0) {
        if (currentTime > 10) {
          that.setData({ timer: currentTime, isred: false })
        } else {
          that.setData({ timer: currentTime, isred: true })
        }
      } else {
        currentTime = 0;
        that.data.timer = 0;
        clearInterval(timerId);
        wx.showModal({
          title: '温馨提示',
          content: '已超过试题时间',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              wx.navigateBack({
                delta: 1
              })
              return
            }
          }
        });
      }
    }, 1000)
  },

  // downtime(val){
  //   let that = this;
  //   timerId = setInterval(function(){
  //     val--;
  //     if (val > 0) {
  //       if (val > 10) {
  //         that.setData({
  //           timer: val,
  //           isred: false
  //         })
  //       } else {
  //         that.setData({
  //           timer: val,
  //           isred: true
  //         })
  //       }
  //     } else {
  //       that.data.timer = 0;
  //       clearInterval(timerId);
  //       wx.showLoading({
  //         title: '已超过试题时间',
  //         icon: 'none',
  //         duration: 1000
  //       })
  //       wx.redirectTo({
  //         url: "../skillPractice/skillPractice"
  //       })
  //     }
  //   }, 1000)
  // },
 



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
      success(res) {
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
              for (let i = 0; i < dictionaries.sort().length; i++) {    //初次过滤
                if (dictionaries[i] == dictionaries[i + 1]) {
                  dictionaries.splice(i, 1)
                }
              }

              didsendtimes = 0;
              let tasklist = [];    //存放所有字典键值对
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
              for (let i = 0; i < tasklist.length; i++) {   //过滤重复的key
                if (!objj[tasklist[i].key]) {
                  result.push(tasklist[i]);
                  objj[tasklist[i].key] = true;
                }
              }
              that.setData({
                tasklist: result  
              })
            }
          } catch (e) {

          }
        }
      }
    })
  },
  // 显示录入界面
  getfillinfo(thisIndex){
    let inputTitle = FieldsBox[thisIndex].FieldName
    this.setData({ inputTitle })
  },
  // 点击选择答案
  choseValue(e) {
    console.log(e);
    thiskey = e.currentTarget.dataset.key
    this.setData({
      thiskey: e.currentTarget.dataset.key
    });
    if (thisIndex < FieldsBox.length -1) {
      userFieldval.push({ key: thisIndex, value: e.currentTarget.dataset.key, text: e.currentTarget.dataset.value });
      console.log(userFieldval)
    }
    this.SubmitTrainingtests();
  },
  
  // 点击input框
  getuserWrite(e){
    this.setData({ focus: true, inputvalues: e.detail.value})
  },

  // 失去焦点或者点击确定提交
  writevalue(e){
    // this.setData({ focus: true})
    // this.setData({ inputvalues: e.detail.value})
    userFieldval.push({ value: e.detail.value });
  },
  

  // 提交练习
  SubmitTrainingtests(e) {
    showReal.splice(0, showReal.length);
    let that = this;
    userFieldval.push({ value: that.data.inputvalues });
    let token = wx.getStorageSync('usertoken');
    if (userFieldval.length === FieldsBox.length){
      that.submitTestOption(); 
    } else if (userFieldval.length < FieldsBox.length){
      that.goNext()
    } else if (userFieldval.length > FieldsBox.length){
      this.initPge();
    }
                                                                                                                    
  },

  // 下一个字段
  goNext() {
    this.setData({ inputvalues: ''})
    let that = this;
    inputelmpt = '';
    // 如果确实未达到最大字段数量
    if (thisIndex < FieldsBox.length-1) {
      this.setData({islast: true});
      this.initLastPage();
      thisIndex++;
      this.showPage(thisIndex);
      let DID = FieldsBox[thisIndex].DID;
      that.showfield(thisIndex, DID);
    }
  },
  // 显示字段
  showfield(thisIndex, DID){
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
  // 上一个字段
  goLast(){
    if(thisIndex>0){
      this.initLastPage();
      thisIndex--;
      if (thisIndex < FieldsBox.length - 1) {
        this.setData({
          isnext: true
        })
      }
      if(thisIndex === 0){
        this.setData({
          islast: false
        })
      }
      this.showPage(thisIndex);
      let DID = FieldsBox[thisIndex].DID;
      this.getLocDic(DID);
    }
  },
  // 初始化下一页界面
  initLastPage() {
    thiskey = null;
    inputelmpt = '';
    dictionaries.splice(0, dictionaries.length);
    this.setData({
      thiskey: null,
      imgDate: '',
      isred: false,
      tasklist: null,
      inputvalues: ''
    });
  },
  // 初始化下一个任务
  initPge() {
    currenttask = null;
    thiskey = null;
    inputelmpt = '';
    currentTime = ''; //当前任务时间
    thisIndex = 0; //当前字段
    // showTaskTime = null; //任务显示时间
    if (timerId != 0) {
      clearInterval(timerId);
    }
    FieldsBox.splice(0, FieldsBox.length);
    dictionaries.splice(0, dictionaries.length);
    userFieldval.splice(0, userFieldval.length);
    showReal.splice(0, showReal.length); 
    this.setData({
      nowMum: '0',
      thiskey: null,
      imgDate: '',
      isred: false,
      tasklist: null,
      isnext: false,
      timer: 0,
      realAnswer: null,
      isshowReal: false,
      inputvalues: '',
      realAnswer: ''
    });
  },
  // 申请转正
  Trainingapplyofficial(callback) {
    let token = wx.getStorageSync('usertoken');
    let url = baseurl.controllers.exercisesCenterUrl + '/v1/usercenter/skills/trainings/applyofficial';
    wx.request({
      method: 'get',
      url: url,
      header: {
        Authorization: token,
        'content-type': 'application/json' // 默认值
      },
      data: {
        token,
        skillId,
        skilltype
      },
      success(res){
        callback(res)
      }
    })
  },
  goPositive(callback) {
    let token = wx.getStorageSync('usertoken');
    let url = baseurl.controllers.exercisesCenterUrl + '/v1/usercenter/isFirstPositive?nowtime=' + (new Date()).getTime();
    let dataobj = {
      token,
      skillId
    }
    http.ExcuteRequest('get', url, dataobj, callback)
  },
  // 获取题目总数等信息
  ExercisesUIShow(){
    let token = wx.getStorageSync('usertoken');
    let url = baseurl.controllers.userCenterUrl + '/v1/usercenter/skills/training/info';
    let dataobj = {
      token, skillid, skilltype, istest: app.globalData.istest, isin
    }
    // 当前用户该技能修炼进度
    http.ExcuteRequestToken('get', url, token, dataobj, res => {
      console.log(res)
      // 总题数exercises，完成正确率accuracy未显示
      if (res && res.resultJsonStr) {
        this.setData({ totalMum: JSON.parse(res.resultJsonStr).exercises })
      }
    })
  },
  GetCurrentUserTrainingProcess(callback){
    let token = wx.getStorageSync('usertoken');
    let url = baseurl.controllers.exercisesCenterUrl + '/v1/usercenter/skills/trainings/result';
    let dataobj = { token, skillid, skilltype, istest:app.globalData.istest }
    http.ExcuteRequest('get', url, dataobj, callback)
  },
  // 判断练习考核答案是否正确
  submitTestOption(){
    let that = this;
    let alldata = this.data.tasklist;
    console.log('提交的字--------------：')
    console.log(userFieldval)
    if (userFieldval.length === FieldsBox.length){
      for (let i = 0; i < FieldsBox.length; i++) {
        let DID = FieldsBox[i].DID;
        // 报文里给的正确答案、问题件
        let answervalue = FieldsBox[i].FieldValue;
        let showanswervalue = '';   //存储当前字段的正确答案
        if (FieldsBox[i].CtrlType.indexOf('|') != -1) {
          var ctrlType = FieldsBox[i].CtrlType.split('|')[0].toLowerCase();//控件类型
        } else {
          var ctrlType = FieldsBox[i].CtrlType.split(':')[0].toLowerCase();//控件类型
        }
        if (ctrlType && ctrlType == 'textbox'){
          showanswervalue = answervalue;
        } else if (ctrlType && ctrlType == 'combox' && DID && DID != '0' && DID != ''){
          for (let k = 0; k < alldata.length; k++) {
            if (alldata[k].key == answervalue) {
              showanswervalue = alldata[k].value;
            }
          }
        }
        let FieldName = i+1;
        // let answerproblem = FieldsBox[i].ProblemID;
        // 用户输入的答案、问题件
        let userinputvalue = userFieldval[i].value;
        let userproblem = 'T0';
        if (userFieldval.length > 0) {
          if (userinputvalue != answervalue) {
            showReal.push({ FieldName, answervalue: showanswervalue });
            that.setData({ isshowReal: true, realAnswer: showReal })
            errorcount++
          }
        }
        FieldsBox[i].FieldValue = that.isExitBlurred(userFieldval[i].value);
      }
    }else{
      wx.showModal({
        title: '温馨提示',
        content: '有未选择字段，请选择',
        showCancel: false,
      })
      return
    }
    
    if (errorcount > 0) {
      that.setData({ isNexttest: true, islast: false, isnext: false })
    }else{
      that.slideTask()
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

  // 点击下一题
  getNexttest(){
    errorcount = 0;
    this.setData({ isNexttest: false });
    this.slideTask();
  },
  slideTask(){
    if (timerId != 0){
      clearInterval(timerId);
    }
    let token = wx.getStorageSync('usertoken');
    let that = this;
    currentTasks.splice(0, currentTasks.length);
    currenttest.testMessage = JSON.stringify(currenttask);
    currenttask = null;
    wx.request({
      method: 'post',
      url: baseurl.controllers.exercisesCenterUrl + "/v1/usercenter/skills/trainings/result",
      header: {
        Authorization: token,
        'content-type': 'application/json' // 默认值
      },
      data: {
        result: JSON.stringify(currenttest),
        skilltype: '04',
        istest: app.globalData.istest,
      },
      success(res) {
        console.log('提交练习考核结果：');
        console.log(res.data);
        that.initPge();
        if (res.data.resultCode == '1101') {
          console.log('修炼提交成功:' + res.data.resultJsonStr);
          let resultJsonObj = JSON.parse(res.data.resultJsonStr);
          console.log('提交正确与否--------------：')
          console.log(resultJsonObj.signleCode)
          switch (resultJsonObj.signleCode) {
            case 0:
              if (!resultJsonObj.passCode) {
                that.Getexercises(false);
              }
              break;
            case 1:
              if (!resultJsonObj.passCode) {
                that.Getexercises(false)
              }
              correctcount++;
              break;
          }
          if (resultJsonObj.passCode) {
            switch (resultJsonObj.passCode) {
              case 2:
                wx.showModal({
                  title: '温馨提示',
                  content: '抱歉，您未通过练习，请重新练习',
                  showCancel: false,
                  success(resz) {
                    if (resz.confirm) {
                      wx.navigateBack({
                        delta: 1
                      })
                    }
                  }
                })
                break;
              case 3:
                if (app.globalData.istest) { //练习
                  let ischeckData = { setCodes: "needToApplyForCorrection" };
                  wx.request({
                    url: baseurl.controllers.helperCenterCenterUrl+'/v1/businessManagement/tasks/otherSet',
                    method: 'get',
                    data: ischeckData,
                    success(res){
                      let datab = JSON.parse(res.data.resultJsonStr);
                      if (datab && datab.length > 0) {
                        let ischeckedStatus = datab[0].settingValue;
                        if (ischeckedStatus == '0') {  //不需要申请转正
                          let sobj = { userId: wx.getStorageSync('userId'), skillId};
                          wx.request({
                            method: 'get',
                            url: baseurl.controllers.exercisesCenterUrl+'/v1/usercenter/updateUserSkillIsNotNeedToApplyForCorrection',
                            data: sobj,
                            success(resy){
                              if (resy.data.resultCode == 1101) {
                                wx.showModal({
                                  title: '温馨提示',
                                  content: '当前技能已达标.请去考核吧',
                                  showCancel: false,
                                  success(re){
                                    if(re.confirm){
                                      wx.navigateBack({
                                        delta: 1   //直接转正去考核
                                      })
                                    }
                                  }
                                })
                              }
                            }
                          })
                        } else if (ischeckedStatus == '1') {  //需要手动申请转正
                          let urls = baseurl.controllers.exercisesCenterUrl + '/v1/usercenter/isFirstPositive?nowtime=' + (new Date()).getTime();
                          wx.request({
                            method: 'get',
                            url: urls,
                            header: {
                              Authorization: token,
                              'content-type': 'application/json' // 默认值
                            },
                            data: {
                              token,
                              skillId
                            },
                            success(resx) {
                              isPositive = resx.data.resultJsonStr;
                              if (isPositive =="true") {
                                wx.showModal({
                                  title: '温馨提示',
                                  content: '完成练习，是否转正申请?',
                                  cancelText: '技能大厅',
                                  confirmText: '申请转正',
                                  success(dataa) {
                                    if (dataa.confirm) {
                                      // 申请转正
                                      wx.request({
                                        method: 'post',
                                        url: baseurl.controllers.exercisesCenterUrl + '/v1/usercenter/skills/trainings/applyofficial',
                                        header: {
                                          Authorization: token,
                                          'content-type': 'application/json' // 默认值
                                        },
                                        data: {
                                          token,
                                          skillId,
                                          skilltype
                                        },
                                        success(ress) {
                                          console.log(ress)
                                          if (ress.data.resultCode == "1101") {
                                            wx.showModal({
                                              title: '温馨提示',
                                              content: '转正申请成功',
                                              showCancel: false,
                                              success(resb) {
                                                if (resb.confirm) {
                                                  wx.navigateBack({
                                                    delta: 1
                                                  })
                                                }
                                              }
                                            })
                                          }
                                        }
                                      })
                                    } else if (data.cancel) {
                                      wx.navigateBack({
                                        delta: 1
                                      })
                                    }
                                  }
                                })
                              } else if(isPositive == "false") {
                                wx.showModal({
                                  title: '温馨提示',
                                  content: '您已转正，去考核吧！',
                                  showCancel: false,
                                  success(res) {
                                    if (res.confirm) {
                                      wx.navigateBack({
                                        delta: 1
                                      })
                                    }
                                  }
                                })
                              }
                            }
                          })
                        }
                      }
                    }
                 
                  })
                } else {
                  wx.showModal({
                    title: '温馨提示',
                    content: '正确率达标',
                    showCancel: false,
                    success(res) {
                      if (res.confirm) {
                        wx.navigateBack({
                          delta: 1
                        })
                      }
                    }
                  })
                }
                break;
            }
          }
          currentprocess += 1;
          acc = (correctcount * 100 / currentprocess).toFixed(2) || 0;
          that.setData({
            accuracy: acc,
            nowMum: currentprocess
          })
        } else {
          console.error('修炼提交失败' + JSON.stringify(res.data));
        }
      }
    })   
  },
  // 切换数字
  buttonone(e){
    this.setData({ inputype: 'number'})
  },
  // 切换文字
  buttontow(e){
    this.setData({ inputype: 'text' })
  }
  
})