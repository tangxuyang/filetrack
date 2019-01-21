//index.js
const app = getApp()
const request = require('../../utils/request').default;
const apis = require('../../utils/apis').default;

const sha1 = require('../../utils/hmac').default;


function padding(n) {
  if(n<10) {
    return '0' + n;
  } else
  {
    return n + "";
  }
}
function timestamp() {
  let now = new Date();
  return now.getFullYear() + padding(now.getMonth()+1)+padding(now.getDate())+padding(now.getHours()) + padding(now.getMinutes()) + padding(now.getSeconds());
}

Page({
  data: {
    fileInfo: {
      wjcpbh: '',
      wjbt: '',
      blqx: '',
      xm: "",
      fwdw: "",
      blqx: "",
      fwrq: "",
      swrq: "",
      contact_phone: '',
      contact_email: "",
      // ['', '申请状态', '接收', '不接收退回', '呈送校办主任', '呈送校领导', '签出成功通知取件', '签出不成功通知取件']
      status: 1,// 1: 未呈送， 2: 已呈送， 3: 收回， 4: 归还中， 5: 已归还
      statusStr: '',
      target: '',
      zt: ''
    },
    fileCode: "XW2018120001",
    directors: [], // 校办主任
    leaders: [], // 校领导
    history: [],// {sendTime: '2018-09-02', target: '马主任', remark: '打回重做！！'}
    isExpand: false,
    director: "",
    leader: ""
  },

  getStatusStr: function(status){
    var map = ['', '申请状态', '已接收', '不接收退回', '呈送校办主任', '呈送校领导', '呈送文件收回', '签出成功通知取件', '签出不成功通知取件'];
    return map[status] || '';
  } ,

  // 获取校办领导列表
  getDirectors: function(cb) {
    let self = this;
    request({
      url: apis.directors,
      data: {
        timestamp: timestamp(),
        type: "校办主任"
      },
      success: function(res) {
        if (res.data.retcode === 0) {//成功
          let directors = res.data.data;
          self.setData({
            directors: directors
          })
        } else {
          self.error('获取校办主任失败')
        }
      }
    });
  },

  // 获取校领导列表
  getLeaders: function() {
    let self = this;
    request({
      url: apis.directors,
      data: {
        timestamp: timestamp(),
        type: '校领导'
      },
      success: function (res) {
        if(res.data.retcode === 0) {//成功
          let leaders = res.data.data;
          self.setData({
            leaders: leaders
          })
        } else {
          self.error('获取校领导失败');
        }
      }
    });
  },

  onLoad: function() {
    let self = this;
    this.getDirectors();
    this.getLeaders();
    
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              console.log(res)
            }
          })
        }
      }
    })
  },
  scan: function() {
    let self = this;
    wx.scanCode({
      success: function(res) {
        let fileCode = res.result;
        if(fileCode) {// 文件编号
          // self.info("调用查询接口查询文件：" + fileCode);

          self.searchFile(fileCode);
        }
      }
    });
  },
  handeInput: function(e) {
    this.setData({
      fileCode: e.detail.value
    })
  },
  search: function() {
    let self = this;
    let fileCode = this.data.fileCode && this.data.fileCode.trim();
    if(fileCode) {
      // this.info("调用查询接口:" + fileCode);
      self.searchFile(fileCode);
    }
  },
  searchFile: function(fileCode) {
    let self = this;
    
    request({
      url: apis.fileDetail,
      data: {
        wjcpbh: fileCode,//"XW2018120001",
        timestamp: timestamp()
      },
      success: function (res) {
        if(res.data.retcode === 0) {
          res.data.data.status = 2;
          res.data.data.state = 2;// TODO: 演示目的，后期删除
          res.data.data.statusStr = self.getStatusStr(res.data.data.state);
          self.setData({
            fileInfo: res.data.data,
            // history: res.data.history// TODO: 暂时没有历史纪录信息
          });
        } else {
          self.error(res.data.retmsg || '查询失败');
        }
        // console.log('response:', res);
      }
    });
  },

  info: function(msg) {
    // wx.showModal({
    //   title: '提示',
    //   content: msg,
    // })
  },
  error: function(msg){
    wx.showToast({
      title: msg,
      icon: 'none'
    })
  },
  // 接收
  receive: function() {
    this.info("调用接收接口更改申请的状态为接收");

    let self = this;
    request({
      url: apis.receive,
      method: "post",
      data: {
        wjcpbh: self.data.fileInfo.wjcpbh,
        timestamp: timestamp(),
        decision: "接受"
      },
      success: function(res) {
        if(res.data.retcode === 0) {
          self.setData({
            "fileInfo.status": 2,
            "fileInfo.statusStr": self.getStatusStr(2),
            "fileInfo.zt": "接受"
          })
        }
      }
    });
  },

  // 不接收退回
  giveBack: function() {
    let self = this;
    this.info("调用退回接口更改状态为不接收退回");

    request({
      url: apis.receive,
      method: "post",
      data: {
        wjcpbh: self.data.fileInfo.wjcpbh,
        timestamp: timestamp(),
        decision: "不接受"
      },
      success: function(res) {
        if(res.data.retcode === 0) {
          self.setData({
            "fileInfo.status": 3,
            "fileInfo.statusStr": self.getStatusStr(3),
            "fileInfo.zt": "不接受"
          })
        } else {

        }
      }
    });
  },

  // 呈送校办主任
  sendToDirector(e) {
    let self = this;
    // this.info("调用呈送校办主任接口");

    request({
      url: apis.fileDetail,
      method: "post",
      data: {
        timestamp: timestamp(),
        wjcpbh: self.data.fileInfo.wjcpbh,
        person: self.data.directors[e.detail.value],//self.data.director,
        person_type: "校办主任"
      },
      success: function (res) {
        if (res.data.retcode === 0) {
          self.setData({
            "fileInfo.status": 4,
            "fileInfo.statusStr": self.getStatusStr(4),
            "fileInfo.zt": "校办主任"
          })
        } else {
          self.error('呈送失败:(');
        }
      },
      fail: function() {
        self.error('呈送失败:(');
      }
    });
  },

  // 呈送校领导
  sendToLeader(e) {
    let self = this;
    // this.info("调用呈送校领导接口");
    request({
      url: apis.fileDetail,
      method: "post",
      data: {
        timestamp: timestamp(),
        wjcpbh: self.data.fileInfo.wjcpbh,
        person: this.data.leaders[e.detail.value],//self.data.leader,
        person_type: "校领导"
      },
      success: function (res) {
        if (res.data.retcode === 0) {
          self.setData({
            "fileInfo.status": 5,
            "fileInfo.statusStr": self.getStatusStr(5),
            "fileInfo.zt": "校领导"
          })
        } else {
          self.error('呈送失败:(');
        }
      },
      fail: function() {
        self.error('呈送失败:(');
      }
    });
  },

  // 签出成功通知取件
  checkoutSuccessNotify: function() {
    let self = this;
    this.info("调用签出成功通知取件接口，更改状态为签出成功通知取件状态");
    request({
      url: apis.checkout,
      method: "post",
      data: {
        timestamp: timestamp(),
        decision: "签出成功",
        wjcpbh: self.data.fileInfo.wjcpbh,
      },
      success: function (res) {
        if (res.data.retcode === 0) {
          self.setData({
            "fileInfo.status": 7,
            "fileInfo.statusStr": self.getStatusStr(7),
            "fileInfo.zt": "签出成功"
          })
        }
      }
    });
  },

  //  签出不成功通知取件
  checkoutFailNotify: function() {
    let self = this;
    this.info("调用签出不成功通知取件接口，更改状态为签出不成功通知取件状态");

    request({
      url: apis.checkout,
      method: "post",
      data: {
        wjcpbh: self.data.fileInfo.wjcpbh,
        timestamp: timestamp(),
        decision: "签出不成功"
      },
      success: function(res) {
        if(res.data.retcode === 0) {
          self.setData({
           "fileInfo.status": 8,
           "fileInfo.statusStr": self.getStatusStr(8) ,
           "fileInfo.zt": "签出不成功"
          })
        }
      }
    });
  },

  revert: function() {
    let self = this;
    this.info("调用签出不成功通知取件接口，更改状态为签出不成功通知取件状态");

    request({
      url: 'http://myform.fudan.edu.cn/api/v1/xwlwcl/reset_test',
      method: "post",
      data: {
        // wjcpbh: self.data.fileInfo.wjcpbh,
        timestamp: timestamp(),
        decision: "签出不成功"
      },
      success: function (res) {
        if (res.data.retcode === 0) {
          self.search();
          // self.setData({
          //   "fileInfo.status": 8,
          //   "fileInfo.statusStr": self.getStatusStr(8),
          //   "fileInfo.zt": "签出不成功"
          // })
        }
      }
    });
  },

  // 收回呈送文件
  // revoke: function() {
  //   let self = this;
  //   this.info("调用收回呈送文件接口");

  //   request({
  //     url: apis.checkoutFail,
  //     data: {
  //       fileCode: self.data.fileInfo.code
  //     },
  //     success: function (res) {
  //       if (res.status === 1) {
  //         self.setData({
  //           "fileInfo.status": 6,
  //           "fileInfo.statusStr": self.getStatusStr(6)
  //         })
  //       }
  //     }
  //   });
  // },

  // 点击呈送记录切换展开与收起状态
  toggle: function() {
    if(this.data.history.length > 0) {
      this.setData({
        isExpand: !this.data.isExpand
      })
    }
  }
})
