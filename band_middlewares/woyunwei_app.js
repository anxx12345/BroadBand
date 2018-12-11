const request = require('request').defaults({jar:true});
const iconv =require('iconv-lite');
const keys = require('../keys')
let fn = (num)=>{

    const headers = {
        'User-Agent':'android-async-http/1.4.3 (http://loopj.com/android-async-http)',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip',
        'Connection': 'Keep-Alive'
    };

    const options = {
        url:'http://60.10.25.153:10010/JtGkAppService/login/auth',
        encoding:null,
        headers:headers,
        form:{
            'loginId':keys.woyunwei.username,
            'pwd':keys.woyunwei.password,
            'version':1
        }
    };
    let headers_catchNum = {
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Origin': 'file://',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1; MX4 Build/LMY47I; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/44.0.2403.147 Mobile Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,en-US;q=0.8',
        'X-Requested-With': 'com.ustcinfo.ict.jtgkapp'
    };
    let options_catchNum = {
        url:'http://60.10.25.153:10010/JtGkAppService/res/getResInfo',
        encoding:null,
        headers:headers,
        form:{
            'province':340000,
            'city':341300,
            'areaCode':341300,
            'busiNo': num
        }
    };
    return new Promise(
        function (resolve,reject){
            request.post(options, function (err,res,body) {
                //console.log(iconv.decode(body, 'utf8'));
                request.post(options_catchNum, function (err,res,body) {
                    //console.log(iconv.decode(body,'utf8'))
                    if(typeof body === 'undefined'){
                        resolve('woyunwei response null.')
                    }else {
                        if((body+'').length !== 0){
                            resolve(iconv.decode(body,'utf8'))
                        }else {
                            resolve('woyunwei response null.')
                        }
                    }
                })
            });
        }
    )

};
module.exports = fn;
//使用接口如下
// fn('18655664031').then(result=>console.log(result));
// fn('055709937749').then(result=>console.log(result));
// fn('055709937123').then(result=>console.log(result));



//历史单查询接口
//POST http://60.10.25.153:10010/JtGkAppService/getHisList HTTP/1.1
//    Host: 60.10.25.153:10010
//Connection: keep-alive
//Content-Length: 166
//Accept: */*
// Origin: file://
// User-Agent: Mozilla/5.0 (Linux; Android 5.1; MX4 Build/LMY47I; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/44.0.2403.147 Mobile Safari/537.36
// Content-Type: application/x-www-form-urlencoded
// Accept-Encoding: gzip, deflate
// Accept-Language: zh-CN,en-US;q=0.8
// X-Requested-With: com.ustcinfo.ict.jtgkapp
//
// userId=18605579259&woId=&shardingId=34&city=341300&beginTime=2018-02-24&endTime=2018-03-03+23%3A59%3A59&page=1&pageNum=10&busiType=1&paraType=1&paraValue=055709113813
//

//1、ZXAN#show running interface gpon-onu_1/2/2:1    //查看2槽位1PON口ONU1 配置
//2、ZXAN#show onu running config gpon-onu_1/1/8:20   //查看onu1远程配置数据



