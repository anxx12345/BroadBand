var path = require('path');
var bodyParser = require('body-parser');
var request = require('request').defaults({jar:true});//载入node request模块
const logIt = require('../running_log');
const fs = require('mz/fs');
const keys = require('../../keys')
Date.prototype.format = function(fmt){ //author: meizz
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
};


function request_postJson(options){
    return new Promise(function (resolve,reject) {
        request.post({url:options.url,json:options.json}, function (err,httpResponse,body) {
            resolve(body)
        })
    })
}

module.exports = (router)=>{


//define index page
    router.get('/iptvCode', async function (ctx, next) {
        if(!ctx.session.user){
            await ctx.redirect('/')
        }
        ctx.body = ctx.req.pipe(request('http://10.255.126.9:6600/bms/rest/img/generatImage'))
    });
    router.post('/iptvQuery',async function (ctx,next) {
        if(!ctx.session.user){
            await ctx.redirect('/')
        }
        let result = {iptvNum: '', iptvMac: '',active:'', state: ''};
        let code = ctx.request.body.code;
        let num = ctx.request.body.num;
        let options_login = {
            url: 'http://10.255.126.9:6600/bms/rest/securityCommon/getSecurityDataForLogin',
            json: {
                "version": "1.0",
                "serviceCode": "auth_login",
                "passport": "",
                "sign": "XXXXXXXXX",
                "requestBody": {
                    "account": keys.iptv.username,
                    "password": keys.iptv.password,
                    "validateCode": code
                }
            }
        };
        let body_login  = await request_postJson(options_login);
        //console.log(JSON.parse(body_login.data));
        if(JSON.parse(body_login.data).resultCode ===0){
            logIt(__dirname+'/iptvQuery','user: '+ctx.session.user+' visit_time '+new Date().format("yyyy-MM-dd hh:mm:ss")+ ' ' + num + ' 远程IP地址:'+ ctx.request.ip);
            let passport = JSON.parse(body_login.data).responseBody.passport;
            let options_user_query = {
                url: 'http://10.255.126.9:6600/bms/rest/securityCommon/getSecurityDataForOther',
                json: {
                    "version": "1.0",
                    "serviceCode": "user_query_userListForOther",
                    "passport": passport,
                    "sign": "XXXXXXXXX",
                    "requestBody": {
                        "currentPage": 1,
                        "pageSize": 10,
                        "data": {
                            "accountNo": num
                        }
                    }
                }
            };
            //console.log(JSON.parse(body_login.data));
            if (JSON.parse(body_login.data).resultCode === 0 && num.length > 0) {
                let body_user_query = await request_postJson(options_user_query);
                if (JSON.parse(body_user_query.data).responseBody.data) {
                    result.iptvNum = JSON.parse(body_user_query.data).responseBody.data[0].fuserId;
                    let serviceStatus = JSON.parse(body_user_query.data).responseBody.data[0].serviceStatus;
                    if(serviceStatus === 0){
                        result.active = '未激活'
                    }else {
                        result.active = '已激活'
                    }
                } else {
                    result.iptvNum = '无记录';
                    result.active = '无记录';
                }

                let options_iptvNum_query = {
                    url: 'http://10.255.126.9:6600/bms/rest/securityCommon/getSecurityDataForOther',
                    json: {
                        "version": "1.0",
                        "serviceCode": "user_query_connectDevices",
                        "passport": passport,
                        "sign": "XXXXXXXXX",
                        "requestBody": {
                            "currentPage": 1,
                            "pageSize": 5,
                            "data": {
                                "ids": "1",
                                "fuserId": result.iptvNum,
                                "connectFlag": "0"
                            }
                        }
                    }
                };
                let body_iptvNum_query = await request_postJson(options_iptvNum_query);
                let options_logout = {url:'http://10.255.126.9:6600/bms/rest/securityCommon/getSecurityDataForOther',json:{"version":"1.0","serviceCode":"auth_loginOut","passport":passport,"sign":"XXXXXXXXX","requestBody":null}};
                await request_postJson(options_logout);
                //console.log(JSON.parse(body_iptvNum_query.data))
                if (JSON.parse(body_iptvNum_query.data).responseBody.data) {
                    result.iptvMac = JSON.parse(body_iptvNum_query.data).responseBody.data[0].identity;
                    //console.log('good...')
                } else {
                    result.iptvMac = '无记录';
                    //console.log('error...')
                }
                //console.log(result);
                ctx.response.body = result;
            } else {
                result.state = '验证码过期或错误或系统忙，请输入新的验证码';
                ctx.response.body = result
            }
        }else {
            result.state = '验证码过期或错误或系统忙，请输入新的验证码';
            ctx.response.body = result
        }
    });

    router.post('/iptvUnbind',async function (ctx,next) {
        if(!ctx.session.user){
            await ctx.redirect('/')
        }
        let result = {iptvNum: '', iptvMac: '', state: ''};
        let code = ctx.request.body.code;
        let mac = ctx.request.body.mac;
        let options_login = {
            url: 'http://10.255.126.9:6600/bms/rest/securityCommon/getSecurityDataForLogin',
            json: { "version": "1.0", "serviceCode": "auth_login", "passport": "", "sign": "XXXXXXXXX", "requestBody": { "account": keys.iptv.username , "password": keys.iptv.password , "validateCode": code } }
        };
        let body_login  = await request_postJson(options_login);
        if(JSON.parse(body_login.data).resultCode ===0){
            logIt(__dirname+'/iptvUnbind','user: '+ctx.session.user+' visit_time '+new Date().format("yyyy-MM-dd hh:mm:ss")+ ' ' + mac + ' 远程IP地址:'+ ctx.request.ip);
            let passport = JSON.parse(body_login.data).responseBody.passport;

            if (JSON.parse(body_login.data).resultCode === 0 && mac.length > 0) {
                let options_mac_query = {
                    url:'http://10.255.126.9:6600/bms/rest/securityCommon/getSecurityDataForOther',
                    json:{ "version":"1.0", "serviceCode":"user_query_userList", "passport":passport, "sign":"XXXXXXXXX", "requestBody":{ "currentPage":1, "pageSize":10, "data":{ "fuserId":"", "buserId":"", "custName":"", "serviceStatus":"", "userType":"", "productGroupCode":"", "caId":"", "macAddress":"9C:62:AB:32:F1:FA", "macAddress":mac, "identity":"", "telephone":"", "email":"", "areaCode":"", "likeSearch":false } } }
                };
                let JsonForIptvNum = await request_postJson(options_mac_query);
                // console.log(JsonForIptvNum);
                if(JSON.parse(JsonForIptvNum.data).responseBody.data){
                    let iptvNum = JSON.parse(JsonForIptvNum.data).responseBody.data[0].buserId;

                    let options_jsonForId = {
                        url:'http://10.255.126.9:6600/bms/rest/securityCommon/getSecurityDataForOther',
                        json:{"version":"1.0","serviceCode":"user_query_connectDevices","passport":passport,"sign":"XXXXXXXXX","requestBody":{"currentPage":1,"pageSize":10,"data":{"model":"","manufacturer":"","deviceId":"","identity":"","state":"","connectFlag":0,"fuserId":iptvNum}}}
                    };
                    let jsonForId = await request_postJson(options_jsonForId);
                    let id = JSON.parse(jsonForId.data).responseBody.data[0].id;
                    let options_unbind1 = {
                        url: 'http://10.255.126.9:6600/bms/rest/securityCommon/getSecurityDataForOther',
                        "account": keys.iptv.username,
                        "password": keys.iptv.password,
                        json: { "version": "1.0", "serviceCode": "user_connect_device", "passport": passport, "sign": "XXXXXXXXX", "requestBody": { "ids": id, "userId": iptvNum, "connectFlag": 1 } }
                    };
                     await request_postJson(options_unbind1);
                    let options_unbind2 = {
                        url: 'http://10.255.126.9:6600/bms/rest/securityCommon/getSecurityDataForOther',
                        "account": keys.iptv.username,
                        "password": keys.iptv.password,
                        json: { "version": "1.0", "serviceCode": "user_query_connectDevices", "passport": passport, "sign": "XXXXXXXXX", "requestBody": { "currentPage": 1, "pageSize": 10, "data": { "model": "", "manufacturer": "", "deviceId": "", "identity": "", "state": "", "connectFlag": 0, "fuserId": iptvNum } } }
                    };
                    let body_unbind = await request_postJson(options_unbind2);
                    // console.log(JSON.parse(body_unbind.data).resultCode)
                    result.state = '解绑成功,请将机顶盒断网后恢复出厂设置';
                    ctx.response.body = result

                }else{
                    result.state = '此MAC地址已经解绑，可以重新绑定;或者MAC地址输入错误不规范';
                    ctx.response.body = result
                }
            } else {
                result.state = '验证码过期或错误或系统忙，请输入新的验证码';
                ctx.response.body = result
            }
        } else {
            result.state = '验证码过期或错误或系统忙，请输入新的验证码';
            ctx.response.body = result
        }
    });

    router.post('/iptvAct',async function (ctx,next) {
        if(!ctx.session.user){
            await ctx.redirect('/')
        }
        let result = {iptvNum: '', iptvMac: '', state: ''};
        let code = ctx.request.body.code;
        let mac = ctx.request.body.mac;
        let options_login = {
            url: 'http://10.255.126.9:6600/bms/rest/securityCommon/getSecurityDataForLogin',
            json: {
                "version": "1.0",
                "serviceCode": "auth_login",
                "passport": "",
                "sign": "XXXXXXXXX",
                "requestBody": {
                    "account": keys.iptv.username
                    , "password": keys.iptv.password 
                    , "validateCode": code
                }
            }
        };
        let body_login  = await request_postJson(options_login);
        if(JSON.parse(body_login.data).resultCode ===0){
            logIt(__dirname+'/iptvUnbind','user: '+ctx.session.user+' visit_time '+new Date().format("yyyy-MM-dd hh:mm:ss")+ ' ' + mac + ' 远程IP地址:'+ ctx.request.ip);
            let passport = JSON.parse(body_login.data).responseBody.passport;
            let options_queryId = {
                url:'http://10.255.126.9:6600/bms/rest/securityCommon/getSecurityDataForOther',
                json:{"version":"1.0","serviceCode":"device_query_deviceList","passport":passport,"sign":"XXXXXXXXX","requestBody":{"currentPage":1,"pageSize":10,"data":{"model":"","manufacturer":"","deviceId":"","identity":mac,"wifiMacAddress":"","macAddress":"","state":""}}}
            };
            let JsonId = await request_postJson(options_queryId);
            let id = JSON.parse(JsonId.data).responseBody.data[0].id;

            let options_active1 = {
                url:'http://10.255.126.9:6600/bms/rest/securityCommon/getSecurityDataForOther',
                json:{"version":"1.0","serviceCode":"device_update_deviceInfo","passport":passport,"sign":"XXXXXXXXX","requestBody":{"id":id,"state":1}}
            };
            await request_postJson(options_active1);

            let options_active2 = {
                url:'http://10.255.126.9:6600/bms/rest/securityCommon/getSecurityDataForOther',
                json:{ "version":"1.0", "serviceCode":"device_query_deviceList", "passport":passport, "sign":"XXXXXXXXX", "requestBody":{ "currentPage":1, "pageSize":10, "data":{ "model":"", "manufacturer":"", "deviceId":"", "identity":mac, "wifiMacAddress":"", "macAddress":"", "state":"" } } }
            };
            let activeRes = await request_postJson(options_active2);
            // console.log(activeRes)
            console.log(JSON.parse(activeRes.data).responseBody.data[0].state);
            //reactivated.
            if(JSON.parse(activeRes.data).responseBody.data[0].state === 1){//state === 1 mean active correctly.
                result.state = '启用成功';
                ctx.response.body = result
            }else {
                result.state = '启用失败,请重新启用试试';
                ctx.response.body = result
            }

        } else {
            result.state = '验证码过期或错误或系统忙，请输入新的验证码';
            ctx.response.body = result
        }
    });

};





