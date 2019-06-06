let baseurl = require('../../config.js');
import { Common } from '../../utils/common.js';
let common = new Common;
const app = getApp();
/**做任务主逻辑* **/

class DoTask {
  constructor() {
    //获取任务定时器ID
    this.getTaskintaervalID = 0;
    //监听任务状态定时器ID
    this.listenTaskStatusInternalID = 0;
    //提交任务定时器ID
    this.submittaskintaervalID = 0;

    //回退任务定时器ID
    this.rollbackintaervalID = 0;

    //用户提交量
    this.userreportCounts = 0;

    //回退任务数组
    this.rollbacktasks = [];

    //提交任务数组
    this.submittasks = [];

    //当前任务数组
    this.currentTasks = [];

    //当前任务...
    this.currenttask = null;

    //是否显示
    this.isshow = false;

    //最大任务数量
    this.maxtaskCount = 2;

    //获取任务最大失败数量
    this.getfailedmaxcount = 15;

    //获取任务数量，获取成功置为0
    this.gettasktimes = 0;

    //当前是否在获取任务
    this.isgettask = false;

    //监听显示任务定时器
    this.lastpagetype = "";

    this.islayerload = '';

    this.SetReportBits = null; //设置子页面显示提交数量

    this.TempBrowserTasks = [];

    this.Gettingtaskcount = 0;

      // this.SetReportCount = this.SetReportCount.bind(this);
    this.StartGetTasks = this.StartGetTasks.bind(this);
    //   this.StartSubmitTasks = this.StartSubmitTasks.bind(this);
    //   this.StartListenShowTask = this.StartListenShowTask.bind(this);
    //   this.StartRollBackTasks = this.StartRollBackTasks.bind(this);
    this.StopGetTasks = this.StopGetTasks.bind(this);
    //   this.StopSubmitTasks = this.StopSubmitTasks.bind(this);
    //   this.StopRollBackTasks = this.StopRollBackTasks.bind(this);
      this.listenTaskStatusInternal = this.listenTaskStatusInternal.bind(this);
    this.gettaskInternal = this.gettaskInternal.bind(this);
    this.Gettask = this.Gettask.bind(this);
    //   this.gettaskcallback = this.gettaskcallback.bind(this);
    //   this.SubmitTaskInternal = this.SubmitTaskInternal.bind(this);
    //   this.rollbackTaskInternal = this.rollbackTaskInternal.bind(this);
    //   this.rollbackcallback = this.rollbackcallback.bind(this);
    this.notaskAndReturn = this.notaskAndReturn.bind(this);
    //   this.RollbackAllTasks = this.RollbackAllTasks.bind(this);
    //   this.SetReportCountCallback = this.SetReportCountCallback.bind(this);
      this.SetReportCount = this.SetReportCount.bind(this);
    //   this.DelayTime = this.DelayTime.bind(this);
    //   this.SubmitTask = this.SubmitTask.bind(this);
    //   this.submitback = this.submitback.bind(this);
    //   this.RollBackTaks = this.RollBackTaks.bind(this);
    //   this.RemoveTempTask = this.RemoveTempTask.bind(this);
  }

  //开始显示任务页面
  StartListenShowTask() {
    this.listenTaskStatusInternalID = setInterval(this.listenTaskStatusInternal, 90);
  }
  //开始获取任务
  StartGetTasks() {
    if (!this.isgettask) {
      this.gettasktimes
      this.isgettask = true;
      this.getTaskintaervalID = setInterval(this.gettaskInternal, 500);
      console.log("start task :" + this.getTaskintaervalID);
    } else {
      console.log("获取任务中，不进行获取");
    }
  }
  //停止获取任务
  StopGetTasks() {
    console.log("stop task:" + this.getTaskintaervalID);
    if (this.getTaskintaervalID != 0) {
      this.isgettask = false;
      clearInterval(this.getTaskintaervalID);
    }
  }

  //开始提交任务
  // StartSubmitTasks() {
  //   this.submittaskintaervalID = setInterval(this.SubmitTaskInternal, 121);
  //   console.log("start submittaskintaervalID:" + this.submittaskintaervalID);
  // }
  //停止提交任务
  // StopSubmitTasks() {
  //   console.log("StopSubmitTasks submittaskintaervalID:" + this.submittaskintaervalID);
  //   clearInterval(this.submittaskintaervalID);
  // }
  //开始回退任务
  // StartRollBackTasks() {
  //   this.rollbackintaervalID = setInterval(this.rollbackTaskInternal, 200);
  //   console.log("start rollbackintaervalID:" + this.rollbackintaervalID);
  // }

  //停止回退任务
  // StopRollBackTasks() {
  //   clearInterval(this.rollbackintaervalID);
  // }

  //监听任务状态定时器
  listenTaskStatusInternal() {
    //判断当前任务不为空显示任务
    if (this.currenttask == null && this.currentTasks.length > 0) {
      let temptask = this.currentTasks[0];
      //根据任务类型显示对应页面，页面类型跟上一个不同时显示不同页面，相同则不更改
      let tasktype = temptask.WorkItemType;

      this.lastpagetype = tasktype;
      this.currenttask = temptask;
    }
  }

  //获取任务定时器
  gettaskInternal() {
    // console.log('取任务定时器开始时间 ： ' + new Date().getTime());
    try {
      //获取任务次数大于限定次数则停止获取任务返回主页
      if (this.gettasktimes > this.getfailedmaxcount && this.currentTasks.length == 0) {
        this.StopGetTasks();
        this.notaskAndReturn();
      }

      //未获取到任务，累计+1
      if (this.currentTasks.length == 0) {
        this.gettasktimes++;
      }

      //当前任务数量大于最大限制任务数量时返回不获取
      if (this.currentTasks.length >= this.maxtaskCount) {
        return;
      } else if (this.Gettingtaskcount == 0) {
        //获取任务
        console.log('开始取任务时间 ： ' + new Date().getTime());
        this.Gettask();
        this.Gettingtaskcount++;
      }

    } catch (Exception) {
      console.error(Exception);
    }
  }

  //获取任务
  Gettask() {
    let token = wx.getStorageSync('usertoken');
    wx.request({
      method: 'get',
      url: baseurl.gettaskURL + "?nowtime= " + new Date().getTime(),
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        timeSpan: 10,
        token: token
      },
      success: (objstr) => {
        console.log(objstr.data);
        wx.setStorageSync('cucurtent', objstr.data);
        if (objstr && objstr.data) {
          console.log('取到任务' + new Date().getTime());
          try {
            this.Gettingtaskcount--;
            let resultobj = JSON.parse(JSON.stringify(objstr.data));
            if (resultobj.resultCode == 1) { //表示成功
              //token更新
              if (resultobj.newToken != null && resultobj.newToken != "") {
                wx.setStorageSync("usertoken", resultobj.newToken);
              }
              let temptasks = JSON.parse(resultobj.resultJsonStr);
              if (temptasks.length != 0) {
                this.gettasktimes = 0;
                //判断是否在获取任务，已停止则回退任务
                if (this.isgettask) {
                  temptasks.forEach(task => {
                    this.currentTasks.push(task);
                    var now = new Date();
                    var time = now.getTime() + 1000 * task.WorkTime;
                    let newtask = {
                      WorkID: task.WorkID,
                      Endpoint: task.Endpoint,
                      timeoutdate: common.timestampToTimes(time)
                    };
                    this.TempBrowserTasks.push(newtask);
                  });
                  wx.setStorageSync("currenttasks", JSON.stringify(this.TempBrowserTasks));
                } else {
                  temptasks.forEach(task => this.rollbacktasks.push(task));
                }
              }
            }
            //登陆过期
            else if (resultobj.resultCode == 40102) {
              if (!app.globalData.isshowconfirm) {
                app.globalData.isshowconfirm = true;
                wx.showLoading({
                  title: '用户登陆过期或在其它地方登陆，请重新登陆',
                })
              }
            }
          } catch (Exception) {
            console.info("任务接口返回错误");
            console.error(Exception);
          }
        } else {
          if (!app.globalData.isshowconfirm) {
            app.globalData.isshowconfirm = true;
            wx.showLoading({
              title: '用户登陆过期或在其它地方登陆，请重新登陆',
            })
          }
          console.log('当前无任务')
        }
      }
    })
  }
  //停止获取任务，回退全部任务
  // RollbackAllTasks() {
  //   try {
  //     this.StopGetTasks();//停止获取任务
  //     if (this.currentTasks.length > 0) {
  //       for (let i = 0; i < this.currentTasks.length; i++) {
  //         this.rollbacktasks.push(this.currentTasks[i]);
  //       }
  //       this.currentTasks.splice(0, this.currentTasks.length);
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  // // 停止获取任务，做完缓存里任务
  // doRemain(){
  //     try {
  //         this.StopGetTasks();//停止获取任务
  //         if (this.currentTasks.length > 0) {
  //           wx.showLoading({
  //             title: '请做完任务再返回',
  //           })

  //           setTimeout(function () {
  //             wx.hideLoading()
  //           }, 2000)
  //         }
  //     } catch (e) {
  //         console.error(e);
  //     }
  // }
  
  //无任务返回
  notaskAndReturn() {
    if (!app.globalData.isshowconfirm) {
      app.globalData.isshowconfirm = true;
      console.log('继续加载')
    } else {
      console.log("已经有弹框!");
    }
  }

  //获取今日提交量
  SetReportCount() {
    // common.sendRequest('get', baseurl.getreportcountURL, token, null).then((res) => {
    //   console.log(res)
    //   app.globalData.submitReport = Math.floor(Number(res.data.resultJsonStr));
    //   console.log(Math.floor(Number(res.data.resultJsonStr)))
    // })
  }

  //提交任务
  // SubmitTask(task) {
  //   var tasks = [];
  //   tasks.push(task);
  //   var dataobj = JSON.stringify({
  //     workID: task.WorkID,
  //     taskResultObj: task,
  //     endpoint: task.Endpoint
  //   });
  //   // ExcuteAjax_BackobjJSONWithPar("post", submitURL + task.Endpoint, getCookie("usertoken"), dataobj, this.submitback, task);
  //   wx.request({
  //     method: 'post',
  //     url: baseurl.submitURL + task.Endpoint,
  //     header: {
  //       'token': wx.getStorageSync('token'),
  //       'content-type': 'application/json' // 默认值
  //     },
  //     data: dataobj,
  //     success: (res) => {
  //       console.log(res.data);
  //     }
  //   })

  // }

  //提交回调函数
  // submitback(result, taskobj) {
  //   if (result.resultCode != 1 && result.resultCode != -4) {
  //     if (taskobj.SubtmitTimes < 2) {
  //       taskobj.SubtmitTimes++;
  //       this.SubmitTask(taskobj);
  //     }
  //     else {
  //       this.rollbacktasks.push(taskobj);
  //     }
  //   }
  //   else {
  //     //获取用户字节量
  //     this.userreportCounts += 1;
  //     this.SetReportBits();
  //     //GetUserReport();
  //     //移除
  //     let taskinfo = JSON.parse(result.resultJsonStr);
  //     this.RemoveTempTask(taskinfo.workid, taskinfo.endpoint);
  //     wx.setStorageSync("currenttasks", JSON.stringify(this.TempBrowserTasks));
  //   }
  // }
  //手动回退任务
  // RollBackTaks(task, callback) {
  //   if (task) {
  //     let usertoken = wx.getStorageSync('usertoken');
  //     let dataobj = {
  //       workID: task.WorkID,
  //       status: "B",
  //       endpoint: task.Endpoint,
  //       operid: task.OperID
  //     };
  //     if (!usertoken) {
  //       usertoken = usertokenrollback;
  //     }
  //     // ExcuteAjax_Backobj("get", rollbacktaskserviceURL, usertoken, dataobj, callback);
  //     wx.request({
  //       method: 'get',
  //       url: baseurl.rollbacktaskserviceURL,
  //       header: {
  //         'token': wx.getStorageSync('token'),
  //         'content-type': 'application/json' // 默认值
  //       },
  //       data: dataobj,
  //       success: (res) => {
  //         console.log(res.data);
  //       }
  //     })

  //   }
  // }

  //回退任务回调
  rollbackcallback(obj) {
    if (obj) {
      if (obj.resultCode == '1') {
        console.info("回退成功");
        let taskinfo = JSON.parse(obj.resultJsonStr);
        this.RemoveTempTask(taskinfo.workid, taskinfo.endpoint);
        wx.setStorageSync("currenttasks", JSON.stringify(this.TempBrowserTasks));
      }
    }
  }

  RemoveTempTask(workid, endpoint) {
    if (this.TempBrowserTasks.length > 0) {
      for (let i = 0; i < this.TempBrowserTasks.length; i++) {
        if (this.TempBrowserTasks[i].WorkID == workid && this.TempBrowserTasks[i].Endpoint == endpoint) {
          this.TempBrowserTasks.splice(i, 1);
          break;
        }
      }
    }
  }

  RollbackTempALlTasks() {
    let currenttemptasksstr = wx.getStorageSync("currenttasks");
    if (currenttemptasksstr) {
      let currenttemptasks = JSON.parse(currenttemptasksstr);
      if (currenttemptasks.length > 0) {
        DoingTask.Load();
        for (let i = 0; i < currenttemptasks.length; i++) {
          if (new Date() >= new Date(currenttemptasks[i].timeoutdate)) {
            currenttemptasks.splice(i--, 1);
          }
        }
        DoingTask.rollbacktasks = currenttemptasks;
        console.log("回退异常任务中请稍后...");
        return true;
      }
    }
    return false;
  }

  //初次加载
  Load() {
    this.StartGetTasks();
    // this.StartSubmitTasks();
    this.StartListenShowTask();
    // this.StartRollBackTasks();
  }
}

export {
  DoTask
}

//页面加载完成，初始化
// (function () {
//   $(document).ready(function () {
//     window.DoingTask.RollbackTempALlTasks();
//     window.DoingTask.Load();
//   });

//   //页面离开或者浏览器关闭的时候给予提示 防止用户误操作 离开当前页面未保存数据可能丢失
//   window.onbeforeunload = function (event) {
//     try {
//       DoingTask.RollbackAllTasks();
//     } catch (e) {
//       console.error(e);
//     }
//     return "确定离开";
//   };
// })();