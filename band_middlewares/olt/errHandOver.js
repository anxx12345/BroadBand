//npm install entries
//npm install telnet-client --save

'use strict';

const Telnet =  require('telnet-client');
const dingTalk = require('../dingtalk.js');
let connection = new Telnet();
let entries = require('entries');
const keys = require('../../keys')

async function telnet(options){
    let params = {
        host: options.host,
        port: 23,
        loginPrompt : 'Username:',
        passwordPrompt :'Password:',
        username: keys.oltzte.username,
        password: keys.oltzte.password,
        shellPrompt: '#',
        timeout: 1500, //1.5s
        debug:true,
        // removeEcho: 4
    };
    let res_info = {
        result:''
    };

    let gpon='';
    let nomore_cmd =  'terminal length 0';
    let cmd_find_uport = 'show vlan ' + options.wai_vlanid;
    await connection.connect(params);
    await connection.exec(nomore_cmd);
    //完成登陆OLT,执行查询命令
    res_info.result = await connection.exec(cmd_find_uport);
    gpon = res_info.result.split('\n');
    gpon=String(gpon);
    if(gpon){
        if(gpon.indexOf('gei')>0){
            let regx=/gei_\d\/\d{1,2}\/\d/g;
            //后面用到该命令，提取倒换的VLAN范围
            let cmd_yewu_port=gpon.match(regx);
            console.log(cmd_yewu_port);

            //***********************
            //查询上行端口状态
            let cmd_uport_state='show interface '+ gpon.match(regx);
            let uport_state = await connection.exec(cmd_uport_state);
            uport_state=String(uport_state.split('\n'));
            // console.log(uport_state);
            if(uport_state.search('line protocol is up')!= -1){
                //up说明状态正常，无需倒换
                console.log("正常，无需倒换。");
                res_info = {  //函数返回结果
                    result:"上行链路正常，不用倒换。"
                };
            }else{
                console.log("不正常，进行倒换...");
                //-----------------------------
                var uport_vlan = await connection.exec('show running-config interface  '+cmd_yewu_port);
                uport_vlan=String(uport_vlan.split('\n'));
                let regx_uport_vlan=/[^\d{4}]n?\d{4}/g;
                uport_vlan=uport_vlan.match(regx_uport_vlan);
                console.log(uport_vlan);
                //判断下面是否有vlan数据，即是否有业务
                if(uport_vlan!=null){
                    //拼接业务vlan范围
                    var yewu_vlan='';
                    for(let j=0;j<uport_vlan.length;j++){
                        yewu_vlan+=uport_vlan[j].toString();
                    }
                    console.log(yewu_vlan);
                    //&&&&&&&&&&&&&&&&&
                    var cmd_guanli_port='';//这里是var声明，不是let，否制报错
                    //down需要倒换，下面检索管理端口
                    let cmd_info=['show running-config interface gei_1/3/1',
                        'show running-config interface gei_1/19/1',
                        'show running-config interface gei_1/3/2',
                        'show running-config interface gei_1/19/2',
                        'show running-config interface gei_1/4/1',
                        'show running-config interface gei_1/4/2',
                        'show running-config interface gei_1/20/1',
                        'show running-config interface gei_1/20/2'
                    ];
                    for(let i=0; i<8; i++)
                    {
                        let is_guanli_port=await connection.exec(cmd_info[i]);
                        is_guanli_port=String(is_guanli_port.split('\n'));
                        //将数字全部匹配，然后依次判断是否在100-199，300-499
                        let guanli_port_arr=is_guanli_port.match(/\d+/g);
                        if(guanli_port_arr!=null){
                            for(let k=0;k<guanli_port_arr.length;k++){
                                if(guanli_port_arr[k]>100 &&guanli_port_arr[k]<500){
                                    cmd_guanli_port=cmd_info[i];
                                    break;
                                }
                                else{
                                    continue;
                                }
                            }

                        }else {
                            continue;
                        }

                    }
                    //管理端口,业务端口都找到，下面准备执行倒换
                    cmd_guanli_port=cmd_guanli_port.match(/gei_\d\/\d\d\/\d/g);
                    console.log("管理端口",cmd_guanli_port);
                    console.log("业务端口",cmd_yewu_port);
                    console.log("vlan数据",yewu_vlan);
                    //判断两个端口是否一致，否则倒换
                    if(cmd_guanli_port.toString()!=cmd_yewu_port.toLocaleString()){
                        //*************执行倒换命令
                        //先删除原业务端口vlan数据
                        //先进入config模式
                        console.log("执行倒换数据");
                        await connection.exec('configure terminal \n');
                        await connection.exec('interface '+cmd_yewu_port+' \n');
                        await connection.exec('no  switchport vlan '+yewu_vlan +' \n');
                        console.log('删除完成');
                        //推出config-if模式
                        await connection.exec('! \n');
                        //添加到管理端口vlan数据
                        await connection.exec('interface '+cmd_guanli_port+' \n');
                        await connection.exec('switchport vlan '+yewu_vlan+' tag'+' \n');
                        //增加环路检测命令
                        await connection.exec('security mac-anti-spoofing uplink-protect enable '+' \n');
                        await connection.exec('! \n');
                        await connection.exec('exit \n');
                        console.log('倒换成功');
                        dingTalk(`OLT(地址{options.host})，外层VLAN{options.wai_vlanid}。因上行链路故障已一键倒换，请盾盾和猛猛在光缆故障修复后勿忘记倒回操作。`)
                        res_info = {  //函数返回结果
                            result:"倒换成功。"
                        };
                        //***********************
                    }
                    //&&&&&&&&&&&

                }else {
                    console.log("业务端口下没有vlan数据");
                    res_info = {  //函数返回结果
                        result:"业务端口下没有vlan数据，不用倒换。"
                    };
                }
                //-----------------------------

            }

        }else{
            res_info = {  //函数返回结果
                result:"上行链路故障，业务端口无数据。"
            };
        }
        connection.end();
        // console.log(res_info);
        return res_info;
    } else {
        res_info = {result:"不正常",state:"该PON口光猫全部掉线"};
        console.log(res_info);
        connection.end();
        return res_info;
    }

}
//telnet({host:'10.10.101.126',wai_vlanid:'3758'});
module.exports = telnet;
