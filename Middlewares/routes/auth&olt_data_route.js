let zte_hw_olt = require('../../band_middlewares/olt/zte_hw_olt_main');
let path = require('path');
const woyunwei = require('../../band_middlewares/woyunwei_app');
const band_auth_IO = require('../../band_middlewares/bandAuth/band_auth_IO');
const logIt = require('../running_log');
const qunzhang = require('../../band_middlewares/olt/olt_qunzhang_main');
const auto_complete =require('../../band_middlewares/autoComplete/auto_complete');
const handOver = require('../../band_middlewares/olt/errHandOver');
const keys = require('../../keys');
const QueryBandNum = require('../../band_middlewares/numQuery/num_query_main')
//const iptv = require('../band_middlewares/iptv/iptv');
Date.prototype.format = function(fmt){ //author: meizz
    let o = {
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
    for(let k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
};

module.exports = (router)=>{

    router.post('/auth', async function (ctx, next) {
        if (!ctx.session.user) {
            await ctx.redirect('/')
        }
        let options = {
            //userNum: '055709113813',
            userNum: ctx.request.body.userNum,
            //startTime: '2018-02-22 00:00:00',
            startTime: ctx.request.body.startTime,
            //endTime: '2018-02-23 23:59:59'
            endTime: ctx.request.body.endTime
        };
        logIt(__dirname + '/auth', 'user: ' + ctx.session.user + ' visit_time ' + new Date().format("yyyy-MM-dd hh:mm:ss") + ' ' + options.userNum + ' ' + options.startTime + ' ' + options.endTime + ' 远程IP地址:' + ctx.request.ip);
        //ctx.response.body(ctx.request.body);
        if (options.userNum.match(/05570\d{7}/) && options.userNum.toString().length === 12) {
            await band_auth_IO(options).then(result => {
                options = {};
                ctx.body = result;
            });
        } else if (options.userNum.match(/1\d{10}/) && options.userNum.length === 11) {
            let bandNum = await QueryBandNum(options.userNum)
            console.log(bandNum)
            if (bandNum) {
                options.userNum = bandNum;
                await band_auth_IO(options).then(result => {
                    options = {};
                    result.bandNum = bandNum
                    ctx.body = result;
                });
            } else {
                options = {};
                ctx.body = 'no num'
            }
        }
    });

    router.post('/olt_v3',async function (ctx,next) {
        if(!ctx.session.user){
            await ctx.redirect('/')
        }
        let options = {
            //userNum: '055709113813',
            userNum:ctx.request.body.userNum
        };
        console.log(options.userNum)
        logIt(__dirname + '/olt', 'user: ' + ctx.session.user + ' visit_time ' + new Date().format("yyyy-MM-dd hh:mm:ss") + ' ' + options.userNum + ' 远程IP地址:' + ctx.request.ip);
        
        //ctx.response.body(ctx.request.body);
        if (options.userNum.match(/05570\d{7}/) && options.userNum.toString().length === 12 || options.userNum.match(/1\d{10}/) && options.userNum.length === 11) {//判断号码是否符合规范，符0557开头则进行下一步
            if (options.userNum.match(/1\d{10}/) && options.userNum.length === 11) {
                options.userNum = await QueryBandNum(options.userNum)
            }
            console.log(options.userNum)
            if (options.userNum) {
                await woyunwei(options.userNum).then(async result => {
                    let json = JSON.parse(result);
                    //console.log(result)
                    if (result.indexOf('找不到对应的产品实例') === -1 && result.indexOf('woyunwei response null') === -1) {//判断集团沃运维app中有没有相应 记录
                        console.log('woyunwei info success.');//woyunwei app有记录则输出提示
                        json = json.body.data.resInfo.res;

                        let olt_manufacturer = json[5].resValue;

                        if (olt_manufacturer === '中兴') {//判断是不是中兴olt
                            console.log('goto zte');
                            let woptions = {
                                host: json[9].resValue,
                                loid: json[6].resValue
                            };
                            console.log(woptions.host + ' ' + woptions.loid + ' ' + olt_manufacturer + ' ' + ctx.request.body.userNum);

                            try {
                                woptions.manufacturer = 'zte';
                                let result = await zte_hw_olt(woptions);
                                if (result.state) {
                                    result.loid = woptions.loid;
                                    woptions = {};
                                    options = {};
                                    result.manufacturer = 'zte';
                                    ctx.body = result;
                                } else {
                                    result.manufacturer = 'zte';
                                    woptions = {};
                                    options = {};
                                    result.data = 'OLT无该用户数据';
                                    ctx.body = result;
                                }
                            } catch (e) {
                                console.log('error end:' + e);
                                ctx.body = 'zte olt query error.'
                            }


                        } else if (olt_manufacturer === '华为') {//判断是不是华为olt
                            console.log('goto huawei');
                            let woptions = {
                                host: json[9].resValue,
                                loid: json[6].resValue
                            };
                            console.log(woptions.host + ' ' + woptions.loid + ' ' + olt_manufacturer + ' ' + ctx.request.body.userNum);

                            try {
                                woptions.manufacturer = 'hw';
                                let result = await zte_hw_olt(woptions);
                                if (result.state) {
                                    result.loid = woptions.loid;
                                    woptions = {}
                                    options = {};
                                    result.manufacturer = 'hw';
                                    ctx.response.body = result;
                                } else {
                                    woptions = {};
                                    options = {};
                                    result.manufacturer = 'hw';
                                    result.data = 'OLT无该用户数据';
                                    ctx.response.body = result
                                }
                            } catch (e) {
                                console.log('error end:' + e);
                                ctx.response.body = 'hw olt query error.'
                            }
                        } else {
                            options = {};
                            woptions = {};
                            ctx.response.body = '目前只支持FTTH区域.';//其他非FTTH区域不支持
                            //console.log('目前只支持FTTH区域。');
                        }
                    } else {//集团沃运维app无记录。
                        options = {};
                        ctx.response.body = 'no user info in woyunwei app.';
                        //console.log('no user info in woyunwei app.');
                    }
                }
                );
            } else {
                options = {};
                ctx.body = 'no num'
            }

        } else {//不符合0557开头则返回空，一般用不到，除非客户端通过软件绕过页面js认证。
            ctx.response.body = {}
        }
    });

    router.post('/oltAdmin',async function (ctx,next) {
        if(!ctx.session.user === keys.auth.admin.username){
            await ctx.redirect('/')
        }
       
        let options = {
            //userNum: '055709113813',
            userNum:ctx.request.body.userNum
        };
        logIt(__dirname+'/olt','user: '+ctx.session.user+' visit_time '+new Date().format("yyyy-MM-dd hh:mm:ss")+ ' ' +options.userNum + ' 远程IP地址:'+ ctx.request.ip);
        //ctx.response.body(ctx.request.body);
        if(options.userNum.match(/05570\d{7}/)&&options.userNum.toString().length === 12 || options.userNum.match(/1\d{10}/) && options.userNum.length === 11){//判断号码是否符合规范，符0557开头则进行下一步
            if (options.userNum.match(/1\d{10}/) && options.userNum.length === 11) {
                options.userNum = await QueryBandNum(options.userNum)
            }
           if(options.userNum){
                await woyunwei(options.userNum).then(async result=> {
                    let json = JSON.parse(result);
                    //console.log(result)
                    if(result.indexOf('找不到对应的产品实例') === -1 && result.indexOf('woyunwei response null') ===-1){//判断集团沃运维app中有没有相应 记录
                        console.log('woyunwei info success.');//woyunwei app有记录则输出提示
                        json = json.body.data.resInfo.res;

                        let olt_manufacturer = json[5].resValue;
                        let olt_ip = json[9].resValue;
                        let vlan_id = json[11].resValue; //获取外层vlan
                        let host = json[9].resValue;
                        if(olt_manufacturer === '中兴'){//判断是不是中兴olt
                            console.log('goto zte');
                            console.log(host+' '+olt_manufacturer +' '+ ctx.request.body.userNum +' '+vlan_id);
                            let qunzhangRes = {};
                            try {
                                qunzhangRes.qz_state = await qunzhang({host:host,vlan:vlan_id,manufacturer:'zte'});
                                qunzhangRes.manufacturer = 'zte'
                                qunzhangRes.olt_ip = olt_ip
                                options = {};
                                ctx.response.body = qunzhangRes;
                            }catch (e) {
                                console.log('error end:'+e);
                                ctx.response.body = 'zte olt query error.'
                            }
                        }else if(olt_manufacturer === '华为'){//判断是不是华为olt
                            console.log('goto huawei');
                            console.log(host+' '+olt_manufacturer +' '+ ctx.request.body.userNum+' '+vlan_id);
                            let qunzhangRes = {};
                            try {
                                qunzhangRes.qz_state = await qunzhang({host:host,vlan:vlan_id,manufacturer:'hw'});
                                qunzhangRes.manufacturer = 'hw'
                                qunzhangRes.olt_ip = olt_ip
                                options = {};
                                ctx.response.body = qunzhangRes;
                            }catch (e) {
                                console.log('error end:'+e);
                                ctx.response.body = 'hw olt query error.'
                            }
                        }else{
                            options = {};
                            ctx.response.body = '目前只支持FTTH区域.';//其他非FTTH区域不支持
                            //console.log('目前只支持FTTH区域。');
                        }
                    }else {//集团沃运维app无记录。
                        options = {};
                        ctx.response.body = 'no user info in woyunwei app.';
                        //console.log('no user info in woyunwei app.');
                    }
                }
            );
           }else{
               options = {};
               ctx.body = 'no num'//can't get band num from cell num
           }
          
        }else {//不符合0557开头则返回空，一般用不到，除非客户端通过软件绕过页面js认证。
            options = {};
            ctx.response.body = {}
        }

    });

    router.post('/olt_autoCom',async function (ctx,next) {
        if(!ctx.session.user === keys.auth.admin.username){
            await ctx.redirect('/')
        }
        let options = {
            //userNum: '055709113813',
            userNum:ctx.request.body.userNum,
            onuid:ctx.request.body.onuid
        };
        let onuid = options.onuid;
        logIt(__dirname+'/olt_autoComplete','user: '+ctx.session.user+' visit_time '+new Date().format("yyyy-MM-dd hh:mm:ss")+ ' ' +options.userNum + ' 远程IP地址:'+ ctx.request.ip);
        //ctx.response.body(ctx.request.body);
        if(options.userNum.match(/05570\d{7}/)&&options.userNum.toString().length === 12){//判断号码是否符合规范，符0557开头则进行下一步
            await woyunwei(options.userNum).then(async result=> {
                    let json = JSON.parse(result);
                    //console.log(result)
                    if(result.indexOf('找不到对应的产品实例') === -1 && result.indexOf('woyunwei response null') ===-1){//判断集团沃运维app中有没有相应 记录
                        console.log('woyunwei info success.');//woyunwei app有记录则输出提示
                        json = json.body.data.resInfo.res;

                        let olt_manufacturer = json[5].resValue;

                        if(olt_manufacturer === '中兴'){//判断是不是中兴olt
                            console.log('goto zte');
                            let options = {
                                host: json[9].resValue,
                                loid:json[6].resValue,
                                pon_cardid:json[3].resValue.split('-').join('/'),
                                ontid:onuid,
                                nei_vlan:json[12].resValue,
                                wai_vlan:json[11].resValue,
                                iptv_vlan:'405'+json[3].resValue.split('-')[1]
                            };
                            console.log(options);
                            console.log('autoComplete'+' '+ ctx.request.body.userNum);

                            try {
                                await auto_complete(options,'zte');
                                options = {};
                                ctx.response.body = 'auto complete ending.';
                            }catch (e) {
                                console.log('error end:'+e);
                                ctx.response.body = 'zte olt auto complete error.'
                            }


                        }else if(olt_manufacturer === '华为'){//判断是不是华为olt
                            console.log('goto huawei');
                            let options = {
                                host: json[9].resValue,
                                loid:json[6].resValue,
                                pon_cardid:json[3].resValue.split('-').join('/'),
                                ontid:onuid,
                                nei_vlan:json[12].resValue,
                                wai_vlan:json[11].resValue,
                                iptv_vlan:'405'+json[3].resValue.split('-')[1]
                            };
                            console.log(options);
                            console.log('autoComplete'+' '+ ctx.request.body.userNum);

                            try {
                                await auto_complete(options,'hw');
                                options = {};
                                ctx.response.body = 'auto complete ending.';
                            }catch (e) {
                                console.log('error end:'+e);
                                ctx.response.body = 'hw olt auto complete error.'
                            }
                        }else{
                            ctx.response.body = '目前只支持FTTH区域.';//其他非FTTH区域不支持
                            //console.log('目前只支持FTTH区域。');
                        }
                    }else {//集团沃运维app无记录。
                        ctx.response.body = 'no user info in woyunwei app.';
                        //console.log('no user info in woyunwei app.');
                    }
                }
            );


        }else {//不符合0557开头则返回空，一般用不到，除非客户端通过软件绕过页面js认证。
            ctx.response.body = {}
        }
    });

    router.post('/olt_errHandOver', async function (ctx, next) {
        if(!ctx.session.user === keys.auth.admin.username){
            await ctx.redirect('/')
        }
        let options = {
            //userNum: '055709113813',
            userNum: ctx.request.body.userNum,
            onuid: ctx.request.body.onuid
        };
        let onuid = options.onuid;
        logIt(__dirname + '/olt_errHandOver', 'user: ' + ctx.session.user + ' visit_time ' + new Date().format("yyyy-MM-dd hh:mm:ss") + ' ' + options.userNum + ' 远程IP地址:' + ctx.request.ip);
        //ctx.response.body(ctx.request.body);
        if (options.userNum.match(/05570\d{7}/) && options.userNum.toString().length === 12) {//判断号码是否符合规范，符0557开头则进行下一步
            await woyunwei(options.userNum).then(async result => {
                let json = JSON.parse(result);
                //console.log(result)
                if (result.indexOf('找不到对应的产品实例') === -1 && result.indexOf('woyunwei response null') === -1) {//判断集团沃运维app中有没有相应 记录
                    console.log('woyunwei info success.');//woyunwei app有记录则输出提示
                    json = json.body.data.resInfo.res;

                    let olt_manufacturer = json[5].resValue;

                    if (olt_manufacturer === "中兴") {
                      //判断是不是中兴olt
                        console.log("goto zte");
                        let option_errHandOver = {
                            host: json[9].resValue,
                            wai_vlanid: json[11].resValue
                        }
                      console.log(option_errHandOver);
                      console.log("errHandOver" + " " + ctx.request.body.userNum);

                      try {
                        let errHandOverRes = await handOver(option_errHandOver);
                        option_errHandOver = {};
                        ctx.response.body = errHandOverRes;
                      } catch (e) {
                        console.log("error end:" + e);
                        ctx.response.body = "zte olt err handover error.";
                      }
                    } else if (olt_manufacturer === "华为") {
                      //判断是不是华为olt
                      ctx.response.body = "目前只支持中兴OLT一键倒换"; //其他非FTTH区域不支持
                    } else {
                      ctx.response.body = "目前只支持FTTH区域."; //其他非FTTH区域不支持
                      //console.log('目前只支持FTTH区域。');
                    }
                } else {//集团沃运维app无记录。
                    ctx.response.body = 'no user info in woyunwei app.';
                    //console.log('no user info in woyunwei app.');
                }
            }
            );


        } else {//不符合0557开头则返回空，一般用不到，除非客户端通过软件绕过页面js认证。
            ctx.response.body = {}
        }
    });
};




