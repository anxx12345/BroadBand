const request = require('request').defaults({jar:true});
const fs = require('fs');
const iconv =require('iconv-lite');
const cheerio = require('cheerio');
const keys = require('../../keys')
const headers = {
    'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
};
const options_login = {
      method:'POST',
      url:'http://rz1.ipnoc.cn:8090/fbrole.proper.login.do',
      form:{'EOSOperator/userID':keys.bandAuth.username,'hciPasswordTypeEOSOperator/password':keys.bandAuth.password},
      headers:headers
};
let total_result = {userInfo:[],userAuthHis:[],userBandType:[]};
function post_login(options){
      return new Promise(function(resolve,reject){
            request.post(options, function (err,res,body) {
                  //console.log(body);
                  resolve(body)
            })
      });
}
function post_getInfo(options){
      return new Promise(function(resolve,reject){
            request.post(options, function (err,res,body) {
                  //console.log(iconv.decode(body,'gbk'));
                  resolve(body)
            })
      });
}
function post_userAuthHis(options){
      return new Promise(function (resolve,reject) {
            request.post(options,function (err,res,body) {
                  resolve(body)
            })
      })
}
function getUserInfoSplit(result){
      console.log('在线记录提取...');
      let html = iconv.decode(result, 'gbk');
      let $ = cheerio.load(html, {decodeEntities: false});
      const td_text = $('.pg_result_content_').text();
      if(td_text.toString()) {
            total_result.userInfo = [];
            let td_text_split = td_text.replace(/[\r\n]/g, "").split('						');
            //console.log(td_text_split[2]+' '+td_text_split[3]+' '+td_text_split[4]+' '+td_text_split[5]);
            let duration = ((new Date(td_text_split[4]) - new Date(td_text_split[3]))/3600000).toString().substring(0,5);
            total_result.userInfo = [td_text_split[2], td_text_split[3], duration + '小时', td_text_split[5]];
            //total_result.userInfo = {'bandNum':td_text_split[2], 'loginTime':td_text_split[3], 'onlineTime':td_text_split[4],'userIP':td_text_split[5]}
      }else {
            total_result.userInfo = [];
      }
}
function getUserAuthHis(result){
      console.log('认证记录提取...');
      let html = iconv.decode(result, 'gbk');
      //console.log(html)
      //fs.writeFile('index.html',html,function(err){
      //      if(err){
      //            return console.log(err)
      //      }
      //});
      let $ = cheerio.load(html, {decodeEntities: false});
      const returnOK = $('.pg_result_content_').text();
      if(returnOK.toString()){
            total_result.userAuthHis = [];
            let td_text = $('tr').text();
            //console.log(td_text);
            let td_text_split = td_text.replace(/[\r\n\t]/g,'=').substring(222).split('========');
            //console.log(td_text_split);
            //let td_text_split = td_text.replace(/[\r\n\t]/g,"-").replace(/\s/g,'').split('--------');
            let arr = [],arr_total = [];
            for(let i = 0;i<td_text_split.length;i++){
                  arr.push(td_text_split[i]);
                  if((i+1)%8 === 0){
                        arr_total.push(arr);
                        arr = []
                  }
            }
            //console.log(arr_total);
            for(let i = 0;i<arr_total.length;i++){
                  //console.log(arr_total[i][2]+' '+arr_total[i][6]+' '+arr_total[i][7].replace(/\=/g,''));
                  total_result.userAuthHis.push([arr_total[i][2],arr_total[i][6],arr_total[i][7].replace(/\=/g,'')]);
                  if(i === arr_total.length-1){
                        return total_result;
                  }
            }
      }else {
            total_result.userAuthHis = [];
            return total_result;
      }

}
function postBandType(options){
     return new Promise(function (resolve,reject) {
          request.post(options, function (err,res,body) {
               resolve(body)
          })
     })
}
function getBandTypeSplit(result){
      console.log('用户资料查询');
      let html = iconv.decode(result, 'gbk');
      let $ = cheerio.load(html, {decodeEntities: false});
      const td_text = $('.pg_result_content_').text();
      if(td_text.toString()) {
            total_result.userBandType = [];
            let td_text_split = td_text.replace(/[\r\n]/g, "").split('						');
            //console.log(td_text_split)
            //console.log(td_text_split[2]+' '+td_text_split[3]+' '+td_text_split[4]+' '+td_text_split[5]);
            total_result.userBandType = [td_text_split[3], td_text_split[4]];
            //total_result.userInfo = {'bandNum':td_text_split[2], 'loginTime':td_text_split[3], 'onlineTime':td_text_split[4],'userIP':td_text_split[5]}
      }else {
            total_result.userBandType = [];
      }
}

function app(options){
      total_result = {};
      const options_getUserInfo = {
            url:'http://rz1.ipnoc.cn:8090/integrationquery.prActiveCall.prActivCallQuery.do',
            encoding:null,
            headers:headers,
            form:{
                  'PageCond/begin':'0',
                  'PageCond/count':'',
                  'ActiveCallQuery/EEORGSEQ/criteria/value':'14',
                  'ActiveCallQuery/EEORGSEQ/criteria/operator':'like',
                  'ActiveCallQuery/EEORGSEQ/criteria/likeRule':'center',
                  'ActiveCallQuery/USER_CODE/criteria/value':options.userNum,
                  'ActiveCallQuery/USER_CODE/criteria/operator':'like',
                  'ActiveCallQuery/USER_CODE/criteria/likeRule':'center',
                  'ActiveCallQuery/FRAMEDIP/criteria/value':'',
                  'ActiveCallQuery/FRAMEDIP/criteria/operator':'like',
                  'ActiveCallQuery/FRAMEDIP/criteria/likeRule':'center',
                  'ActiveCallQuery/NASIP/criteria/value':'',
                  'ActiveCallQuery/NASIP/criteria/operator':'like',
                  'ActiveCallQuery/NASIP/criteria/likeRule':'center',
                  'ActiveCallQuery/ORGCODE/criteria/value':'',
                  'ActiveCallQuery/MAC/criteria/value':'',
                  'ActiveCallQuery/DURATION_D/criteria/value':'',
                  'ActiveCallQuery/DUAL_D/criteria/value':'1',
                  'PageCond/length':'50'
            }
      };
      const options_bandType = {
            method:'POST',
            url:'http://rz1.ipnoc.cn:8090/integrationquery.prcust.prCustQuery.do',
            headers:headers,
            encoding:null,
            form:{
                  'CustQuery/_order/col1/asc':'DESC',
                  'CustQuery/_order/col1/field':'REGDATE',
                  'CustQuery/_order/col2/asc':'DESC',
                  'CustQuery/_order/col2/field':'CUSTID',
                  'CustQuery/LASTNASIP':'',
                  'CustQuery/LASTNASPORTID':'',
                  'CustQuery/LOTID':'',
                  'CustQuery/ORG_ID':'',
                  'CustQuery/USER_CODE':options.userNum,
                  //'CustQuery/USER_CODE':'055709113811',
                  'CustQuery/USER_STATUS':'',
                  'PageCond/begin':'0',
                  'PageCond/count':'',
                  'PageCond/length':'50'
            }
      };
      const options_auth ={
            method:'POST',
            url:'http://rz1.ipnoc.cn:8090/integrationquery.prAAALog.prAAALogQuery.do',
            headers:headers,
            encoding:null,
            form:{
                  'PageCond/begin':'0',
                  'PageCond/count':'',
                  'PageCond/length':'100',
                  'QueryAAALOG/_order/col1/asc':'DESC',
                  'QueryAAALOG/_order/col1/field':'RECVTIME',
                  'QueryAAALOG/CALLINGID/criteria/value':'',
                  'QueryAAALOG/FRAMEDIPADDR/criteria/value':'',
                  'QueryAAALOG/MDSIP/criteria/value':'',
                  'QueryAAALOG/NASIP/criteria/likeRule':'center',
                  'QueryAAALOG/NASIP/criteria/operator':'like',
                  'QueryAAALOG/NASIP/criteria/value':'',
                  'QueryAAALOG/NASPORTID/criteria/value':'',
                  'QueryAAALOG/NASPORTTYPE/criteria/value':'',
                  'QueryAAALOG/PACKETTYPE/criteria/value':'',
                  //'QueryAAALOG/RECVTIME/max':'2018-02-23 23:59:59',
                  'QueryAAALOG/RECVTIME/max':options.endTime,
                  //'QueryAAALOG/RECVTIME/min':'2018-02-01 00:00:00',
                  'QueryAAALOG/RECVTIME/min':options.startTime,
                  'QueryAAALOG/RETCODE/criteria/value':'',
                  'QueryAAALOG/USERNAME/criteria/likeRule':'center',
                  'QueryAAALOG/USERNAME/criteria/operator':'like',
                  'QueryAAALOG/USERNAME/criteria/value':options.userNum,
                  'select1':'desc',
                  'temp/currDateTime':'',
                  'VALUE':'360'
            }
      };

      return post_login(options_login)
          .then(result => post_getInfo(options_getUserInfo))
          .then(result => getUserInfoSplit(result))
          .then(result =>postBandType(options_bandType))
          .then(result =>getBandTypeSplit(result) )
          .then(result => post_userAuthHis(options_auth))
          .then(result => getUserAuthHis(result))
          .catch(err=>console.log(err));
}
module.exports = app;
// app({userNum:'055709956057'}).then(result=>console.log(result));
