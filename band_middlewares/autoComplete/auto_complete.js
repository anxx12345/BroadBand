﻿let Telnet = require('telnet-client');
let entries = require('entries');
let connection = new Telnet();
const keys = require('../../keys')
let olt_writedata = function(options,factoryid) {
    if(factoryid=='zte'){
        (async function (options) {
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
            let nomore_cmd =  'terminal length 0';
            await connection.connect(params);
            await connection.exec(nomore_cmd);
            let write_cmd = {
                cmd0:'configure terminal \n',//进入configrure模式
                cmd_0_1:'interface gpon-olt_'+options.pon_cardid+'\n',
                cmd_0_2:'no onu '+options.ontid+'\n',
                //第1部分
                // cmd1:'interface gpon-olt_'+options.pon_cardid +'\n',
                cmd1:'onu '+ options.ontid +' type ZTEG-F627 loid '+options.loid +'\n',
                cmd2:'exit\n',
                cmd3:'! \n',
                //第2部分
                cmd4:'interface gpon-onu_'+options.pon_cardid+':'+options.ontid,
                cmd5: 'sn-bind disable \n',
                cmd6: 'tcont 1 name Tl1DefaultCreate profile FTTH_family_40 \n ',
                cmd7: 'gemport 1 name Tl1DefaultCreate tcont 1 \n',
                cmd8: 'switchport mode hybrid vport 1 \n',
                cmd9: 'service-port 1 vport 1 user-vlan 999 vlan 999 \n',
                cmd10: 'service-port 1 description INTERNET \n',
                cmd11: 'service-port 2 vport 1 user-vlan ' + options.nei_vlan+' vlan '+options.nei_vlan+' svlan '+options.wai_vlan,//power
                cmd12: 'service-port 2 description INTERNET \n',
                cmd13: 'service-port 3 vport 1 user-vlan 47 vlan 47 \n',
                cmd14: 'service-port 3 description VOIP \n' ,
                cmd15: 'service-port 4 vport 1 user-vlan 282 vlan 282 svlan '+options.iptv_vlan,
                cmd16: 'service-port 4 description IPTV \n shutdown \n',
                cmd17: '! \n' ,
                //第3部分
                cmd18: 'pon-onu-mng gpon-onu_'+options.pon_cardid+':'+options.ontid,
                cmd19: 'service TR069 gemport 1 vlan 999 \n',
                cmd20: 'service INTERNET gemport 1 vlan  '+options.nei_vlan+'\n' ,
                cmd21: 'service VOIP gemport 1 vlan 47 \n' ,
                cmd22: 'service IPTV gemport 1 vlan 282 \n' ,
                cmd23: 'switchport-bind switch_0/1 veip 1 \n' ,
                cmd24: 'vlan port eth_0/1 mode tag vlan  '+options.nei_vlan+'\n' ,
                cmd25:'vlan-filter-mode veip 1 tag-filter vlan-filter untag-filter transparent  \n',
                cmd26: 'vlan-filter veip 1 pri 5 vlan 47 \n' ,
                cmd27: 'vlan-filter veip 1 pri 4 vlan 282 \n' ,
                cmd28: 'vlan-filter veip 1 pri 6 vlan 999 \n' ,
                cmd29: 'vlan-filter veip 1 pri 0 vlan  '+options.nei_vlan+'\n' ,
                cmd30:'! \n',
                cmd32:'interface gpon-onu_'+options.pon_cardid+':'+options.ontid,
                cmd33:'no shutdown \n',
                cmd34:'! \n',
                cmd35:'exit \n',
                cmd36:'exit \n',
            };
            for (let [key, value] of entries(write_cmd)) {
                console.log(await connection.exec(value));
            }
            connection.end();
        })(options);

    }else if(factoryid=='hw') {
        (async function(options){
            let params = {
                host: options.host,
                port: 23,
                loginPrompt : '>>User name:',
                passwordPrompt :'>>User password:',
                username: keys.olthw.username,
                password: keys.olthw.password,
                shellPrompt: '>',
                timeout: 20000, //1.5s
                execTimeout:20000,
                debug:true,
                removeEcho: 4
            };

            let nomore_cmd =  ' enable \n config ';//不暂停显示，因为需要显示接口信息，进入配置模式
            let gpon_cmd = 'display service-port port  ' + options.pon_cardid +' \n';//关键加入\n换行符
            await connection.connect(params);
            params.shellPrompt = ')#';  //下条命令改变提示符
            await connection.exec(nomore_cmd,params);

            let onu_cmd="display service-port port "+ options.pon_cardid+" ont "+options.ontid+' \n';
            console.log(onu_cmd);
            var res_info = {  //查询,反馈结果
                gpon_data:'',
                onu_data:'', //查询Onu数据
            };
            res_info.gpon_data=await connection.exec(gpon_cmd );
            res_info.onu_data=await connection.exec(onu_cmd );
            // console .log(res_info.gpon_data);
            // console .log(res_info.onu_data);
            //用于单口光猫数据
            var cat_cmd="service-port  vlan "+options.wai_vlan+"  port "+options.pon_cardid+"  ont "+options.ontid+" eth 1 multi-service user-vlan \n" +
                "untagged tag-transform add-double inner-vlan "+options.nei_vlan+"  inner-priority 0 inbound \n" +
                "traffic-table index 6 outbound traffic-table index 6\r";

            //用于路由光猫数据
            var routecat_cmd="service-port  vlan "+options.wai_vlan+" port "+options.pon_cardid+"  ont "+options.ontid+" multi-service user-vlan "+options.nei_vlan+"\n" +
                "tag-transform translate-and-add inner-vlan "+options.nei_vlan+"  inner-priority 0 inbound \n" +
                "traffic-table index 8 outbound traffic-table index 8\r";

            //语音数据
            var voice_cmd="service-port  vlan 47 port  "+options.pon_cardid+"  ont "+options.ontid+"  multi-service user-vlan 47 \n" +
                "tag-transform translate inbound traffic-table index 7 outbound traffic-table \n" +
                "index 7 \r";
            //IPTV数据
            var iptv_cmd="service-port  vlan "+options.iptv_vlan+" port   "+options.pon_cardid+"  ont "+options.ontid+"  multi-service user-vlan 282 \n" +
                "tag-transform translate-and-add inner-vlan 282 inner-priority 0 inbound \n" +
                "traffic-table index 7 outbound traffic-table index 7 \r";

            // let testdata='';
            // if(options.dataflag=='1'){
            //     testdata=await connection.exec(cat_cmd);
            //     console.log("已执行命令：",testdata);
            // }
            // else if(options.dataflag=='2'){
            //     testdata=await connection.exec(routecat_cmd);
            //     console.log("已执行命令：",testdata);
            // }
            // else if(options.dataflag=='3'){
            //     testdata=await connection.exec(voice_cmd);
            //     console.log("已执行命令：",testdata);
            // }
            // else if(options.dataflag=='4'){
            //     testdata=await connection.exec(iptv_cmd);
            //     console.log("已执行命令：",testdata);
            // }
            // else {
            await connection.exec(cat_cmd);
            await connection.exec(routecat_cmd);
            await connection.exec(voice_cmd);
            await connection.exec(iptv_cmd);

            // }
            connection.end();
            console.log("END");
        })(options)
    }else {
        console.log("factoryid不对.")
    }
};


//暴露接口
//参数与实际对应
module.exports = olt_writedata;

//pon_cardid 对应‘OLT的PON口网管逻辑号’;ontid对应‘onu编号’  nei_vlan对应‘内层VLAN’，wai_vlan对应‘外层VLAN’
// olt_writedata({host:'10.10.104.10',loid:'5570083382',pon_cardid:'1/2/2',ontid:'3',nei_vlan:'1021',wai_vlan:'3828',iptv_vlan:'4052'},'zte');

//pon_cardid 对应‘OLT的PON口网管逻辑号’;ontid对应‘onu编号’ nei_vlan 对应‘内层VLAN’，语音固定为47，wai_vlan对应‘外层VLAN’；dataflag：‘1为单口光猫数据’，‘2为用于路由光猫数据’，‘3为语音数据’，‘4为IPTV数据'
// olt_writedata({host:'10.10.45.2',pon_cardid:'0/2/0',ontid:'5',wai_vlan:'4051',nei_vlan:'1007','iptv_vlan':'4052',dataflag:'0'},'hw');





