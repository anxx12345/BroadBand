'use strict';

let Telnet =  require('telnet-client');
let connection = new Telnet();
let entries = require('entries');
const keys = require('../../../keys')

async function telnet(options){
    // console.log(options)
    let vlan_info=''; //这是查询结果
    let gpon_info='';//判断gpon是否在vlan_info中，没有的话说明掉线
    let qz_state_flag='';//判断gei或者eth是否在vlan_info中
    if(options.factoryid==='zte'){
        let params_zte = {
            host: options.host,
            port: 23,
            loginPrompt : 'Username:',
            passwordPrompt :'Password:',
            username: keys.oltzte.username,
            password: keys.oltzte.password,
            shellPrompt: '#',
            timeout: 5000, //20s
            execTimeout:5000,
            debug:true,
        };

        let cmd_zte = 'show mac vlan ' + options.vlanid;
        await connection.connect(params_zte);
        let nomore_cmd =  'terminal length 0'
        await connection.exec(nomore_cmd)
        vlan_info = await connection.exec(cmd_zte);
        // console.log(vlan_info);
        vlan_info = vlan_info.split('\n');
        gpon_info=/gpon-onu/.exec(vlan_info);
        vlan_info=String(vlan_info);
        // qz_state_flag=vlan_info.indexOf('gei')||vlan_info.indexOf('smart');
        qz_state_flag = Boolean(vlan_info.match(/gei/g))|| Boolean(vlan_info.match(/smart/g))
    }else {
        let params_hw = {
            host: options.host,
            port: 23,
            loginPrompt : '>>User name:',
            passwordPrompt :'>>User password:',
            username: keys.olthw.username,
            password: keys.olthw.password,
            shellPrompt: '>',
            timeout: 20000, //20s
            execTimeout:20000,
            debug:true,
            removeEcho: 4
        };
        let nomore_cmd =  ' enable \n config';//不暂停显示，因为需要显示接口信息，进入配置模式
        let cmd_hw = 'display mac-address vlan  ' + options.vlanid;
        await connection.connect(params_hw);
        params_hw.shellPrompt = ')#';  //下条命令改变提示符
        await connection.exec(nomore_cmd,params_hw);

        vlan_info = await connection.exec(cmd_hw);
        vlan_info = vlan_info.split('\n');
        gpon_info=/gpon/.exec(vlan_info);
        // console.log(vlan_info);
        vlan_info=String(vlan_info);
        qz_state_flag=Boolean(vlan_info.match(/eth/g));
    }


    // console.log(vlan_info);
    let res_info = {  //函数返回结果
        qz_state:'', // Means that there is data in the olt.
    };
    gpon_info=String(gpon_info);
    if(gpon_info !=='null'){
        if(qz_state_flag){
            res_info = {  //函数返回结果
                qz_state:"该PON口无群障"
            };
        }else{
            res_info = {  //函数返回结果
                qz_state:"该PON口上联链路故障"
            };
        }
        connection.end();
        console.log(res_info.qz_state);
    } else {
        res_info = {qz_state:"该PON口光猫全部掉线"};
        connection.end();
        console.log(res_info.qz_state);
    }

}
// telnet({host:'10.10.28.2',vlanid:'3242',factoryid:'hw'});


// telnet({host:'10.10.104.10',vlanid:'3116',factoryid:'zte'});
// telnet({host:'10.10.99.182',vlanid:'3703',factoryid:'zte'})
// let options = {host:process.argv[2],vlanid:process.argv[3],factoryid:process.argv[4]};
telnet({host:process.argv[2],vlanid:process.argv[3],factoryid:process.argv[4]});
