const sha1 = require('./hmac').default;
let count = 0;
function request(obj) {
  let param = Object.assign({}, obj);
  // if(param.complete) {
    let complete = param.complete;
    param.complete = function(){
      complete && complete();
      count--;
      console.log('complelte.......');
      if(count==0) {
        wx.hideLoading();
      }
    }
  // }

  if(param.data) {
    let sign = "";
    let keys = Object.keys(param.data);
    keys.sort();
    let arr = [];
    keys.forEach((k)=>{
      arr.push(k + "=" + param.data[k]);
    });

    let queryStr = arr.join('&');
    console.log('query:', queryStr);
    sign = sha1.HmacSHA1(queryStr,'08f3a0a48ea433af').toString();
    param.data.sign = sign;
  }

  wx.showLoading({
    title: '',
  })
  count++;
  wx.request(param);
}

// function request(obj) {
//   wx.showLoading({
//     title: '',
//     mask: true
//   })

//   setTimeout(function(){
//     wx.hideLoading();
//   }, 1000);
//   console.log("request: ", obj);
//   obj.success({status: 1, message: '', data: []});
// }

export default request;