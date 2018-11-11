let count = 0;
// function request(obj) {
//   let param = Object.assign({}, obj);
//   if(param.complete) {
//     let complete = param.complete;
//     param.complete = function(){
//       complete();
//       count--;
//       if(count==0) {
//         wx.hideLoading();
//       }
//     }
//   }

//   count++;
//   wx.request(param);
// }

function request(obj) {
  wx.showLoading({
    title: '',
    mask: true
  })

  setTimeout(function(){
    wx.hideLoading();
  }, 1000);
  console.log("request: ", obj);
  obj.success({status: 1, message: '', data: []});
}

export default request;