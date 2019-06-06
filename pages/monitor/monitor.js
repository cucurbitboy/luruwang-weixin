import * as echarts from '../../ec-canvas/echarts';
const app = getApp();
let baseurl = require('../../config.js');
let getAjax = require('../../utils/common.js');
import { Common } from '../../utils/common.js';
let common = new Common;
import {
  Request
} from '../../utils/request.js';
let http = new Request();
let chart = null;
// 全局变量
let datas = '';
let listId = new Array();

let listx = new Array();
let listy = new Array();


let groupList = null;
function setOption(data, chart, xdata, ydata) {
  let wxtitle = data.monitorName;
  let wxtype = data.monitorType;
  if (wxtype == "0") {
    wxtype = "bar";
  } else {
    wxtype = "line";
  }
  const option = {
    color: ['#37a2da'],
    tooltip: {
      trigger: 'axis',
      axisPointer: {            // 坐标轴指示器，坐标轴触发有效
        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
      },
      confine: true
    },
    legend: {
      selectedMode: 'single',  //单选或多选问题
      bottom: 0,
      left: 'center',
      z: 100,
    },
    grid: {
      y2: 5,
      left: 20,
      right: 20,
      bottom: 40,
      top: 30,
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: xdata,
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          color: '#666',
          interval: 0,
          rotate: 60,
          //倾斜度 -90 至 90 默认为0  
          margin: 2,
          textStyle: {
            fontWeight: "bolder",
            color: "#000000"
          }
        },
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisTick: { show: false },
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          color: '#666'
        }
      }
    ],
    series: [
      {
        name: wxtitle,
        type: wxtype,
        label: {
          normal: {
            show: true,
            position: 'inside'
          }
        },
        data: ydata,
        label: {
          normal: {
            show: true,
            position: 'top',
            color: '#000000'
          }
        },
      }
    ]
  };
  chart.setOption(option)
}


Page({
  data: {
    array: null,
    index: 0,
    totalName: '全选',
    isAllcheck: false,
    monitorList: null,
    ismonitorList: false,   //是否显示列表
    // isshowdata: true,  //是否显示图表数据
    ecOne: {
      lazyLoad: true
    },
    timer: ''     //因为我要实时刷新，所以设置了个定时器
  },

  // 单个CheckBox
  radioChange: function(e){
    clearInterval(this.data.timer);
    // this.setData({ isshowdata: true });
    console.log(e);
    let that = this;
    let id = e.detail.value;
    let index = e.currentTarget.dataset.index;
    // 选中的列表，展示选中的图表
    let iid = id + "a";
    that.column(iid)
  },

  column: function(iid){
    var _this = this;
    let data = '';
    for(let i=0; i < datas.monitorList.length; i++){
      if(datas.monitorList[i].id + "a" === iid){
        data = datas.monitorList[i];
        break;
      }
    }
    let time = data.executionInterval || 3;
    this.getOneOption(data, iid);
    this.setData({
      timer: setInterval(function () {
        _this.getOneOption(data, iid);
      }, time*10000)
    })
  },

  onLoad: function(e) {
    // 获取监控组监控项值
    this.GetMonitorGroupList();
    // 获取监控数据
    // this.getMonitorDatas();    
  },

  // 获取监控组
  GetMonitorGroupList: function(){
    let that = this;
    let userId = wx.getStorageSync('userId');
    let objdata = { pageNum: "1", pageSize: '10', monitorGroupTitle: "", userId};
    let urla = baseurl.getmonitor +'/v1/monitorControl/GetMonitorGroupListWeChat';
    http.ExcuteRequest('post',urla , objdata, data =>{
      console.log(data);
      let array = [];
      if (data && data.monitorGroupList.length > 0){
        groupList = data.monitorGroupList;
        for (let i = 0; i < data.monitorGroupList.length; i++){
          if (data.monitorGroupList[i]){
            array.push(data.monitorGroupList[i].monitorGroupTitle);
          }
        }
        array.unshift('请选择');
        if(array){
          that.setData({ array })
        }
      }else{
        wx.showModal({
          title: '温馨提示',
          content: '暂无监控权限',
          showCancel: false,
          success(reobj){
            if(reobj.confirm){
              wx.navigateTo({
                url: '../index/index',
              })
            }
          }
        })
      }
    })
  },
  // 获取监控数据(监控项)
  getMonitorDatas: function(){
    let that = this;
    let urlb = baseurl.getmonitor + '/businessMonitoring/getDataList';
    http.ExcuteRequest('post', urlb, null, res => {
      for (let i = 0; i < res.monitorList.length; i++){
        listId.push(res.monitorList[i].id + "a");
      }
      console.log(listId);
      datas = res;
      console.log(datas)
    })
  },



  /*选择器*/
  bindPickerChange: function(e) {
    clearInterval(this.data.timer);
    // this.setData({ isshowdata: false });
    let that = this;
    let arrName = '';
    let arrIndex = '';
    let monitorList = [];
    let slistID = '';
    if (groupList.length>0){
      for (let i = 0; i < groupList.length; i++) {
        if (Number(e.detail.value)-1 === i) {
          slistID = groupList[i].id;
          arrName = groupList[i].monitorName.split(",");
          arrIndex = groupList[i].monitorProject.split(",");
          break;
        }
      }
      let arrconcat = arrName.concat(arrIndex);
      for (let i = 0; i < arrconcat.length/2; i++){
        monitorList.push({
            name: arrconcat[i],
            id: arrconcat[arrconcat.length/2+i],
            index: i,
            isListcheck: ''
        })
      }
    }
    // 告诉rides微信端请求
    let dataobj = { id: slistID};
    let urlc = baseurl.getmonitor + '/businessMonitoring/SaveMonitorGroupListId';
    http.ExcuteRequest('post', urlc, dataobj, res =>{
      that.getMonitorDatas();
      if (res.isSuccess){
        console.log(res)
      }else{
          wx.showModal({
            title: '温馨提示',
            content: '请重新选择监控组',
          })
      }
    });
    // this.getMonitorDatas();
    
    console.log('picker发送选择改变，携带值为', e.detail.value);
    if(e.detail.value && e.detail.value != 0){
      this.setData({
        index: e.detail.value,
        monitorList, ismonitorList: true
      })
    }else{
      this.setData({
        index: e.detail.value,
        monitorList, ismonitorList: false
      })
    }
    
  },
  
  /*
   *柱状图
   **/

  onReady: function () {   //这一步是一定要注意的
    this.oneComponent = this.selectComponent('#mychart-one');
  },
  onUnload: function () {
    clearInterval(this.data.timer)
  },
  onHide: function(){
    clearInterval(this.data.timer)
  },
  init_one: function (data, xdata, ydata) {   //初始化第一个图表
    this.oneComponent.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      setOption(data, chart, xdata, ydata)
      this.chart = chart;
      return chart;
    });
  },
  getOneOption: function (data, iid) {    //这一步其实就要给图表加上数据
    var _this = this;
    let dataobj = JSON.stringify(data);
    let urld = baseurl.getmonitor + '/businessMonitoring/getBusinessDatas';
    http.ExcuteRequest('post', urld, dataobj, res =>{
      if(res){
        let list = res.dataString.split(",");
        listx.splice(0, listx.length);
        listy.splice(0, listy.length);
        for (let i = 0; i < list.length / 2; i++) {
          listx.push(list[2 * i]);
          listy.push(list[2 * i + 1]);
        }
        _this.init_one(data, listx, listy)
      }
    })
  }

});