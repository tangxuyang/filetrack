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
      status: 1,// 1: 未呈送， 2: 已呈送， 3: 收回， 4: 归还中， 5: 已归还
      statusStr: '未呈送',
      target: ''
    },
    fileCode: "",
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
    var map = ['', '未呈送', '已呈送', '已收回', '归还中', '已归还'];
    return map[status];
  } ,
  onLoad: function() {
    let self = this;
    // TODO: 调用接口查询呈送的列表
    request({
      url: apis.targets,
      success: function(res) {
        if(res.status == 1) {
          let targets = res.data;
          // self.setData({
          //   targets: targets.map(function(t,i) {
          //     return {
          //       name: t,
          //       checked: false,
          //       disabled: false
          //     }
          //   })
          // });
        }
      }
    });
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
  // 呈送
  send: function() {
    // wx.showModal({
    //   title: '提示',
    //   content: '调用呈送接口',
    // })
    let self = this;
    // TODO: 调用呈送接口
    request({
      url: apis.changeStatus,
      data: {
        fileCode: self.data.fileInfo.code,
        status: 2
      },
      success: function(res) {
        if(res.status == 1) {
          self.setData({
            "fileInfo.status": 2,
            "fileInfo.statusStr": self.getStatusStr(2)
          });
        }
      }
    });  
  },

  // 收回
  revoke: function() {
    // wx.showModal({
    //   title: '提示',
    //   content: '调用收回接口',
    // })
    let self = this;
    let status = 3;
    // TODO: 调用收回接口
    request({
      url: apis.changeStatus,
      data: {
        fileCode: self.data.fileInfo.code,
        remark: self.data.fileInfo.remark,
        status: status,
      },

      success: function(res) {
        if(res.status == 1) {
          self.setData({
            "fileInfo.status": status,
            "fileInfo.statusStr": self.getStatusStr(status),
            "historyd": self.data.history.push({}),// 把记录添加到history列表中
            "fileInfo.remark": ""
          });
        }
      }
    })
    
  },

  // 归还完成（已归还）
  finishBack: function() {
    // wx.showModal({
    //   title: '提示',
    //   content: '调用完成接口',
    // })
    let self = this;
    let status = 5;
    // TODO: 调用归还接口
    request({
      url: apis.changeStatus,
      data: {
        fileCode: self.data.fileInfo.code,
        status: status
      },
      success: function(res) {
        if(res.status == 1) {
          self.setData({
            "fileInfo.status": status,
            "fileInfo.statusStr": self.getStatusStr(status)
          })
        }
      }
    });
  },

  // 归还文件
  giveBack: function() {
    // wx.showModal({
    //   title: '提示',
    //   content: '调用归还接口',
    // })
    let self = this;
    let status = 4;// 归还中
    request({
      url: apis.changeStatus,
      data: {
        fileCode: self.data.fileInfo.code,
        status: status
      },
      success: function(res) {
        if(res.status == 1) {
          self.setData({
            "fileInfo.status": status,
            "fileInfo.statusStr": self.getStatusStr(status)
          });
        }
      }
    })
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
