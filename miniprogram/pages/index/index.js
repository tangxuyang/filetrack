//index.js
const app = getApp()
const request = require('../../utils/request').default;
const apis = require('../../utils/apis').default;

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
    directors: [], // 校办主任
    leader: [], // 校领导
    targets: [
      {name: '张主任', checked: false, disabled: false}, 
      {name: '王主任', checked: false, disabled: true},
      {name: '朱主任', checked: false, disabled: false},
      {name: '刘主任', checked: false, disabled: false},
      {name: '马主任', chekced: false, disabled: false},
      {name: '李主任', checked: false, disabled: false}
      ],
    history: [{sendTime: '2018-09-02', target: '马主任', remark: '打回重做！！'}],
    isExpand: false
  },

  getStatusStr: function(status){
    var map = ['', '申请状态', '接收', '不接收退回', '呈送校办主任', '呈送校领导', '签出成功通知取件', '签出不成功通知取件'];
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
    this.getDirectors();
    this.getLeaders();
  },
  scan: function() {
    let self = this;
    wx.scanCode({
      success: function(res) {
        // 要求文件的二维码是http://xxxx.com?filecode=mmmm
        let result = res.result;
        let temp = result.split('filecode=');
        let fileCode = tempo[1];
        if(fileCode) {// 文件编号
          self.searchFile(fileCode);
        }
      }
    });
  },
  search: function() {
    let self = this;
    let fileCode = this.data.fileCode && this.data.fileCode.trim();
    if(fileCode) {
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
  },

  // 呈送校领导
  sendToLeader() {
    let self = this;
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
            "fileInfo.status": 6,
            "fileInfo.statusStr": self.getStatusStr(6)
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
           "fileInfo.status": 7,
           "fileInfo.statusStr": self.getStatusStr(7) 
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
