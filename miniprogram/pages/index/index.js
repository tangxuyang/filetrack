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
      code: '2018-09-22-cs-001',
      title: '计算机科学与技术001号文件',
      createDate: '2018-09-22 12:00:01',
      senderName: "易水寒",
      senderPhone: '63293021',
      senderMobile: '1882903949',
      senderEmail: "test@test.com",
      // ['', '申请状态', '接收', '不接收退回', '呈送校办主任', '呈送校领导', '签出成功通知取件', '签出不成功通知取件']
      status: 1,// 1: 未呈送， 2: 已呈送， 3: 收回， 4: 归还中， 5: 已归还
      statusStr: '申请状态',
      target: ''
    },
    fileCode: "",
    directors: ["张主任", "马主任", "李主任", "黄主任", "王主任"], // 校办主任
    leaders: ["张领导", "马领导", "李领导", "黄领导", "王领导"], // 校领导
    // targets: [
    //   {name: '张主任', checked: false, disabled: false}, 
    //   {name: '王主任', checked: false, disabled: true},
    //   {name: '朱主任', checked: false, disabled: false},
    //   {name: '刘主任', checked: false, disabled: false},
    //   {name: '马主任', chekced: false, disabled: false},
    //   {name: '李主任', checked: false, disabled: false}
    //   ],
    // array: ['美国', '中国', '巴西', '日本'],
    history: [{sendTime: '2018-09-02', target: '马主任', remark: '打回重做！！'}],
    isExpand: false
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
      success: function(res) {
        let directors = res.data;// TODO: 接口字段
        self.setData({
          directors: directors.map(function(d, i) {
            return {
              name: d,
              id: d
            }
          })
        })
      }
    });
  },

  // 获取校领导列表
  getLeaders: function() {
    let self = this;
    request({
      url: apis.leaders,
      success: function (res) {
        let leaders = res.data;// TODO: 接口字段
        self.setData({
          leaders: leaders.map(function (l, i) {
            return {
              name: l,
              id: l
            }
          })
        })
      }
    });
  },

  onLoad: function() {
    let self = this;
    // this.getDirectors();
    // this.getLeaders();
    request({
      url: "http://myform.fudan.edu.cn/api/v1/xwlwcl",
      data: {
        wjcpbh: "helsljf",
        timestamp: timestamp()
      },
      success: function(res){
        console.log('response:' , res);
      }
    });
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
        // 要求文件的二维码是http://xxxx.com?filecode=mmmm
        // let result = res.result;
        // let temp = result.split('filecode=');
        // let fileCode = tempo[1];
        let fileCode = res.result;
        if(fileCode) {// 文件编号
          self.info("调用查询接口查询文件：" + fileCode);
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
      this.info("调用查询接口:" + fileCode);
      self.searchFile(fileCode);
    }
    // wx.showModal({
    //   title: '提示',
    //   content: '此处调用详情接口获取申请信息',
    // })
  },
  searchFile: function(fileCode) {
    let self = this;
    
    // TODO: 调用文件详情接口
    request({
      url: apis.fileDetail,
      data: {
        fileCode: fileCode
      },
      success: function (res) {
        // TODO: 设置文件信息
        if (res.status == 1) {
          res.data.statusStr = self.getStatusStr(res.data.fileInfo.status);
          wx.setData({
            fileInfo: res.data.fileInfo,
            history: res.data.history
          });
        }
      }
    });
  },

  info: function(msg) {
    wx.showModal({
      title: '提示',
      content: msg,
    })
  },
  // 接收
  receive: function() {
    this.info("调用接收接口更改申请的状态为接收");

    let self = this;
    request({
      url: apis.receiver,
      data: {
        fildCode: self.data.fileInfo.code
      },
      success: function(res) {
        if(res.status === 1) {
          self.setData({
            "fileInfo.status": 2,
            "fileInfo.statusStr": self.getStatusStr(2)
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
      url: apis.giveBack,
      data: {
        fileCode: self.data.fileInfo.code
      },
      success: function(res) {
        if(res.status === 1) {
          self.setData({
            "fileInfo.status": 3,
            "fileInfo.statusStr": self.getStatusStr(3)
          })
        }
      }
    });
  },

  // 呈送校办主任
  sendToDirector() {
    let self = this;

    this.info("调用呈送校办主任接口");

    request({
      url: apis.giveBack,
      data: {
        fileCode: self.data.fileInfo.code
      },
      success: function (res) {
        if (res.status === 1) {
          self.setData({
            "fileInfo.status": 4,
            "fileInfo.statusStr": self.getStatusStr(4)
          })
        }
      }
    });
  },

  // 呈送校领导
  sendToLeader() {
    let self = this;

    this.info("调用呈送校领导接口");

    request({
      url: apis.giveBack,
      data: {
        fileCode: self.data.fileInfo.code
      },
      success: function (res) {
        if (res.status === 1) {
          self.setData({
            "fileInfo.status": 5,
            "fileInfo.statusStr": self.getStatusStr(5)
          })
        }
      }
    });
  },

  // 签出成功通知取件
  checkoutSuccessNotify: function() {
    let self = this;
    this.info("调用签出成功通知取件接口，更改状态为签出成功通知取件状态");
    request({
      url: apis.checkoutSuccess,
      data: {
        fileCode: self.data.fileInfo.code
      },
      success: function (res) {
        if (res.status === 1) {
          self.setData({
            "fileInfo.status": 7,
            "fileInfo.statusStr": self.getStatusStr(7)
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
      url: apis.checkoutFail,
      data: {
        fileCode: self.data.fileInfo.code
      },
      success: function(res) {
        if(res.status === 1) {
          self.setData({
           "fileInfo.status": 8,
           "fileInfo.statusStr": self.getStatusStr(8) 
          })
        }
      }
    });
  },

  // 收回呈送文件
  revoke: function() {
    let self = this;
    this.info("调用收回呈送文件接口");

    request({
      url: apis.checkoutFail,
      data: {
        fileCode: self.data.fileInfo.code
      },
      success: function (res) {
        if (res.status === 1) {
          self.setData({
            "fileInfo.status": 6,
            "fileInfo.statusStr": self.getStatusStr(6)
          })
        }
      }
    });
  },

  // 点击呈送记录切换展开与收起状态
  toggle: function() {
    if(this.data.history.length > 0) {
      this.setData({
        isExpand: !this.data.isExpand
      })
    }
  }
})
