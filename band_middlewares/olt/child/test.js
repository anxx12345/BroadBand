//npm install entries
//npm install telnet-client

'use strict';

let Telnet = require('telnet-client');
let connection = new Telnet();
let entries = require('entries');

async function telnet(options){

    let params = {
        host: options.host,
        port: 23,
        loginPrompt : 'Username:',
        passwordPrompt :'Password:',
        username: '',
        password: '',
        shellPrompt: '#',
        timeout: 1500, //1.5s
        debug:true,
        // removeEcho: 4
    };


    // Judge the accuracy of the data
    let res_arr = {  //telnet反馈结果
        gpon:'not find onu',     //获取的gpon onu参数
        result0:'', // 第1条指令结果
        result1:'', // 第2条指令结果....
        result2:'', // 第3条指令结果....
        result3:'', // 第4条指令结果....
        result4:'', // 第4条指令结果....
        state:''
    };
    let gpon = '';

    let nomore_cmd =  'terminal length 0'
    let gpon_cmd = 'show gpon onu by loid ' + options.loid
    await connection.connect(params)
    await connection.exec(nomore_cmd)
    let result = await connection.exec(gpon_cmd)
    console.log(result)
    console.log(await connection.exec(' ggg \r'))
    gpon = result.split('\n')[2]
    // console.log(gpon);
    if(gpon){
        let othercmd = { //zte获取信息的命令
            result0: 'show pon onu un',
            result1: 'show pon power attenuation ' + gpon,//power
            result2: 'show onu running config ' + gpon,//config
            result3 : 'show running-config interface '+ gpon,//inter
            result4 : 'show gpon onu detail-info ' + gpon,//detail
        };
        for (let [key, value] of entries(othercmd)) {
            res_arr[key] = await connection.exec(value);
            // console.log("value:",res_arr[key]);
        }
        let res_info = {  //函数返回结果
            gpon:gpon,     //获取的gpon onu参数
            result0:(res_arr.result0.indexOf('No related information to show') !== -1)?'无未注册光猫信息':res_arr.result0,
            result1:res_arr.result1,
            result2:/pon-onu-[\s\S]*\!/.exec(res_arr.result2)[0],
            result3:(res_arr.result3.indexOf('No related information to show') !== -1)?'No related information to show':/Building[\s\S]*\end/.exec(res_arr.result3)[0],
            result4:res_arr.result4.replace(/\r\u0000/g,'').replace(/\n/,''),
            state:true // Means that there is data in the olt.
        };

        connection.end();
        console.log(JSON.stringify(res_info));
    } else {
        let res_info = {state:false};
        console.log(JSON.stringify(res_info));
        connection.end();
    }

}

// telnet({host:'10.56.8.35',loid:'5540055451'})
// telnet('10.10.101.2','5570061226');
//telnet({host:'10.10.101.2',loid:'5570061226'});
//10.10.104.42 5570114159 中兴 055709906387

let options = {host:'10.10.104.42',loid:5570114159};
// module.exports = telnet;
telnet(options);